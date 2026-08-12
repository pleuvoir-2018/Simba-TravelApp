/* MODULE js/05b-orlando.js — Universal Orlando group trip.
   Renders when nav item carries uoTab. Uses the shared group overrides store:
   uoflights/uofees/uohotel (organizer-owned), uosched (collaborative by id,
   owner .by), uoexp (per-person map), uotodoDone (organizer-owned). All five
   keys ride mergeCruise lanes — see 01-core. */

function uoT(){ return (typeof TRIP_DATA!=='undefined'&&TRIP_DATA['orlando-universal'])||{}; }
function uoAdmin(){ return !!(window._cru&&window._cru.role==='admin'); }
function uoMe(){ return (window._cru||{}).uid||null; }
function uoMoney(n){ return '$'+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}); }
function uoSchedList(){ if(!Array.isArray(overrides.uosched))overrides.uosched=[]; return overrides.uosched; }
function uoDayLabel(d){ return 'Day '+d+(d===1?' · arrive':(d===4?' · depart':'')); }

/* ---- schedule feed: stored items + synthetic rows from flights & hotel ---- */
function uoFeed(){
  const T=uoT();
  const rows=uoSchedList().map(x=>({...x,src:'sched'}));
  (overrides.uoflights||[]).forEach((f,i)=>{
    rows.push({id:'fl'+i,day:Number(f.day)||1,t:f.t||'',txt:'✈ '+(f.r||'Flight')+(f.f?' · '+f.f:''),kind:'flight',src:'fly'});
  });
  const H=overrides.uohotel||T.hotelDefault||{};
  if(H.name){ rows.push({id:'hin',day:1,t:'16:00',txt:'🏨 Check in · '+H.name,kind:'hotel',src:'hotel'});
              rows.push({id:'hout',day:4,t:'11:00',txt:'🏨 Check out · '+H.name,kind:'hotel',src:'hotel'}); }
  return rows.sort((a,b)=>(a.day-b.day)||String(a.t||'99').localeCompare(String(b.t||'99')));
}

function renderOrlando(c){
  const T=uoT(); const admin=uoAdmin(); const me=uoMe();
  const K={travel:'🚗',park:'🎢',meal:'🍽',flight:'✈',hotel:'🏨',other:'📍'};
  let body='';

  /* ================= TODAY ================= */
  if(c.uoTab==='uotoday'){
    const done=overrides.uotodoDone||[];
    const todos=(T.seedTodos||[]).map(t=>{
      const ok=done.includes(t.name);
      return `<div class="tdo-row"><span style="flex:0 0 20px">${admin?`<input type="checkbox" ${ok?'checked':''} onchange="uoTodo('${esc(t.name)}',this.checked)">`:(ok?'✅':'⬜')}</span>
        <span class="tdo-main"><span class="tdo-t" style="${ok?'text-decoration:line-through;color:var(--grey)':''}">${esc(t.name)}</span><span class="tdo-desc" style="display:block;margin-top:2px">${esc(t.desc)}</span></span></div>`;
    }).join('');
    body=`
      <div class="td2-grid" style="display:grid;grid-template-columns:1.25fr 1fr;gap:16px;align-items:start">
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="card"><div style="padding:20px 18px;display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <div style="flex:0 0 96px;height:96px;border-radius:9px;background:#0B2545 url('${(T.cardPhoto||'')}') center/cover;display:flex;align-items:center;justify-content:center;font-size:40px">🎬</div>
            <div style="flex:1;min-width:180px">
              <div style="font:600 9px var(--mono);letter-spacing:.16em;color:var(--grey)">UNIVERSAL ORLANDO · GROUP TRIP</div>
              <div style="font:700 30px var(--serif);margin:2px 0 6px">Dates TBD</div>
              <div style="display:flex;gap:7px;flex-wrap:wrap">
                <span class="shipchip">⏱ 3 nights · 4 days</span>
                <span class="shipchip">✈ IAD → MCO planned</span>
                <span class="shipchip">🏨 JW Bonnet Creek</span>
              </div></div></div></div>
          <div class="card"><div class="chead"><span>🎯 Before we go</span><span>${done.length}/${(T.seedTodos||[]).length} done</span></div>${todos}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;min-width:0">
          <div class="card"><div class="chead"><span>📅 Calendar</span><span>dates pending</span></div>
            <div style="padding:12px 14px;font-size:12px;color:var(--grey)">The trip calendar lights up here once dates are chosen — day dots, tap-for-plans, the works. First to-do above.</div></div>
          <div class="card"><div class="chead"><span>🌤 Weather · Orlando</span><span>7-day</span></div><div id="uowx" style="padding:6px 10px 12px"><div style="padding:8px;font-size:11px;color:var(--grey)">Loading forecast…</div></div></div>
        </div>
      </div>`;
    setTimeout(uoLoadWx,0);
  }

  /* ================= SCHEDULE ================= */
  if(c.uoTab==='uosched'){
    const day=c._uoDay||1;
    const feed=uoFeed().filter(x=>x.day===day);
    const H=overrides.uohotel||T.hotelDefault||{};
    const rows=feed.length?feed.map(x=>`
      <div class="tdo-row"><span style="flex:0 0 44px;font:600 10px var(--mono);color:var(--grey)">${esc(x.t||'—')}</span>
        <span class="tdo-main"><span class="tdo-t">${K[x.kind]||'📍'} ${esc(x.txt)}</span>${x.dur?`<span class="tdo-desc" style="margin-left:9px">~${esc(x.dur)}</span>`:''}</span>
        ${x.src==='sched'&&(admin||x.by===me)?`<button class="tdo-x" onclick="uoDelSched('${x.id}')" style="color:var(--clay);font-size:16px;background:none;border:none;cursor:pointer">×</button>`:`<span class="tdo-desc" style="flex:0 0 auto">${x.src==='fly'?'from Flights':(x.src==='hotel'?'from Hotel':'')}</span>`}
      </div>`).join(''):'<div style="padding:12px 14px;font-size:12px;color:var(--grey)">Nothing planned for this day yet.</div>';
    body=`
      <div class="card"><div class="chead"><span>🗓 Schedule — 3 nights · 4 days</span><span>dates TBD · days are relative</span></div>
        <div class="shipchips" style="padding-top:12px">${[1,2,3,4].map(d=>`<span class="shipchip ${d===day?'':'spec'}" style="cursor:pointer;${d===day?'background:var(--indigo);border-color:var(--indigo);color:#fff':''}" onclick="uoDay(${d})">${uoDayLabel(d)}</span>`).join('')}</div>
        <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
          <select id="uos_day">${[1,2,3,4].map(d=>`<option value="${d}" ${d===day?'selected':''}>Day ${d}</option>`).join('')}</select>
          <input id="uos_t" type="time" style="width:104px">
          <select id="uos_kind"><option value="park">🎢 Park time</option><option value="travel">🚗 Travel</option><option value="meal">🍽 Meal</option><option value="other">📍 Other</option></select>
          <input id="uos_txt" placeholder="What's happening (e.g. Rope drop Epic — Stardust Racers first)" style="flex:1;min-width:160px">
          <input id="uos_dur" placeholder="~45 min" style="width:90px">
          <button class="pladd" type="button" onclick="uoAddSched()" style="flex:0 0 auto;padding:8px 14px">+ Add</button>
        </div></div>
        ${rows}
      </div>
      <div class="card"><div class="chead"><span>🗺 The lay of the land</span><span>airport · hotel · parks</span></div>
        <div id="uomap" style="height:340px"></div>
        <div style="padding:9px 13px;font-size:11px;color:var(--grey)">MCO → hotel ~20 min · hotel → Universal ~15 min · parks are neighbours except Epic (~10 min south). Travel rows above are how we hold those gaps honest.</div>
      </div>`;
    setTimeout(()=>uoMap('uomap','sched'),0);
  }

  /* ================= ATTRACTIONS ================= */
  if(c.uoTab==='uoattr'){
    const pf=c._uoPark||'all', tf=c._uoType||'all';
    const P=T.parks||{};
    const list=(T.attr||[]).filter(a=>(pf==='all'||a.park===pf)&&(tf==='all'||a.type===tf));
    const TYPES={coaster:'Coaster',dark:'Dark ride',water:'Water',show:'Show',family:'Family'};
    body=`
      <div class="card"><div class="chead"><span>🎢 Attractions</span><span>${list.length} of ${(T.attr||[]).length}</span></div>
        <div class="shipchips" style="padding-top:12px">${['all','usf','ioa','epic','vb'].map(k=>`<span class="shipchip ${k===pf?'':'spec'}" style="cursor:pointer;${k===pf?`background:${k==='all'?'var(--indigo)':(P[k]||{}).c};border-color:transparent;color:#fff`:''}" onclick="uoPark('${k}')">${k==='all'?'ALL PARKS':esc((P[k]||{}).n||k)}</span>`).join('')}</div>
        <div class="shipchips">${['all','coaster','dark','water','show','family'].map(k=>`<span class="shipchip ${k===tf?'':'spec'}" style="cursor:pointer;${k===tf?'background:var(--moss);border-color:var(--moss);color:#fff':''}" onclick="uoType('${k}')">${k==='all'?'All types':TYPES[k]}</span>`).join('')}</div>
        ${list.map(a=>`<div class="tdo-row"><span style="flex:0 0 10px;height:10px;border-radius:50%;background:${(P[a.park]||{}).c||'#888'};margin-top:5px"></span>
          <span class="tdo-main"><span class="tdo-t">${esc(a.n)}</span><span class="tdo-cat">${TYPES[a.type]||a.type}${a.ht?' · '+esc(a.ht)+'+':''}</span>
          <span class="tdo-desc" style="display:block;margin-top:2px">${esc(a.d)} · <i style="font-style:normal;color:${(P[a.park]||{}).c}">${esc((P[a.park]||{}).n||'')}</i></span></span></div>`).join('')}
      </div>
      <div class="card"><div class="chead"><span>🗺 Park map</span><span>coloured by park</span></div><div id="uoamap" style="height:320px"></div></div>`;
    setTimeout(()=>uoMap('uoamap','parks'),0);
  }

  /* ================= RESTAURANTS ================= */
  if(c.uoTab==='uorest'){
    const wf=c._uoWhere||'all';
    const P=T.parks||{};
    const list=(T.rest||[]).filter(r=>wf==='all'||r.where===wf);
    body=`
      <div class="card"><div class="chead"><span>🍽 Restaurants</span><span>tap + to add to the schedule</span></div>
        <div class="shipchips" style="padding-top:12px">${['all','usf','ioa','epic','vb','citywalk'].map(k=>`<span class="shipchip ${k===wf?'':'spec'}" style="cursor:pointer;${k===wf?`background:${k==='all'?'var(--indigo)':(P[k]||{}).c};border-color:transparent;color:#fff`:''}" onclick="uoWhere('${k}')">${k==='all'?'EVERYWHERE':esc((P[k]||{}).n||k)}</span>`).join('')}</div>
        ${list.map((r,i)=>{const gi=(T.rest||[]).indexOf(r);return `<div class="tdo-row"><span style="flex:0 0 10px;height:10px;border-radius:50%;background:${(P[r.where]||{}).c||'#888'};margin-top:5px"></span>
          <span class="tdo-main"><span class="tdo-t">${esc(r.n)}</span><span class="tdo-cat">${r.kind==='table'?'table service':'quick service'}${r.res?' · takes reservations':''}</span>
          <span class="tdo-desc" style="display:block;margin-top:2px">${esc(r.cui)} · ${esc(r.d)}</span>
          <span id="uor_${gi}" style="display:none;margin-top:7px;gap:7px" class="plrow1">
            <select id="uor_d_${gi}">${[1,2,3,4].map(d=>`<option value="${d}">Day ${d}</option>`).join('')}</select>
            <input id="uor_t_${gi}" type="time" style="width:100px">
            <button class="pladd" type="button" onclick="uoRestAdd(${gi})" style="padding:7px 12px">Add</button>
          </span></span>
          <button class="pladd" type="button" onclick="uoRestForm(${gi})" style="flex:0 0 auto;padding:6px 11px" title="Add to schedule">＋</button></div>`;}).join('')}
      </div>`;
  }

  /* ================= FLIGHTS ================= */
  if(c.uoTab==='uofly'){
    const F=overrides.uoflights||[]; const fees=overrides.uofees||[];
    const pp=F.reduce((s,f)=>s+Number(f.pp||0),0), fpp=fees.reduce((s,x)=>s+Number(x.amt||0),0);
    body=`
      <div class="card"><div class="chead"><span>✈ Flights</span><span>${admin?'you edit · guests view':'from the organizer'}</span></div>
        ${admin?`<div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="uof_r" placeholder="IAD → MCO" style="width:120px"><input id="uof_f" placeholder="UA 1234" style="width:90px">
          <select id="uof_day">${[1,2,3,4].map(d=>`<option value="${d}">Day ${d}</option>`).join('')}</select>
          <input id="uof_t" type="time" style="width:100px"><input id="uof_pp" type="number" min="0" step="0.01" placeholder="$/person" style="width:100px">
          <button class="pladd" type="button" onclick="uoAddFly()" style="padding:8px 13px">+ Add</button></div></div>`:''}
        ${F.length?F.map((f,i)=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">✈ ${esc(f.r)}</span><span class="tdo-cat">Day ${f.day}${f.t?' · '+esc(f.t):''}${f.f?' · '+esc(f.f):''}</span>
          <span class="tdo-desc" style="display:block;margin-top:2px">${uoMoney(f.pp)} per person · feeds the Schedule tab</span></span>
          ${admin?`<button class="tdo-x" onclick="uoDelFly(${i})" style="color:var(--clay);font-size:16px;background:none;border:none;cursor:pointer">×</button>`:''}</div>`).join('')
        :'<div style="padding:12px 14px;font-size:12px;color:var(--grey)">No flights entered yet.</div>'}
      </div>
      <div class="card"><div class="chead"><span>💳 Flight fees & extras</span><span>per person</span></div>
        ${admin?`<div class="plform"><div class="plrow1" style="display:flex;gap:8px">
          <input id="uofee_l" placeholder="Seat selection, bags…" style="flex:1"><input id="uofee_a" type="number" min="0" step="0.01" placeholder="$/person" style="width:110px">
          <button class="pladd" type="button" onclick="uoAddFee()" style="padding:8px 13px">+ Add</button></div></div>`:''}
        ${fees.map((x,i)=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(x.l)}</span><span class="tdo-desc" style="margin-left:9px">${uoMoney(x.amt)}</span></span>
          ${admin?`<button class="tdo-x" onclick="uoDelFee(${i})" style="color:var(--clay);font-size:16px;background:none;border:none;cursor:pointer">×</button>`:''}</div>`).join('')||'<div style="padding:12px 14px;font-size:12px;color:var(--grey)">None yet.</div>'}
        <div style="padding:10px 14px;border-top:1px solid var(--rule);display:flex;justify-content:space-between;font:700 13px var(--serif)"><span>Air total / person</span><span>${uoMoney(pp+fpp)}</span></div>
      </div>`;
  }

  /* ================= HOTEL ================= */
  if(c.uoTab==='uohotel'){
    const H={...(T.hotelDefault||{}),...(overrides.uohotel||{})};
    const perPerson=Number(H.roomCost||0)/2;
    body=`
      <div class="card"><div class="chead"><span>🏨 Hotel</span><span>${admin?'you edit · guests view':'from the organizer'}</span></div>
        <div style="padding:13px 16px">
          <div style="font:700 16px var(--serif)">${esc(H.name||'')}</div>
          <div style="font-size:12px;color:var(--grey);margin-top:3px">${esc(H.addr||'')}</div>
          <div style="font-size:12px;margin-top:7px">${esc(H.note||'')}</div>
        </div>
        ${admin?`<div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="uoh_cost" type="number" min="0" step="0.01" placeholder="Room total (all ${H.nights||3} nights)" value="${H.roomCost||''}" style="flex:1;min-width:150px">
          <input id="uoh_note" placeholder="Note (confirmation #, rate…)" value="" style="flex:2;min-width:160px">
          <button class="pladd" type="button" onclick="uoSaveHotel()" style="padding:8px 14px">Save</button></div></div>`:''}
        <div class="tdo-row"><span class="tdo-main"><span class="tdo-t">Room cost · ${H.nights||3} nights</span><span class="tdo-desc" style="margin-left:9px">${uoMoney(H.roomCost)} per room · ${uoMoney(perPerson)} per person (2 per room)</span></span></div>
        <div class="tdo-row"><span class="tdo-main"><span class="tdo-t">Feeds the trip</span><span class="tdo-desc" style="margin-left:9px">check-in/out on the Schedule · pinned on the map · per-person share on Expenses</span></span></div>
      </div>
      <div class="card"><div class="chead"><span>🗺 Where it sits</span></div><div id="uohmap" style="height:300px"></div></div>`;
    setTimeout(()=>uoMap('uohmap','hotel'),0);
  }

  /* ================= EXPENSES ================= */
  if(c.uoTab==='uoexp'){
    const F=overrides.uoflights||[]; const fees=overrides.uofees||[];
    const H={...(T.hotelDefault||{}),...(overrides.uohotel||{})};
    const flightPP=F.reduce((s,f)=>s+Number(f.pp||0),0), feePP=fees.reduce((s,x)=>s+Number(x.amt||0),0);
    const hotelPP=Number(H.roomCost||0)/2;
    const total=flightPP+feePP+hotelPP;
    if(!overrides.uoexp)overrides.uoexp={};
    const mine=overrides.uoexp[me]||[];
    const myTotal=mine.reduce((s,x)=>s+Number(x.amt||0),0);
    const invRow=(l,v,sub)=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${l}</span>${sub?`<span class="tdo-desc" style="display:block;margin-top:2px">${sub}</span>`:''}</span><span style="font:600 12px var(--mono)">${uoMoney(v)}</span></div>`;
    body=`
      <div class="card"><div class="chead"><span>🧾 Group booking — your share</span><span>invoice</span></div>
        ${invRow('✈ Flights',flightPP,F.map(f=>esc(f.r)).join(' · ')||'not booked yet')}
        ${fees.map(x=>invRow('&nbsp;&nbsp;+ '+esc(x.l),x.amt)).join('')}
        ${invRow('🏨 Hotel · half a room',hotelPP,esc(H.name||'')+' · '+(H.nights||3)+' nights ÷ 2')}
        <div style="padding:12px 16px;border-top:2px solid var(--indigo);display:flex;justify-content:space-between;align-items:baseline">
          <span style="font:700 14px var(--serif)">Your total</span><span style="font:700 20px var(--serif)">${uoMoney(total)}</span></div>
        <div style="padding:0 16px 12px;font-size:10.5px;color:var(--grey)">Strictly two per room; flights and fees are per person as entered by the organizer.</div>
      </div>
      <div class="card"><div class="chead"><span>💵 My expenses</span><span>${uoMoney(myTotal)} total</span></div>
        <div class="plform"><div class="plrow1" style="display:flex;gap:8px;flex-wrap:wrap">
          <input id="uox_d" type="date"><input id="uox_desc" placeholder="Butterbeer, wand, lockers…" style="flex:1;min-width:150px">
          <input id="uox_amt" type="number" min="0" step="0.01" placeholder="$" style="width:90px">
          <button class="pladd" type="button" onclick="uoAddExp()" style="padding:8px 13px">+ Add</button></div></div>
        ${mine.length?mine.map((x,i)=>`<div class="tdo-row"><span style="flex:0 0 74px;font:600 10px var(--mono);color:var(--grey)">${esc(x.d||'—')}</span>
          <span class="tdo-main"><span class="tdo-t">${esc(x.desc)}</span></span><span style="font:600 12px var(--mono)">${uoMoney(x.amt)}</span>
          <button class="tdo-x" onclick="uoDelExp(${i})" style="color:var(--clay);font-size:16px;background:none;border:none;cursor:pointer">×</button></div>`).join('')
        :'<div style="padding:12px 14px;font-size:12px;color:var(--grey)">Nothing yet — this list is yours alone; every traveller keeps their own.</div>'}
      </div>`;
  }

  const el=document.getElementById('content');
  el.innerHTML=`<div class="wrap">${body}</div>`;
}

/* ---------------- maps ---------------- */
function uoMap(elId,mode){
  const el=document.getElementById(elId); if(!el||typeof L==='undefined')return;
  const T=uoT(); const P=T.parks||{}; const PT=T.points||{};
  const m=L.map(elId,{scrollWheelZoom:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:18,attribution:'© OpenStreetMap © CARTO'}).addTo(m);
  const pts=[];
  const pin=(lat,lng,html,color)=>{ pts.push([lat,lng]);
    L.marker([lat,lng],{icon:L.divIcon({className:'',html:`<span class="mk" style="background:${color};font-size:9px">${html}</span>`,iconSize:[20,20],iconAnchor:[10,10]})}).addTo(m); };
  const H={...(T.hotelDefault||{}),...(overrides.uohotel||{})};
  if(mode!=='parks'){ pin(PT.mco.lat,PT.mco.lng,'✈','#4A6E9E'); pin(H.lat||PT.hotel.lat,H.lng||PT.hotel.lng,'🏨','#8E4B62'); }
  Object.keys(P).forEach(k=>{ if(mode==='hotel')return; pin(P[k].lat,P[k].lng,'🎢',P[k].c); });
  if(mode==='hotel'){ pin(P.epic.lat,P.epic.lng,'🎢',P.epic.c); }
  m.fitBounds(pts,{padding:[28,28]});
}

/* ---------------- weather (write-time DOM per house rule) ---------------- */
function uoLoadWx(){
  if(window._uoWxBusy)return; window._uoWxBusy=true;
  const put=h=>{ const el=document.getElementById('uowx'); if(el)el.innerHTML=h; };
  const ctl=new AbortController(); setTimeout(()=>ctl.abort(),8000);
  fetch('https://api.open-meteo.com/v1/forecast?latitude=28.4743&longitude=-81.4678&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&forecast_days=7&timezone=America%2FNew_York',{signal:ctl.signal})
   .then(r=>r.json()).then(d=>{
     const ICO=c=>c===0?'☀':c<3?'⛅':c<50?'☁':c<70?'🌧':c<80?'🌧':'⛈';
     const days=d.daily.time.map((t,i)=>{
       const dow=['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(t+'T12:00:00').getDay()];
       return `<span style="display:flex;flex-direction:column;align-items:center;gap:2px"><b style="font:600 7.5px var(--mono);color:var(--grey)">${i===0?'TODAY':dow}</b><i style="font-style:normal;font-size:16px">${ICO(d.daily.weather_code[i])}</i><em style="font-style:normal;font:600 11px var(--mono)">${Math.round(d.daily.temperature_2m_max[i])}°</em><u style="text-decoration:none;font:500 10px var(--mono);color:var(--grey)">${Math.round(d.daily.temperature_2m_min[i])}°</u></span>`;
     }).join('');
     put(`<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center">${days}</div>`);
   }).catch(()=>put('<div style="padding:8px;font-size:11px;color:var(--grey)">Forecast unavailable — try a refresh.</div>'))
   .finally(()=>{window._uoWxBusy=false;});
}

/* ---------------- actions ---------------- */
window.uoDay=function(d){ const c=navCities()[ci]; c._uoDay=d; render(); };
window.uoPark=function(k){ const c=navCities()[ci]; c._uoPark=k; render(); };
window.uoType=function(k){ const c=navCities()[ci]; c._uoType=k; render(); };
window.uoWhere=function(k){ const c=navCities()[ci]; c._uoWhere=k; render(); };
window.uoTodo=function(name,on){ if(!uoAdmin())return;
  overrides.uotodoDone=overrides.uotodoDone||[];
  overrides.uotodoDone=on?[...new Set([...overrides.uotodoDone,name])]:overrides.uotodoDone.filter(x=>x!==name);
  saveOverrides(); render(); };
window.uoAddSched=function(){
  const g=i=>document.getElementById(i);
  const txt=g('uos_txt').value.trim(); if(!txt)return;
  uoSchedList().push({id:'uos'+Date.now(),by:uoMe(),day:Number(g('uos_day').value),t:g('uos_t').value,kind:g('uos_kind').value,txt,dur:g('uos_dur').value.trim()});
  saveOverrides(); render(); };
window.uoDelSched=function(id){
  const x=uoSchedList().find(v=>v.id===id); if(!x)return;
  if(!uoAdmin()&&x.by!==uoMe())return;
  overrides.uosched=uoSchedList().filter(v=>v.id!==id); saveOverrides(); render(); };
window.uoRestForm=function(i){ const el=document.getElementById('uor_'+i); if(el)el.style.display=el.style.display==='none'?'flex':'none'; };
window.uoRestAdd=function(i){
  const T=uoT(); const r=(T.rest||[])[i]; if(!r)return;
  const d=Number(document.getElementById('uor_d_'+i).value)||1, t=document.getElementById('uor_t_'+i).value;
  uoSchedList().push({id:'uos'+Date.now(),by:uoMe(),day:d,t,kind:'meal',txt:r.n+(r.res?' — reserve ahead':'')});
  saveOverrides(); flash(r.n+' → Day '+d+' ✓','ok'); render(); };
window.uoAddFly=function(){ if(!uoAdmin())return;
  const g=i=>document.getElementById(i); const r=g('uof_r').value.trim(); if(!r)return;
  overrides.uoflights=overrides.uoflights||[];
  overrides.uoflights.push({r,f:g('uof_f').value.trim(),day:Number(g('uof_day').value),t:g('uof_t').value,pp:Number(g('uof_pp').value||0)});
  saveOverrides(); render(); };
window.uoDelFly=function(i){ if(!uoAdmin())return; overrides.uoflights.splice(i,1); saveOverrides(); render(); };
window.uoAddFee=function(){ if(!uoAdmin())return;
  const l=document.getElementById('uofee_l').value.trim(); if(!l)return;
  overrides.uofees=overrides.uofees||[];
  overrides.uofees.push({l,amt:Number(document.getElementById('uofee_a').value||0)});
  saveOverrides(); render(); };
window.uoDelFee=function(i){ if(!uoAdmin())return; overrides.uofees.splice(i,1); saveOverrides(); render(); };
window.uoSaveHotel=function(){ if(!uoAdmin())return;
  const T=uoT(); const cur={...(T.hotelDefault||{}),...(overrides.uohotel||{})};
  const cost=Number(document.getElementById('uoh_cost').value||0);
  const note=document.getElementById('uoh_note').value.trim();
  overrides.uohotel={...cur,roomCost:cost,...(note?{note}:{})};
  saveOverrides(); render(); };
window.uoAddExp=function(){
  const g=i=>document.getElementById(i); const desc=g('uox_desc').value.trim(); if(!desc)return;
  const me=uoMe(); if(!overrides.uoexp)overrides.uoexp={};
  overrides.uoexp[me]=overrides.uoexp[me]||[];
  overrides.uoexp[me].push({d:g('uox_d').value,desc,amt:Number(g('uox_amt').value||0)});
  saveOverrides(); render(); };
window.uoDelExp=function(i){
  const me=uoMe(); if(!overrides.uoexp||!overrides.uoexp[me])return;
  overrides.uoexp[me].splice(i,1); saveOverrides(); render(); };
