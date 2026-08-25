/* MODULE js/03d-cardroi.js — Card ROI (travel tools).
   Every member tracks their own premium-card benefit usage against the annual
   fee and gets a keep-or-cancel verdict. Grantable tool like Benefits (admin
   hands out access in IAM); each person's ledger is theirs alone — members
   write u.cardTrack, the master writes store.app.adminCardTrack, and both
   ride the self-owned carry in mergeApp (the same patch that fixes the trav
   rollback). Designers see their own read-only view via the save wall.

   The card database (CR_CARDS) is seeded from sources checked August 2026 —
   the 2025/26 refresh wave: Plat $895, CSR $795, AAdvantage Exec $695 from
   Aug 23 2026, United Club $695. Issuers churn these constantly, so the AF
   and every per-use value are user-editable; the seed is a starting point,
   never a cage. ver tags mark confidence like the lounge DB does.

   Priority Pass–network visits are ONE shared counter no matter how many
   cards in the wallet carry PP (Plat, Biz Plat, CSR, Venture X, Bilt
   Palladium, Strata Elite and the BofA Elite all do) — the visit
   only happened once, so its value attributes to a single card of the
   user's choosing. Airline clubs (Sky Club, United Club, Admirals) are
   card-specific networks and count on their own cards.
   FHR / THC stays are count-type perks on the Plat, valued per stay beyond
   the $600 hotel credit meter. Points earned ride a pts × ¢/pt row per card.
   Everything is bucketed per calendar year so renewals compare cleanly. */

const CR_PP_VAL=35;   // default $/visit for a Priority Pass–network door
const CR_CARDS={
 amexplat:{n:'Amex Platinum',af:895,ver:'checked Aug 2026',pp:true,
  credits:[
   ['hotel','Hotel credit (FHR/THC, $300×2)',600,'h',300],
   ['resy','Resy dining ($100/q)',400,'q',100],
   ['ent','Digital entertainment ($25/mo)',300,'m',25],
   ['air','Airline fee credit',200],
   ['uber','Uber Cash ($15/mo, $35 in Dec)',200,'m',[15,15,15,15,15,15,15,15,15,15,15,35]],
   ['uberone','Uber One membership',120],
   ['lulu','lululemon ($75/q)',300,'q',75],
   ['oura','Oura Ring',200],
   ['walmart','Walmart+ ($12.95/mo)',155,'m',12.95],
   ['clear','CLEAR Plus',209],
   ['equinox','Equinox',300]],
  counts:[
   ['fhr','FHR stay perks (breakfast, $100 prop credit…)',150],
   ['cent','Centurion Lounge visit',50],
   ['thc','THC stay perks',75]],
  note:'Plus Hilton & Marriott Gold, Global Entry every 4 yrs. Saks ended Jul 2026; Equinox cadence varies \u2014 meter it as your statements show.'},
 csr:{n:'Chase Sapphire Reserve',af:795,ver:'checked Aug 2026',pp:true,
  credits:[
   ['travel','Travel credit (automatic)',300],
   ['edit','The Edit hotel credit',500,'h',250],
   ['dining','Exclusive Tables dining ($150×2)',300,'h',150],
   ['stubhub','StubHub ($150×2)',300,'h',150],
   ['doordash','DoorDash (monthly)',300,'m',25],
   ['apple','Apple TV+ & Music',250],
   ['lyft','Lyft in-app ($10/mo, thru 9/2027)',120,'m',10],
   ['peloton','Peloton membership ($10/mo, thru 2027)',120,'m',10]],
  counts:[
   ['sapphire','Sapphire Lounge visit',50]],
  note:'Plus IHG Platinum status and Sapphire Lounges (count those visits in the shared lounge row). One-time $250 select-hotel credit runs through 2026.'},
 venturex:{n:'Capital One Venture X',af:395,ver:'checked Aug 2026',pp:true,
  credits:[
   ['travel','Capital One Travel credit',300],
   ['anniv','10k anniversary miles (~$100)',100]],
  counts:[],
  note:'Lounge guests cost extra since Feb 2026 — count your own visits in the shared lounge row.'},
 amexgold:{n:'Amex Gold',af:325,ver:'curated',pp:false,
  credits:[
   ['dining','Dining credit ($10/mo)',120,'m',10],
   ['uber','Uber Cash ($10/mo)',120,'m',10],
   ['resy','Resy ($50×2)',100,'h',50],
   ['dunkin','Dunkin ($7/mo)',84,'m',7]],
  counts:[],
  note:'No lounge network on this one.'},
 deltares:{n:'Amex Delta Reserve',af:650,ver:'checked Aug 2026',pp:false,
  credits:[
   ['stays','Delta Stays credit',200],
   ['resy','Resy dining',240,'m',20],
   ['ride','Rideshare ($10/mo)',120,'m',10]],
  counts:[
   ['club','Sky Club visit (15/yr cap)',50],
   ['comp','Companion certificate used',400],
   ['bag','Free first bag (DL, you + companions)',35]],
  note:'Sky Club is Delta\u2019s own network — it counts here, not in the shared lounge row.'},
 unitedclub:{n:'United Club Card',af:695,ver:'checked Aug 2026',pp:false,
  credits:[
   ['renowned','Renowned Hotels credit',200],
   ['ride','Rideshare credits',150],
   ['instacart','Instacart ($20/mo, thru 2027)',240,'m',20]],
  counts:[
   ['club','United Club visit',40],
   ['award','10k-mile award discount (×2/yr)',135],
   ['bag','Free checked bag (UA, you + companion, 1st & 2nd)',40]],
  note:'Membership itself retails near the AF — the per-visit counter is how it earns it back. JSX and Avis/Budget credits exist too; their splits aren’t seeded, log them however your statement pays.'},
 ritz:{n:'Chase Ritz-Carlton',af:450,ver:'checked Aug 2026 \u2014 closed to applications, product-change only',pp:true,
  credits:[
   ['air','Airline incidental credit ($300 \u2014 message Chase to apply)',300]],
  counts:[
   ['fna','Free-night award used (\u226485k, +25k top-off ok)',500],
   ['prop','$100 Ritz/St. Regis property credit (2-night min)',100],
   ['club','Ritz Club Level upgrade (3/yr, \u22647 nights)',200],
   ['sapphire','Sapphire Lounge visit',50]],
  note:'The sleeper keeper \u2014 in by name like Bilt, VX and Quest. Free authorized users EACH get their own Priority Pass (+2 guests), and this card opens Chase Sapphire Lounges too. Gold Elite + 15 elite nights, GE/TSA every 4 yrs. PP restaurants ended for this card in 2024. Club upgrade value varies wildly by property \u2014 edit the \u0024200 default to taste.'},
 unitedquest:{n:'United Quest',af:350,ver:'checked Aug 2026 \u2014 2026 refresh, credits total \u0024860',pp:false,
  credits:[
   ['travelbank','United TravelBank credit',200],
   ['ride','Rideshare ($8/mo, $12 in Dec)',100,'m',[8,8,8,8,8,8,8,8,8,8,8,12]],
   ['instacart','Instacart ($10+$5/mo, thru 2027)',180,'m',15],
   ['renowned','Renowned Hotels credit',150],
   ['jsx','JSX flights',150],
   ['avis','Avis / Budget',80]],
  counts:[
   ['award','10k-mile award discount (1/yr, +1 after \u002420k spend)',135],
   ['bag','Free checked bag (UA, you + companion, 1st & 2nd)',40]],
  note:'The mid-tier by name \u2014 in under the \u0024500 line like Bilt and VX. No lounge on this one; two free bags for you + a companion, 1,000 PQP boost, GE/TSA every 4 yrs. Rideshare cadence as reported \u2014 edit if your statement pays differently.'},
 aaexec:{n:'Citi AAdvantage Executive',af:695,ver:'checked Aug 2026 — $695 from Aug 23, $595 before; edit the AF to match your renewal',pp:false,
  credits:[
   ['vacations','AA Vacations credit ($250×2)',500,'h',250],
   ['inflight','Inflight & Admirals Club credit',100],
   ['avis','Avis / Budget',120],
   ['lyft','Lyft ($10/mo)',120,'m',10]],
  counts:[
   ['club','Admirals Club visit',40],
   ['bag','Free first bag (AA, you + up to 8 companions)',40]],
  note:'Admirals Club membership alone now retails $1,200+.'},
 bilt:{n:'Bilt Palladium',af:495,ver:'checked Aug 2026 \u2014 Card 2.0 lineup, launched Feb 2026',pp:true,
  credits:[
   ['hotel','Bilt Travel hotel credit ($200\u00d72)',400,'h',200]],
  counts:[],
  note:'Under the $500 line but in by name \u2014 the VX rule. Annual Bilt Cash and Gold status ride along; edit values as the young program settles.'},
 bonvoybrill:{n:'Amex Bonvoy Brilliant',af:650,ver:'curated',pp:false,
  credits:[
   ['dining','Dining credit ($25/mo)',300,'m',25]],
  counts:[
   ['fna','Free-night award used (\u226485k)',500],
   ['prop','$100 Ritz/St. Regis property credit (2-night min)',100]],
  note:'Plus Bonvoy Platinum Elite outright \u2014 which is why it pairs with the Japan hotels.'},
 hiltonaspire:{n:'Amex Hilton Aspire',af:550,ver:'curated',pp:false,
  credits:[
   ['resort','Hilton resort credit ($200\u00d72)',400,'h',200],
   ['flight','Flight credit ($50/q)',200,'q',50]],
  counts:[
   ['fnr','Free-night reward used',500]],
  note:'Hilton Diamond outright \u2014 the status is half the card.'},
 strataelite:{n:'Citi Strata Elite',af:595,ver:'checked Aug 2026',pp:true,
  credits:[
   ['hotel','Citi Travel hotel credit (2-night min)',300],
   ['splurge','Splurge credit (pick-2 merchants)',200],
   ['blacklane','Blacklane chauffeur ($100\u00d72)',200,'h',100]],
  counts:[
   ['admirals','Admirals Club one-day pass (4/yr)',40]],
  note:'PP Select is lounges only \u2014 no restaurant credits. Marriott + Hilton Gold ride along; GE/TSA every 4 yrs.'},
 boaelite:{n:'BofA Premium Rewards Elite',af:550,ver:'curated',pp:true,
  credits:[
   ['airline','Airline incidental credits',300],
   ['lifestyle','Lifestyle credits',150]],
  counts:[],
  note:'Quiet card \u2014 the credits and PP are the whole story; Preferred Rewards multipliers are where it earns.'},
 amexbizplat:{n:'Amex Business Platinum',af:895,ver:'curated \u2014 business credits churn; edit to your statement',pp:true,
  credits:[
   ['air','Airline fee credit',200],
   ['clear','CLEAR Plus',209]],
  counts:[
   ['cent','Centurion Lounge visit',50]],
  note:'Opens every amexplat lounge door (Centurion, GLC, Sky Clubs flying Delta). The business-side credits (Dell-style, wireless\u2026) churn too fast to seed \u2014 add them as you use them via the meters you edit.'}
};
const CR_PPCARDS=Object.keys(CR_CARDS).filter(k=>CR_CARDS[k].pp);

/* ---- whose ledger: mine, and only mine. The resolver IS the wall — every
   read and write goes through it, so one member can never touch another's
   numbers no matter what the UI is coaxed into calling. ---- */
function crStore(){
  const me=window._app||{};
  if(!me.uid)return null;
  if(me.uid==='admin'){ const A=APP(); A.adminCardTrack=A.adminCardTrack||{}; return A.adminCardTrack; }
  const u=appUsers().find(x=>x.uid===me.uid);
  if(!u)return null;
  u.cardTrack=u.cardTrack||{};
  return u.cardTrack;
}
function crCanEdit(){
  return !window._realApp&&typeof appRole==='function'&&appRole()!=='designer'&&!!(window._app&&window._app.uid);
}
function crGuard(){ if(crCanEdit())return true; flash('Read-only here','err'); return false; }
const CR_YEAR0=2026;   // the tool's floor — no ledgers exist before it
function crYearSel(){ const ui=window._crUI=window._crUI||{}; return ui.year||(ui.year=Math.max(CR_YEAR0,new Date().getFullYear())); }
function crYears(){ const top=Math.max(CR_YEAR0,new Date().getFullYear())+1; const a=[]; for(let y=CR_YEAR0;y<=top;y++)a.push(y); return a; }
function crY(){
  const s=crStore(); if(!s)return null;
  const y=crYearSel();
  s[y]=s[y]||{cards:{},pp:{n:0,v:CR_PP_VAL,to:''}};
  s[y].cards=s[y].cards||{}; s[y].pp=s[y].pp||{n:0,v:CR_PP_VAL,to:''};
  return s[y];
}
function crCard(id){ const Y=crY(); if(!Y)return null; Y.cards[id]=Y.cards[id]||{credits:{},counts:{},pts:0,cpp:1.2}; return Y.cards[id]; }
/* ---- periodized credits ----
   A credit def is [key,label,max] (annual meter, number input) or
   [key,label,max,per,slice] with per m|q|h — those render as tap pills, one
   per period, each worth the fixed slice. Storage: annual keeps a Number;
   periodized keeps {p:[bool...], r:carry} where r preserves any dollars from
   a legacy Number that didn't divide into whole slices — migration must
   never silently drop money. Future periods are locked: the calendar, not
   the user, opens them. */
function crPerN(per){ return per==='m'?12:per==='q'?4:2; }
function crPerSlice(def,i){ return Array.isArray(def[4])?Number(def[4][i]||0):Number(def[4]||0); }   // slice arrays: uneven months (Uber's \u002435 December)
function crPerLabels(per){ return per==='m'?['J','F','M','A','M','J','J','A','S','O','N','D']:per==='q'?['Q1','Q2','Q3','Q4']:['H1','H2']; }
function crCurPeriod(per,year){
  const now=new Date();
  if(year<now.getFullYear())return crPerN(per)-1;      // past year: everything open
  if(year>now.getFullYear())return -1;                 // future year: nothing open yet
  const m=now.getMonth();
  return per==='m'?m:per==='q'?Math.floor(m/3):(m<6?0:1);
}
function crCredNorm(c,k,def){
  const per=def[3], N=crPerN(per);
  let v=c.credits[k];
  if(v&&typeof v==='object'&&Array.isArray(v.p)){ while(v.p.length<N)v.p.push(false); return v; }
  let num=Number(v||0);
  const p=[...Array(N)].map(()=>false);
  for(let i=0;i<N;i++){ const sl=crPerSlice(def,i); if(sl>0&&num>=sl){p[i]=true;num=Math.round((num-sl)*100)/100;} else break; }
  return {p,r:Math.max(0,num)};                        // greedy fill front-to-back; carry keeps the odd dollars
}
function crCreditVal(c,def){
  const k=def[0];
  if(!def[3])return Number(c.credits[k]||0);
  const o=crCredNorm(c,k,def);
  const raw=o.p.reduce((a,on,i)=>a+(on?crPerSlice(def,i):0),0)+Number(o.r||0);
  return Math.min(raw,def[2]);                         // cap: \u002412.95\u00d712 lands at exactly the \u0024155 the issuer pays
}
function crMoney(n){ return (n<0?'\u2212$':'$')+Math.abs(Number(n||0)).toLocaleString('en-US',{maximumFractionDigits:0}); }

/* Which cards this person tracks: their Travel-profile wallet plus anything
   added by hand (y.extra) — the profile is the natural source, not a cage. */
function crMyCards(){
  const t=(typeof travOf==='function')?travOf(window._app||{}):{};
  const Y=crY()||{};
  const mine=(t.cards||[]).filter(id=>CR_CARDS[id]);
  (Y.extra||[]).forEach(id=>{ if(CR_CARDS[id]&&!mine.includes(id))mine.push(id); });
  return mine;
}
/* crFee, not crAF: the mutator below is window.crAF, and in a browser a
   top-level function declaration and window.<same name> are ONE binding —
   the assignment overwrote this reader and every render recursed itself to
   death. The new-Function harness masked it (sandbox 'window' is not the
   script's global scope); vm-context loading is the standard now. */
function crFee(id){
  const c=crCard(id);
  const o=(c&&c.af!==undefined&&c.af!==''&&Number(c.af)>0)?Number(c.af):null;   // af:0 = crash-loop residue, treat as unset
  return o!==null?o:CR_CARDS[id].af;
}
function crCardVal(id){
  const c=crCard(id); if(!c)return 0;
  const D=CR_CARDS[id];
  let v=0;
  D.credits.forEach(def=>{ v+=crCreditVal(c,def); });   // annual meters count as entered; periodized count used periods x slice + any migrated carry
  D.counts.forEach(([k,,def])=>{ const e=c.counts[k]||{}; v+=Number(e.n||0)*Number(e.v!==undefined?e.v:def); });
  v+=Number(c.pts||0)*Number(c.cpp||0)/100;
  const pp=(crY()||{}).pp||{};
  if(pp.to===id)v+=Number(pp.n||0)*Number(pp.v||CR_PP_VAL);   // the shared lounge row lands on exactly one card
  return v;
}

/* ---------------- page ---------------- */
window.openCardRoi=function(){ window._onAdmin=false; tripSel=null; renderCardRoiPage(); };
window.renderCardRoiPage=function(keep){
  if(typeof canOpen!=='function'||!canOpen('cardroi')){ if(typeof renderHome==='function')renderHome(); return; }
  document.body.classList.remove('cruise','itin');
  document.body.classList.add('home','tools');
  document.body.style.setProperty('--tripac','#0E7C86');
  if(!keep)window._crUI={};
  const Y=crY();
  if(!Y){ if(typeof renderHome==='function')renderHome(); return; }
  const edit=crCanEdit();
  const year=crYearSel();
  const mine=crMyCards();
  const pp=Y.pp;
  const myPP=mine.filter(id=>CR_CARDS[id].pp);
  if(myPP.length&&!myPP.includes(pp.to))pp.to=myPP[0];

  const totVal=mine.reduce((a,id)=>a+crCardVal(id),0);
  const totAF=mine.reduce((a,id)=>a+crFee(id),0);
  const net=totVal-totAF;

  const lbl=t=>`<div style="padding:11px 15px 2px;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey)">${t}</div>`;
  const num=(id,val,w,step)=>`<input type="number" min="0" step="${step||1}" value="${val===0?'':val}" placeholder="0" ${edit?`onchange="${id}"`:'disabled'} style="width:${w||80}px;height:30px;padding:4px 7px;font-size:12px">`;
  const bar=(v,af)=>{ const pct=af>0?Math.min(100,Math.round(v/af*100)):0; const over=v>=af;
    return `<div style="height:9px;background:var(--rule);border-radius:2px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${over?'var(--moss)':'var(--tripac,#0E7C86)'}"></span></div>`; };
  const verdict=(v,af)=>{ const d=v-af;
    return `<span style="font:700 9.5px var(--mono);letter-spacing:.04em;border:1px solid ${d>=0?'var(--moss)':'var(--clay)'};color:${d>=0?'var(--moss)':'var(--clay)'};border-radius:3px;padding:2px 6px">${d>=0?'✓ AF covered '+(d>0?'+'+crMoney(d):''):crMoney(d)+' short'}</span>`; };

  /* -------- dashboard -------- */
  const dash=`<div class="card"><div class="chead"><span>📊 ${year} — value received vs annual fees</span>
      <span><select onchange="crYearSet(+this.value)" style="height:26px;font:600 11px var(--mono);background:none;color:var(--indigo);border:1px solid var(--indigo);border-radius:3px">${crYears().map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></span></div>
    <div style="padding:14px 15px 6px;display:flex;gap:26px;flex-wrap:wrap;align-items:flex-end">
      <div><div style="font:600 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--grey)">Benefits used</div>
        <div style="font-family:var(--serif);font-size:clamp(30px,6vw,44px);line-height:1;color:var(--indigo);padding-bottom:8px">${crMoney(totVal)}</div></div>
      <div><div style="font:600 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--grey)">Annual fees</div>
        <div style="font-family:var(--serif);font-size:clamp(30px,6vw,44px);line-height:1;color:var(--grey);padding-bottom:8px">${crMoney(totAF)}</div></div>
      <div><div style="font:600 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--grey)">Net</div>
        <div style="font-family:var(--serif);font-size:clamp(30px,6vw,44px);line-height:1;color:${net>=0?'var(--moss)':'var(--clay)'};padding-bottom:8px">${crMoney(net)}</div></div>
    </div>
    ${mine.map(id=>{const v=crCardVal(id),af=crFee(id);return `<div style="padding:5px 15px;border-top:1px dotted var(--rule)">
      <div style="display:flex;justify-content:space-between;gap:10px;font-size:12.5px;margin-bottom:4px">
        <b style="font-family:var(--serif)">${CR_CARDS[id].n}</b>
        <span style="font:600 10.5px var(--mono)">${crMoney(v)} / ${crMoney(af)} &nbsp;${verdict(v,af)}</span></div>
      ${bar(v,af)}
    </div>`;}).join('')||'<div style="padding:12px 15px;font-size:12px;color:var(--grey)">No cards yet — check your premium cards under Avatar → 🎫 Travel, or add one below.</div>'}
    <div class="ba-note" style="padding:8px 15px 12px">Break-even is the fee line — moss past it means the card paid for itself this year. Seeded values ${''}checked August 2026; issuers change these constantly, so every fee and per-use value is editable.</div>
  </div>`;

  /* -------- shared lounge row: PP counted ONCE across the wallet -------- */
  const ppCard=myPP.length?`<div class="card"><div class="chead"><span>🛋 Priority Pass network — shared</span><span>counted once, whichever card opened the door</span></div>
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:11px 15px">
      ${edit?`<button class="plx" onclick="crPP(-1)" style="border:1px solid var(--rule);border-radius:3px;padding:2px 9px;font-size:14px">−</button>`:''}
      <span style="font-family:var(--serif);font-size:20px;min-width:28px;text-align:center">${pp.n||0}</span>
      ${edit?`<button class="plx" onclick="crPP(1)" style="border:1px solid var(--rule);border-radius:3px;padding:2px 9px;font-size:14px">＋</button>`:''}
      <span style="font:600 10px var(--mono);color:var(--grey)">visits ×</span>
      ${num(`crPPv(this.value)`,pp.v,70)}
      <span style="font:600 10px var(--mono);color:var(--grey)">$ each · credit it to</span>
      <select ${edit?`onchange="crPPto(this.value)"`:'disabled'} style="height:30px;font-size:12px">${myPP.map(id=>`<option value="${id}" ${pp.to===id?'selected':''}>${CR_CARDS[id].n}</option>`).join('')}</select>
      <span style="font:600 11px var(--mono);margin-left:auto">${crMoney((pp.n||0)*(pp.v||0))}</span>
    </div>
    <div class="ba-note" style="padding:0 15px 11px">${myPP.length>1?'Several of your cards carry Priority Pass, but a visit only happens once — so it lives here and lands on one card\u2019s ledger, your pick.':'Your PP visits, valued per door.'} Centurion, Sapphire Lounge, Sky Club, United Club and Admirals are card-native networks — they count on their own cards below, not here.</div>
  </div>`:'';

  /* -------- one card per card -------- */
  const cardCard=id=>{
    const D=CR_CARDS[id], c=crCard(id), v=crCardVal(id), af=crFee(id);
    const credits=D.credits.map(def=>{const [k,n,max]=def;const used=crCreditVal(c,def);const pct=Math.min(100,Math.round(used/max*100));
      const meter=`<span style="flex:1;min-width:60px;height:8px;background:var(--rule);border-radius:2px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:${used>=max?'var(--moss)':'var(--tripac,#0E7C86)'}"></span></span>`;
      if(!def[3])return `<div style="display:flex;align-items:center;gap:9px;padding:4px 15px">
        <span style="flex:0 0 42%;min-width:150px;font-size:12px">${n}</span>
        ${num(`crCredit('${id}','${k}',this.value)`,used,74,5)}
        <span style="font:600 9.5px var(--mono);color:var(--grey)">/ $${max}</span>
        ${meter}
      </div>`;
      const per=def[3], o=crCredNorm(c,k,def), cur=crCurPeriod(per,year), labels=crPerLabels(per);
      const pills=o.p.map((on,i)=>{
        const future=i>cur;
        const isCur=i===cur;
        const base='display:inline-flex;align-items:center;justify-content:center;border-radius:'+(per==='m'?'50%':'3px')+';font:700 '+(per==='m'?'8px':'8.5px')+' var(--mono);cursor:'+((edit&&!future)?'pointer':'default')+';min-width:'+(per==='m'?'19px':'27px')+';height:19px;padding:0 '+(per==='m'?'0':'4px')+';';
        const look=on?'background:var(--tripac,#0E7C86);color:#fff;border:1.5px solid var(--tripac,#0E7C86)'
          :future?'background:none;color:var(--rule);border:1.5px dashed var(--rule)'
          :'background:none;color:var(--grey);border:1.5px solid '+(isCur?'var(--clay)':'var(--rule)');
        return `<button type="button" ${edit&&!future?`onclick="crCreditP('${id}','${k}',${i})"`:'disabled'} title="${labels[i]}${Array.isArray(def[4])?' · $'+crPerSlice(def,i):''}${future?' — not yet':isCur?' — current':''}" style="${base}${look}">${labels[i]}</button>`;
      }).join('');
      return `<div style="display:flex;align-items:center;gap:7px;padding:4px 15px;flex-wrap:wrap">
        <span style="flex:0 0 42%;min-width:150px;font-size:12px">${n}${o.r>0?` <span style=\"font:600 8.5px var(--mono);color:var(--grey)\" title=\"carried from earlier tracking\">+$${o.r}</span>`:''}</span>
        <span style="display:flex;gap:3px;flex-wrap:wrap">${pills}</span>
        <span style="font:600 9.5px var(--mono);color:var(--grey);margin-left:auto">$${used} / $${max}</span>
        ${meter}
      </div>`;
    }).join('');
    const counts=D.counts.map(([k,n,def])=>{const e=c.counts[k]||{};const cnt=Number(e.n||0),val=e.v!==undefined?e.v:def;
      return `<div style="display:flex;align-items:center;gap:9px;padding:4px 15px">
        <span style="flex:0 0 42%;min-width:150px;font-size:12px">${n}</span>
        ${edit?`<button class="plx" onclick="crCount('${id}','${k}',-1,${def})" style="border:1px solid var(--rule);border-radius:3px;padding:1px 8px">−</button>`:''}
        <span style="font:600 12px var(--mono);min-width:20px;text-align:center">${cnt}</span>
        ${edit?`<button class="plx" onclick="crCount('${id}','${k}',1,${def})" style="border:1px solid var(--rule);border-radius:3px;padding:1px 8px">＋</button>`:''}
        <span style="font:600 9.5px var(--mono);color:var(--grey)">×</span>
        ${num(`crCountV('${id}','${k}',this.value,${def})`,val,66)}
        <span style="font:600 10.5px var(--mono);margin-left:auto">${crMoney(cnt*val)}</span>
      </div>`;}).join('');
    return `<div class="card"><div class="chead"><span>💳 ${D.n}</span><span>${crMoney(v)} vs AF
        ${edit?num(`crAF('${id}',this.value)`,af,72):('$'+af)} &nbsp;${verdict(v,af)}</span></div>
      ${lbl('Statement credits — enter what you\u2019ve actually used')}
      ${credits||'<div style="padding:4px 15px;font-size:11.5px;color:var(--grey)">No tracked credits on this card.</div>'}
      ${D.counts.length?lbl('Perks by the visit / use')+counts:''}
      ${lbl('✨ Points & miles earned this year')}
      <div style="display:flex;align-items:center;gap:9px;padding:4px 15px 8px">
        ${num(`crPts('${id}','pts',this.value)`,Number(c.pts||0),100,1000)}
        <span style="font:600 9.5px var(--mono);color:var(--grey)">pts ×</span>
        ${num(`crPts('${id}','cpp',this.value)`,Number(c.cpp||0),58)}
        <span style="font:600 9.5px var(--mono);color:var(--grey)">¢/pt =</span>
        <span style="font:600 11px var(--mono)">${crMoney(Number(c.pts||0)*Number(c.cpp||0)/100)}</span>
      </div>
      <div style="padding:2px 15px 6px">${bar(v,af)}</div>
      <div class="ba-note" style="padding:0 15px 11px">${esc(D.note||'')} <i>(${D.ver})</i></div>
    </div>`;
  };

  /* -------- add-a-card row for cards outside the Travel profile -------- */
  const others=Object.keys(CR_CARDS).filter(id=>!mine.includes(id));
  const addRow=edit&&others.length?`<div class="card"><div class="plform" style="padding:10px 15px"><div class="plrow1">
      <span style="font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey)">Track another card</span>
      <select id="cr_add">${others.map(id=>`<option value="${id}">${CR_CARDS[id].n} — $${CR_CARDS[id].af}</option>`).join('')}</select>
      <button class="pladd" type="button" onclick="crAdd()" style="padding:8px 12px">+ Track</button>
    </div><div class="plhint">Cards in your Avatar → 🎫 Travel profile appear automatically.</div></div></div>`:'';

  panel.innerHTML=`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px">
        <div><div class="kicker" style="margin:0">TRAVEL TOOLS</div><h1 style="margin:2px 0 0;font-size:24px">Card ROI</h1></div>
        <button type="button" onclick="renderHome()" style="border:1.5px solid var(--ink);background:none;border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:8px 13px;cursor:pointer;color:var(--ink)">← Trips</button>
      </div>
      ${edit?'':'<div class="ba-note" style="padding:0 4px 10px">Read-only view.</div>'}
      <div style="display:flex;flex-direction:column;gap:14px">
        ${dash}
        ${ppCard}
        ${mine.map(cardCard).join('')}
        ${addRow}
      </div>
    </div>`;
};

/* ---------------- mutators — every one behind the wall, every one on MY ledger ---------------- */
function crSave(){ saveOverrides(); renderCardRoiPage(true); }
window.crYearSet=function(y){ const ui=window._crUI=window._crUI||{}; ui.year=Math.max(CR_YEAR0,Number(y)||CR_YEAR0); renderCardRoiPage(true); };
window.crAF=function(id,v){ if(!crGuard())return; if(v===undefined)return; const c=crCard(id); if(!c)return; c.af=v===''?'':Math.max(0,Number(v)||0); crSave(); };
window.crCredit=function(id,k,v){ if(!crGuard())return; const c=crCard(id); if(!c)return; c.credits[k]=Math.max(0,Number(v)||0); crSave(); };
window.crCreditP=function(id,k,i){
  if(!crGuard())return;
  const c=crCard(id); if(!c)return;
  const def=CR_CARDS[id].credits.find(d=>d[0]===k); if(!def||!def[3])return;
  if(i>crCurPeriod(def[3],crYearSel())){flash('That period hasn\u2019t started yet','err');return;}
  const o=crCredNorm(c,k,def);
  o.p[i]=!o.p[i];
  c.credits[k]=o;                                      // migration persists on first touch
  crSave();
};
window.crCount=function(id,k,d,def){ if(!crGuard())return; const c=crCard(id); if(!c)return;
  c.counts[k]=c.counts[k]||{n:0,v:def};
  c.counts[k].n=Math.max(0,Number(c.counts[k].n||0)+d);
  crSave(); };
window.crCountV=function(id,k,v,def){ if(!crGuard())return; const c=crCard(id); if(!c)return;
  c.counts[k]=c.counts[k]||{n:0,v:def};
  c.counts[k].v=Math.max(0,Number(v)||0);
  crSave(); };
window.crPts=function(id,f,v){ if(!crGuard())return; const c=crCard(id); if(!c)return; c[f]=Math.max(0,Number(v)||0); crSave(); };
window.crPP=function(d){ if(!crGuard())return; const Y=crY(); if(!Y)return; Y.pp.n=Math.max(0,Number(Y.pp.n||0)+d); crSave(); };
window.crPPv=function(v){ if(!crGuard())return; const Y=crY(); if(!Y)return; Y.pp.v=Math.max(0,Number(v)||0); crSave(); };
window.crPPto=function(id){ if(!crGuard())return; const Y=crY(); if(!Y)return; Y.pp.to=id; crSave(); };
window.crAdd=function(){ if(!crGuard())return; const Y=crY(); if(!Y)return;
  const el=document.getElementById('cr_add'); if(!el||!CR_CARDS[el.value])return;
  Y.extra=Y.extra||[]; if(!Y.extra.includes(el.value))Y.extra.push(el.value);
  crSave(); };
