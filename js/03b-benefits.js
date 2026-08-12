/* MODULE js/03b-benefits.js — Benefits Assistant (travel tools).
   Landing-page tool, separate from trips. Reads the user's Travel profile
   (u.trav / adminTrav ids from 04-planner's TRAV_CAT) and answers three
   questions: what do my hotel tiers get me · what does this flight get me ·
   which lounges can I enter at this airport.
   Lounge data: IAD & MCO verified against Aug 2026 sources; Asia-Pacific
   entries from curated knowledge — rules shift, the UI says so. */

/* ---------------- small IATA base ---------------- */
const BA_AIRPORTS={
 /* USA */
 ATL:{city:'Atlanta',cc:'US'},LAX:{city:'Los Angeles',cc:'US'},ORD:{city:'Chicago O\u2019Hare',cc:'US'},MDW:{city:'Chicago Midway',cc:'US'},
 DFW:{city:'Dallas\u2013Fort Worth',cc:'US'},DAL:{city:'Dallas Love',cc:'US'},DEN:{city:'Denver',cc:'US'},JFK:{city:'New York JFK',cc:'US'},
 LGA:{city:'New York LaGuardia',cc:'US'},EWR:{city:'Newark',cc:'US'},SFO:{city:'San Francisco',cc:'US'},SJC:{city:'San Jose',cc:'US'},
 SEA:{city:'Seattle',cc:'US'},LAS:{city:'Las Vegas',cc:'US'},MCO:{city:'Orlando',cc:'US'},MIA:{city:'Miami',cc:'US'},
 FLL:{city:'Fort Lauderdale',cc:'US'},TPA:{city:'Tampa',cc:'US'},PHX:{city:'Phoenix',cc:'US'},IAH:{city:'Houston Bush',cc:'US'},
 HOU:{city:'Houston Hobby',cc:'US'},BOS:{city:'Boston',cc:'US'},MSP:{city:'Minneapolis',cc:'US'},DTW:{city:'Detroit',cc:'US'},
 PHL:{city:'Philadelphia',cc:'US'},BWI:{city:'Baltimore',cc:'US'},DCA:{city:'Washington National',cc:'US'},IAD:{city:'Washington Dulles',cc:'US'},
 SLC:{city:'Salt Lake City',cc:'US'},SAN:{city:'San Diego',cc:'US'},AUS:{city:'Austin',cc:'US'},BNA:{city:'Nashville',cc:'US'},
 CLT:{city:'Charlotte',cc:'US'},RDU:{city:'Raleigh\u2013Durham',cc:'US'},STL:{city:'St. Louis',cc:'US'},MSY:{city:'New Orleans',cc:'US'},
 PDX:{city:'Portland',cc:'US'},SMF:{city:'Sacramento',cc:'US'},HNL:{city:'Honolulu',cc:'US'},OGG:{city:'Maui Kahului',cc:'US'},
 ANC:{city:'Anchorage',cc:'US'},
 /* Japan */
 HND:{city:'Tokyo Haneda',cc:'JP'},NRT:{city:'Tokyo Narita',cc:'JP'},KIX:{city:'Osaka Kansai',cc:'JP'},ITM:{city:'Osaka Itami',cc:'JP'},
 NGO:{city:'Nagoya Ch\u016bbu',cc:'JP'},CTS:{city:'Sapporo New Chitose',cc:'JP'},FUK:{city:'Fukuoka',cc:'JP'},OKA:{city:'Okinawa Naha',cc:'JP'},
 SDJ:{city:'Sendai',cc:'JP'},HIJ:{city:'Hiroshima',cc:'JP'},KOJ:{city:'Kagoshima',cc:'JP'},KMJ:{city:'Kumamoto',cc:'JP'},
 /* Canada */
 YYZ:{city:'Toronto Pearson',cc:'CA'},YVR:{city:'Vancouver',cc:'CA'},YUL:{city:'Montr\u00e9al',cc:'CA'},YYC:{city:'Calgary',cc:'CA'},
 YEG:{city:'Edmonton',cc:'CA'},YOW:{city:'Ottawa',cc:'CA'},YWG:{city:'Winnipeg',cc:'CA'},YHZ:{city:'Halifax',cc:'CA'},
 /* Korea */
 ICN:{city:'Seoul Incheon',cc:'KR'},GMP:{city:'Seoul Gimpo',cc:'KR'},CJU:{city:'Jeju',cc:'KR'},PUS:{city:'Busan Gimhae',cc:'KR'},
 TAE:{city:'Daegu',cc:'KR'},CJJ:{city:'Cheongju',cc:'KR'}
};
const BA_AIRLINE_HOME={ua:'US',dl:'US',aa:'US',ke:'KR',oz:'KR',nh:'JP',jl:'JP',ac:'CA'};
const BA_AIRLINE_NAMES={ua:'United',dl:'Delta',aa:'American',ke:'Korean Air',oz:'Asiana',nh:'ANA',jl:'JAL',ac:'Air Canada'};

/* ---------------- hotel benefits by tier ---------------- */
const BA_HOTEL={
 bonvoy:{n:'Marriott Bonvoy',order:['Member','Silver','Gold','Platinum','Titanium','Ambassador'],ben:{
  Member:['Member rates & free wi-fi','Mobile key & chat'],
  Silver:['+10% points','Priority late checkout (availability)'],
  Gold:['+25% points','2 p.m. late checkout','Enhanced room upgrade (availability)'],
  Platinum:['+50% points','4 p.m. late checkout — guaranteed at most brands','Lounge access & free breakfast (participating brands)','Suite upgrades incl. select suites','Welcome gift: points / breakfast / amenity','Guaranteed room type'],
  Titanium:['Everything in Platinum','+75% points','48-hour guaranteed availability','United Silver via RewardsPlus'],
  Ambassador:['Everything in Titanium','Ambassador service & Your24 (choose your own 24h stay)']}},
 hilton:{n:'Hilton Honors',order:['Member','Silver','Gold','Diamond'],ben:{
  Member:['Member rates, free wi-fi, digital key'],
  Silver:['+20% points','5th award night free','Two bottled waters'],
  Gold:['+80% points','Daily F&B credit (US) / breakfast (elsewhere)','Room upgrades incl. junior suites (availability)'],
  Diamond:['+100% points','Executive lounge access','Upgrades to one-bedroom suites (availability)','48-hour room guarantee','Diamond status gifting at milestones']}},
 hyatt:{n:'World of Hyatt',order:['Member','Discoverist','Explorist','Globalist'],ben:{
  Member:['Member rates, free wi-fi'],
  Discoverist:['+10% points','2 p.m. late checkout','Premium internet, bottled water'],
  Explorist:['+20% points','Preferred rooms at check-in','4 club-lounge award nights per year'],
  Globalist:['+30% points','Club lounge access — or free full breakfast where no club','Suite upgrades on eligible rates at booking (TSUs) and at check-in','4 p.m. late checkout','Waived resort & parking fees on award stays','Guest of Honor bookings']}},
 ihg:{n:'IHG One Rewards',order:['Club','Silver','Gold','Platinum','Diamond'],ben:{
  Club:['Member rates & wi-fi'],
  Silver:['+20% points'],
  Gold:['+40% points','Priority check-in'],
  Platinum:['+60% points','Room upgrades (availability)','Early check-in / late checkout (availability)','Welcome amenity'],
  Diamond:['+100% points','Best upgrade priority','Complimentary breakfast (most brands)','Dedicated support line']}}
};

/* ---------------- airline benefit rules ---------------- */
function baTierRank(air,tier){
  const ladders={ua:['Member','Silver','Gold','Platinum','1K'],dl:['Member','Silver','Gold','Platinum','Diamond'],
   aa:['Member','Gold','Platinum','Platinum Pro','Executive Platinum'],ke:['Member','Morning Calm','Morning Calm Premium','Million Miler'],
   oz:['Member','Gold','Diamond','Diamond Plus','Platinum'],nh:['Member','Bronze','Platinum','Diamond'],
   jl:['Member','Crystal','Sapphire','JGC Premier','Diamond'],ac:['Member','25K','35K','50K','75K','Super Elite']};
  const L=ladders[air]||[]; const i=L.indexOf(tier); return i<0?0:i;
}
function baAirlineBenefits(air,cabin,fromCode,toCode,tier){
  const A=BA_AIRPORTS[fromCode]||{}, B=BA_AIRPORTS[toCode]||{};
  const home=BA_AIRLINE_HOME[air];
  const dom=A.cc&&B.cc&&A.cc===B.cc&&A.cc===home;
  const intl=!dom;
  const rank=baTierRank(air,tier);
  const prem=cabin==='first'||cabin==='business';
  const out={route:(A.city||fromCode)+' → '+(B.city||toCode)+' · '+(dom?'domestic':'international'),items:[]};
  const add=(ok,label,why)=>{ if(ok)out.items.push({label,why}); };
  // Checked bags
  let bags='1 checked bag';
  if(cabin==='first')bags='2–3 checked bags (cabin allowance)';
  else if(cabin==='business')bags='2 checked bags (cabin allowance)';
  else if(cabin==='premium')bags=intl?'2 checked bags (premium economy intl)':'1–2 checked bags';
  else { // economy / basic
    if(air==='ua'||air==='aa'||air==='dl'){ bags=intl?'1–2 checked bags (route-dependent; transpacific usually 1–2)':(rank>0?'1+ free bag (elite waiver)':'0 free — fees apply domestically (card waivers may apply)'); }
    if(air==='ke'||air==='oz')bags=intl?'1–2 checked bags (TPAC 2 on many fares)':'1 checked bag';
    if(air==='nh'||air==='jl')bags=intl?'2 checked bags (JP-carrier intl standard)':'1 checked bag';
  if(air==='ac')bags=intl?'1–2 checked bags (route/fare-dependent)':(rank>0?'1+ free bag (Aeroplan elite)':'0–1 free — fare-dependent');
  }
  if(rank>=2)bags+=' · +1 extra bag or +extra weight (elite)';
  out.items.push({label:'🧳 Baggage: '+bags,why:tier&&rank>0?tier+' allowance applied':'base fare rules'});
  add(prem||rank>=1,'🎫 Priority check-in',prem?'premium cabin':'elite status');
  add(prem||rank>=2,'🛂 Priority security where offered',prem?'premium cabin':'mid-tier+');
  add(prem||rank>=1,'🛫 Priority boarding',prem?'premium cabin':'elite status');
  add(prem||rank>=3,'🧳 Priority baggage delivery',prem?'premium cabin':'top-tier');
  add(intl&&(cabin==='business'||cabin==='first'),'🛋 Lounge access with this ticket','international premium cabin — see the Lounge tab for the doors');
  add(intl&&!prem&&((air==='ua'&&rank>=2)||(air==='nh'&&rank>=2)||(air==='oz'&&rank>=1)||(air==='ac'&&rank>=3)),'🛋 Star Alliance Gold lounge access on this itinerary','Star Gold from your status, intl itinerary');
  add(intl&&!prem&&air==='jl'&&rank>=2,'🛋 oneworld Sapphire lounge access on this itinerary','JMB Sapphire+ status');
  add(intl&&!prem&&air==='ke'&&rank>=1,'🛋 KAL Prestige lounge access','SKYPASS elite on intl Korean Air');
  add((air==='ua'||air==='dl'||air==='aa')&&rank>=1&&dom,'⬆ Complimentary upgrade list (domestic)','elite status');
  add(rank>=1,'💺 Preferred / extra-legroom seats',rank>=3?'free at booking (top tiers)':'free or discounted by tier');
  add(rank>=3,'☎ Elite service line & higher waiver priority','top-tier');
  if(cabin==='basic')out.items.push({label:'⚠ Basic economy: boarding last, seat assigned, elite benefits often reduced; bags per rules above',why:'fare-class restriction'});
  return out;
}

/* ---------------- lounge database ---------------- */
/* access rule atoms:
   cards:[ids] · pp:true (Priority Pass via amexplat/csr/venturex)
   airline:{id,cabins:[..],intlOnly?} · tier:{air:id,min:'TierName',intlOnly?}
   note per lounge; ver:'verified Aug 2026'|'curated' */
const BA_PP_CARDS=['amexplat','csr','venturex'];
const BA_LOUNGES={
 IAD:[
  {n:'Capital One Lounge',loc:'Ticketing level, post-TSA PreCheck between East/West checkpoints',hrs:'06:00–22:00',rate:'4.5★',am:'Hot food, bar, grab-and-go, showers, nursing room',
   rules:[{cards:['venturex'],why:'Venture X — Capital One Lounge network (guest fees from Feb 2026)'}],ver:'verified Aug 2026'},
  {n:'Turkish Airlines Lounge',loc:'Concourse B, opposite B43',hrs:'~09:00–23:00 (flight-dependent)',rate:'4.6★',am:'Best food at IAD — hot buffet, cocktail bar, showers; walk-in day passes',
   rules:[{pp:true,why:'Priority Pass'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance premium cabin'}],ver:'verified Aug 2026'},
  {n:'United Polaris Lounge',loc:'Concourse C',hrs:'from ~05:30 to last departure',rate:'4.6★',am:'À la carte dining, showers, quiet suites',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'United/Star long-haul business — 2026: basic business fares excluded'},{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA long-haul premium cabin'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Air Canada Signature (Star long-haul J)'}],ver:'verified Aug 2026'},
  {n:'United Club (C7 · C17 · D)',loc:'Concourses C & D',hrs:'05:30–22:00',rate:'4.0★',am:'Standard Club fare, multiple locations',
   rules:[{airline:{id:'ua',cabins:['business','first']},why:'United premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold on intl itinerary'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+ (Star Gold) intl'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Star premium cabin'},{cards:['unitedclub'],why:'United Club Infinite card'}],ver:'verified Aug 2026'},
  {n:'Air France–KLM Lounge',loc:'Concourse A (upper level)',hrs:'afternoon bank ~12:00–22:00',rate:'4.3★',am:'Taittinger champagne, French bites',
   rules:[{pp:true,why:'Priority Pass (capacity-controlled)'}],ver:'verified Aug 2026'},
  {n:'Etihad Lounge',loc:'Concourse A near A14',hrs:'06:00–22:00',rate:'4.4★',am:'Revamped with Chase; à la carte at peak',
   rules:[{pp:true,why:'Priority Pass — one visit/calendar year'}],ver:'verified Aug 2026'},
  {n:'Lufthansa Business Lounge',loc:'Concourse B (B49–B51)',hrs:'CLOSED for renovation → end 2026',rate:'—',am:'Reopening with Dulles Next; TK/BA lounges cover LH premium pax meanwhile',
   rules:[],ver:'verified Aug 2026'},
  {n:'Virgin Atlantic Clubhouse',loc:'Concourse A (upper level)',hrs:'per VS departure bank',rate:'4.7★',am:'Premium-cabin only — no cards, no PP',
   rules:[],ver:'verified Aug 2026'}
 ],
 MCO:[
  {n:'The Club MCO — Airside 1',loc:'Terminal A/B complex, gates 1–29 (next to XpresSpa)',hrs:'~07:00–21:00',rate:'4.1★',am:'Largest independent option; shower suites; day passes from ~$50',
   rules:[{pp:true,why:'Priority Pass'}],ver:'verified Aug 2026'},
  {n:'The Club MCO — Airside 4',loc:'Gates 70–99 near gate 91',hrs:'~08:00–20:00',rate:'4.0★',am:'3-hour stay cap at peak',
   rules:[{pp:true,why:'Priority Pass'}],ver:'verified Aug 2026'},
  {n:'Plaza Premium Lounge',loc:'Terminal C, level 2 near gate 241',hrs:'daily, ~2-hour cap',rate:'4.2★',am:'10,000 sq ft, hot food, calmer than the north complex',
   rules:[{pp:true,why:'Priority Pass'},{cards:['amexplat'],why:'Amex Platinum — Plaza Premium network'}],ver:'verified Aug 2026'},
  {n:'Delta Sky Club',loc:'Terminal B / Airside 3',hrs:'per DL bank',rate:'4.2★',am:'Strictest door at MCO; no day passes',
   rules:[{cards:['amexplat'],flying:'dl',why:'Amex Platinum flying Delta same-day (visit limits apply)'},{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta'},{airline:{id:'dl',cabins:['business','first']},why:'Delta One / First (route rules)'}],ver:'verified Aug 2026'},
  {n:'Admirals Club',loc:'Terminal B / Airside 3 near gate 55',hrs:'~05:00–20:00 (fills by mid-morning at peak)',rate:'3.9★',am:'Undersized for the traffic; day pass ~$79',
   rules:[{cards:['aaexec'],why:'Citi / AAdvantage Executive'},{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'oneworld intl premium cabin'},{tier:{air:'aa',min:'Platinum',intlOnly:true},why:'oneworld Sapphire+ on qualifying intl'}],ver:'verified Aug 2026'},
  {n:'United Club',loc:'Terminal B / Airside 3',hrs:'per UA bank',rate:'3.8★',am:'Small; standard Club spread',
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first']},why:'UA premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold on intl itinerary'}],ver:'verified Aug 2026'}
 ],
 ICN:[
  {n:'KAL Prestige Lounge (T2, East & West)',loc:'Terminal 2 after security',hrs:'~05:00–22:00',rate:'4.2★',am:'Korean & western buffet, showers, nap zones',
   rules:[{airline:{id:'ke',cabins:['business','first']},why:'Prestige/First on Korean Air'},{tier:{air:'ke',min:'Morning Calm',intlOnly:true},why:'SKYPASS elite'},{airline:{id:'dl',cabins:['business'],intlOnly:true},why:'Delta One at the SkyTeam hub'}],ver:'curated'},
  {n:'Asiana Business Lounge (T1)',loc:'Terminal 1, multiple locations',hrs:'~05:30–21:30',rate:'4.1★',am:'Buffet, showers; Star Alliance door at ICN T1',
   rules:[{airline:{id:'oz',cabins:['business','first']},why:'Asiana premium cabin'},{tier:{air:'oz',min:'Gold',intlOnly:true},why:'Star Gold'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'},{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'}],ver:'curated'},
  {n:'Matina Lounge (T1 & T2)',loc:'Both terminals, 4F',hrs:'~06:00–22:00',rate:'3.9★',am:'Independent; the usual PP door at ICN',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'},
  {n:'SKY HUB Lounge',loc:'T1 (and Concourse A)',hrs:'~06:30–21:30',rate:'3.8★',am:'Independent buffet lounge',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 HND:[
  {n:'ANA Suite Lounge / ANA Lounge (Intl T3)',loc:'110 & 114 gate areas',hrs:'per bank',rate:'4.4★',am:'Fresh-made soba/udon bar, showers',
   rules:[{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA intl premium cabin'},{tier:{air:'nh',min:'Platinum',intlOnly:true},why:'ANA Platinum+/Star Gold'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'}],ver:'curated'},
  {n:'JAL Sakura Lounge (Intl T3)',loc:'Near gate 112',hrs:'per bank',rate:'4.4★',am:'JAL curry tradition, showers',
   rules:[{airline:{id:'jl',cabins:['business','first'],intlOnly:true},why:'JAL intl premium cabin'},{tier:{air:'jl',min:'Sapphire',intlOnly:true},why:'JMB Sapphire+/oneworld Sapphire'},{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'oneworld intl premium cabin'},{tier:{air:'aa',min:'Platinum',intlOnly:true},why:'oneworld Sapphire+'}],ver:'curated'},
  {n:'TIAT Lounge / Sky Lounge',loc:'T3, 4F area',hrs:'~07:00–22:00',rate:'3.9★',am:'Contract lounges; the PP doors at Haneda intl',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 NRT:[
  {n:'ANA Lounge (T1)',loc:'Satellite 4 & 5',hrs:'per bank',rate:'4.3★',am:'Noodle bar, showers',
   rules:[{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA intl premium cabin'},{tier:{air:'nh',min:'Platinum',intlOnly:true},why:'ANA Platinum+/Star Gold'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'}],ver:'curated'},
  {n:'United Club (T1)',loc:'Terminal 1 Satellite',hrs:'per UA bank',rate:'3.9★',am:'The UA door at Narita',
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first']},why:'UA premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
  {n:'IASS / KAL / independent lounges',loc:'T1 & T2',hrs:'~07:00–21:00',rate:'3.7★',am:'Modest but reliable PP options',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 KIX:[
  {n:'KAL Lounge',loc:'North gates area',hrs:'per KE bank',rate:'4.0★',am:'The Korean Air door for the 11/27 style hops',
   rules:[{airline:{id:'ke',cabins:['business','first']},why:'Prestige on Korean Air'},{tier:{air:'ke',min:'Morning Calm',intlOnly:true},why:'SKYPASS elite'}],ver:'curated'},
  {n:'ANA Lounge / Star Alliance',loc:'Main terminal, intl gates',hrs:'per bank',rate:'4.1★',am:'Star door at Kansai',
   rules:[{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA premium cabin'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business'},{tier:{air:'nh',min:'Platinum',intlOnly:true},why:'ANA Platinum+'}],ver:'curated'},
  {n:'Aspire / Plaza Premium-style contract lounges',loc:'Intl departures',hrs:'~07:00–22:00',rate:'3.8★',am:'PP-network doors at KIX',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 HNL:[
  {n:'Plumeria Lounge (Hawaiian) & IASS Hawaii',loc:'Main overseas terminal',hrs:'~07:00–21:00',rate:'3.7★',am:'The PP doors at HNL',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'},
  {n:'United Club',loc:'Terminal 2 near G gates',hrs:'per UA bank',rate:'3.9★',am:'Open-air walkway to it — very Honolulu',
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first']},why:'UA premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
  {n:'Delta Sky Club',loc:'Terminal 2',hrs:'per DL bank',rate:'4.0★',am:'Compact Sky Club',
   rules:[{cards:['amexplat'],flying:'dl',why:'Amex Platinum flying Delta'},{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta'},{airline:{id:'dl',cabins:['business','first']},why:'Delta premium cabin'}],ver:'curated'}
 ],
 YVR:[
  {n:'Plaza Premium Lounge (Intl & Transborder)',loc:'Intl departures + US transborder',hrs:'~05:00–22:00',rate:'4.1★',am:'Plaza Premium\u2019s home airport — hot food, showers',
   rules:[{pp:true,why:'Priority Pass'},{cards:['amexplat'],why:'Amex Platinum — Plaza Premium network'}],ver:'curated'},
  {n:'SKYTEAM / Air Canada Maple Leaf Lounges',loc:'Intl & transborder piers',hrs:'per bank',rate:'4.2★',am:'Alliance doors before the Yokohama-bound legs',
   rules:[{airline:{id:'ac',cabins:['business','first']},why:'Air Canada Signature / Maple Leaf home hub'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+ (Star Gold)'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business (Maple Leaf)'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'},{airline:{id:'dl',cabins:['business'],intlOnly:true},why:'SkyTeam business (SkyTeam lounge)'},{airline:{id:'ke',cabins:['business','first']},why:'SkyTeam — KE Prestige uses SkyTeam/contract door'}],ver:'curated'}
 ]
};

function baHasPP(cards){ return (cards||[]).some(c=>BA_PP_CARDS.includes(c)); }
function baLoungeCheck(l,ctx){
  const t=ctx.trav||{}; const cards=t.cards||[];
  for(const r of (l.rules||[])){
    if(r.cards&&r.cards.some(c=>cards.includes(c))&&(!r.flying||r.flying===ctx.air))return r.why;
    if(r.pp&&baHasPP(cards))return r.why+' (via '+(cards.includes('amexplat')?'Amex Platinum':cards.includes('csr')?'Sapphire Reserve':'Venture X')+')';
    if(r.airline&&r.airline.id===ctx.air&&r.airline.cabins.includes(ctx.cabin)&&(!r.airline.intlOnly||ctx.intl))return r.why;
    if(r.tier&&(t.air||{})[r.tier.air]&&baTierRank(r.tier.air,(t.air||{})[r.tier.air])>=baTierRank(r.tier.air,r.tier.min)&&(!r.tier.intlOnly||ctx.intl)&&r.tier.air===ctx.air)return r.why;
  }
  return null;
}

/* ---------------- page ---------------- */
window.openBenefits=function(){ window._onAdmin=false; tripSel=null; renderBenefitsPage('hotel'); };
window.renderBenefitsPage=function(tab,keep){
  document.body.classList.remove('cruise','itin');
  document.body.classList.add('home','tools');   // home-family chrome (no trip sidebar/header), tools palette
  document.body.style.setProperty('--tripac','#0E7C86');
  const me=window._app||{}; const t=(typeof travOf==='function')?travOf(me):{};
  const st=window._baState=keep?window._baState||{}:{};
  let pane='';
  if(tab==='hotel'){
    pane=Object.keys(BA_HOTEL).map(k=>{
      const H=BA_HOTEL[k]; const myTier=(t.hotel||{})[k];
      const tier=myTier||H.order[0];
      const list=(H.ben[tier]||[]).map(b=>`<div class="ba-ben">· ${b}</div>`).join('');
      return `<div class="card"><div class="chead"><span>${H.n}</span><span>${myTier?('your tier: '+myTier):'no membership — base benefits shown'}</span></div>
        <div style="padding:11px 15px">${list}
        ${!myTier?'<div class="ba-note">Add your tier under Avatar → 🎫 Travel and this personalises.</div>':''}
        ${myTier&&H.order.indexOf(myTier)<H.order.length-1?`<div class="ba-note">Next tier (${H.order[H.order.indexOf(myTier)+1]}) adds: ${(H.ben[H.order[H.order.indexOf(myTier)+1]]||[])[H.ben[H.order[H.order.indexOf(myTier)+1]].length>1?1:0]||'—'}…</div>`:''}
        </div></div>`;
    }).join('');
  }
  if(tab==='air'){
    const r=st.airRes;
    pane=`<div class="card"><div class="chead"><span>✈ What does this flight get me?</span></div>
      <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
        <select id="ba_air">${Object.keys(BA_AIRLINE_NAMES).map(a=>`<option value="${a}" ${st.air===a?'selected':''}>${BA_AIRLINE_NAMES[a]}</option>`).join('')}</select>
        <select id="ba_cab">${[['economy','Economy'],['basic','Basic economy'],['premium','Premium economy'],['business','Business'],['first','First']].map(([v,l])=>`<option value="${v}" ${st.cab===v?'selected':''}>${l}</option>`).join('')}</select>
        <input id="ba_from" placeholder="From (IAD)" maxlength="3" value="${st.from||''}" style="width:90px;text-transform:uppercase">
        <input id="ba_to" placeholder="To (ICN)" maxlength="3" value="${st.to||''}" style="width:90px;text-transform:uppercase">
        <button class="pladd" type="button" onclick="baAirGo()" style="padding:8px 14px">Check</button>
      </div></div>
      ${r?`<div style="padding:4px 15px 12px"><div style="font:600 10px var(--mono);letter-spacing:.1em;color:var(--grey);margin:6px 0 8px">${r.route}${r.tier?' · as '+r.tier:''}</div>
        ${r.items.map(i=>`<div class="ba-ben"><b>${i.label}</b><span class="ba-why">${i.why}</span></div>`).join('')}
        <div class="ba-note">Guidance from published program rules — fares and routes carry exceptions; the airline\u2019s page wins.</div></div>`
       :'<div style="padding:10px 15px 14px;font-size:12px;color:var(--grey)">Your saved airline tiers apply automatically.</div>'}
    </div>`;
  }
  if(tab==='lounge'){
    const r=st.lRes;
    pane=`<div class="card"><div class="chead"><span>🛋 Which doors open for me?</span></div>
      <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
        <input id="ba_lap" placeholder="Airport (IAD)" maxlength="3" value="${st.lap||''}" style="width:110px;text-transform:uppercase">
        <select id="ba_lair">${Object.keys(BA_AIRLINE_NAMES).map(a=>`<option value="${a}" ${st.lair===a?'selected':''}>${BA_AIRLINE_NAMES[a]}</option>`).join('')}</select>
        <select id="ba_lsvc">${[['first','Domestic / intl First'],['business','International Business'],['economy','Economy']].map(([v,l])=>`<option value="${v}" ${st.lsvc===v?'selected':''}>${l}</option>`).join('')}</select>
        <button class="pladd" type="button" onclick="baLoungeGo()" style="padding:8px 14px">Find lounges</button>
      </div></div>
      ${r?(r.list.length?r.list.map(x=>`<div class="ba-lounge ${x.ok?'':'ba-no'}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><b style="font-family:var(--serif);font-size:14px">${x.l.n}</b><span style="font:600 10px var(--mono);color:var(--grey)">${x.l.rate}</span></div>
          <div class="ba-meta">${x.l.loc} · ${x.l.hrs}</div>
          <div class="ba-meta">${x.l.am}</div>
          <div class="${x.ok?'ba-yes':'ba-nope'}">${x.ok?'✓ '+x.ok:'✕ Not with your current memberships'}${x.l.ver==='curated'?' · <i>curated — verify hours</i>':''}</div>
        </div>`).join('')+`<div class="ba-note">${r.known?'':'Airport not in the database yet — the seeded set covers this group\u2019s routes (IAD, MCO, ICN, HND, NRT, KIX, HNL, YVR). More on request. '}IAD & MCO verified against Aug 2026 sources; ✈-marked lounges depend on the ticket, not the wallet.</div>`
        :'<div style="padding:12px 15px;font-size:12px;color:var(--grey)">No lounge data for that code yet — seeded airports: IAD, MCO, ICN, HND, NRT, KIX, HNL, YVR.</div>')
      :'<div style="padding:10px 15px 14px;font-size:12px;color:var(--grey)">Combines the ticket you\u2019ll fly with the cards and statuses in your Travel profile.</div>'}
    </div>`;
  }
  panel.innerHTML=`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px">
        <div><div class="kicker" style="margin:0">TRAVEL TOOLS</div><h1 style="margin:2px 0 0;font-size:24px">Benefits Assistant</h1></div>
        <button type="button" onclick="renderHome()" style="border:1.5px solid var(--ink);background:none;border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:8px 13px;cursor:pointer;color:var(--ink)">← Trips</button>
      </div>
      <div style="display:flex;gap:16px;align-items:flex-start">
        <div class="pp-menu" style="flex:0 0 118px;border-radius:9px;padding:10px 0">
          ${[['hotel','🏨 Hotel'],['air','✈ Airline'],['lounge','🛋 Lounge']].map(([k,l])=>`<button type="button" class="${k===tab?'on':''}" onclick="renderBenefitsPage('${k}',true)">${l}</button>`).join('')}
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">${pane}</div>
      </div>
    </div>`;
};
window.baAirGo=function(){
  const g=i=>document.getElementById(i);
  const st=window._baState=window._baState||{};
  st.air=g('ba_air').value; st.cab=g('ba_cab').value;
  st.from=g('ba_from').value.trim().toUpperCase(); st.to=g('ba_to').value.trim().toUpperCase();
  const t=(typeof travOf==='function')?travOf(window._app||{}):{};
  const tier=(t.air||{})[st.air]||null;
  st.airRes=baAirlineBenefits(st.air,st.cab,st.from,st.to,tier);
  st.airRes.tier=tier;
  renderBenefitsPage('air',true);
};
window.baLoungeGo=function(){
  const g=i=>document.getElementById(i);
  const st=window._baState=window._baState||{};
  st.lap=g('ba_lap').value.trim().toUpperCase(); st.lair=g('ba_lair').value; st.lsvc=g('ba_lsvc').value;
  const t=(typeof travOf==='function')?travOf(window._app||{}):{};
  const L=BA_LOUNGES[st.lap];
  if(!L){ st.lRes={list:[],known:false}; renderBenefitsPage('lounge',true); return; }
  const home=BA_AIRLINE_HOME[st.lair];
  const apCC=(BA_AIRPORTS[st.lap]||{}).cc;
  const intl=st.lsvc!=='first'?true:(apCC!==home);   // 'domestic first' honest only vs carrier home
  const ctx={trav:t,air:st.lair,cabin:st.lsvc==='economy'?'economy':st.lsvc,intl:(st.lsvc==='business')||apCC!==home};
  st.lRes={known:true,list:L.map(l=>({l,ok:baLoungeCheck(l,ctx)})).sort((a,b)=>(b.ok?1:0)-(a.ok?1:0))};
  renderBenefitsPage('lounge',true);
};
