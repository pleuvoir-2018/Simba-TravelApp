/* MODULE js/07b-print.js — 🖨 per-city printable itinerary sheets.
   Read-only: assembles the live plan (city legs + seeded stops + the user's
   own planner stops from overrides.stops, merged by id exactly like the
   planner's eff view) into a washi print sheet, one page per date. Curation
   rule: the POI catalog never auto-prints — the sheet shows what was PLANNED
   (stops), not everything the app knows. Loaded after the engine; only
   reads globals (CITIES, overrides, esc, CUR), writes nothing to the store. */
function pdNorm(d){
  if(!d)return '';
  const iso=/^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if(iso)return String(+iso[2])+'/'+String(+iso[3]);
  const md=/^(\d{1,2}\/\d{1,2})/.exec(d);
  return md?md[1]:String(d);
}
function pdMins(s){
  if(s.t&&/^\d{1,2}:\d{2}$/.test(s.t)){const [h,m]=s.t.split(':');return h*60+ +m;}
  if(s.m==='Breakfast')return 9*60;
  if(s.m==='Lunch')return 12*60;                 // default — flagged ~
  if(s.m==='Dinner')return 19*60;                // default — flagged ~
  return 26*60;                                  // untimed → timeline tail
}
function pdTimeCell(s){
  if(s.t&&/^\d{1,2}:\d{2}$/.test(s.t))return {h:'<span class="t">'+esc(s.t)+'</span>',def:false};
  if(s.m==='Lunch')return {h:'<span class="t">~12:00</span>',def:true};
  if(s.m==='Dinner')return {h:'<span class="t">~19:00</span>',def:true};
  if(s.m==='Breakfast')return {h:'<span class="t">~09:00</span>',def:true};
  return {h:'<span class="t soft">ANYTIME</span>',def:false};
}
function pdStops(c){
  const seed=(c.stops||[]).slice();
  const mine=((typeof overrides!=='undefined'&&overrides.stops)||[]).filter(s=>s.city===c.id&&!s.del);
  const byId=new Map(seed.map(s=>[String(s.id),Object.assign({},s)]));
  mine.forEach(s=>{ byId.set(String(s.id),Object.assign(byId.get(String(s.id))||{},s)); });
  /* day plans are their OWN lane (overrides.plans) — the v1 sheet missed them */
  const plans=((typeof overrides!=='undefined'&&overrides.plans)||[]).filter(s=>s.city===c.id&&!s.del)
    .map(s=>Object.assign({plan:true},s));
  return [...byId.values(),...plans];
}
function pdDateHero(dt,stops){
  const DOW={Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday'};
  const MON=['','January','February','March','April','May','June','July','August','September','October','November','December'];
  for(const s of stops){
    const m=/^(\d{1,2})\/(\d{1,2})\s+(\w{3})/.exec(s.d||'');
    if(m&&String(+m[1])+'/'+String(+m[2])===dt&&DOW[m[3]])return DOW[m[3]]+' · '+MON[+m[1]].slice(0,3)+' '+(+m[2]);
    const iso=/^(\d{4})-(\d{2})-(\d{2})/.exec(s.d||'');
    if(iso&&String(+iso[2])+'/'+String(+iso[3])===dt){
      const day=new Date(+iso[1],+iso[2]-1,+iso[3]).getDay();
      return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day]+' · '+MON[+iso[2]].slice(0,3)+' '+(+iso[3]);
    }
  }
  return dt;
}
function pdMoney(n){ return n?((typeof CUR!=='undefined'&&CUR.sym)||'¥')+Number(n).toLocaleString():''; }
const PD_HEADS=2; // budgets track OUR TWO by policy, even when bookings seat more
const PD_KRW_PER_JPY=9.3; // ≈ seed — the app has no KRW feed; printed as approximate
function pdUsdRate(){ // JPY per USD: live FX when the engine has it, else the trip plan rate
  if(typeof liveRate!=='undefined'&&liveRate>0)return liveRate;
  if(typeof CUR!=='undefined')return CUR.plan||CUR.fallback||150;
  return 150;
}
function pdReceipt(meals){
  if(!meals.length)return '';
  const tot=meals.reduce((a,s)=>a+Number(s.jpy||0),0);
  const usd=Math.round(tot/pdUsdRate()), krw=Math.round(tot*PD_KRW_PER_JPY/1000)*1000;
  const line=s=>`<div class="rc-line"><span>${esc((s.name||'').toUpperCase())}</span><span class="rc-dots"></span><span>${pdMoney(s.jpy)}</span></div>`;
  return `<div class="pd-receipt">
    <div class="rc-head">*** FOOD BUDGET ***</div>
    ${meals.map(line).join('')}
    <div class="rc-rule"></div>
    <div class="rc-line rc-big"><span>TOTAL</span><span class="rc-dots"></span><span>${pdMoney(tot)}</span></div>
    <div class="rc-line"><span>/PERSON ×${PD_HEADS}</span><span class="rc-dots"></span><span>${pdMoney(Math.round(tot/PD_HEADS))}</span></div>
    <div class="rc-line rc-fx"><span>≈</span><span class="rc-dots"></span><span>$${usd.toLocaleString()} · ₩${krw.toLocaleString()}</span></div>
    <div class="rc-foot">rates: ¥${pdUsdRate()}/$ ${typeof liveRate!=='undefined'&&liveRate>0?'live':'plan'} · ₩${PD_KRW_PER_JPY}/¥ approx</div>
  </div>`;
}
function pdCss(){
  if(document.getElementById('pdStyle'))return;
  const st=document.createElement('style'); st.id='pdStyle';
  st.textContent=`
#pdSheet{display:none}
body.print-mode>*:not(#pdSheet){display:none!important}
body.print-mode #pdSheet{display:block;background:#e8e2d5;min-height:100vh;padding:18px 8px;position:relative;z-index:9999}
#pdSheet .pd-page{max-width:760px;margin:0 auto 16px;background:#F6F1E7;color:#14161B;padding:32px 36px 22px;box-shadow:0 3px 20px rgba(20,22,27,.18);font-family:var(--sans,Inter,system-ui)}
#pdSheet .pd-eyebrow{font:700 9px var(--mono);letter-spacing:.22em;text-transform:uppercase;color:#B8552A}
#pdSheet h1{font:700 32px/1.05 var(--serif,Georgia);margin:5px 0 2px}
#pdSheet .pd-sub{font:600 11px var(--mono);letter-spacing:.06em;color:#6B6E76}
#pdSheet .pd-date{font:700 17px var(--serif,Georgia);color:#B8552A;margin-top:3px}
#pdSheet .pd-receipt{margin:16px auto 0;max-width:340px;background:#fff;border-top:2px dashed #B9B2A2;border-bottom:2px dashed #B9B2A2;padding:12px 16px 10px;font-family:var(--mono,monospace);color:#14161B;break-inside:avoid;box-shadow:0 1px 6px rgba(20,22,27,.09)}
#pdSheet .rc-head{text-align:center;font:700 10px var(--mono);letter-spacing:.18em;margin-bottom:8px}
#pdSheet .rc-line{display:flex;align-items:baseline;gap:6px;font:600 10.5px var(--mono);padding:2px 0}
#pdSheet .rc-line span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%}
#pdSheet .rc-dots{flex:1;border-bottom:1.5px dotted #B9B2A2;transform:translateY(-3px)}
#pdSheet .rc-rule{border-top:1.5px solid #14161B;margin:6px 0 4px}
#pdSheet .rc-big{font-size:13px;font-weight:700}
#pdSheet .rc-fx{color:#4a4d55}
#pdSheet .rc-foot{margin-top:7px;text-align:center;font:600 7.5px var(--mono);letter-spacing:.08em;color:#8a8d95}
#pdSheet .pd-defnote{margin-top:12px;font:600 9px var(--mono);letter-spacing:.05em;color:#6B6E76;border-left:3px solid #D9D2C3;padding:3px 0 3px 9px}
#pdSheet .pd-band{background:#EDE4D3;border-radius:6px;margin:18px 0 11px;padding:7px 13px;font:700 10px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:#22406B;display:flex;justify-content:space-between}
#pdSheet .pd-band small{color:#6B6E76;letter-spacing:.05em;text-transform:none;font-weight:600}
#pdSheet .pd-tl{position:relative;padding-left:84px}
#pdSheet .pd-tl:before{content:"";position:absolute;left:62px;top:6px;bottom:6px;width:1.5px;background:#D9D2C3}
#pdSheet .pd-stop{position:relative;padding:8px 0 12px;break-inside:avoid}
#pdSheet .pd-stop .t{position:absolute;left:-84px;width:54px;text-align:right;font:700 11px var(--mono);color:#22406B}
#pdSheet .pd-stop .t.soft{color:#6B6E76;font-weight:700;font-size:8.5px;letter-spacing:.06em}
#pdSheet .pd-stop:after{content:"";position:absolute;left:-25px;top:12px;width:9px;height:9px;border-radius:50%;background:#F6F1E7;border:2px solid #22406B}
#pdSheet .pd-stop.pd-train:after{border-color:#B8552A;background:#B8552A}
#pdSheet .pd-stop h3{font:700 15px var(--serif,Georgia)}
#pdSheet .pd-meta{font:600 9.5px var(--mono);letter-spacing:.04em;color:#6B6E76;margin-top:2px}
#pdSheet .pd-meta b{color:#B8552A}
#pdSheet .pd-stop p{font:400 12px/1.5 var(--sans,Inter);color:#3a3d44;margin-top:4px;max-width:560px}
#pdSheet .pd-card{background:#fff;border-radius:8px;box-shadow:0 1px 6px rgba(20,22,27,.09);padding:10px 14px;margin-top:5px}
#pdSheet .pd-x{position:fixed;top:10px;right:12px;font:700 12px var(--mono);border:1.5px solid #14161B;background:#F6F1E7;border-radius:3px;padding:8px 14px;cursor:pointer;z-index:10000}
#pdSheet .pd-foot{margin-top:20px;border-top:1px solid #D9D2C3;padding-top:8px;display:flex;justify-content:space-between;font:600 8.5px var(--mono);letter-spacing:.08em;color:#6B6E76}
@media print{
 #pdSheet{background:none!important;padding:0!important}
 #pdSheet .pd-page{box-shadow:none;max-width:none;page-break-after:always;padding:8mm 10mm}
 #pdSheet .pd-x{display:none}
 @page{margin:8mm}
}`;
  document.head.appendChild(st);
}
function pdSheetHtml(c,trip){
  const stops=pdStops(c);
  const dates=[...new Set(stops.map(s=>pdNorm(s.d)).filter(Boolean))]
    .sort((a,b)=>{const [am,ad]=a.split('/').map(Number),[bm,bd]=b.split('/').map(Number);return am-bm||ad-bd;});
  const days=dates.length?dates:[''];
  return days.map((dt,di)=>{
    const legsIn=(c.legs||[]).filter(L=>dt&&((L.r||'')+(L.m||'')).includes(dt))
      .map(L=>({leg:true,name:L.r,meta:L.m,note:L.n,mins:(m=>m?m[1].split(':')[0]*60+ +m[1].split(':')[1]:-1)(/\b(\d{1,2}:\d{2})/.exec(L.m||''))}));
    const dayStops=stops.filter(s=>pdNorm(s.d)===dt);
    let usedDefault=false;
    const items=[...legsIn,...dayStops.map(s=>({stop:s,mins:pdMins(s)}))].sort((a,b)=>(a.mins??0)-(b.mins??0));
    const rowHtml=it=>{
      if(it.leg)return `<div class="pd-stop pd-train"><span class="t">${esc(((/\b(\d{1,2}:\d{2})/.exec(it.meta||'')||[])[1]||'—'))}</span>
        <h3>${esc(it.name||'')}</h3><div class="pd-meta">${esc(it.meta||'')}</div>${it.note?`<p>${esc(it.note)}</p>`:''}</div>`;
      const s=it.stop, tc=pdTimeCell(s); if(tc.def)usedDefault=true;
      const bits=[s.m?esc(s.m.toUpperCase()):(s.cat?esc(String(s.cat).toUpperCase()):null),s.area?esc(s.area):null,
        s.dish?esc(s.dish):null,s.jpy?('<b>'+pdMoney(s.jpy)+'</b>'+(s.m?' · '+pdMoney(Math.round(s.jpy/PD_HEADS))+'/pp':'')):null,s.pay?esc(s.pay):null,s.hrs?esc(s.hrs):null].filter(Boolean).join(' · ');
      return `<div class="pd-stop${s.m?' pd-meal':''}">${tc.h}
        <h3>${s.done?'✓ ':''}${esc(s.name||'')}${s.q?` <span style="font-weight:500;color:#6B6E76;font-size:12px">${esc(s.q)}</span>`:''}</h3>
        <div class="pd-card"><div class="pd-meta">${bits}</div>
        ${s.warn?`<p><b style="color:#B8552A">⚠</b> ${esc(s.warn)}</p>`:''}${s.note?`<p>${esc(s.note)}</p>`:''}</div></div>`;
    };
    const rows=items.map(rowHtml).join('');
    return `<div class="pd-page">
      <div class="pd-eyebrow">${esc(trip)}${days.length>1?` · sheet ${di+1}/${days.length}`:''}</div>
      <h1>${esc(c.city)}</h1>
      <div class="pd-date">${esc(pdDateHero(dt,dayStops))}</div>
      <div class="pd-band"><span>The day</span><small>${items.length} item${items.length===1?'':'s'}</small></div>
      <div class="pd-tl">${rows||'<div class="pd-stop"><span class="t soft">—</span><p>Nothing planned yet — add stops in the planner.</p></div>'}</div>
      ${pdReceipt(dayStops.filter(s=>s.m&&s.jpy).sort((a,b)=>pdMins(a)-pdMins(b)))}
      ${usedDefault?'<div class="pd-defnote">~ marked times are defaults (lunch 12:00 · dinner 19:00) — the booking time isn\u2019t set yet; add a time in the planner once confirmed.</div>':''}
      <div class="pd-foot"><span>SIMBA TRAVELAPP</span><span>PRINTED FROM THE LIVE PLAN</span></div>
    </div>`;
  }).join('');
}
window.pdClose=function(){
  document.body.classList.remove('print-mode');
  const el=document.getElementById('pdSheet'); if(el)el.remove();
};
window.printCity=function(cid){
  const c=(typeof CITIES!=='undefined'?CITIES:[]).find(x=>x.id===cid);
  if(!c)return;
  pdCss();
  let el=document.getElementById('pdSheet');
  if(!el){el=document.createElement('div');el.id='pdSheet';document.body.appendChild(el);}
  const trip=(document.querySelector('.nb-t')||{}).textContent||'Trip';
  el.innerHTML=`<button class="pd-x" onclick="pdClose()">✕ CLOSE</button>`+pdSheetHtml(c,trip+' · itinerary');
  document.body.classList.add('print-mode');
  setTimeout(()=>{ try{window.print();}catch(e){} },60);
};
if(typeof addEventListener==='function')addEventListener('afterprint',()=>{ /* stay open for re-print; ✕ closes */ });
