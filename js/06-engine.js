/* MODULE js/06-engine.js — Trip switching, Today view, city panels, expenses, vault, FX, master render()
   Split from index.html with statement order preserved; load order matters. */
function applyTripData(id){
  const t=TRIP_DATA[id];
  if(!t)return;                       // unknown trip: leave the current data alone
  CITIES=t.cities;HOTELS=t.hotels;FLIGHTS=t.flights;
  WX_CFG=t.wx;TODAY_CITY=t.todayCity;TONIGHT=t.tonight;
  TRIP_TZ=t.tz||'Asia/Tokyo'; TRIP_MON=t.mon||11; CUR=t.cur||{code:'JPY',sym:'¥',key:'jpy',fallback:150};
  liveRate=CUR.fallback; fetchExchangeRate&&fetchExchangeRate();
  ci=0;sel=null;selPoi=null;cat='all';
  const b=document.querySelector('.nb-t');if(b)b.textContent=t.brand;
  const f=document.querySelector('.nav-foot');if(f)f.textContent=t.foot;
  const ti=document.getElementById('tripTitle');if(ti)ti.textContent=t.title;
  const kk=document.getElementById('kickerTxt');if(kk)kk.textContent=t.kicker;
  const nbs=document.querySelector('.nb-sun');if(nbs)nbs.textContent=t.emoji||'🧭';
  document.body.style.setProperty('--tripac',t.accent||'#22406B');
  document.body.classList.toggle('cruise',!!t.cruise);
  if(typeof updateAvatar==='function')updateAvatar();
  const eb=document.getElementById('editToggle');
  if(eb)eb.style.display=t.cruise?'none':'';
  if(t.cruise&&editMode){editMode=false;document.body.classList.remove('editing');const sb=document.getElementById('savebar');if(sb)sb.classList.remove('show');}
  document.title=t.title;
  buildNav();
  drawCountdown();
}

const MONTH_NAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function tokyoToday(){
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:TRIP_TZ,year:'numeric',month:'numeric',day:'numeric',weekday:'long'}).formatToParts(new Date());
  const o={};parts.forEach(x=>o[x.type]=x.value);
  return{y:+o.year,m:+o.month,d:+o.day,w:o.weekday};
}
window.gotoCity=function(i){ci=i;sel=null;selPoi=null;cat='all';render();};
window.gotoMeal=function(i,id){ci=i;sel=id;selPoi=null;cat='all';render();};
let _tdCalRef=null;
function tdCalHtml(dep,fin,t){
  const [y,m]=window._tdCalYm;
  _tdCalRef={dep,fin,t};
  const first=new Date(Date.UTC(y,m,1)), startDow=first.getUTCDay();
  const dim=new Date(Date.UTC(y,m+1,0)).getUTCDate();
  const inTripD=d=>{const k=Date.UTC(y,m,d);return k>=Date.UTC(dep[0],dep[1],dep[2])&&k<=Date.UTC(fin[0],fin[1],fin[2]);};
  const isToday=d=>(y===t.y&&m===t.m-1&&d===t.d);
  let cells='';
  for(let i=0;i<startDow;i++)cells+='<span></span>';
  for(let d=1;d<=dim;d++)cells+=`<span class="cal2-d ${isToday(d)?'cal2-today':''}">${d}${inTripD(d)?'<i class="cal2-dot"></i>':''}</span>`;
  return `<div class="cal2">
    <div class="cal2-nav"><button type="button" onclick="tdCalShift(-1)">‹</button><span>${MONTH_NAMES[m]} ${y}</span><button type="button" onclick="tdCalShift(1)">›</button></div>
    <div class="cal2-grid cal2-dow">${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(x=>`<span>${x}</span>`).join('')}</div>
    <div class="cal2-grid">${cells}</div>
  </div>`;
}
window.tdCalShift=function(n){
  let [y,m]=window._tdCalYm; m+=n; if(m<0){m=11;y--;} if(m>11){m=0;y++;}
  window._tdCalYm=[y,m]; render();
};
function renderToday(){
  const t=tokyoToday();
  const key=t.y*10000+t.m*100+t.d;
  const TD=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{};
  const dep=TD.depart||[2026,10,15], arr=TD.arrive||[2026,10,17], fin=TD.end||[2026,10,27];
  const ymd=a=>a[0]*10000+(a[1]+1)*100+a[2];
  const pre=key<ymd(dep), post=key>ymd(fin), inTrip=!pre&&!post;
  const tripDays=Math.round((Date.UTC(fin[0],fin[1],fin[2])-Date.UTC(arr[0],arr[1],arr[2]))/86400000)+1;
  const dateLine=`${t.w} · ${MONTH_NAMES[t.m-1]} ${t.d} · ${TRIP_TZ.split('/')[1].replace('_',' ')}`;
  const allStops=CITIES.map((c,i)=>c.stops?stopsFor(c).map(x=>({...eff(x),cityName:c.city,ci:i})):[]).flat();
  let html=`<div class="td-stack">`;
  if(pre){
    const days=Math.round((Date.UTC(dep[0],dep[1],dep[2])-Date.UTC(t.y,t.m-1,t.d))/86400000);
    const card=(typeof TRIPS!=='undefined'?TRIPS.find(x=>x.id===tripKey()):null)||{};
    const chips=(TD.departNote||'').split('·').map(s=>s.trim()).filter(Boolean);
    const chipIco=['✈','⏱','📅'];
    const fmtD=a=>`${MONTH_NAMES[a[1]].slice(0,3)} ${a[2]}`;
    if(!window._tdCalYm)window._tdCalYm=[dep[0],dep[1]];
    const toBook=allStops.filter(x=>x.res==='book');
    const walkIns=allStops.filter(x=>x.res==='walk');
    html+=`<div class="td2-grid">
      <div class="td2-main">
        <div class="card td2-hero">
          ${card.photo?`<img class="td2-art" src="${card.photo}" alt="" onerror="this.style.display='none'">`:''}
          <div class="td2-hero-mid">
            <div class="th-today">${dateLine}</div>
            <div class="td2-num">${days}</div>
            <div class="th-lbl" style="letter-spacing:.18em">Days until wheels-up</div>
            ${chips.length?`<div class="td2-chips">${chips.map((c,i)=>`<span class="td2-chip">${chipIco[i]||'·'} ${esc(c)}</span>`).join('')}</div>`:''}
          </div>
        </div>
        <div class="card"><div class="td2-h"><span>To Book</span><span class="td2-pill">${toBook.length} open</span></div>
          ${toBook.map((x,i)=>`<div class="tb-row" onclick="gotoMeal(${x.ci},${x.id})">
            <span class="tb-main"><span class="tb-name">${esc(x.name)}</span>
              <span class="tb-meta">${esc(x.cityName)} · ${x.d} · ${x.m}</span>
              ${x.warn?`<span class="tb-warn">${esc(x.warn)}</span>`:''}</span>
            <span class="tb-chev">›</span>
          </div>`).join('')||'<div class="td-empty">Everything is booked ✓</div>'}
        </div>
        ${todoCard(21,'Prep — due in the next 3 weeks')}
        <div class="card"><div class="td2-h"><span>Walk-ins</span><span style="font:600 9px var(--mono);color:var(--grey)">NO ACTION NEEDED</span></div>
          <div style="padding:4px 16px 13px;font-size:12px;color:var(--grey)">${walkIns.map(x=>esc(x.name)).join(' · ')||'—'}</div></div>
      </div>
      <div class="td2-side">
        <div class="card"><div class="td2-h"><span>Trip Overview</span></div>
          <div class="td2-ov">
            <div class="ov-row"><span class="ov-ic">📍</span><span><span class="ov-l">Destination</span><span class="ov-v">${esc(card.country||TD.brand||'')}</span></span></div>
            <div class="ov-row"><span class="ov-ic">⏳</span><span><span class="ov-l">Duration</span><span class="ov-v">${tripDays} days</span></span></div>
            <div class="ov-row"><span class="ov-ic">🗓</span><span><span class="ov-l">Dates</span><span class="ov-v">${fmtD(dep)} – ${fmtD(fin)}, ${fin[0]}</span></span></div>
            <div class="ov-row"><span class="ov-ic">👥</span><span><span class="ov-l">Travelers</span><span class="ov-v">${TD.travelers||2}</span></span></div>
          </div>
        </div>
        <div class="card"><div class="td2-h"><span>Calendar</span></div>${tdCalHtml(dep,fin,t)}</div>
      </div>
    </div>`;
  } else if(inTrip){
    html+=`<div class="card td-hero">`;
    const day=t.d, cid=TODAY_CITY[day], cityIdx=cid?CITIES.findIndex(c=>c.id===cid):-1;
    const dayNo=Math.round((Date.UTC(t.y,t.m-1,t.d)-Date.UTC(arr[0],arr[1],arr[2]))/86400000)+1;
    const headline=dayNo<1?(TD.preLabel||'Positioning day'):(`Day ${dayNo} of ${tripDays}`);
    const where=cityIdx>-1?CITIES[cityIdx].city:(TD.transitLabel||'In transit ✈');
    html+=`<div class="td-date">${dateLine}</div><div class="td-big">${headline}</div><div class="td-sub">${where}</div>`+
      (cityIdx>-1?`<button class="td-go" onclick="gotoCity(${cityIdx})">Open the ${CITIES[cityIdx].city} tab →</button>`:'')+`</div>`;
    const meals=allStops.filter(x=>x.d.startsWith(TRIP_MON+'/'+day));
    const order={Breakfast:0,Lunch:1,Dinner:2};
    meals.sort((a,b)=>(order[a.m]??9)-(order[b.m]??9));
    html+=`<div class="card"><div class="chead"><span>Today's meals</span></div>`+
      (meals.map(x=>`<div class="td-row" onclick="gotoMeal(${x.ci},${x.id})"><span class="num">${x.id}</span><span style="flex:1;min-width:0"><span class="td-name">${x.name}</span> <span class="tag ${x.res}">${RES_LABEL[x.res]||x.res}</span>${x.pay==='cash'?'<span class="tag cash">💴 cash</span>':''}<span class="td-meta">${x.m} · ${x.dish} · ${x.hrs} · ${x.area}</span>${x.warn?`<span class="td-warn">${esc(x.warn)}</span>`:''}${x.note?`<span class="td-note">${esc(x.note)}</span>`:''}</span></div>`).join('')||'<div class="td-empty">No planned meals today — graze free.</div>')+`</div>`;
    const dayPlans=(overrides.plans||[]).filter(p=>p.d===TRIP_MON+'/'+day).sort((a,b)=>(a.t||'99:99').localeCompare(b.t||'99:99'));
    if(dayPlans.length){
      html+=`<div class="card"><div class="chead"><span>Today's plan</span><span>${dayPlans.filter(p=>p.done).length}/${dayPlans.length} done</span></div>`+
        dayPlans.map(p=>{const pc=CITIES.find(c=>c.id===p.city);return planRow(p,pc?pc.city:'',true);}).join('')+`</div>`;
    }
    html+=todoCard(0,"Today's to-dos");
    const fl=FLIGHTS.filter(f=>f.d.includes(MONTH_NAMES[t.m-1].slice(0,3)+' '+day));
    const tr=((TD.trains)||[]).filter(x=>x.d===MONTH_NAMES[t.m-1].slice(0,3)+' '+day);
    if(fl.length||tr.length){
      html+=`<div class="card"><div class="chead"><span>Today's transit</span></div>`+
        fl.map(f=>`<div class="train"><div class="route">${f.route}</div><div class="tmeta">${f.d} · ${f.t} · ${f.train}</div><div class="note ${f.warn?'warn':''}">${f.note}</div></div>`).join('')+
        tr.map(x=>`<div class="train"><div class="route">${x.route}</div><div class="tmeta">${x.d} · ${x.t} · ${x.train}</div><div class="note">${x.note}</div></div>`).join('')+`</div>`;
    }
    const tn=TONIGHT[day];
    if(tn){
      if(Array.isArray(tn)){
        html+=`<div class="card"><div class="chead"><span>Tonight</span></div><div style="padding:10px 12px"><div class="td-name">${tn[0]}</div><div style="font-size:12px;color:var(--grey);margin-top:3px">${tn[1]}</div></div></div>`;
      }else{
        const h=HOTELS[tn];
        html+=`<div class="card hotel-card"><div class="chead"><span>Tonight's hotel</span></div><dl><dt>Name</dt><dd><b>${h.n}</b></dd><dt>Address</dt><dd>${h.addr}</dd><dt>Nearest station</dt><dd>${h.stn}</dd><dt>Phone</dt><dd><a href="tel:${h.tel.replace(/[^+\d]/g,'')}">${h.tel}</a></dd></dl></div>`;
      }
    }
    if(cid&&WX_CFG[cid]){
      html+=`<div class="card"><div class="chead"><span>Weather · ${CITIES[cityIdx].city}</span></div><div id="wxbody" style="padding:10px 12px;"><div class="note">Loading forecast…</div></div></div>`;
    }
  } else {
    const spentUsd=(overrides.expenses||[]).reduce((a,e)=>a+Number(e.usd),0);
    html+=`<div class="card td-hero"><div class="td-date">${dateLine}</div><div class="td-big">Okaeri 🏠</div><div class="td-sub">Trip complete${spentUsd?` · $${spentUsd.toLocaleString('en-US',{minimumFractionDigits:2})} logged`:''}</div></div>`;
  }
  html+=`</div>`;
  panel.innerHTML=html;
  const cidNow=inTrip?TODAY_CITY[t.d]:null;
  if(cidNow&&document.getElementById('wxbody'))loadWeather(cidNow);
}

/* ---------------- FX TREND (Frankfurter/ECB, no key) ---------------- */
let fxRange='1m';
const fxCache={};
async function loadFx(range){
  const el=document.getElementById('fxchart');
  if(!el)return;
  el.innerHTML='<div class="note">Loading rate history…</div>';
  try{
    const ck=CUR.code+':'+range;
    if(!fxCache[ck]){
      const end=new Date();
      const start=new Date(end.getTime()-(range==='1w'?7:30)*86400000);
      const fmt=d=>d.toISOString().slice(0,10);
      let pts=null;
      // Primary: Frankfurter v1 time series (ECB, single request)
      try{
        const r=await fetch(`https://api.frankfurter.dev/v1/${fmt(start)}..${fmt(end)}?base=USD&symbols=${CUR.code}`);
        if(r.ok){
          const d=await r.json();
          const arr=Object.keys(d.rates||{}).sort().map(k=>({d:k,v:d.rates[k][CUR.code]})).filter(x=>x.v);
          if(arr.length>=2)pts=arr;
        }
      }catch(e){}
      // Fallback: daily snapshots from the same API the live converter uses
      if(!pts){
        const dates=[];
        for(let ts=start.getTime();ts<=end.getTime();ts+=86400000)dates.push(fmt(new Date(ts)));
        const got=await Promise.all(dates.map(dt=>
          fetch(`https://${dt}.currency-api.pages.dev/v1/currencies/usd.min.json`)
            .then(r=>r.ok?r.json():null)
            .then(j=>j&&j.usd&&j.usd[CUR.key]?{d:dt,v:j.usd[CUR.key]}:null)
            .catch(()=>null)
        ));
        const arr=got.filter(Boolean);
        if(arr.length>=2)pts=arr;
      }
      if(!pts)throw new Error('fx unavailable');
      fxCache[ck]=pts;
    }
    const pts=fxCache[ck];
    const vs=pts.map(x=>x.v), min=Math.min(...vs), max=Math.max(...vs), span=(max-min)||1;
    const W=320,H=110,T=8,B=18,L=6,R=6;
    const X=i=>L+(W-L-R)*i/(pts.length-1);
    const Y=v=>T+(H-T-B)*(1-(v-min)/span);
    const line=pts.map((x,i)=>`${i?'L':'M'}${X(i).toFixed(1)},${Y(x.v).toFixed(1)}`).join(' ');
    const area=line+` L${X(pts.length-1).toFixed(1)},${H-B} L${X(0).toFixed(1)},${H-B} Z`;
    const first=pts[0].v, last=pts[pts.length-1].v, chg=(last-first)/first*100;
    const md=k=>k.slice(5).replace('-','/');
    el.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">
        <span style="font-family:var(--serif);font-size:22px;font-weight:700;color:var(--indigo);">${CUR.sym}${last.toFixed(2)}</span>
        <span style="font:600 10px var(--mono);color:${chg>=0?'var(--moss)':'var(--clay)'};">${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(2)}% over ${range==='1w'?'1 week':'1 month'}</span>
      </div>
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block;" role="img" aria-label="USD trend">
        <line x1="${L}" y1="${Y(max)}" x2="${W-R}" y2="${Y(max)}" stroke="rgba(20,22,27,.1)" stroke-dasharray="2 4"/>
        <line x1="${L}" y1="${Y(min)}" x2="${W-R}" y2="${Y(min)}" stroke="rgba(20,22,27,.1)" stroke-dasharray="2 4"/>
        <path d="${area}" fill="rgba(34,64,107,.08)"/>
        <path d="${line}" fill="none" stroke="#22406B" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${X(pts.length-1).toFixed(1)}" cy="${Y(last).toFixed(1)}" r="3" fill="#B8552A"/>
      </svg>
      <div style="display:flex;justify-content:space-between;font:9px var(--mono);color:var(--grey);margin-top:4px;">
        <span>${md(pts[0].d)}</span>
        <span>L ${CUR.sym}${min.toFixed(2)} · H ${CUR.sym}${max.toFixed(2)} · ECB daily</span>
        <span>${md(pts[pts.length-1].d)}</span>
      </div>`;
  }catch(e){
    el.innerHTML='<div class="note">Rate history unavailable right now — check again when online.</div>';
  }
}

function renderCalc() {
  panel.innerHTML = `
  <div class="card" style="max-width:500px; margin: 40px auto; padding:32px 24px; text-align:center;">
    <div style="font-family:var(--serif); font-size:24px; color:var(--indigo); margin-bottom:8px;">Quick Converter</div>
    <div style="font-family:var(--mono); font-size:11px; color:var(--moss); margin-bottom:32px; letter-spacing:0.05em; text-transform:uppercase;">
      Live Rate: ${CUR.sym}${liveRate.toFixed(2)} = $1.00
    </div>
    
    <div style="margin-bottom:24px; position:relative;">
      <div style="font:600 12px var(--mono); color:var(--grey); text-transform:uppercase; margin-bottom:8px; text-align:left;">Price in ${CUR.name||CUR.code} (${CUR.sym})</div>
      <input type="number" id="quickJpy" placeholder="0" style="width:100%; font-family:var(--serif); font-size:48px; font-weight:700; color:var(--ink); border:none; border-bottom:2px solid var(--clay); background:transparent; padding:8px 0; text-align:center; outline:none;">
    </div>

    <div style="margin-bottom:24px;">
      <div style="font:600 12px var(--mono); color:var(--grey); text-transform:uppercase; margin-bottom:8px; text-align:left;">Cost in USD ($)</div>
      <div id="quickUsd" style="font-family:var(--serif); font-size:48px; font-weight:700; color:var(--moss); padding:8px 0;">$0.00</div>
    </div>
  </div>

  <div class="card" style="max-width:500px; margin:14px auto 0;">
    <div class="chead"><span>USD → ${CUR.code} trend</span>
      <span style="display:flex;gap:5px;">
        <button class="chip fx-r ${fxRange==='1w'?'on':''}" data-r="1w" type="button">1W</button>
        <button class="chip fx-r ${fxRange==='1m'?'on':''}" data-r="1m" type="button">1M</button>
      </span>
    </div>
    <div id="fxchart" style="padding:12px 16px;"></div>
  </div>`;

  // Instant math as you type
  document.getElementById('quickJpy').addEventListener('input', (e) => {
    const jpy = Number(e.target.value);
    const usdDisplay = document.getElementById('quickUsd');
    if (jpy > 0) {
      usdDisplay.textContent = '$' + (jpy / liveRate).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    } else {
      usdDisplay.textContent = '$0.00';
    }
  });

  document.querySelectorAll('.fx-r').forEach(b=>b.onclick=()=>{
    fxRange=b.dataset.r;
    document.querySelectorAll('.fx-r').forEach(x=>x.classList.toggle('on',x.dataset.r===fxRange));
    loadFx(fxRange);
  });
  loadFx(fxRange);
}

function render(){
  if(!tripSel){renderHome();return;}
  refreshNav();
  if(!window._app){ renderLogin(); return; }
  if(appRole()==='pending'){ renderPendingApp(); return; }
  const TT=(typeof TRIP_DATA!=='undefined')&&TRIP_DATA[tripKey()];
  if(TT&&(TT.cruise||TT.group)&&(!window._cru||!window._cru.uid)){ window._cru=appGroupSession(tripKey()); if(!window._cru){ backToTrips(); return; } }
  const NAVC=navCities(); if(ci>=NAVC.length)ci=0;
  const c=NAVC[ci];

  if(c.cruiseTab){ if(map){map.remove();map=null;} renderCruise(c); return; }
  if(c.jjTab){ if(map){map.remove();map=null;} renderJeju(c); return; }

  if(c.addrest){ if(map){map.remove();map=null;} renderAddRestaurant(); return; }

  if(c.today){
    if(map){map.remove();map=null;}
    renderToday();
    return;
  }

  if(c.calc){
    if(map){map.remove();map=null;}
    renderCalc();
    return;
  }
  
  if(c.expenses){
    if(map){map.remove();map=null;}
    renderExpenses();
    return;
  }

  if(c.todo){ if(map){map.remove();map=null;} renderTodo(); return; }

  if(c.vault){ if(map){map.remove();map=null;} renderVault(); return; }

  if(c.flights||c.rail_only){
    if(map){map.remove();map=null;}
    const rows=c.flights?FLIGHTS:(((typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{}).trains||[]);
    panel.innerHTML=`<div class="card"><div class="chead"><span>${c.flights?'Flights':'Shinkansen & intercity'}</span></div>
      ${rows.map(t=>`<div class="train"><div class="route">${t.route}</div>
        <div class="tmeta">${t.d} · ${t.t} · ${t.train}</div>
        <div class="note ${t.warn?'warn':''}">${t.note}</div></div>`).join('')}</div>`;
    return;
  }
  panel.innerHTML=`<div class="grid">
    <div class="col-left">
    <div class="mapcard"><div class="maphead"><h2>${c.city}</h2>
      <button class="poitoggle ${showPoi?'on':''}" id="poiT" type="button">◆ POI ${showPoi?'on':'off'}</button></div>
      <div id="map"></div></div>
    <div class="stack" id="sideleft"></div></div>
    <div class="stack" id="side"></div></div>`;
  document.getElementById('poiT').onclick=()=>{showPoi=!showPoi;selPoi=null;render();};
  buildMap(c);
  renderSide(c);
}
