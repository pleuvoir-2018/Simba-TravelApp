/* MODULE js/03c-estimator.js — Travel Estimator (travel tools).
   Staff-only: admins write, designers review read-only; regular users have no
   grant path (canOpen blocks staff tools before the grant lookup, and the IAM
   grid never offers one). Rough-costs a future trip city by city before it
   earns a trip file: flights with layover legs, hotel stays with FHR flags,
   free line items, a CREDITS lane (FHR/THC/card credits as subtractions),
   POINTS-aware costing on hotels & flights (pts + program + cash value → cpp,
   the cost field becomes out-of-pocket fees), and NAMED SCENARIOS — parallel
   drafts of the same trip with a delta view, the spreadsheet's side-by-side
   columns, computed.
   Lounge cross-wire: each flight leg's departure airport is run through the
   Benefits engine (baCarrierOf / baLoungeCheck / BA_LOUNGES + the admin's
   Travel profile) and accessible doors print under the ticket. travOf lives
   in 04-planner which loads later — call-time typeof guards, never load-time.
   Data: store.app.estimator, USD. It rides the ADMIN-OWNED lane in 01-core's
   mergeApp (listed next to tripLabels) so a stale non-admin blob can never
   clobber the admin's numbers. Old single-estimate blobs migrate in ES().
   Reuses the Benefits Assistant airport combobox — must load AFTER 03b. */

const ES_CATS=['Food','POI & Cafe','Transit','Omiyage','Other'];   // free line items — Flight & Hotel are automatic lanes
const ES_ICO={'Flight':'✈','Hotel':'🏨','Food':'🍜','POI & Cafe':'☕','Transit':'🚇','Omiyage':'🎁','Other':'📦'};
const ES_CLS=['Economy','Premium Economy','Business','First'];
const ES_PROGS=[['mr','Amex MR'],['bonvoy','Bonvoy'],['ua','United'],['ac','Aeroplan'],['jl','JAL JMB'],['dl','Delta'],['other','Other']];
const ES_CABIN={'Economy':'economy','Premium Economy':'premium','Business':'business','First':'first'};

function ES(){
  const a=APP();
  if(!a.estimator||typeof a.estimator!=='object')a.estimator={};
  const E=a.estimator;
  /* migration: the first shipped shape was one flat {cities:[…]} — wrap it as
     scenario #1 rather than losing it. Two-shapes, one home. */
  if(E.cities&&!E.scens){ E.scens=[{id:'s1',name:'Estimate 1',cities:E.cities}]; E.cur='s1'; delete E.cities; }
  E.scens=E.scens||[];
  if(!E.scens.length)E.scens.push({id:'s'+Date.now(),name:'Estimate 1',cities:[]});
  if(!E.scens.some(s=>s.id===E.cur))E.cur=E.scens[0].id;
  return E;
}
/* Designers may browse other scenarios without writing: their switch lives in
   UI state, the admin's in the saved blob. */
function esScen(){
  const E=ES(), ui=window._esUI||{};
  return E.scens.find(s=>s.id===(ui.scenView||E.cur))||E.scens[0];
}
/* The write wall — every mutator checks it, mirroring the block the save
   layer enforces for designers. UI hiding alone is not protection. */
function esCanEdit(){ return typeof appRole==='function'&&appRole()==='admin'&&!window._realApp; }
function esGuard(){ if(esCanEdit())return true; flash('Read-only here — estimates are the organizer\u2019s','err'); return false; }
function esMoney(n){ return (n<0?'\u2212$':'$')+Math.abs(Number(n||0)).toLocaleString('en-US',{maximumFractionDigits:0}); }
function esPts(n){ return Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0}); }
function esNights(ci,co){ const a=Date.parse(ci),b=Date.parse(co); return (a&&b&&b>a)?Math.round((b-a)/864e5):0; }
function esCity(id){ return esScen().cities.find(c=>c.id===id); }
function esFmtD(d){ if(!d)return ''; const p=String(d).split('-'); return p.length===3?(+p[1])+'/'+(+p[2]):d; }
function esProgName(id){ const p=ES_PROGS.find(x=>x[0]===id); return p?p[1]:id; }
function esCpp(x){ return (x.pts>0&&x.val>0)?(x.val/x.pts*100):0; }

function esHotelSum(c){ return (c.hotels||[]).reduce((a,h)=>a+Number(h.cost||0),0); }
function esFlightSum(c){ return (c.flights||[]).reduce((a,f)=>a+Number(f.cost||0),0); }
function esItemSum(c,cat){ return (c.items||[]).filter(x=>!cat||(x.cat||'Other')===cat).reduce((a,x)=>a+Number(x.cost||0),0); }
function esCredSum(c){ return (c.credits||[]).reduce((a,x)=>a+Number(x.amt||0),0); }
function esCityGross(c){ return esHotelSum(c)+esFlightSum(c)+esItemSum(c); }
function esCityNet(c){ return esCityGross(c)-esCredSum(c); }
function esScenNet(s){ return (s.cities||[]).reduce((a,c)=>a+esCityNet(c),0); }
/* Points ledger: everything paid in miles/points across the scenario,
   per program — pts, stated cash value, out-of-pocket fees, weighted cpp. */
function esPtsLedger(cities){
  const led={};
  cities.forEach(c=>[...(c.hotels||[]),...(c.flights||[])].forEach(x=>{
    if(!(Number(x.pts)>0))return;
    const p=x.prog||'other';
    led[p]=led[p]||{pts:0,val:0,fees:0};
    led[p].pts+=Number(x.pts); led[p].val+=Number(x.val||0); led[p].fees+=Number(x.cost||0);
  }));
  return led;
}

/* Airport field value: resolve through the Benefits matcher; an unlisted but
   code-shaped entry (DOH, LIS…) passes through verbatim — the estimator is
   planning paper, not the lounge engine, so the small IATA base must not be
   a dead end. Free text that matches nothing flashes candidates. */
function esAp(id,label,required){
  const raw=((document.getElementById(id)||{}).value||'').trim();
  if(!raw)return required?(flash(label+' is required','err'),{ok:false}):{ok:true,code:''};
  const r=baApValue(id);
  if(r.code)return {ok:true,code:r.code};
  if(/^[A-Za-z]{3}$/.test(raw))return {ok:true,code:raw.toUpperCase()};
  flash(label+': '+(r.cands.length?('did you mean '+r.cands.slice(0,3).map(a=>a.c+' ('+a.city+')').join(' / ')+'?'):'no airport matched — a bare 3-letter code also works'),'err');
  return {ok:false};
}
function esApCity(code){ return (typeof BA_AIRPORTS!=='undefined'&&BA_AIRPORTS[code])?BA_AIRPORTS[code].city:''; }

/* ---- lounge cross-wire: which doors open on this ticket, per departure ----
   Same engine the Benefits Lounge tab runs, fed from the estimate's own
   airline text and cabin — zero extra data entry. Curated-DB caveat rides
   along from the lounge records themselves. */
function esLoungeLines(f){
  if(typeof baLoungeCheck!=='function'||typeof BA_LOUNGES==='undefined'||typeof travOf!=='function')return '';
  const trav=travOf(window._app||{});
  const air=(typeof baCarrierOf==='function')?baCarrierOf(f.airline):null;
  const cabin=ES_CABIN[f.cls]||'economy';
  const seen={};
  return (f.segs||[]).map(s=>{
    const code=s.f;
    if(!code||seen[code]||!BA_LOUNGES[code])return '';
    seen[code]=1;
    const A=(typeof BA_AIRPORTS!=='undefined'&&BA_AIRPORTS[code])||{}, B=(typeof BA_AIRPORTS!=='undefined'&&BA_AIRPORTS[s.t])||{};
    const intl=!A.cc||!B.cc||A.cc!==B.cc;
    const hits=BA_LOUNGES[code].map(l=>({l,why:baLoungeCheck(l,{trav,air,cabin,intl})})).filter(x=>x.why).slice(0,2);
    if(!hits.length)return '';
    return `<span class="pl-jpy" style="color:#0E7C86">🛋 ${esc(code)} · ${hits.map(x=>esc(x.l.n)+' — '+esc(x.why)).join(' · ')}</span>`;
  }).join('');
}

/* ---------------- breakdown bars — same language as the Japan/Jeju money tabs ---------------- */
function esBars(cities){
  const lanes=[['Flight',cities.reduce((a,c)=>a+esFlightSum(c),0)],
               ['Hotel',cities.reduce((a,c)=>a+esHotelSum(c),0)]]
    .concat(ES_CATS.map(cat=>[cat,cities.reduce((a,c)=>a+esItemSum(c,cat),0)]));
  const total=lanes.reduce((a,x)=>a+x[1],0);
  const cred=cities.reduce((a,c)=>a+esCredSum(c),0);
  if(!(total>0)&&!(cred>0))return '<div style="padding:10px 15px 12px;font-size:11.5px;color:var(--grey)">Nothing to break down yet.</div>';
  return lanes.map(([n,v])=>{
    if(!(v>0))return '';
    const pct=Math.round(v/total*100);
    return `<div style="display:flex;align-items:center;gap:9px;padding:4px 15px">
      <span style="flex:0 0 100px;font:600 9px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--grey)">${ES_ICO[n]} ${n}</span>
      <span style="flex:1;height:9px;background:var(--rule);border-radius:2px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:var(--tripac,#0E7C86)"></span></span>
      <span style="flex:0 0 96px;text-align:right;font:600 10.5px var(--mono)">${esMoney(v)} · ${pct}%</span>
    </div>`;
  }).join('')
  +(cred>0?`<div style="display:flex;justify-content:space-between;padding:6px 15px 2px;font:600 10px var(--mono);color:var(--moss)">
      <span style="letter-spacing:.05em;text-transform:uppercase">🎟 Credits</span><span>${esMoney(-cred)}</span></div>`:'');
}

/* ---------------- page ---------------- */
window.openEstimator=function(){ window._onAdmin=false; tripSel=null; renderEstimatorPage(); };
window.renderEstimatorPage=function(keep){
  /* The gate lives in the function, not on the card — any future entry point
     hits the same wall. */
  if(typeof canOpen!=='function'||!canOpen('estimator')){ if(typeof renderHome==='function')renderHome(); return; }
  document.body.classList.remove('cruise','itin');
  document.body.classList.add('home','tools');   // home-family chrome, tools palette
  document.body.style.setProperty('--tripac','#0E7C86');
  if(!keep)window._esUI={};
  const ui=window._esUI=window._esUI||{};
  const E=ES(), S=esScen(), edit=esCanEdit();
  const cities=S.cities;
  const gross=cities.reduce((a,c)=>a+esCityGross(c),0);
  const cred=cities.reduce((a,c)=>a+esCredSum(c),0);
  const net=gross-cred;
  const fhrN=cities.reduce((a,c)=>a+(c.hotels||[]).filter(h=>h.fhr).length,0);
  const led=esPtsLedger(cities);
  const ledKeys=Object.keys(led);

  const lbl=t=>`<div style="padding:11px 15px 2px;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey)">${t}</div>`;
  const xbtn=(fn,ttl)=>edit?`<button class="plx" onclick="${fn}" title="${ttl||'Remove'}" style="color:var(--clay);font-size:17px">×</button>`:'';
  const ptsTag=x=>Number(x.pts)>0?`<span class="pl-jpy" style="color:var(--plum)">✨ ${esPts(x.pts)} ${esc(esProgName(x.prog||'other'))} pts${x.val>0?` · ${esMoney(x.val)} value · ${esCpp(x).toFixed(1)}¢/pt`:''}${Number(x.cost)>0?' · '+esMoney(x.cost)+' fees':''}</span>`:'';

  /* -------- scenario bar -------- */
  const scenBar=`<div class="card"><div class="plform" style="padding:10px 15px"><div class="plrow1">
      <select onchange="esScenSet(this.value)" style="min-width:170px">${E.scens.map(s=>`<option value="${s.id}" ${s.id===S.id?'selected':''}>${esc(s.name)} — ${esMoney(esScenNet(s))}</option>`).join('')}</select>
      ${edit?`<button class="pladd" type="button" onclick="esScenNew()" style="padding:8px 12px">＋ New</button>
      <button class="pladd" type="button" onclick="esScenDup()" style="padding:8px 12px">⧉ Duplicate</button>
      <button class="pladd" type="button" onclick="esScenRen()" style="padding:8px 12px;background:none;color:var(--indigo);border:1px solid var(--indigo)">✎ Rename</button>
      ${E.scens.length>1?`<button class="pladd" type="button" onclick="esScenDel()" style="padding:8px 12px;background:none;color:var(--clay);border:1px solid var(--clay)">× Delete</button>`:''}`:''}
    </div>
    ${E.scens.length>1?`<div class="plhint">Scenarios are parallel drafts of the same trip — duplicate one, change the levers, compare below.</div>`:''}
  </div></div>`;

  /* -------- summary card -------- */
  const sumCard=`<div class="card"><div class="chead"><span>Σ ${esc(S.name)}</span><span>${cities.length} cit${cities.length===1?'y':'ies'}</span></div>
    <div style="padding:14px 15px 4px">
      <div style="font:600 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--grey)">Estimated total${cred>0?' · net of credits':''}</div>
      <div style="font-family:var(--serif);font-size:clamp(34px,7vw,52px);line-height:1;color:var(--indigo);padding-bottom:8px">${esMoney(net)}</div>
      ${cred>0?`<div style="font:600 10px var(--mono);color:var(--grey);padding-bottom:6px">Gross ${esMoney(gross)} · 🎟 Credits ${esMoney(-cred)}</div>`:''}
    </div>
    ${cities.map(c=>{const n2=esNights(c.from,c.to);return `<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 15px;border-top:1px dotted var(--rule)">
      <span style="font-size:12.5px"><b style="font-family:var(--serif)">${esc(c.name)}</b>${c.ap?` <span style="font:600 9.5px var(--mono);color:var(--plum)">${esc(c.ap)}</span>`:''}${c.from?` <span style="font:9.5px var(--mono);color:var(--grey)">${esFmtD(c.from)}${c.to?'–'+esFmtD(c.to):''}</span>`:''}</span>
      <span style="font:600 11px var(--mono)">${esMoney(esCityNet(c))}${n2?` <span style="color:var(--grey)">· ${esMoney(esCityNet(c)/n2)}/day</span>`:''}</span>
    </div>`;}).join('')}
    ${lbl('By category')}
    ${esBars(cities)}
    ${ledKeys.length?lbl('✨ Points spent')+ledKeys.map(p=>{const L=led[p];const cpp=L.val>0&&L.pts>0?(L.val/L.pts*100).toFixed(1):null;
      return `<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 15px;font:600 10.5px var(--mono)">
        <span style="color:var(--plum)">${esc(esProgName(p))}</span>
        <span>${esPts(L.pts)} pts${L.val>0?' · '+esMoney(L.val)+' value':''}${cpp?' · '+cpp+'¢/pt':''}${L.fees>0?' · '+esMoney(L.fees)+' fees':''}</span>
      </div>`;}).join('')+'<div class="ba-note" style="padding:2px 15px 4px">Only the cash side (fees) is in the dollar totals — points ride their own ledger.</div>':''}
    ${fhrN?`<div class="ba-note" style="padding:2px 15px 12px">🏨 ${fhrN} FHR-eligible stay${fhrN>1?'s':''} — breakfast for two, $100 property credit, noon check-in. Log the credit in the 🎟 Credits lane to net it out.</div>`:''}
    ${E.scens.length>1?lbl('⇄ Other scenarios')+E.scens.filter(x=>x.id!==S.id).map(x=>{const d=esScenNet(x)-net;
      return `<div style="display:flex;justify-content:space-between;gap:10px;padding:4px 15px 8px;font:600 10.5px var(--mono)">
        <span>${esc(x.name)}</span><span>${esMoney(esScenNet(x))} <span style="color:${d>0?'var(--clay)':'var(--moss)'}">(${d>=0?'+':''}${esMoney(d)} vs this)</span></span>
      </div>`;}).join(''):''}
  </div>`;

  /* -------- one card per city — FORM LAYER REBUILT FROM SCRATCH --------
     Three patch rounds on the old free-flowing rows converged on the same
     mess, so the forms are one system now: every field is a labeled cell
     (tiny mono caption above the input — unlabeled date boxes read as
     debris), widths are fixed by type (dates 135, money 110–120, selects
     130–150, only names flex), rows bottom-align to a common baseline, and
     every add-button is content-width, pinned right via margin-left:auto so
     the buttons form one column down the card. The ✨ award trio is its own
     labeled sub-row that unfolds under the checkbox; unticking clears it.
     Mutator ids are UNCHANGED — this is a render rebuild, not a data one. */
  const LBL='font:600 8.5px var(--mono);letter-spacing:.08em;color:var(--grey)';
  const esF=(lbl,inner,grow)=>`<span style="display:flex;flex-direction:column;gap:3px${grow?';flex:1;min-width:160px':''}"><label style="${LBL}">${lbl}</label>${inner}</span>`;
  const esBtnR=(fn,txt)=>`<button class="pladd" type="button" onclick="${fn}" style="flex:0 0 auto;margin-left:auto;padding:9px 20px;min-width:110px">${txt}</button>`;
  const esChk=(idAttr,lbl,extra)=>`<label style="display:inline-flex;align-items:center;gap:5px;font:600 9.5px var(--mono);letter-spacing:.05em;color:var(--grey);height:36px">${idAttr?`<input type="checkbox" id="${idAttr}" style="width:auto;height:auto">`:extra}${lbl}</label>`;
  const ptsRows=(pfx,word,cid)=>`<div class="plrow1">
        <label style="display:inline-flex;align-items:center;gap:5px;font:600 9.5px var(--mono);letter-spacing:.05em;color:var(--grey)"><input type="checkbox" style="width:auto;height:auto" onchange="var w=this.closest('.plform').querySelector('.es-pts');w.style.display=this.checked?'flex':'none';if(!this.checked)w.querySelectorAll('input').forEach(function(i){i.value='';})">✨ Award ${word}</label>
      </div>
      <div class="es-pts plrow1" style="display:none;padding-left:22px;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
        ${esF('POINTS',`<input id="${pfx}_pts_${cid}" type="number" min="0" step="1000" placeholder="85,000" style="width:110px">`)}
        ${esF('PROGRAM',`<select id="${pfx}_prog_${cid}" style="width:150px">${ES_PROGS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>`)}
        ${esF('CASH VALUE $',`<input id="${pfx}_val_${cid}" type="number" min="0" step="1" placeholder="0" style="width:120px" title="What it would have cost in cash — for ¢/pt">`)}
      </div>`;
  const cityCard=c=>{
    const hotels=(c.hotels||[]).map(h=>{const n=esNights(h.ci,h.co);return `<div class="pl-row">
      <span class="pl-ic">🏨</span>
      <span class="pl-main">${esc(h.n)}${h.fhr?' <span style="font:700 8.5px var(--mono);letter-spacing:.05em;color:#0E7C86;border:1px solid #0E7C86;border-radius:3px;padding:1px 4px">FHR</span>':''}
        <span class="pl-jpy">${esFmtD(h.ci)} → ${esFmtD(h.co)}${n&&!(Number(h.pts)>0)?` · ${n} night${n>1?'s':''} (${esMoney(Number(h.cost||0)/n)}/nt)`:n?` · ${n} night${n>1?'s':''}`:''}</span>
        ${ptsTag(h)}</span>
      <span style="font:600 11px var(--mono);align-self:center">${esMoney(h.cost)}</span>
      ${xbtn(`esDelHotel('${c.id}','${h.id}')`)}
    </div>`;}).join('');
    const flights=(c.flights||[]).map(f=>`<div class="pl-row" style="flex-wrap:wrap">
      <span class="pl-ic">✈</span>
      <span class="pl-main">${esc(f.airline||'—')} <span style="font:600 9.5px var(--mono);color:var(--plum)">${esc(f.cls||'')}</span>
        ${(f.segs||[]).map((s,i)=>`<span class="pl-jpy">${esc(s.f)} → ${esc(s.t)} · ${esFmtD(s.d)}${s.tm?' '+esc(s.tm):''}${(f.segs.length>1&&edit)?` <a href="#" onclick="esDelLeg('${c.id}','${f.id}',${i});return false" style="color:var(--clay);text-decoration:none" title="Remove leg">×</a>`:''}</span>`).join('')}
        ${ptsTag(f)}
        ${esLoungeLines(f)}</span>
      <span style="font:600 11px var(--mono);align-self:center">${esMoney(f.cost)}</span>
      ${edit?`<button class="plx" onclick="esLayForm('${c.id}','${f.id}')" title="Add a layover leg" style="color:var(--indigo)">＋</button>`:''}
      ${xbtn(`esDelFlight('${c.id}','${f.id}')`)}
      ${ui.layFor===f.id&&edit?`<div class="plform" style="flex-basis:100%;padding:8px 0 2px 30px">
        <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('FROM',baApField('el_from_'+f.id,'Code or city',''))}
          ${esF('TO',baApField('el_to_'+f.id,'Code or city',''))}
          ${esF('DATE',`<input id="el_date_${f.id}" type="date" style="width:135px">`)}
          ${esF('DEPART',`<input id="el_time_${f.id}" type="time" style="width:100px">`)}
          ${esBtnR(`esAddLeg('${c.id}','${f.id}')`,'+ Leg')}
        </div>
        <div class="plhint">Layovers are routing lines under the same ticket — the fare stays one number on the flight.</div>
      </div>`:''}
    </div>`).join('');
    const items=(c.items||[]).map(x=>`<div class="pl-row">
      <span class="pl-ic">${ES_ICO[x.cat]||'📦'}</span>
      <span class="pl-main">${esc(x.desc)}<span class="pl-jpy">${esc(x.cat||'Other')}</span></span>
      <span style="font:600 11px var(--mono);align-self:center">${esMoney(x.cost)}</span>
      ${xbtn(`esDelItem('${c.id}','${x.id}')`)}
    </div>`).join('');
    const credits=(c.credits||[]).map(x=>`<div class="pl-row">
      <span class="pl-ic">🎟</span>
      <span class="pl-main">${esc(x.desc)}<span class="pl-jpy">credit — subtracted from the total</span></span>
      <span style="font:600 11px var(--mono);align-self:center;color:var(--moss)">${esMoney(-Number(x.amt||0))}</span>
      ${xbtn(`esDelCredit('${c.id}','${x.id}')`)}
    </div>`).join('');
    return `<div class="card"><div class="chead"><span>🏙 ${esc(c.name)}${c.ap?' · '+esc(c.ap):''}</span><span>${esMoney(esCityNet(c))}
      ${edit?`&nbsp;<button class="plx" onclick="esEditCity('${c.id}')" title="Edit city" style="appearance:none;-webkit-appearance:none;background:none;border:none;cursor:pointer;padding:0 4px;color:var(--indigo);font-size:13px">✎</button><button class="plx" onclick="esDelCity('${c.id}')" title="Remove city" style="appearance:none;-webkit-appearance:none;background:none;border:none;cursor:pointer;padding:0 4px;color:var(--indigo);font-size:16px">×</button>`:''}</span></div>

      ${lbl('🏨 Hotels — '+esMoney(esHotelSum(c)))}
      ${hotels||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">No stays yet.</div>'}
      ${edit?`<div class="plform">
        <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('HOTEL',`<input id="eh_n_${c.id}" placeholder="Grand Hyatt…" maxlength="60">`,1)}
          ${esF('CHECK-IN',`<input id="eh_ci_${c.id}" type="date" style="width:135px">`)}
          ${esF('CHECK-OUT',`<input id="eh_co_${c.id}" type="date" style="width:135px">`)}
          ${esChk('eh_fhr_'+c.id,'FHR')}
        </div>
        ${ptsRows('eh','stay',c.id)}
        <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('CASH / FEES $',`<input id="eh_cost_${c.id}" type="number" min="0" step="1" placeholder="0" style="width:120px">`)}
          ${esBtnR(`esAddHotel('${c.id}')`,'+ Stay')}
        </div>
        <div class="plhint">Cash stay: leave ✨ unticked. Award stay: tick ✨ — the $ field is then just taxes/fees, and cash value feeds ¢/pt.</div>
      </div>`:''}

      ${lbl('✈ Flights — '+esMoney(esFlightSum(c)))}
      ${flights||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">No flights yet.</div>'}
      ${edit?`<div class="plform">
        <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('AIRLINE',`<input id="ef_air_${c.id}" placeholder="Delta" maxlength="30" style="width:130px">`)}
          ${esF('CLASS',`<select id="ef_cls_${c.id}" style="width:130px">${ES_CLS.map(x=>`<option>${x}</option>`).join('')}</select>`)}
          ${esF('FROM',baApField('ef_from_'+c.id,'Code or city',''))}
          ${esF('TO',baApField('ef_to_'+c.id,'Code or city',''))}
          ${esF('DATE',`<input id="ef_date_${c.id}" type="date" style="width:135px">`)}
          ${esF('DEPART',`<input id="ef_time_${c.id}" type="time" style="width:100px">`)}
        </div>
        ${ptsRows('ef','ticket',c.id)}
        <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('FARE / FEES $',`<input id="ef_cost_${c.id}" type="number" min="0" step="1" placeholder="0" style="width:120px">`)}
          ${esBtnR(`esAddFlight('${c.id}')`,'+ Flight')}
        </div>
        <div class="plhint">One row per ticket — add connections afterwards with the ＋ on the flight. Award ticket: tick ✨, the $ field is then taxes/fees.</div>
      </div>`:''}

      ${lbl('🧾 Other line items — '+esMoney(esItemSum(c)))}
      ${items||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">Nothing yet — daily food, trains, tickets…</div>'}
      ${edit?`<div class="plform"><div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('WHAT',`<input id="ei_d_${c.id}" placeholder="Daily food ×4" maxlength="60">`,1)}
          ${esF('CATEGORY',`<select id="ei_cat_${c.id}" style="width:140px">${ES_CATS.map(x=>`<option>${x}</option>`).join('')}</select>`)}
          ${esF('COST $',`<input id="ei_cost_${c.id}" type="number" min="0" step="1" placeholder="0" style="width:110px">`)}
          ${esBtnR(`esAddItem('${c.id}')`,'+ Item')}
        </div></div>`:''}

      ${lbl('🎟 Credits — '+esMoney(-esCredSum(c)))}
      ${credits||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">None yet — FHR $100/stay, THC, card travel credits.</div>'}
      ${edit?`<div class="plform"><div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
          ${esF('CREDIT',`<input id="ecr_d_${c.id}" placeholder="FHR dining" maxlength="60">`,1)}
          ${esF('AMOUNT $',`<input id="ecr_a_${c.id}" type="number" min="0" step="1" placeholder="100" style="width:110px">`)}
          ${esBtnR(`esAddCredit('${c.id}')`,'+ Credit')}
        </div></div>`:''}

      ${lbl('By category — this city')}
      ${esBars([c])}
      <div style="height:8px"></div>
    </div>`;
  };

  /* -------- add / edit-meta card — same labeled system -------- */
  const ec=ui.editCity?esCity(ui.editCity):null;
  const addCard=edit?`<div class="card" id="es_addcity"><div class="chead"><span>${ec?'✎ Edit city — '+esc(ec.name):'🗺 Add a city'}</span></div>
    <div class="plform">
      <div class="plrow1" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-start;align-items:flex-end">
        ${esF('CITY',`<input id="es_cname" placeholder="Lisbon, Sapporo…" maxlength="40" value="${ec?esc(ec.name):''}">`,1)}
        ${esF('AIRPORT',baApField('es_cap','Code or city',ec&&ec.ap?(esApCity(ec.ap)?ec.ap+' · '+esApCity(ec.ap):ec.ap):''))}
        ${esF('ARRIVE',`<input id="es_cfrom" type="date" style="width:135px" value="${ec?(ec.from||''):''}">`)}
        ${esF('LEAVE',`<input id="es_cto" type="date" style="width:135px" value="${ec?(ec.to||''):''}">`)}
        <span style="display:flex;gap:8px;margin-left:auto">
          <button class="pladd" type="button" onclick="esAddCity()" style="flex:0 0 auto;padding:9px 20px;min-width:110px;${ec?'background:var(--moss);border-color:var(--moss)':''}">${ec?'✓ Update':'+ Add city'}</button>
          ${ec?'<button class="pladd" type="button" onclick="window._esUI.editCity=null;renderEstimatorPage(true)" style="flex:0 0 auto;padding:9px 14px;background:none;color:var(--grey);border:1px solid var(--rule)">Cancel</button>':''}
        </span>
      </div>
      <div class="plhint">Each city is its own block of the same template — stays, flights, line items, credits, its own subtotal. Dates are optional but unlock the per-day burn.</div>
    </div>
  </div>`:'';

  panel.innerHTML=`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px">
        <div><div class="kicker" style="margin:0">TRAVEL TOOLS</div><h1 style="margin:2px 0 0;font-size:24px">Travel Estimator</h1></div>
        <button type="button" onclick="renderHome()" style="border:1.5px solid var(--ink);background:none;border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:8px 13px;cursor:pointer;color:var(--ink)">← Trips</button>
      </div>
      ${edit?'':'<div class="ba-note" style="padding:0 4px 10px">Design review — read only, the numbers are the organizer\u2019s.</div>'}
      <div style="display:flex;flex-direction:column;gap:14px">
        ${scenBar}
        ${sumCard}
        ${cities.map(cityCard).join('')||'<div class="card"><div style="padding:13px 16px;font-size:12.5px;color:var(--grey)">No cities yet — every estimate starts with one below.</div></div>'}
        ${addCard}
      </div>
    </div>`;
};

/* ---------------- scenario mutators ---------------- */
window.esScenSet=function(id){
  const ui=window._esUI=window._esUI||{};
  if(esCanEdit()){ ES().cur=id; ui.scenView=null; saveOverrides(); }
  else ui.scenView=id;   // designers browse without writing
  ui.editCity=null; ui.layFor=null;
  renderEstimatorPage(true);
};
window.esScenNew=function(){
  if(!esGuard())return;
  const name=prompt('Name the scenario:','Estimate '+(ES().scens.length+1));
  if(name===null||!name.trim())return;
  const s={id:'s'+Date.now(),name:name.trim().slice(0,40),cities:[]};
  ES().scens.push(s); ES().cur=s.id;
  saveOverrides(); renderEstimatorPage(true);
};
window.esScenDup=function(){
  if(!esGuard())return;
  const S=esScen();
  const s=JSON.parse(JSON.stringify(S));   // deep copy — drafts must not share objects
  s.id='s'+Date.now(); s.name=(S.name+' copy').slice(0,40);
  ES().scens.push(s); ES().cur=s.id;
  saveOverrides(); renderEstimatorPage(true);
};
window.esScenRen=function(){
  if(!esGuard())return;
  const S=esScen();
  const v=prompt('Rename scenario:',S.name);
  if(v===null||!v.trim())return;
  S.name=v.trim().slice(0,40);
  saveOverrides(); renderEstimatorPage(true);
};
window.esScenDel=function(){
  if(!esGuard())return;
  const E=ES(); if(E.scens.length<2){flash('The last scenario stays','err');return;}
  const S=esScen();
  if(!confirm('Delete scenario "'+S.name+'" and everything in it?'))return;
  E.scens=E.scens.filter(x=>x.id!==S.id);
  E.cur=E.scens[0].id;
  saveOverrides(); renderEstimatorPage(true);
};

/* ---------------- city & line mutators — every one behind the wall ---------------- */
/* Read the points trio from a form; empty points → cash mode, no fields stored. */
function esReadPts(pfx,cid){
  const g=i=>document.getElementById(pfx+'_'+i+'_'+cid);
  const pts=Number((g('pts')||{}).value||0);
  if(!(pts>0))return {};
  return {pts,prog:(g('prog')||{}).value||'other',val:Number((g('val')||{}).value||0)};
}
window.esAddCity=function(){
  if(!esGuard())return;
  const g=i=>document.getElementById(i);
  const name=(g('es_cname').value||'').trim();
  if(!name){g('es_cname').focus();return;}
  const ap=esAp('es_cap','Airport',false); if(!ap.ok)return;
  const ui=window._esUI||{};
  if(ui.editCity){
    const c=esCity(ui.editCity); if(!c)return;
    c.name=name; c.ap=ap.code; c.from=g('es_cfrom').value||''; c.to=g('es_cto').value||'';
    ui.editCity=null;
  }else{
    esScen().cities.push({id:'ec'+Date.now(),name,ap:ap.code,from:g('es_cfrom').value||'',to:g('es_cto').value||'',hotels:[],flights:[],items:[],credits:[]});
  }
  saveOverrides(); renderEstimatorPage(true);
};
window.esEditCity=function(id){ (window._esUI=window._esUI||{}).editCity=id; renderEstimatorPage(true);
  const el=document.getElementById('es_addcity'); if(el)el.scrollIntoView({behavior:'smooth',block:'center'}); };
window.esDelCity=function(id){
  if(!esGuard())return;
  const c=esCity(id); if(!c)return;
  if(!confirm('Remove '+c.name+' and everything estimated under it?'))return;
  const S=esScen(); S.cities=S.cities.filter(x=>x.id!==id);
  saveOverrides(); renderEstimatorPage(true);
};
window.esAddHotel=function(cid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const g=i=>document.getElementById(i+'_'+cid);
  const n=(g('eh_n').value||'').trim(); if(!n){g('eh_n').focus();return;}
  const ci=g('eh_ci').value,co=g('eh_co').value;
  if(ci&&co&&!(Date.parse(co)>Date.parse(ci))){flash('Check-out must be after check-in','err');return;}
  c.hotels=c.hotels||[];
  c.hotels.push(Object.assign({id:'h'+Date.now(),n,ci,co,cost:Number(g('eh_cost').value||0),fhr:!!g('eh_fhr').checked},esReadPts('eh',cid)));
  saveOverrides(); renderEstimatorPage(true);
};
window.esDelHotel=function(cid,hid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  c.hotels=(c.hotels||[]).filter(x=>x.id!==hid);
  saveOverrides(); renderEstimatorPage(true);
};
window.esAddFlight=function(cid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const g=i=>document.getElementById(i+'_'+cid);
  const air=(g('ef_air').value||'').trim(); if(!air){g('ef_air').focus();return;}
  const F=esAp('ef_from_'+cid,'From',true); if(!F.ok)return;
  const T=esAp('ef_to_'+cid,'To',true); if(!T.ok)return;
  c.flights=c.flights||[];
  c.flights.push(Object.assign({id:'f'+Date.now(),airline:air,cls:g('ef_cls').value,cost:Number(g('ef_cost').value||0),
    segs:[{f:F.code,t:T.code,d:g('ef_date').value||'',tm:g('ef_time').value||''}]},esReadPts('ef',cid)));
  saveOverrides(); renderEstimatorPage(true);
};
window.esDelFlight=function(cid,fid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  c.flights=(c.flights||[]).filter(x=>x.id!==fid);
  saveOverrides(); renderEstimatorPage(true);
};
window.esLayForm=function(cid,fid){
  const ui=window._esUI=window._esUI||{};
  ui.layFor=ui.layFor===fid?null:fid;
  renderEstimatorPage(true);
};
window.esAddLeg=function(cid,fid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const f=(c.flights||[]).find(x=>x.id===fid); if(!f)return;
  const F=esAp('el_from_'+fid,'From',true); if(!F.ok)return;
  const T=esAp('el_to_'+fid,'To',true); if(!T.ok)return;
  const g=i=>document.getElementById(i+'_'+fid);
  f.segs=f.segs||[];
  f.segs.push({f:F.code,t:T.code,d:g('el_date').value||'',tm:g('el_time').value||''});
  /* keep the routing chronological when dates are supplied — same discipline
     as the Japan rail inserts */
  f.segs.sort((a,b)=>String(a.d+' '+a.tm).localeCompare(String(b.d+' '+b.tm)));
  (window._esUI||{}).layFor=null;
  saveOverrides(); renderEstimatorPage(true);
};
window.esDelLeg=function(cid,fid,idx){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const f=(c.flights||[]).find(x=>x.id===fid); if(!f||!f.segs||f.segs.length<2)return;
  f.segs.splice(idx,1);
  saveOverrides(); renderEstimatorPage(true);
};
window.esAddItem=function(cid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const g=i=>document.getElementById(i+'_'+cid);
  const d=(g('ei_d').value||'').trim(); if(!d){g('ei_d').focus();return;}
  c.items=c.items||[];
  c.items.push({id:'i'+Date.now(),desc:d,cat:g('ei_cat').value,cost:Number(g('ei_cost').value||0)});
  saveOverrides(); renderEstimatorPage(true);
};
window.esDelItem=function(cid,iid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  c.items=(c.items||[]).filter(x=>x.id!==iid);
  saveOverrides(); renderEstimatorPage(true);
};
window.esAddCredit=function(cid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  const g=i=>document.getElementById(i+'_'+cid);
  const d=(g('ecr_d').value||'').trim(); if(!d){g('ecr_d').focus();return;}
  const a=Number(g('ecr_a').value||0); if(!(a>0)){g('ecr_a').focus();return;}
  c.credits=c.credits||[];
  c.credits.push({id:'cr'+Date.now(),desc:d,amt:a});
  saveOverrides(); renderEstimatorPage(true);
};
window.esDelCredit=function(cid,crid){
  if(!esGuard())return;
  const c=esCity(cid); if(!c)return;
  c.credits=(c.credits||[]).filter(x=>x.id!==crid);
  saveOverrides(); renderEstimatorPage(true);
};
