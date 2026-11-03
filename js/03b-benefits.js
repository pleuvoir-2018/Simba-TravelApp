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
 CUN:{city:'Canc\u00fan',cc:'MX'},
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
/* Priority Pass reality checks (Aug 2026, per Wesley):
   — Chase SAPPHIRE LOUNGES no longer honour the one-free-visit for ordinary
     Priority Pass members; entry is Chase-issued PP Select / cardholders.
     One IS seeded: IAD Concourse A (the ex-Etihad space). Its rules carry
     cards:['csr'] and must NOT carry a pp rule; the same applies to any
     Sapphire Lounge seeded in future.
   — United Clubs: domestic first does NOT get in; the airline rules on every
     United Club row are intlOnly for that reason. */
const BA_PP_CARDS=['amexplat','csr','venturex','bilt','strataelite','boaelite','amexbizplat','ritz'];
/* amexbizplat rides every amexplat door rule (Centurion, GLC, Plaza Premium,
   flying-Delta Sky Clubs) — the why-strings keep the shorter 'Amex Platinum'
   label for both. */
const BA_LOUNGES={
 IAD:[
  {n:'Capital One Lounge',loc:'Ticketing level, post-TSA PreCheck between East/West checkpoints',hrs:'06:00–22:00',rate:'4.5★',am:'Hot food, bar, grab-and-go, showers, nursing room',
   rules:[{cards:['venturex'],why:'Venture X — Capital One Lounge network (guest fees from Feb 2026)'}],ver:'verified Aug 2026'},
  {n:'Turkish Airlines Lounge',loc:'Concourse B, opposite B43',hrs:'~09:00–23:00 (flight-dependent)',rate:'4.6★',am:'Best food at IAD — hot buffet, cocktail bar, showers; walk-in day passes',
   rules:[{pp:true,why:'Priority Pass'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance premium cabin'}],ver:'verified Aug 2026'},
  {n:'United Polaris Lounge',loc:'Concourse C',hrs:'from ~05:30 to last departure',rate:'4.6★',am:'À la carte dining, showers, quiet suites',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'United/Star long-haul business — 2026: basic business fares excluded'},{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA long-haul premium cabin'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Air Canada Signature (Star long-haul J)'}],ver:'verified Aug 2026'},
  {n:'United Club (C7 · C17 · D)',loc:'Concourses C & D',hrs:'05:30–22:00',rate:'4.0★',am:'Standard Club fare, multiple locations',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'United intl premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold on intl itinerary'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+ (Star Gold) intl'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Star premium cabin'},{cards:['unitedclub'],why:'United Club Infinite card'}],ver:'verified Aug 2026'},
  {n:'Air France–KLM Lounge',loc:'Concourse A (upper level)',hrs:'afternoon bank ~12:00–22:00',rate:'4.3★',am:'Taittinger champagne, French bites',
   rules:[{pp:true,why:'Priority Pass (capacity-controlled)'}],ver:'verified Aug 2026'},
  {n:'Chase Sapphire Lounge (ex-Etihad)',loc:'Concourse A near A14',hrs:'06:00–22:00',rate:'4.4★',am:'The Chase build-out of the old Etihad space; à la carte at peak',
   /* Sapphire Lounges no longer honour the PP one-free-visit (Aug 2026):
      entry is Sapphire Reserve cardholders, not Priority Pass. */
   rules:[{cards:['csr'],why:'Sapphire Reserve cardholder'}],ver:'verified Aug 2026'},
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
   rules:[{pp:true,why:'Priority Pass'},{cards:['amexplat','amexbizplat'],why:'Amex Platinum — Plaza Premium network'}],ver:'verified Aug 2026'},
  {n:'Delta Sky Club',loc:'Terminal B / Airside 3',hrs:'per DL bank',rate:'4.2★',am:'Strictest door at MCO; no day passes',
   rules:[{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta same-day (visit limits apply)'},{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta'},{airline:{id:'dl',cabins:['business','first']},why:'Delta One / First (route rules)'}],ver:'verified Aug 2026'},
  {n:'Admirals Club',loc:'Terminal B / Airside 3 near gate 55',hrs:'~05:00–20:00 (fills by mid-morning at peak)',rate:'3.9★',am:'Undersized for the traffic; day pass ~$79',
   rules:[{cards:['aaexec'],why:'Citi / AAdvantage Executive'},{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'oneworld intl premium cabin'},{tier:{air:'aa',min:'Platinum',intlOnly:true},why:'oneworld Sapphire+ on qualifying intl'}],ver:'verified Aug 2026'},
  {n:'United Club',loc:'Terminal B / Airside 3',hrs:'per UA bank',rate:'3.8★',am:'Small; standard Club spread',
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'UA intl premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold on intl itinerary'}],ver:'verified Aug 2026'}
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
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'UA intl premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
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
   rules:[{cards:['unitedclub'],why:'United Club Infinite'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'UA intl premium cabin'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
  {n:'Delta Sky Club',loc:'Terminal 2',hrs:'per DL bank',rate:'4.0★',am:'Compact Sky Club',
   rules:[{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta'},{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta'},{airline:{id:'dl',cabins:['business','first']},why:'Delta premium cabin'}],ver:'curated'}
 ],
 YVR:[
  {n:'Plaza Premium Lounge (Intl & Transborder)',loc:'Intl departures + US transborder',hrs:'~05:00–22:00',rate:'4.1★',am:'Plaza Premium\u2019s home airport — hot food, showers',
   rules:[{pp:true,why:'Priority Pass'},{cards:['amexplat','amexbizplat'],why:'Amex Platinum — Plaza Premium network'}],ver:'curated'},
  {n:'SKYTEAM / Air Canada Maple Leaf Lounges',loc:'Intl & transborder piers',hrs:'per bank',rate:'4.2★',am:'Alliance doors before the Yokohama-bound legs',
   rules:[{airline:{id:'ac',cabins:['business','first']},why:'Air Canada Signature / Maple Leaf home hub'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+ (Star Gold)'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business (Maple Leaf)'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'},{airline:{id:'dl',cabins:['business'],intlOnly:true},why:'SkyTeam business (SkyTeam lounge)'},{airline:{id:'ke',cabins:['business','first']},why:'SkyTeam — KE Prestige uses SkyTeam/contract door'}],ver:'curated'}
 ],
 YYZ:[
  {n:'American Express Lounge',loc:'T1 · international departures, near the E-gates (post-security)',hrs:'~05:30–21:00',rate:'4.0★',am:'Table-service plates, espresso bar — the calm room before AC/UA banks',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum — Global Lounge Collection'}],ver:'curated'},
  {n:'Plaza Premium Lounges (T1 & T3)',loc:'T1 Intl E-gates · T3 Intl and Domestic',hrs:'per terminal, ~04:30–23:00',rate:'3.8★',am:'Hot buffet and showers, several rooms — busiest before the evening transatlantic bank',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum — Plaza Premium network'},{pp:true,why:'Priority Pass'}],ver:'curated'},
  {n:'Air Canada Maple Leaf Lounges & Signature Suite',loc:'T1 · domestic, transborder and international piers',hrs:'per bank',rate:'4.3★',am:'AC\u2019s home hub — the Signature Suite is à-la-carte dining for intl Signature Class',
   rules:[{airline:{id:'ac',cabins:['business','first']},why:'Air Canada Signature / Maple Leaf home hub'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+ (Star Gold)'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance business (Maple Leaf)'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'}
 ],
 SEA:[
  {n:'The Centurion Lounge',loc:'Central Terminal, mezzanine level',hrs:'05:00–22:00',rate:'4.2★',am:'Big bar as you enter, Pacific-NW menu',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum — 3-hour window'}],ver:'curated'},
  {n:'Delta Sky Clubs (A & B)',loc:'Concourses A and B',hrs:'per bank',rate:'4.1★',am:'Two clubs — the A club is the newer, bigger one',
   rules:[{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta (15 visits/yr)'},{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta — 10 visits/yr cap'},{airline:{id:'dl',cabins:['business']},why:'Delta One'}],ver:'curated'}
 ],
 LAX:[
  {n:'The Centurion Lounge',loc:'Tom Bradley Intl (TBIT) — airside-reachable from T4–8',hrs:'06:00–22:00',rate:'4.0★',am:'The connector walk from T7 is real — budget 15 min',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'Delta Sky Club',loc:'Terminal 3',hrs:'per bank',rate:'4.3★',am:'Post-renovation flagship with the sunset deck',
   rules:[{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta (15 visits/yr)'},{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta — 10 visits/yr cap'},{airline:{id:'dl',cabins:['business']},why:'Delta One'}],ver:'curated'},
  {n:'United Club',loc:'Terminals 7/8',hrs:'per bank',rate:'3.8★',am:'Two clubs on the United side',
   rules:[{cards:['unitedclub'],flying:'ua',why:'United Club Card membership'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star Alliance intl business'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
  {n:'Star Alliance Business Lounge',loc:'TBIT, above the great hall',hrs:'per bank',rate:'4.4★',am:'The outdoor terrace is the best airside space at LAX',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star intl business'},{airline:{id:'ac',cabins:['business','first'],intlOnly:true},why:'Air Canada Signature'},{airline:{id:'nh',cabins:['business','first']},why:'ANA premium'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'},{tier:{air:'ac',min:'50K',intlOnly:true},why:'Aeroplan 50K+'}],ver:'curated'},
  {n:'Korean Air KAL Business Class Lounge',loc:'TBIT',hrs:'per KE banks',rate:'3.7★',am:'Quieter fallback when the alliance lounges queue',
   rules:[{airline:{id:'ke',cabins:['business','first']},why:'KE Prestige/First'},{tier:{air:'ke',min:'Morning Calm'},why:'SKYPASS elite'},{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 SFO:[
  {n:'The Centurion Lounge (temporary)',loc:'Terminal 3 — interim space during the T3 West project; permanent room reopens 2027',hrs:'reduced — check the app',rate:'3.6★',am:'Napa tasting wall is on pause in the temp space',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'United Polaris Lounge',loc:'Intl Terminal G',hrs:'per intl banks',rate:'4.6★',am:'Sit-down dining — the best UA lounge anywhere',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Polaris — intl business/first only'}],ver:'curated'},
  {n:'United Clubs',loc:'Terminal 3 & Intl G',hrs:'per bank',rate:'3.9★',am:'Hub-sized, hub-crowded',
   rules:[{cards:['unitedclub'],flying:'ua',why:'United Club Card membership'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star intl business'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'},
  {n:'The Club SFO',loc:'Terminal A',hrs:'~06:00–23:00',rate:'3.5★',am:'The independent fallback',
   rules:[{pp:true,why:'Priority Pass'},{cards:['amexplat','amexbizplat'],why:'Amex Global Lounge Collection'}],ver:'curated'}
 ],
 CUN:[
  {n:'Mera Business Lounges (T3 & T4)',loc:'Terminals 3 and 4, airside',hrs:'~06:00–22:00',rate:'3.4★',am:'The workhorse pair — T4 is the newer room',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'},
  {n:'The Grand Lounge Elite',loc:'Terminal 3',hrs:'~07:00–21:00',rate:'3.6★',am:'Calmer than the Meras when charter banks surge',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 DFW:[
  {n:'The Centurion Lounge',loc:'Terminal D, near D12 — expansion in the works',hrs:'05:30–22:00',rate:'4.1★',am:'Texas BBQ station; Skylink reaches it from every terminal',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'Capital One Lounge',loc:'Terminal D, near D22',hrs:'~05:00–22:00',rate:'4.5★',am:'The original C1 lounge — grab-and-go wall included',
   rules:[{cards:['venturex'],why:'Venture X — guests are paid since Feb 2026'}],ver:'curated'},
  {n:'Admirals Clubs',loc:'Every terminal — AA’s fortress',hrs:'per bank',rate:'3.9★',am:'A/B/C/D rooms; D is the flagship-adjacent one',
   rules:[{cards:['aaexec'],flying:'aa',why:'AAdvantage Exec — Admirals membership, AA/oneworld same day'},{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'AA intl premium'},{tier:{air:'jl',min:'Sapphire',intlOnly:true},why:'oneworld Sapphire (JMB) intl'}],ver:'curated'},
  {n:'Flagship Lounge',loc:'Terminal D',hrs:'per intl banks',rate:'4.4★',am:'The intl-premium room — worth skipping Admirals for',
   rules:[{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'AA intl business/first'},{tier:{air:'jl',min:'Sapphire',intlOnly:true},why:'oneworld Sapphire intl'}],ver:'curated'}
 ],
 JFK:[
  {n:'The Centurion Lounge',loc:'Terminal 4, mezzanine above the A gates',hrs:'per T4 banks',rate:'4.2★',am:'Two floors and the mini spa',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'Chase Sapphire Lounge by The Club',loc:'Terminal 4, adjacent to the Centurion',hrs:'per T4 banks',rate:'4.3★',am:'The ex-Etihad space, Chase-run',
   rules:[{cards:['csr','ritz'],why:'Sapphire Reserve or Ritz-Carlton card — ordinary Priority Pass no longer admits'}],ver:'curated'},
  {n:'Delta Sky Club & Delta One Lounge',loc:'Terminal 4',hrs:'per bank',rate:'4.4★',am:'The Delta One room (2024) is the prize if the ticket qualifies',
   rules:[{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta (15 visits/yr)'},{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta — 10 visits/yr cap'},{airline:{id:'dl',cabins:['business']},why:'Delta One — the dedicated lounge'}],ver:'curated'},
  {n:'Admirals Club & Flagship Lounge',loc:'Terminal 8',hrs:'per bank',rate:'4.0★',am:'Flagship for intl premium; Admirals for the membership',
   rules:[{cards:['aaexec'],flying:'aa',why:'AAdvantage Exec membership'},{airline:{id:'aa',cabins:['business','first'],intlOnly:true},why:'AA intl premium → Flagship'},{tier:{air:'jl',min:'Sapphire',intlOnly:true},why:'oneworld Sapphire intl'}],ver:'curated'}
 ],
 LGA:[
  {n:'The Centurion Lounge',loc:'Terminal B, fourth floor',hrs:'05:00–22:00 (Sat to 21:00)',rate:'4.0★',am:'Above the food hall — the escalator hides behind the water wall',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'Chase Sapphire Lounge',loc:'Terminal B',hrs:'per bank',rate:'4.5★',am:'Chase’s showcase room',
   rules:[{cards:['csr','ritz'],why:'Sapphire Reserve or Ritz-Carlton card — ordinary Priority Pass no longer admits'}],ver:'curated'},
  {n:'Capital One Landing',loc:'Terminal B — opened Feb 2026',hrs:'per bank',rate:'4.2★',am:'Small-plates concept, brand-new',
   rules:[{cards:['venturex'],why:'Venture X — guests are paid extras'}],ver:'curated'},
  {n:'Delta Sky Club',loc:'Terminal C',hrs:'per bank',rate:'4.1★',am:'The big C-terminal club from the rebuild',
   rules:[{cards:['deltares'],flying:'dl',why:'Delta Reserve flying Delta (15 visits/yr)'},{cards:['amexplat','amexbizplat'],flying:'dl',why:'Amex Platinum flying Delta — 10 visits/yr cap'},{airline:{id:'dl',cabins:['business']},why:'Delta One'}],ver:'curated'}
 ],
 EWR:[
  {n:'United Polaris Lounge',loc:'Terminal C, near C120',hrs:'per intl banks',rate:'4.5★',am:'Sit-down dining before the transatlantic bank',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Polaris — intl business/first only'}],ver:'curated'},
  {n:'United Clubs',loc:'Terminal C (several)',hrs:'per bank',rate:'3.7★',am:'Fortress-hub rooms — C123 is usually the calmest',
   rules:[{cards:['unitedclub'],flying:'ua',why:'United Club Card membership'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Star intl business'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold intl'}],ver:'curated'}
 ],
 DCA:[
  {n:'The Centurion Lounge',loc:'Between concourses D and E, mezzanine by the central atrium',hrs:'05:00–21:00',rate:'4.3★',am:'The newest US Centurion — and the home-field one',
   rules:[{cards:['amexplat','amexbizplat'],why:'Amex Platinum'}],ver:'curated'},
  {n:'Admirals Club',loc:'National Hall, E gates side',hrs:'per bank',rate:'3.6★',am:'DCA is otherwise thin — this and the Centurion are the field',
   rules:[{cards:['aaexec'],flying:'aa',why:'AAdvantage Exec membership, AA same day'}],ver:'curated'}
 ],
 BWI:[
  {n:'The Club BWI',loc:'Concourse D, airside',hrs:'~05:00–21:00',rate:'3.3★',am:'The one independent door — BWI has no bank-brand lounges',
   rules:[{pp:true,why:'Priority Pass'}],ver:'curated'}
 ],
 ORD:[
  {n:'United Club (Terminal 1 · Gate B6, B18 & C10)',loc:'Terminal 1 Concourse B near Gate B6 (open until 11:00 PM) · Gate B18 · Concourse C',hrs:'05:00–23:00',rate:'4.1★',am:'Full bar, hot buffet, espresso machines — Gate B6 club stays open until 11:00 PM for late bank connections',
   rules:[{cards:['unitedclub'],why:'United Club Card'},{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Same-day United Business / First international/transborder connection'},{tier:{air:'ua',min:'Gold',intlOnly:true},why:'Star Gold on international/transborder itinerary'}],ver:'verified Nov 2026'},
  {n:'United Polaris Lounge',loc:'Terminal 1 Concourse C near Gate C18',hrs:'06:00–21:00',rate:'4.6★',am:'Sit-down dining, shower suites, full bar',
   rules:[{airline:{id:'ua',cabins:['business','first'],intlOnly:true},why:'Long-haul international Polaris Business'},{airline:{id:'nh',cabins:['business','first'],intlOnly:true},why:'ANA long-haul business/first'}],ver:'verified Nov 2026'}
 ]
};
/* ---- per-airport freshness: shown on the Airports tab; status derives from
   the lounges themselves (any 'verified…' entry lifts the airport). ---- */
const BA_AP_META={
 IAD:{checked:'Aug 2026'},MCO:{checked:'Aug 2026'},
 ICN:{checked:'Aug 2026'},HND:{checked:'Aug 2026'},NRT:{checked:'Aug 2026'},KIX:{checked:'Aug 2026'},
 HNL:{checked:'Aug 2026'},YVR:{checked:'Aug 2026'},YYZ:{checked:'Aug 17, 2026'},
 SEA:{checked:'Aug 17, 2026'},LAX:{checked:'Aug 17, 2026'},
 SFO:{checked:'Aug 17, 2026',note:'Centurion in a temporary space until the T3 rebuild lands (2027).'},
 CUN:{checked:'Aug 17, 2026'},DFW:{checked:'Aug 17, 2026'},JFK:{checked:'Aug 17, 2026'},
 LGA:{checked:'Aug 17, 2026'},
 EWR:{checked:'Aug 17, 2026',note:'A Centurion Lounge (Terminal A) is slated to open later in 2026 \u2014 not a door yet.'},
 DCA:{checked:'Aug 17, 2026'},BWI:{checked:'Aug 17, 2026'},ORD:{checked:'Nov 2026'}
};
function baApStatus(code){
  const L=BA_LOUNGES[code]||[];
  return L.some(l=>String(l.ver||'').startsWith('verified'))?'verified':'curated';
}
/* Requests ride the existing tickets lane \u2014 append-mostly, admin-triaged,
   merge-safe by construction. One open request per subject per person. */
function baFileReq(title,detail){
  const me=window._app||{};
  if(!me.uid){flash('Sign in first','err');return false;}
  if(typeof appRole==='function'&&appRole()==='designer'){flash('Design review account \u2014 requests don\u2019t save','err');return false;}
  const dup=appTickets().some(t=>t.by===me.uid&&t.title===title&&(t.status==='received'||t.status==='progress'));
  if(dup){flash('Already requested \u2014 it\u2019s in the organizer\u2019s queue','ok');return false;}
  APP().tickets=appTickets().concat([{id:'t'+Date.now(),kind:'airport',title,detail,
    by:me.uid,byName:me.name||'',ts:Date.now(),status:'received'}]);
  saveOverrides();
  flash('Request filed \u2014 the organizer will see it \u2713','ok');
  return true;
}
window.baReqRefresh=function(code){
  baFileReq('Airport data refresh: '+code,'Lounge data for '+code+' ('+((BA_AIRPORTS[code]||{}).city||'')+') last checked '+((BA_AP_META[code]||{}).checked||'unknown')+' \u2014 please re-verify.');
  renderBenefitsPage('ap',true);
};
window.baReqAirport=function(){
  const el=document.getElementById('ba_req_ap'); const raw=(el?el.value:'').trim();
  if(!raw){el&&el.focus();return;}
  const r=baApValue('ba_req_ap');
  const code=r.code||(/^[A-Za-z]{3}$/.test(raw)?raw.toUpperCase():null);
  const label=code?(code+((BA_AIRPORTS[code]||{}).city?' \u00b7 '+BA_AIRPORTS[code].city:'')):raw;
  if(code&&BA_LOUNGES[code]){flash(code+' is already covered \u2014 ask for a refresh instead','err');return;}
  if(baFileReq('Airport request: '+label,'Please add lounge data for '+label+'.'))
    {el.value='';renderBenefitsPage('ap',true);}
};
function baAirportsPane(){
  const me=window._app||{};
  const canReq=!!me.uid&&!(typeof appRole==='function'&&appRole()==='designer');
  const codes=Object.keys(BA_LOUNGES).sort();
  const mine=appTickets().filter(t=>t.kind==='airport'&&t.by===me.uid&&(t.status==='received'||t.status==='progress'));
  const chip=st=>st==='verified'
    ?'<span style="font:700 8.5px var(--mono);letter-spacing:.05em;color:var(--moss);border:1px solid var(--moss);border-radius:3px;padding:1px 5px">VERIFIED</span>'
    :'<span style="font:700 8.5px var(--mono);letter-spacing:.05em;color:var(--grey);border:1px solid var(--rule);border-radius:3px;padding:1px 5px">CURATED</span>';
  return `<div class="card"><div class="chead"><span>\u{1F5FA} Available airports</span><span>${codes.length} airports \u00b7 ${Object.values(BA_LOUNGES).reduce((a,l)=>a+l.length,0)} lounges</span></div>
    ${codes.map(c=>{const M=BA_AP_META[c]||{};const pend=mine.some(t=>t.title==='Airport data refresh: '+c);
      return `<div style="display:flex;align-items:center;gap:9px;padding:6px 15px;border-bottom:1px dotted var(--rule);flex-wrap:wrap">
        <b style="font-family:var(--mono);letter-spacing:.04em;min-width:38px">${c}</b>
        <span style="flex:1;min-width:120px;font-size:12.5px">${esc((BA_AIRPORTS[c]||{}).city||'\u2014')}
          <span style="display:block;font:9.5px var(--mono);color:var(--grey)">${(BA_LOUNGES[c]||[]).length} lounge${(BA_LOUNGES[c]||[]).length===1?'':'s'} \u00b7 checked ${esc(M.checked||'\u2014')}${M.note?' \u00b7 '+esc(M.note):''}</span></span>
        ${chip(baApStatus(c))}
        ${canReq?(pend?'<span style="font:600 9px var(--mono);color:var(--clay)">refresh requested</span>'
          :`<button type="button" onclick="baReqRefresh('${c}')" style="border:1px solid var(--rule);background:none;border-radius:3px;font:600 9px var(--mono);letter-spacing:.05em;text-transform:uppercase;padding:4px 8px;cursor:pointer;color:var(--indigo)">\u21BB Refresh</button>`):''}
      </div>`;}).join('')}
    <div class="ba-note" style="padding:9px 15px 12px">Verified means checked against issuer/operator pages on the date shown; curated means built from good sources but rules shift \u2014 the door decides. A refresh request lands in the organizer\u2019s ticket queue.</div>
  </div>
  <div class="card"><div class="chead"><span>\u2795 Request an airport</span></div>
    <div class="plform"><div class="plrow1">
      ${baApField('ba_req_ap','Code or city \u2014 anywhere','')}
      <button class="pladd" type="button" ${canReq?'onclick="baReqAirport()"':'disabled'} style="padding:8px 14px">Request</button>
    </div>
    <div class="plhint">${canReq?'Unknown codes are fine \u2014 a bare 3-letter code goes through as-is.':'Sign in with a member account to file requests.'}</div>
    ${mine.filter(t=>t.title.startsWith('Airport request:')).map(t=>`<div style="font:600 10px var(--mono);color:var(--grey)">\u23F3 ${esc(t.title)} \u2014 ${t.status}</div>`).join('')}
    </div>
  </div>`;
}

/* ---- smart airport field: one box, code or name, system figures it out ---- */
function baApMatches(q){
  q=(q||'').trim().toLowerCase(); if(!q)return [];
  const all=Object.keys(BA_AIRPORTS).map(c=>({c,city:BA_AIRPORTS[c].city}));
  const exact=all.filter(a=>a.c.toLowerCase()===q);
  const codeP=all.filter(a=>a.c.toLowerCase().startsWith(q)&&a.c.toLowerCase()!==q);
  const cityM=all.filter(a=>a.city.toLowerCase().includes(q)&&!exact.includes(a)&&!codeP.includes(a));
  return [...exact,...codeP,...cityM].slice(0,8);
}
function baResolveAp(q){
  const m=baApMatches(q);
  if(!m.length)return {code:null,cands:[]};
  if(m[0].c.toLowerCase()===String(q).trim().toLowerCase())return {code:m[0].c,cands:m};
  const cityEq=m.filter(a=>a.city.toLowerCase()===String(q).trim().toLowerCase());
  if(cityEq.length===1)return {code:cityEq[0].c,cands:m};
  if(m.length===1)return {code:m[0].c,cands:m};
  return {code:null,cands:m};   // ambiguous — the dropdown disambiguates
}
window.baApType=function(inp){
  const dd=inp.parentElement.querySelector('.ba-dd'); if(!dd)return;
  const m=baApMatches(inp.value);
  if(!m.length||m.some(a=>inp.value===a.c+' · '+a.city)){dd.style.display='none';return;}
  dd.innerHTML=m.map(a=>`<div class="ba-dd-i" onmousedown="baApPick(this,'${a.c}')"><b>${a.c}</b> · ${a.city}</div>`).join('');
  dd.style.display='block';
  /* Fixed-position: coordinates from the input's rect, measured after paint,
     clamped into the viewport; flips above the field when the space below is
     shorter than the list (the tablet keyboard eats half the screen). */
  const r=inp.getBoundingClientRect();
  dd.style.minWidth=Math.max(220,r.width)+'px';
  const b=dd.getBoundingClientRect(), G=10;
  let left=r.left, top=r.bottom+3;
  if(left+b.width>innerWidth-G)left=innerWidth-G-b.width;
  if(left<G)left=G;
  if(top+b.height>innerHeight-G&&r.top-3-b.height>G)top=r.top-3-b.height;
  dd.style.left=left+'px'; dd.style.top=top+'px';
};
/* The page scrolling under a fixed dropdown would strand it mid-air; close it.
   Scrolls INSIDE the list (its own scrollbar) must not — that is the fix for
   'cannot scroll through the results'. */
addEventListener('scroll',e=>{
  if(e.target&&e.target.classList&&e.target.classList.contains('ba-dd'))return;
  document.querySelectorAll('.ba-dd').forEach(d=>{if(d.style.display==='block')d.style.display='none';});
},true);
addEventListener('resize',()=>{document.querySelectorAll('.ba-dd').forEach(d=>d.style.display='none');});
window.baApPick=function(el,code){
  const wrap=el.closest('.ba-apwrap'); const inp=wrap.querySelector('input');
  inp.value=code+' · '+BA_AIRPORTS[code].city;
  wrap.querySelector('.ba-dd').style.display='none';
};
window.baApHide=function(inp){ setTimeout(()=>{const dd=inp.parentElement.querySelector('.ba-dd'); if(dd)dd.style.display='none';},160); };
function baApField(id,ph,val){
  return `<span class="ba-apwrap"><input id="${id}" placeholder="${ph}" value="${val||''}" autocomplete="off"
    oninput="baApType(this)" onfocus="baApType(this)" onblur="baApHide(this)" style="width:180px"><div class="ba-dd"></div></span>`;
}
function baApValue(id){
  const v=(document.getElementById(id)||{}).value||'';
  const picked=v.match(/^([A-Za-z]{3}) · /);
  if(picked)return {code:picked[1].toUpperCase(),cands:[]};
  return baResolveAp(v);
}
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
/* ---------------- SUMMARY: heads-up engine over the trips you're on ---------------- */
const BA_CHAIN_KEYS=[[/jw marriott|marriott|westin|sheraton|ritz|st\.? regis|renaissance|courtyard|moxy|aloft|autograph/i,'bonvoy'],
 [/hilton|conrad|waldorf|doubletree|canopy|curio/i,'hilton'],[/hyatt/i,'hyatt'],[/intercontinental|holiday inn|crowne|hotel indigo|kimpton/i,'ihg']];
const BA_CARRIER_KEYS=[[/united|polaris/i,'ua'],[/delta/i,'dl'],[/american/i,'aa'],[/korean/i,'ke'],[/asiana/i,'oz'],[/\bana\b|all nippon/i,'nh'],[/\bjal\b|japan airlines/i,'jl'],[/air canada/i,'ac']];
function baChainOf(name){ for(const [rx,id] of BA_CHAIN_KEYS)if(rx.test(name||''))return id; return null; }
function baCarrierOf(txt){ for(const [rx,id] of BA_CARRIER_KEYS)if(rx.test(txt||''))return id; return null; }
function baCodesIn(txt){ return (String(txt||'').match(/\b[A-Z]{3}\b/g)||[]).filter(c=>BA_AIRPORTS[c]); }
function baCabinOf(txt){ return /first/i.test(txt||'')?'first':(/business|prestige|polaris|signature/i.test(txt||'')?'business':'economy'); }
function baSummaryData(trav,trips){
  const out=[];
  trips.forEach(T=>{
    const card={id:T.id,title:T.title,emoji:T.emoji,items:[]};
    (T.flights||[]).forEach(f=>{
      /* Departure is what's LEFT of the arrow — never 'first code found
         anywhere'. Route strings mix city names and codes ('Tokyo Narita →
         Vancouver YVR'), so the old codes[0] read the DESTINATION of an
         arrival as a departure and minted a phantom lounge row (the YVR
         twin). If the left segment carries no code, resolve the city name
         through the same matcher the airport combobox uses; if that is
         ambiguous, skip the flight rather than guess. */
      const route=String(f.route||f.r||'');
      const seg=route.split('→')[0];
      let dep=baCodesIn(seg)[0]||null;
      if(!dep){
        const m=baApMatches(seg.trim());
        if(m.length===1)dep=m[0].c;
        else{const hit=m.filter(a=>seg.toLowerCase().includes(a.city.toLowerCase()));
          if(hit.length===1)dep=hit[0].c;}
      }
      if(!dep)return;
      const codes=[...new Set([dep,...baCodesIn(route+' '+(f.note||f.n||''))])];
      const carrier=baCarrierOf((f.train||f.f||'')+' '+(f.route||f.r||''));
      const intl=codes.some(c=>BA_AIRPORTS[c]&&BA_AIRPORTS[c].cc!==BA_AIRPORTS[dep].cc);
      const cabin=baCabinOf((f.train||f.f||'')+' '+(f.note||''));
      const L=BA_LOUNGES[dep];
      if(L){
        /* Keep the structure: each open door is a part carrying the lounge's
           INDEX in BA_LOUNGES[dep] plus the why — the hover card resolves the
           full record (loc, hrs, rating, amenities) from those two keys at
           hover time instead of flattening everything into one sentence. */
        const ok=L.map((l,li)=>({l,li,why:baLoungeCheck(l,{trav,air:carrier,cabin,intl})})).filter(x=>x.why).slice(0,3);
        if(ok.length)card.items.push({k:'lounge',t:ok.length+(ok.length>1?' doors open at ':' door opens at ')+dep,
          sub:(f.d||'')+' · '+BA_AIRPORTS[dep].city,
          parts:ok.map(x=>({t:'✓ '+x.l.n,cls:'ok',ap:dep,li:x.li,why:x.why}))});
      }
      if(carrier&&(trav.air||{})[carrier]){
        const tier=(trav.air||{})[carrier];
        const rank=baTierRank(carrier,tier);
        if(rank>0)card.items.push({k:'air',t:BA_AIRLINE_NAMES[carrier]+' as '+tier,sub:(f.d||'')+' · flight perks',
          parts:['priority check-in','priority boarding',rank>=2?'priority security where offered':null,intl&&((carrier==='ua'&&rank>=2)||(carrier==='nh'&&rank>=2)||(carrier==='oz'&&rank>=1)||(carrier==='ac'&&rank>=3))?'Star Gold lounges on this itinerary':null,intl&&carrier==='ke'&&rank>=1?'KAL Prestige lounges':null,intl&&carrier==='jl'&&rank>=2?'oneworld Sapphire lounges':null].filter(Boolean).map(p=>({t:p,cls:'perk'}))});
      }
    });
    Object.values(T.hotels||{}).forEach(h=>{
      const chain=baChainOf(h.n); if(!chain)return;
      const H=BA_HOTEL[chain]; const tier=(trav.hotel||{})[chain];
      if(tier){ card.items.push({k:'hotel',t:h.n,sub:'your '+H.n+' '+tier,
        parts:(H.ben[tier]||[]).slice(0,4).map(p=>({t:p,cls:'perk'}))}); }
      else card.items.push({k:'hotel',t:h.n,sub:H.n+' · no tier on file',
        parts:[{t:'base member rates',cls:'base',why:'Add your tier under Avatar → 🎫 Travel to personalise'}]});
    });
    if(card.items.length)out.push(card);
  });
  return out;
}
/* Lounge hover card — same body-mounted fixed-position pattern as the person
   card (uCard): measure after paint, clamp into the viewport, tap toggles on
   touch, Escape and outer scroll dismiss. The chip carries only (airport,
   index, why); the full record is resolved from BA_LOUNGES here. */
function baCardEl(){let c=document.getElementById('baCard');
  if(!c){c=document.createElement('div');c.id='baCard';document.body.appendChild(c);}return c;}
function baCardShow(el){
  const L=(BA_LOUNGES[el.dataset.ap]||[])[+el.dataset.li]; const c=baCardEl();
  if(!L){c.style.display='none';return;}
  c.innerHTML=`<div class="bac-n">${esc(L.n)}</div>
    <div class="bac-meta">${esc(L.loc)} · ${esc(L.hrs)}<span class="bac-rate">${esc(L.rate)}</span></div>
    <div class="bac-am">${esc(L.am)}</div>
    <div class="bac-why">✓ ${esc(el.dataset.why||'')}</div>
    ${L.ver==='curated'?'<div class="bac-ver">curated — verify hours before you fly</div>':''}`;
  c.style.display='block';
  const r=el.getBoundingClientRect(), b=c.getBoundingClientRect(), G=10;
  let left=r.left, top=r.bottom+7;
  if(left+b.width>innerWidth-G)left=innerWidth-G-b.width;
  if(left<G)left=G;
  if(top+b.height>innerHeight-G)top=Math.max(G,r.top-b.height-7);
  c.style.left=left+'px'; c.style.top=top+'px';
}
function baCardHide(){const c=document.getElementById('baCard');if(c)c.style.display='none';}
document.addEventListener('mouseover',e=>{
  const el=e.target.closest&&e.target.closest('.ba-lc');
  if(el)baCardShow(el); else if(!(e.target.closest&&e.target.closest('#baCard')))baCardHide();
});
document.addEventListener('focusin',e=>{const el=e.target.closest&&e.target.closest('.ba-lc');if(el)baCardShow(el);});
document.addEventListener('click',e=>{
  const el=e.target.closest&&e.target.closest('.ba-lc');
  const c=document.getElementById('baCard');
  if(el){e.stopPropagation();
    if(c&&c.style.display==='block'&&c.dataset.for===el.dataset.ap+el.dataset.li){baCardHide();c.dataset.for='';return;}
    baCardShow(el);baCardEl().dataset.for=el.dataset.ap+el.dataset.li;return;}
  baCardHide();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')baCardHide();});
addEventListener('scroll',e=>{if(!(e.target&&e.target.id==='baCard'))baCardHide();},true);
window.openBenefits=function(){ window._onAdmin=false; tripSel=null; renderBenefitsPage('sum'); };
window.renderBenefitsPage=function(tab,keep){
  saveLoc({ba:tab});
  document.body.classList.remove('cruise','itin');
  document.body.classList.add('home','tools');   // home-family chrome (no trip sidebar/header), tools palette
  document.body.style.setProperty('--tripac','#0E7C86');
  const me=window._app||{}; const t=(typeof travOf==='function')?travOf(me):{};
  const st=window._baState=keep?window._baState||{}:{};
  let pane='';
  if(tab==='sum'){
    const trips=Object.keys(window.TRIPS_REGISTRY||{}).filter(id=>typeof canOpen!=='function'||canOpen(id))
      .map(id=>({id,...(window.TRIPS_REGISTRY[id]||{})}));
    const data=baSummaryData(t,trips);
    const ICO={lounge:'🛋',air:'✈',hotel:'🏨'};
    const hasProfile=(t.cards||[]).length||Object.keys(t.air||{}).length||Object.keys(t.hotel||{}).length;
    const strip=[];
    Object.entries(t.hotel||{}).forEach(([k,tier])=>{if(tier&&BA_HOTEL[k])strip.push('🏨 '+BA_HOTEL[k].n.replace('Marriott ','').replace(' Honors','')+' '+tier);});
    Object.entries(t.air||{}).forEach(([k,tier])=>{if(tier&&BA_AIRLINE_NAMES[k])strip.push('✈ '+BA_AIRLINE_NAMES[k]+' '+tier);});
    (t.cards||[]).forEach(id=>{const cd=(typeof TRAV_CAT!=='undefined'?TRAV_CAT.cards:[]).find(x=>x.id===id);if(cd)strip.push('💳 '+cd.n);});
    const counts=c=>{const doors=c.items.filter(i=>i.k==='lounge').reduce((a,i)=>a+i.parts.length,0),
      air=c.items.filter(i=>i.k==='air').length,hot=c.items.filter(i=>i.k==='hotel').length;
      return [doors?doors+(doors>1?' lounges':' lounge'):null,air?air+(air>1?' flights':' flight'):null,hot?hot+(hot>1?' hotels':' hotel'):null].filter(Boolean).join(' · ')||'heads up';};
    const chip=p=>p.ap!==undefined
      ?`<span class="ba-chip ${p.cls} ba-lc" tabindex="0" data-ap="${p.ap}" data-li="${p.li}" data-why="${esc(p.why)}">${esc(p.t)}</span>`
      :`<span class="ba-chip ${p.cls}" ${p.why?`title="${esc(p.why)}"`:''}>${esc(p.t)}</span>`;
    pane=(hasProfile?`<div class="card"><div class="chead"><span>🎫 What the engine reads</span><span>from Avatar → Travel</span></div>
        <div class="ba-strip">${strip.map(s=>`<span class="ba-pchip">${esc(s)}</span>`).join('')}</div></div>`
      :`<div class="card"><div style="padding:13px 16px;font-size:12.5px">No memberships on file yet — add cards and statuses under <b>Avatar → 🎫 Travel</b> and this page starts predicting your trips.</div></div>`)
     +(data.length?data.map(c=>`<div class="card"><div class="chead"><span>${c.emoji||'🧭'} ${esc(c.title||c.id)}</span><span>${counts(c)}</span></div>
        ${c.items.map(i=>`<div class="ba-row"><span class="ba-ric">${ICO[i.k]}</span><span style="min-width:0">
          <div class="ba-rh">${esc(i.t)}</div><div class="ba-rsub">${esc(i.sub||'')}</div>
          <div class="ba-chips">${(i.parts||[]).map(chip).join('')}</div></span></div>`).join('')}
      </div>`).join('')
     :`<div class="card"><div style="padding:13px 16px;font-size:12.5px;color:var(--grey)">Nothing to predict yet — trips with flights or chain hotels will surface here.</div></div>`)
     +`<div class="ba-note" style="padding:0 4px">Hover a lounge chip for the room itself — hours, rating, what's inside. Built from the flights and hotels already in your trips.</div>`;
  }
  if(tab==='hotel'){
    pane=Object.keys(BA_HOTEL).map(k=>{
      const H=BA_HOTEL[k]; const myTier=(t.hotel||{})[k];
      const tier=myTier||H.order[0];
      const mi=H.order.indexOf(tier);
      /* Ladder: your rung filled, climbed rungs quiet moss, the rest outline.
         Then your tier's benefits as chips; then what the NEXT rung adds —
         only the delta, each new benefit a grey chip. Same chip language as
         the Summary so the two tabs read as one system. */
      const ladder=H.order.map((tr,i)=>`<span class="ba-chip ${myTier?(i===mi?'now':i<mi?'past':'base'):'base'}">${esc(tr)}</span>`).join('');
      const bens=(H.ben[tier]||[]).map(b=>`<span class="ba-chip perk">${esc(b)}</span>`).join('');
      let next='';
      if(myTier&&mi<H.order.length-1){
        const nt=H.order[mi+1];
        const delta=(H.ben[nt]||[]).filter(b=>!(H.ben[tier]||[]).includes(b));
        if(delta.length)next=`<div class="ba-hsec"><div class="ba-rsub">${esc(nt)} adds</div>
          <div class="ba-chips">${delta.map(b=>`<span class="ba-chip base">${esc(b)}</span>`).join('')}</div></div>`;
      }
      return `<div class="card"><div class="chead"><span>${H.n}</span><span>${myTier?'your tier':'no membership — base shown'}</span></div>
        <div class="ba-hsec"><div class="ba-rsub">Tier ladder</div><div class="ba-chips">${ladder}</div></div>
        <div class="ba-hsec"><div class="ba-rsub">${myTier?('at '+esc(myTier)):'base benefits'}</div><div class="ba-chips">${bens}</div></div>
        ${next}
        ${!myTier?'<div class="ba-note" style="padding:0 15px 12px">Add your tier under Avatar → 🎫 Travel and this personalises.</div>':''}
      </div>`;
    }).join('');
  }
  if(tab==='air'){
    const r=st.airRes;
    pane=`<div class="card"><div class="chead"><span>✈ What does this flight get me?</span></div>
      <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
        <select id="ba_air">${Object.keys(BA_AIRLINE_NAMES).map(a=>`<option value="${a}" ${st.air===a?'selected':''}>${BA_AIRLINE_NAMES[a]}</option>`).join('')}</select>
        <select id="ba_cab">${[['economy','Economy'],['basic','Basic economy'],['premium','Premium economy'],['business','Business'],['first','First']].map(([v,l])=>`<option value="${v}" ${st.cab===v?'selected':''}>${l}</option>`).join('')}</select>
        ${baApField('ba_from','From — code or city',st.fromTxt)}
        ${baApField('ba_to','To — code or city',st.toTxt)}
        <button class="pladd" type="button" onclick="baAirGo()" style="padding:8px 14px">Check</button>
      </div></div>
      ${r?`<div style="padding:4px 15px 12px"><div style="font:600 10px var(--mono);letter-spacing:.1em;color:var(--grey);margin:6px 0 8px">${r.route}${r.tier?' · as '+r.tier:''}</div>
        ${r.items.map(i=>`<div class="ba-ben"><b>${i.label}</b><span class="ba-why">${i.why}</span></div>`).join('')}
        <div class="ba-note">Guidance from published program rules — fares and routes carry exceptions; the airline\u2019s page wins.</div></div>`
       :'<div style="padding:10px 15px 14px;font-size:12px;color:var(--grey)">Your saved airline tiers apply automatically.</div>'}
    </div>`;
  }
  if(tab==='ap'){ pane=baAirportsPane(); }
  if(tab==='lounge'){
    const r=st.lRes;
    pane=`<div class="card"><div class="chead"><span>🛋 Which doors open for me?</span></div>
      <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
        ${baApField('ba_lap','Airport — code or city',st.lapTxt)}
        <select id="ba_lair">${Object.keys(BA_AIRLINE_NAMES).map(a=>`<option value="${a}" ${st.lair===a?'selected':''}>${BA_AIRLINE_NAMES[a]}</option>`).join('')}</select>
        <select id="ba_lsvc">${[['first','Domestic / intl First'],['business','International Business'],['economy','Economy']].map(([v,l])=>`<option value="${v}" ${st.lsvc===v?'selected':''}>${l}</option>`).join('')}</select>
        <button class="pladd" type="button" onclick="baLoungeGo()" style="padding:8px 14px">Find lounges</button>
      </div></div>
      ${r?(r.list.length?r.list.map(x=>`<div class="ba-lounge ${x.ok?'':'ba-no'}">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><b style="font-family:var(--serif);font-size:14px">${x.l.n}</b><span style="font:600 10px var(--mono);color:var(--grey)">${x.l.rate}</span></div>
          <div class="ba-meta">${x.l.loc} · ${x.l.hrs}</div>
          <div class="ba-meta">${x.l.am}</div>
          <div class="${x.ok?'ba-yes':'ba-nope'}">${x.ok?'✓ '+x.ok:'✕ Not with your current memberships'}${x.l.ver==='curated'?' · <i>curated — verify hours</i>':''}</div>
        </div>`).join('')+`<div class="ba-note">${r.known?'':'Airport not in the database yet — the seeded set now covers 19 airports \u2014 the 🗺 Airports tab lists them all and takes requests. '}IAD & MCO verified against Aug 2026 sources; ✈-marked lounges depend on the ticket, not the wallet.</div>`
        :'<div style="padding:12px 15px;font-size:12px;color:var(--grey)">No lounge data for that code yet — see the 🗺 Airports tab for the 19 seeded airports \u2014 and to request this one.</div>')
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
          ${[['sum','💡 Summary'],['hotel','🏨 Hotel'],['air','✈ Airline'],['lounge','🛋 Lounge'],['ap','🗺 Airports']].map(([k,l])=>`<button type="button" class="${k===tab?'on':''}" onclick="renderBenefitsPage('${k}',true)">${l}</button>`).join('')}
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:14px">${pane}</div>
      </div>
    </div>`;
};
window.baAirGo=function(){
  const g=i=>document.getElementById(i);
  const st=window._baState=window._baState||{};
  st.air=g('ba_air').value; st.cab=g('ba_cab').value;
  st.fromTxt=g('ba_from').value; st.toTxt=g('ba_to').value;
  const F=baApValue('ba_from'), T2=baApValue('ba_to');
  const amb=(r,which)=>{ if(!r.code){ flash(which+': '+(r.cands.length?('did you mean '+r.cands.slice(0,3).map(a=>a.c+' ('+a.city+')').join(' / ')+'?'):'no airport matched'),'err'); return true;} return false; };
  if(amb(F,'From')||amb(T2,'To'))return;
  st.from=F.code; st.to=T2.code;
  st.fromTxt=F.code+' · '+BA_AIRPORTS[F.code].city; st.toTxt=T2.code+' · '+BA_AIRPORTS[T2.code].city;
  const t=(typeof travOf==='function')?travOf(window._app||{}):{};
  const tier=(t.air||{})[st.air]||null;
  st.airRes=baAirlineBenefits(st.air,st.cab,st.from,st.to,tier);
  st.airRes.tier=tier;
  renderBenefitsPage('air',true);
};
window.baLoungeGo=function(){
  const g=i=>document.getElementById(i);
  const st=window._baState=window._baState||{};
  st.lapTxt=g('ba_lap').value; st.lair=g('ba_lair').value; st.lsvc=g('ba_lsvc').value;
  const R=baApValue('ba_lap');
  if(!R.code){ flash(R.cands.length?('Did you mean '+R.cands.slice(0,3).map(a=>a.c+' ('+a.city+')').join(' / ')+'?'):'No airport matched — try the code or city name','err'); return; }
  st.lap=R.code; st.lapTxt=R.code+' · '+BA_AIRPORTS[R.code].city;
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
