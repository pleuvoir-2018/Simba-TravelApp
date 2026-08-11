/* MODULE js/02-ui-shell.js — Nav shell, Leaflet map builders, meal cards, weather
   Split from index.html with statement order preserved; load order matters. */
/* ---------------- UI ---------------- */
const panel=document.getElementById('panel');
let ci=0,sel=null,selPoi=null,editMode=false,showPoi=true,cat='all',map=null,markers={};
const RES_LABEL={ok:'Booked',book:'To book',walk:'Walk-in'};

/* ---- Left nav (collapsible sidebar) ---- */
var TRIP_TZ='Asia/Tokyo',TRIP_MON=11,CUR={code:'JPY',sym:'¥',key:'jpy',fallback:150,name:'yen'};
const shell=document.getElementById('shell'),navlist=document.getElementById('navlist');
/* Rebuilt on every trip switch — a nav built once from Japan would index
   into Korea's array and open the wrong tab. */
let devMode=false;
try{devMode=localStorage.getItem('jt_dev')==='1';}catch(e){}
const DEV_TAB={id:'addrest',city:'Add restaurant',sub:'developer mode',addrest:true};
function navCities(){
  let list=CITIES.slice();
  if(list.some(c=>c.cruiseTab||c.jjTab)&&!window._cru)return [];
  if(list.some(c=>c.adminOnly)&&cruRole()!=='admin')list=list.filter(c=>!c.adminOnly);
  if(devMode&&list.some(c=>c.stops)&&!list.some(c=>c.addrest))list.push(DEV_TAB);
  return list;
}
window.toggleDev=function(on){
  devMode=on;
  try{localStorage.setItem('jt_dev',on?'1':'0');}catch(e){}
  if(!on)ci=0;
  buildNav();render();
};
function buildNav(){
  const t=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||null;
  const ico=(t&&t.navIcons)||{}, secs=(t&&t.navSecs)||{};
  navlist.innerHTML=navCities().map((c,i)=>
    (i===0?'<div class="nvsec">Now</div>':'')+
    (secs[c.id]?`<div class="nvsec">${secs[c.id]}</div>`:'')+
    `<button class="nvi" data-i="${i}" title="${c.city}"><span class="nvic">${ico[c.id]||'•'}</span><span class="nvtx"><span class="nv1">${c.city}</span><span class="nv2">${c.sub}</span></span></button>`
  ).join('')+(CITIES.some(c=>c.stops)?`<label style="display:flex;align-items:center;gap:7px;padding:13px 14px 6px;font:600 9px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey);cursor:pointer">
      <input type="checkbox" ${devMode?'checked':''} onchange="toggleDev(this.checked)" style="width:13px;height:13px;accent-color:var(--clay)"> <span class="devlbl">Developer mode</span></label>`:'');
  navlist.querySelectorAll('.nvi').forEach(b=>b.onclick=()=>{ci=+b.dataset.i;sel=null;selPoi=null;cat='all';shell.classList.remove('drawer');render();});
}
function refreshNav(){navlist.querySelectorAll('.nvi').forEach(b=>{const on=+b.dataset.i===ci;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
// collapsed state is a device preference — kept in this browser, not synced
try{if(localStorage.getItem('jt_nav_mini')==='1')shell.classList.add('mini');}catch(e){}
const navCollapse=document.getElementById('navCollapse');
navCollapse.textContent=shell.classList.contains('mini')?'»':'«';
navCollapse.onclick=()=>{
  const mini=shell.classList.toggle('mini');
  navCollapse.textContent=mini?'»':'«';
  navCollapse.title=mini?'Expand menu':'Collapse menu';
  try{localStorage.setItem('jt_nav_mini',mini?'1':'0');}catch(e){}
};
document.getElementById('navBurger').onclick=()=>shell.classList.add('drawer');
document.getElementById('backdrop').onclick=()=>shell.classList.remove('drawer');
document.getElementById('editToggle').onclick=()=>{editMode=!editMode;
 document.getElementById('editToggle').classList.toggle('on',editMode);
 document.getElementById('savebar').classList.toggle('show',editMode);
 document.body.classList.toggle('editing',editMode);render();};
document.getElementById('saveBtn').onclick=saveOverrides;
document.getElementById('resetBtn').onclick=resetAll;
document.getElementById('exportBtn').onclick=exportData;

function icon(html,size,cls){return L.divIcon({className:'',html:`<div class="mk ${cls||''}" style="width:${size}px;height:${size}px">${html}</div>`,iconSize:[size,size],iconAnchor:[size/2,size/2]});}

function buildMap(c){
  if(map){map.remove();map=null;}
  markers={};
  map=L.map('map',{scrollWheelZoom:true});
  // GPS Locator
  map.locate({setView: false, maxZoom: 16});
  map.on('locationfound', function(e) {
    L.circleMarker(e.latlng, {
      radius: 6, color: '#fff', weight: 2, fillColor: '#22406B', fillOpacity: 1
    }).addTo(map).bindPopup("You are here");
  });
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'&copy; Esri'}).addTo(map);
  const hotel=HOTELS[c.hotel];
  const bounds=[[hotel.lat,hotel.lng]];

  // day loops: hotel → meals(in day order) → hotel
  const byDay={};stopsFor(c).forEach(st=>{(byDay[st.d]=byDay[st.d]||[]).push(st);});
  Object.values(byDay).forEach(ms=>{
    const pts=[[hotel.lat,hotel.lng],...ms.map(s=>[s.lat,s.lng]),[hotel.lat,hotel.lng]];
    const far=ms.some(s=>Math.hypot(s.lat-hotel.lat,(s.lng-hotel.lng)*0.82)*111>15);
    L.polyline(pts,{color:far?'#22406B':'#8E4B62',weight:far?2:1.6,dashArray:far?'8 5':'2 5',opacity:.55}).addTo(map);
  });

  // NRT arrival route on Yokohama
  if(c.showNRT){
    L.polyline([[NRT.lat,NRT.lng],[hotel.lat,hotel.lng]],{color:'#4A6E9E',weight:2,dashArray:'10 6',opacity:.6}).addTo(map);
    const am=L.marker([NRT.lat,NRT.lng],{icon:icon('✈',24,'mk-air')}).addTo(map);
    am.bindPopup(`<b>${NRT.n}</b><br>ZG021 lands 12:45 · N'EX direct to Yokohama ~90 min`);
    bounds.push([NRT.lat,NRT.lng]);
  }

  // meals
  stopsFor(c).forEach(s=>{
    const e=eff(s);
    const m=L.marker([s.lat,s.lng],{icon:icon(s.id,sel===s.id?28:22,sel===s.id?'on':'')}).addTo(map);

    // Dynamically appends booking time and platform if they exist
    let popupContent = `<b>${s.name}</b><br>${s.d} · ${s.m} — ${s.dish}<br>${s.hrs}<br>${RES_LABEL[e.res]}${e.pay==='cash'?' · 💴 cash only':''}`;
    if (e.res === 'ok' && (e.btime || e.bplat)) {
      popupContent += ` (${e.btime || ''}${e.btime && e.bplat ? ' via ' : ''}${e.bplat || ''})`;
    }
    popupContent += e.jpy?` · ${CUR.sym}${Number(e.jpy).toLocaleString()}`:(e.cost?` · ${esc(e.cost)}`:"");
    popupContent += `<div style="margin-top:8px;border-top:1px dotted var(--rule);padding-top:6px;"><a href="https://www.google.com/maps/search/${encodeURIComponent((s.q||s.name)+' '+c.city)}/@${s.lat},${s.lng},17z" target="_blank" style="font-family:var(--mono);font-size:10px;color:var(--indigo);text-decoration:none;font-weight:600;text-transform:uppercase;letter-spacing:0.02em;">📍 Open in Google Maps ↗</a></div>`;

    m.bindPopup(popupContent);
    m.on('click',()=>{sel=s.id;selPoi=null;renderSide(c);refreshIcons(c);});
    markers['m'+s.id]=m;
    bounds.push([s.lat,s.lng]);
  });

  // POIs
  if(showPoi)c.pois.forEach((p,i)=>{
    if(cat!=='all'&&p.c!==cat)return;
    const m=L.marker([p.lat,p.lng],{icon:icon(`<span>${p.ic}</span>`,selPoi===i?26:20,'mk-poi'+(selPoi===i?' on':''))}).addTo(map);
    const gq=(p.q||p.n.replace(/\(.*?\)/g,' ').replace(/[+·]/g,' ').replace(/\s+/g,' ').trim())+' '+c.city;
    const gMapUrl = `https://www.google.com/maps/search/${encodeURIComponent(gq)}/@${p.lat},${p.lng},17z`;
    m.bindPopup(`<b>${p.n}</b><br>${p.d}<br><i>near ${p.a}</i>
      <div style="margin-top:8px; border-top:1px dotted var(--rule); padding-top:6px;">
        <a href="${gMapUrl}" target="_blank" style="font-family:var(--mono); font-size:10px; color:var(--indigo); text-decoration:none; font-weight:600; text-transform:uppercase; letter-spacing:0.02em;">
          📍 Open in Google Maps ↗
        </a>
      </div>
    `);
    m.on('click',()=>{selPoi=i;sel=null;renderSide(c);refreshIcons(c);});
    markers['p'+i]=m;
    bounds.push([p.lat,p.lng]);
  });

  // hotel
  const hm=L.marker([hotel.lat,hotel.lng],{icon:icon('H',24,'mk-h')}).addTo(map);
  hm.bindPopup(`<b>${hotel.n}</b><br>${hotel.stn}`);
  map.fitBounds(bounds,{padding:[36,36]});

  // Visual Map Legend - NOW OUTSIDE THE LOOP
  const legend = L.control({position: 'bottomright'});
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'map-legend');
    div.innerHTML = `
      <div style="font-weight:bold; margin-bottom:6px; color:var(--indigo);">Legend</div>
      <div class="l-row"><span class="l-box" style="background:var(--plum);"></span> Hotel</div>
      <div class="l-row"><span class="l-circ" style="background:var(--indigo);"></span> Meals</div>
      <div class="l-row"><span class="l-dia" style="background:var(--moss);"></span> POI</div>
      <div class="l-row"><span style="color:var(--plum); font-weight:bold; font-size:12px; line-height:8px; margin-top:-4px;">⋯</span> Day loop</div>
      <div class="l-row"><span style="color:var(--indigo); font-weight:bold; font-size:12px; line-height:8px; margin-top:-4px;">╌</span> Transit</div>
    `;
    return div;
  };
  legend.addTo(map);
}
function refreshIcons(c){
  stopsFor(c).forEach(s=>{const m=markers['m'+s.id];if(m)m.setIcon(icon(s.id,sel===s.id?28:22,sel===s.id?'on':''));});
  c.pois.forEach((p,i)=>{const m=markers['p'+i];if(m)m.setIcon(icon(`<span>${p.ic}</span>`,selPoi===i?26:20,'mk-poi'+(selPoi===i?' on':'')));});
}

function mealCard(p){
  const e=eff(p);
  return `<div class="meal ${sel===p.id?'on':''}" data-n="${p.id}">
    <div class="num">${p.id}</div>
    <div style="flex:1;min-width:0">
      <div class="m1">${p.d} · ${p.m}</div>
      <div class="m2">${p.name}<span class="tag ${e.res}">${RES_LABEL[e.res]}</span>${e.pay==='cash'?'<span class="tag cash">💴 cash only</span>':''}</div>

      ${!editMode && e.res==='ok' && (e.btime || e.bplat) ? `<div style="display:inline-block; margin-top:4px; margin-bottom:2px; padding:3px 6px; background:rgba(94,127,76,.1); color:var(--moss); font:600 10px var(--mono); text-transform:uppercase; letter-spacing:0.05em; border-radius:2px;">✓ Reserved ${e.btime ? 'at ' + e.btime : ''} ${e.bplat ? 'via ' + e.bplat : ''}</div>` : ''}
      ${!editMode && e.actualJpy ? (()=>{const aU=Number(e.actualJpy)/liveRate;const diff=Number(e.actualJpy)-Number(e.jpy);return `<div style="display:inline-block;margin:4px 0 2px 4px;padding:3px 6px;background:${diff>0?'rgba(184,85,42,.1)':'rgba(94,127,76,.1)'};color:${diff>0?'var(--clay)':'var(--moss)'};font:600 10px var(--mono);border-radius:2px;">${CUR.sym}${Number(e.actualJpy).toLocaleString()}${CUR.code==='USD'?'':` · $${aU.toFixed(2)}`}${diff!==0?` ${diff>0?'▲':'▼'}${CUR.sym}${Math.abs(diff).toLocaleString()}`:''}</div>`})():''}

      <div class="m3">${p.dish}</div>
      <div class="m4">${p.hrs}${e.jpy?` · ${CUR.sym}${Number(e.jpy).toLocaleString()}`:(e.cost?` · ${esc(e.cost)}`:"")}</div>
      <div class="efields">
        <div class="erow">
          <label>${CUR.sym} <input type="number" data-f="jpy" data-id="${p.id}" value="${e.jpy}"></label>
          <select data-f="res" data-id="${p.id}">${Object.entries(RES_LABEL).map(([v,l])=>`<option value="${v}" ${e.res===v?'selected':''}>${l}</option>`).join('')}</select>
          <select data-f="pay" data-id="${p.id}"><option value="" ${!e.pay?'selected':''}>Payment?</option><option value="cash" ${e.pay==='cash'?'selected':''}>💴 Cash only</option><option value="card" ${e.pay==='card'?'selected':''}>Cards OK</option></select>
        </div>

        <div class="erow" style="margin-top:4px;">
          <label>Time <input type="text" placeholder="e.g., 18:30" data-f="btime" data-id="${p.id}" value="${e.btime||''}"></label>
          <label>Platform <input type="text" placeholder="e.g., Tablecheck" data-f="bplat" data-id="${p.id}" value="${e.bplat||''}"></label>
        </div>

        <div class="erow" style="margin-top:4px;">
          <label>Actual ${CUR.sym} spent <input type="number" placeholder="from the receipt" data-f="actualJpy" data-id="${p.id}" value="${e.actualJpy||''}"></label>
          <label>Paid with <select data-f="actualCard" data-id="${p.id}">
            ${['AMEX Platinum','AMEX Gold','AMEX Bonvoy Brilliant','Capital One Venture X','United Quest','Cash'].map(cd=>`<option ${e.actualCard===cd?'selected':''}>${cd}</option>`).join('')}
          </select></label>
        </div>

        <textarea rows="2" data-f="note" data-id="${p.id}" placeholder="Info note (blue box) — clear to remove">${esc(e.note||'')}</textarea>
        <textarea rows="2" data-f="warn" data-id="${p.id}" placeholder="Warning note (red box) — clear to remove">${esc(e.warn||'')}</textarea>
        <textarea rows="2" data-f="unote" data-id="${p.id}" placeholder="Your note…">${esc(e.unote||'')}</textarea>
      </div>
      ${e.warn?`<div class="note warn">${esc(e.warn)}</div>`:''}
      ${e.note?`<div class="note">${esc(e.note)}</div>`:''}
      ${e.unote&&!editMode?`<div class="note" style="border-left-color:var(--moss);background:rgba(94,127,76,.08);color:#465F38">✎ ${esc(e.unote)}</div>`:''}
    </div></div>`;
}

/* ---------------- WEATHER (Open-Meteo, no key) ---------------- */

const WX_ICON = c =>
  c===0?"☀️":c<=2?"🌤️":c===3?"☁️":c<=48?"🌫️":c<=57?"🌦️":c<=67?"🌧️":
  c<=77?"🌨️":c<=82?"🌧️":c<=86?"🌨️":"⛈️";
const wxCache = {};

async function loadWeather(cityId){
  const el = document.getElementById('wxbody');
  if(!el) return;
  const cfg = WX_CFG[cityId];
  if(!cfg) return;
  try{
    if(!wxCache[cityId]){
      const u = `https://api.open-meteo.com/v1/forecast?latitude=${cfg.lat}&longitude=${cfg.lng}`
        + `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max`
        + `&timezone=Asia%2FTokyo&forecast_days=16`;
      const r = await fetch(u);
      if(!r.ok) throw new Error('wx http '+r.status);
      wxCache[cityId] = await r.json();
    }
    const d = wxCache[cityId].daily;

    // Prefer your actual trip dates if they're inside the 16-day window; else show the next 5 days
    let idxs = d.time.map((t,i)=>({t,i})).filter(x=>x.t>=cfg.from && x.t<=cfg.to).map(x=>x.i);
    const onTrip = idxs.length>0;
    if(!onTrip) idxs = d.time.slice(0,5).map((_,i)=>i);

    el.innerHTML = `
      <div style="display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;">
        ${idxs.map(i=>{
          const dt=new Date(d.time[i]+'T12:00:00');
          const wd=dt.toLocaleDateString('en-US',{weekday:'short'});
          const md=(dt.getMonth()+1)+'/'+dt.getDate();
          return `<div style="flex:1;min-width:64px;text-align:center;border:1px solid var(--rule);border-radius:2px;padding:7px 4px;background:#fff8;">
            <div style="font:600 9px var(--mono);color:var(--grey);text-transform:uppercase;">${wd} ${md}</div>
            <div style="font-size:20px;line-height:1.4;">${WX_ICON(d.weather_code[i])}</div>
            <div style="font:600 11px var(--mono);">${Math.round(d.temperature_2m_max[i])}°<span style="color:var(--grey);font-weight:400;">/${Math.round(d.temperature_2m_min[i])}°</span></div>
            <div style="font:9px var(--mono);color:${d.precipitation_probability_max[i]>=50?'var(--clay)':'var(--indigo2)'};">💧${d.precipitation_probability_max[i]??0}%</div>
          </div>`;}).join('')}
      </div>
      <div style="font:9px var(--mono);color:var(--grey);margin-top:6px;">
        ${onTrip?`Your dates in this city · °C · ${TRIP_TZ}`:'Trip dates not yet in forecast range — showing next 5 days · °C'}
      </div>`;
  }catch(e){
    el.innerHTML = `<div class="note">Weather unavailable right now — check again when online.</div>`;
  }
}

