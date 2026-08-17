/* MODULE js/03c-estimator.js — Travel Estimator (travel tools).
   Staff-only: admins write, designers review read-only; regular users have no
   grant path (canOpen blocks staff tools before the grant lookup, and the IAM
   grid never offers one). Rough-costs a future trip city by city — flights
   with layover legs, hotel stays with FHR flags, and free line items — before
   the trip earns a data file.
   Data: store.app.estimator, USD. It rides the ADMIN-OWNED lane in 01-core's
   mergeApp (listed next to tripLabels) so a stale non-admin blob can never
   clobber the admin's numbers.
   Reuses the Benefits Assistant airport combobox (baApField / baApValue /
   BA_AIRPORTS) — this file must load AFTER 03b-benefits.js. */

const ES_CATS=['Food','POI & Cafe','Transit','Omiyage','Other'];   // free line items — Flight & Hotel are automatic lanes
const ES_ICO={'Flight':'✈','Hotel':'🏨','Food':'🍜','POI & Cafe':'☕','Transit':'🚇','Omiyage':'🎁','Other':'📦'};
const ES_CLS=['Economy','Premium Economy','Business','First'];

function ES(){ const a=APP(); if(!a.estimator||typeof a.estimator!=='object')a.estimator={}; a.estimator.cities=a.estimator.cities||[]; return a.estimator; }
/* The write wall — every mutator checks it, mirroring the block the save
   layer enforces for designers. UI hiding alone is not protection. */
function esCanEdit(){ return typeof appRole==='function'&&appRole()==='admin'&&!window._realApp; }
function esGuard(){ if(esCanEdit())return true; flash('Read-only here — estimates are the organizer\u2019s','err'); return false; }
function esMoney(n){ return '$'+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0}); }
function esNights(ci,co){ const a=Date.parse(ci),b=Date.parse(co); return (a&&b&&b>a)?Math.round((b-a)/864e5):0; }
function esCity(id){ return ES().cities.find(c=>c.id===id); }
function esHotelSum(c){ return (c.hotels||[]).reduce((a,h)=>a+Number(h.cost||0),0); }
function esFlightSum(c){ return (c.flights||[]).reduce((a,f)=>a+Number(f.cost||0),0); }
function esItemSum(c,cat){ return (c.items||[]).filter(x=>!cat||(x.cat||'Other')===cat).reduce((a,x)=>a+Number(x.cost||0),0); }
function esCitySum(c){ return esHotelSum(c)+esFlightSum(c)+esItemSum(c); }
function esFmtD(d){ if(!d)return ''; const p=String(d).split('-'); return p.length===3?(+p[1])+'/'+(+p[2]):d; }

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

/* ---------------- breakdown bars — same language as the Japan/Jeju money tabs ---------------- */
function esBars(cities){
  const lanes=[['Flight',cities.reduce((a,c)=>a+esFlightSum(c),0)],
               ['Hotel',cities.reduce((a,c)=>a+esHotelSum(c),0)]]
    .concat(ES_CATS.map(cat=>[cat,cities.reduce((a,c)=>a+esItemSum(c,cat),0)]));
  const total=lanes.reduce((a,x)=>a+x[1],0);
  if(!(total>0))return '<div style="padding:10px 15px 12px;font-size:11.5px;color:var(--grey)">Nothing to break down yet.</div>';
  return lanes.map(([n,v])=>{
    if(!(v>0))return '';
    const pct=Math.round(v/total*100);
    return `<div style="display:flex;align-items:center;gap:9px;padding:4px 15px">
      <span style="flex:0 0 100px;font:600 9px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--grey)">${ES_ICO[n]} ${n}</span>
      <span style="flex:1;height:9px;background:var(--rule);border-radius:2px;overflow:hidden"><span style="display:block;height:100%;width:${pct}%;background:var(--tripac,#0E7C86)"></span></span>
      <span style="flex:0 0 96px;text-align:right;font:600 10.5px var(--mono)">${esMoney(v)} · ${pct}%</span>
    </div>`;
  }).join('');
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
  const E=ES(), edit=esCanEdit();
  const cities=E.cities;
  const grand=cities.reduce((a,c)=>a+esCitySum(c),0);
  const fhrN=cities.reduce((a,c)=>a+(c.hotels||[]).filter(h=>h.fhr).length,0);

  const lbl=t=>`<div style="padding:11px 15px 2px;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey)">${t}</div>`;
  const xbtn=(fn,ttl)=>edit?`<button class="plx" onclick="${fn}" title="${ttl||'Remove'}" style="color:var(--clay);font-size:17px">×</button>`:'';

  /* -------- summary card -------- */
  const sumCard=`<div class="card"><div class="chead"><span>Σ Whole estimate</span><span>${cities.length} cit${cities.length===1?'y':'ies'}</span></div>
    <div style="padding:14px 15px 4px">
      <div style="font:600 10px var(--mono);letter-spacing:.15em;text-transform:uppercase;color:var(--grey)">Estimated total</div>
      <div style="font-family:var(--serif);font-size:clamp(34px,7vw,52px);line-height:1;color:var(--indigo);padding-bottom:8px">${esMoney(grand)}</div>
    </div>
    ${cities.map(c=>`<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 15px;border-top:1px dotted var(--rule)">
      <span style="font-size:12.5px"><b style="font-family:var(--serif)">${esc(c.name)}</b>${c.ap?` <span style="font:600 9.5px var(--mono);color:var(--plum)">${esc(c.ap)}</span>`:''}${c.from?` <span style="font:9.5px var(--mono);color:var(--grey)">${esFmtD(c.from)}${c.to?'–'+esFmtD(c.to):''}</span>`:''}</span>
      <span style="font:600 11px var(--mono)">${esMoney(esCitySum(c))}</span>
    </div>`).join('')}
    ${lbl('By category')}
    ${esBars(cities)}
    ${fhrN?`<div class="ba-note" style="padding:2px 15px 12px">🏨 ${fhrN} FHR-eligible stay${fhrN>1?'s':''} — breakfast for two, $100 property credit, noon check-in. The credit is not deducted from the numbers above.</div>`:''}
  </div>`;

  /* -------- one card per city -------- */
  const cityCard=c=>{
    const hotels=(c.hotels||[]).map(h=>{const n=esNights(h.ci,h.co);return `<div class="pl-row">
      <span class="pl-ic">🏨</span>
      <span class="pl-main">${esc(h.n)}${h.fhr?' <span style="font:700 8.5px var(--mono);letter-spacing:.05em;color:#0E7C86;border:1px solid #0E7C86;border-radius:3px;padding:1px 4px">FHR</span>':''}
        <span class="pl-jpy">${esFmtD(h.ci)} → ${esFmtD(h.co)}${n?` · ${n} night${n>1?'s':''} (${esMoney(Number(h.cost||0)/n)}/nt)`:''}</span></span>
      <span style="font:600 11px var(--mono);align-self:center">${esMoney(h.cost)}</span>
      ${xbtn(`esDelHotel('${c.id}','${h.id}')`)}
    </div>`;}).join('');
    const flights=(c.flights||[]).map(f=>`<div class="pl-row" style="flex-wrap:wrap">
      <span class="pl-ic">✈</span>
      <span class="pl-main">${esc(f.airline||'—')} <span style="font:600 9.5px var(--mono);color:var(--plum)">${esc(f.cls||'')}</span>
        ${(f.segs||[]).map((s,i)=>`<span class="pl-jpy">${esc(s.f)} → ${esc(s.t)} · ${esFmtD(s.d)}${s.tm?' '+esc(s.tm):''}${(f.segs.length>1&&edit)?` <a href="#" onclick="esDelLeg('${c.id}','${f.id}',${i});return false" style="color:var(--clay);text-decoration:none" title="Remove leg">×</a>`:''}</span>`).join('')}</span>
      <span style="font:600 11px var(--mono);align-self:center">${esMoney(f.cost)}</span>
      ${edit?`<button class="plx" onclick="esLayForm('${c.id}','${f.id}')" title="Add a layover leg" style="color:var(--indigo)">＋</button>`:''}
      ${xbtn(`esDelFlight('${c.id}','${f.id}')`)}
      ${ui.layFor===f.id&&edit?`<div class="plform" style="flex-basis:100%;padding:8px 0 2px 30px">
        <div class="plrow1">
          ${baApField('el_from_'+f.id,'From — code or city','')}
          ${baApField('el_to_'+f.id,'To — code or city','')}
          <input id="el_date_${f.id}" type="date"><input id="el_time_${f.id}" type="time">
          <button class="pladd" type="button" onclick="esAddLeg('${c.id}','${f.id}')" style="padding:8px 12px">+ Leg</button>
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
    return `<div class="card"><div class="chead"><span>🏙 ${esc(c.name)}${c.ap?' · '+esc(c.ap):''}</span><span>${esMoney(esCitySum(c))}
      ${edit?`&nbsp;<button class="plx" onclick="esEditCity('${c.id}')" title="Edit city" style="color:#DCEAF9">✎</button><button class="plx" onclick="esDelCity('${c.id}')" title="Remove city" style="color:#DCEAF9;font-size:16px">×</button>`:''}</span></div>

      ${lbl('🏨 Hotels — '+esMoney(esHotelSum(c)))}
      ${hotels||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">No stays yet.</div>'}
      ${edit?`<div class="plform"><div class="plrow1">
          <input id="eh_n_${c.id}" placeholder="Hotel" maxlength="60" style="flex:1;min-width:150px">
          <input id="eh_ci_${c.id}" type="date" title="Check-in"><input id="eh_co_${c.id}" type="date" title="Check-out">
          <input id="eh_cost_${c.id}" type="number" min="0" step="1" placeholder="Cost $" style="width:92px">
          <label style="display:inline-flex;align-items:center;gap:5px;font:600 9.5px var(--mono);letter-spacing:.05em;color:var(--grey)"><input type="checkbox" id="eh_fhr_${c.id}" style="width:auto;height:auto">FHR</label>
          <button class="pladd" type="button" onclick="esAddHotel('${c.id}')" style="padding:8px 12px">+ Stay</button>
        </div></div>`:''}

      ${lbl('✈ Flights — '+esMoney(esFlightSum(c)))}
      ${flights||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">No flights yet.</div>'}
      ${edit?`<div class="plform"><div class="plrow1">
          <input id="ef_air_${c.id}" placeholder="Airline" maxlength="30" style="width:120px">
          <select id="ef_cls_${c.id}">${ES_CLS.map(x=>`<option>${x}</option>`).join('')}</select>
          ${baApField('ef_from_'+c.id,'From — code or city','')}
          ${baApField('ef_to_'+c.id,'To — code or city','')}
        </div><div class="plrow1">
          <input id="ef_date_${c.id}" type="date"><input id="ef_time_${c.id}" type="time" title="Departure">
          <input id="ef_cost_${c.id}" type="number" min="0" step="1" placeholder="Fare $" style="width:92px">
          <button class="pladd" type="button" onclick="esAddFlight('${c.id}')" style="padding:8px 12px">+ Flight</button>
        </div><div class="plhint">One row per ticket — add connections afterwards with the ＋ on the flight.</div></div>`:''}

      ${lbl('🧾 Other line items — '+esMoney(esItemSum(c)))}
      ${items||'<div style="padding:6px 15px;font-size:11.5px;color:var(--grey)">Nothing yet — daily food, trains, tickets…</div>'}
      ${edit?`<div class="plform"><div class="plrow1">
          <input id="ei_d_${c.id}" placeholder="What" maxlength="60" style="flex:1;min-width:150px">
          <select id="ei_cat_${c.id}">${ES_CATS.map(x=>`<option>${x}</option>`).join('')}</select>
          <input id="ei_cost_${c.id}" type="number" min="0" step="1" placeholder="Cost $" style="width:92px">
          <button class="pladd" type="button" onclick="esAddItem('${c.id}')" style="padding:8px 12px">+ Item</button>
        </div></div>`:''}

      ${lbl('By category — this city')}
      ${esBars([c])}
      <div style="height:8px"></div>
    </div>`;
  };

  /* -------- add / edit-meta card -------- */
  const ec=ui.editCity?esCity(ui.editCity):null;
  const addCard=edit?`<div class="card" id="es_addcity"><div class="chead"><span>${ec?'✎ Edit city — '+esc(ec.name):'🗺 Add a city'}</span></div>
    <div class="plform"><div class="plrow1">
      <input id="es_cname" placeholder="City (Lisbon, Sapporo…)" maxlength="40" value="${ec?esc(ec.name):''}" style="flex:1;min-width:150px">
      ${baApField('es_cap','Airport — code or city',ec&&ec.ap?(esApCity(ec.ap)?ec.ap+' · '+esApCity(ec.ap):ec.ap):'')}
    </div><div class="plrow1">
      <input id="es_cfrom" type="date" title="Arrive" value="${ec?(ec.from||''):''}">
      <input id="es_cto" type="date" title="Leave" value="${ec?(ec.to||''):''}">
      <button class="pladd" type="button" onclick="esAddCity()" style="padding:8px 14px;${ec?'background:var(--moss);border-color:var(--moss)':''}">${ec?'✓ Update':'+ Add city'}</button>
      ${ec?'<button class="pladd" type="button" onclick="window._esUI.editCity=null;renderEstimatorPage(true)" style="padding:8px 14px;background:none;color:var(--grey);border:1px solid var(--rule)">Cancel</button>':''}
    </div>
    <div class="plhint">Each city is its own block of the same template — stays, flights, line items, its own subtotal. Dates are optional.</div></div>
  </div>`:'';

  panel.innerHTML=`
    <div style="max-width:900px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0 14px">
        <div><div class="kicker" style="margin:0">TRAVEL TOOLS</div><h1 style="margin:2px 0 0;font-size:24px">Travel Estimator</h1></div>
        <button type="button" onclick="renderHome()" style="border:1.5px solid var(--ink);background:none;border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:8px 13px;cursor:pointer;color:var(--ink)">← Trips</button>
      </div>
      ${edit?'':'<div class="ba-note" style="padding:0 4px 10px">Design review — read only, the numbers are the organizer\u2019s.</div>'}
      <div style="display:flex;flex-direction:column;gap:14px">
        ${sumCard}
        ${cities.map(cityCard).join('')||'<div class="card"><div style="padding:13px 16px;font-size:12.5px;color:var(--grey)">No cities yet — every estimate starts with one below.</div></div>'}
        ${addCard}
      </div>
    </div>`;
};

/* ---------------- mutators — every one behind the wall ---------------- */
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
    ES().cities.push({id:'ec'+Date.now(),name,ap:ap.code,from:g('es_cfrom').value||'',to:g('es_cto').value||'',hotels:[],flights:[],items:[]});
  }
  saveOverrides(); renderEstimatorPage(true);
};
window.esEditCity=function(id){ (window._esUI=window._esUI||{}).editCity=id; renderEstimatorPage(true);
  const el=document.getElementById('es_addcity'); if(el)el.scrollIntoView({behavior:'smooth',block:'center'}); };
window.esDelCity=function(id){
  if(!esGuard())return;
  const c=esCity(id); if(!c)return;
  if(!confirm('Remove '+c.name+' and everything estimated under it?'))return;
  ES().cities=ES().cities.filter(x=>x.id!==id);
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
  c.hotels.push({id:'h'+Date.now(),n,ci,co,cost:Number(g('eh_cost').value||0),fhr:!!g('eh_fhr').checked});
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
  c.flights.push({id:'f'+Date.now(),airline:air,cls:g('ef_cls').value,cost:Number(g('ef_cost').value||0),
    segs:[{f:F.code,t:T.code,d:g('ef_date').value||'',tm:g('ef_time').value||''}]});
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
