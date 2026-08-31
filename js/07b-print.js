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
  if(s.m==='Lunch')return 12*60;
  if(s.m==='Dinner')return 18*60;
  return null;                                   // untimed → day-plan card
}
function pdStops(c){
  const seed=(c.stops||[]).slice();
  const mine=((typeof overrides!=='undefined'&&overrides.stops)||[]).filter(s=>s.city===c.id&&!s.del);
  const byId=new Map(seed.map(s=>[String(s.id),Object.assign({},s)]));
  mine.forEach(s=>{ byId.set(String(s.id),Object.assign(byId.get(String(s.id))||{},s)); });
  return [...byId.values()];
}
function pdMoney(n){ return n?((typeof CUR!=='undefined'&&CUR.sym)||'¥')+Number(n).toLocaleString():''; }
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
    const legsIn=(c.legs||[]).filter(L=>dt&&((L.r||'')+(L.m||'')).includes(dt));
    const dayStops=stops.filter(s=>pdNorm(s.d)===dt);
    const timed=dayStops.filter(s=>pdMins(s)!=null).sort((a,b)=>pdMins(a)-pdMins(b));
    const untimed=dayStops.filter(s=>pdMins(s)==null);
    const stopHtml=s=>{
      const tCell=s.t?`<span class="t">${esc(s.t)}</span>`:`<span class="t soft">${esc((s.m||'').toUpperCase())}</span>`;
      const bits=[s.m&&!s.t?null:(s.m?esc(s.m.toUpperCase()):null),s.area?esc(s.area):null,s.dish?esc(s.dish):null,
        s.jpy?'<b>'+pdMoney(s.jpy)+'</b>':null,s.pay?esc(s.pay):null,s.hrs?esc(s.hrs):null].filter(Boolean).join(' · ');
      return `<div class="pd-stop">${tCell}
        <h3>${esc(s.name||'')}${s.q?` <span style="font-weight:500;color:#6B6E76;font-size:12px">${esc(s.q)}</span>`:''}</h3>
        <div class="pd-card"><div class="pd-meta">${bits}</div>
        ${s.warn?`<p><b style="color:#B8552A">⚠</b> ${esc(s.warn)}</p>`:''}${s.note?`<p>${esc(s.note)}</p>`:''}</div></div>`;
    };
    const legHtml=L=>`<div class="pd-stop pd-train"><span class="t">${esc(((/\b(\d{1,2}:\d{2})/.exec(L.m||'')||[])[1]||'—'))}</span>
      <h3>${esc(L.r||'')}</h3><div class="pd-meta">${esc(L.m||'')}</div>${L.n?`<p>${esc(L.n)}</p>`:''}</div>`;
    return `<div class="pd-page">
      <div class="pd-eyebrow">${esc(trip)}${days.length>1?` · sheet ${di+1}/${days.length}`:''}</div>
      <h1>${esc(c.city)}</h1>
      <div class="pd-sub">${dt?esc(dt)+' · ':''}${esc(c.sub||'')}</div>
      ${legsIn.length?`<div class="pd-band"><span>Trains</span><small>times local</small></div><div class="pd-tl">${legsIn.map(legHtml).join('')}</div>`:''}
      <div class="pd-band"><span>The day</span><small>${dayStops.length} stop${dayStops.length===1?'':'s'}</small></div>
      <div class="pd-tl">${timed.map(stopHtml).join('')||'<div class="pd-stop"><span class="t soft">—</span><p>Nothing timed yet — add stops in the planner.</p></div>'}</div>
      ${untimed.length?`<div class="pd-band"><span>Also planned</span><small>untimed</small></div><div class="pd-tl">${untimed.map(stopHtml).join('')}</div>`:''}
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
