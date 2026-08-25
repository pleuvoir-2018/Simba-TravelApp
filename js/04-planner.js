/* MODULE js/04-planner.js — To-do tracker, day plans, developer-mode restaurant manager
   Split from index.html with statement order preserved; load order matters. */
/* ---------------- TO-DO / PREP TRACKER ---------------- */
const TODO_CATS={ticket:'🎟 Entry ticket',booking:'📞 Booking',transport:'🚄 Transportation',concierge:'🛎 Hotel / concierge',shop:'🛍 Shopping',admin:'📋 Admin',other:'📍 Other'};
const TODO_ICO={ticket:'🎟',booking:'📞',transport:'🚄',concierge:'🛎',shop:'🛍',admin:'📋',other:'📍'};
const TODO_SEED_VERSION=3;   // bumped: seeds are per-trip now

let todoView='list', todoMonth='2026-08', todoDaySel=null;
window._editTid=null;
function tokyoISO(){return new Date().toLocaleDateString('en-CA',{timeZone:TRIP_TZ});}
function tripSeedTodos(){
  const t=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||null;
  return (t&&t.seedTodos)||[];
}
function ensureTodos(){
  if(!overrides.todos){
    overrides.todos=tripSeedTodos().map(t=>({...t,done:false}));
    overrides.todoSeed=TODO_SEED_VERSION;
    saveOverrides();
    return;
  }
  // One-time cleanup: drop the v1 seed items that are no longer defaults.
  // User-added ids are 't'+Date.now() (13 digits) so they can never match.
  if(overrides.todoSeed!==TODO_SEED_VERSION){
    const keep=tripSeedTodos().map(t=>t.id);
    overrides.todos=overrides.todos.filter(t=>!(/^t([1-9]|1[0-4])$/.test(t.id)&&!keep.includes(t.id)));
    overrides.todoSeed=TODO_SEED_VERSION;
    saveOverrides();
  }
}
function todoRow(x,compact){
  const today=tokyoISO();
  const overdue=x.d&&x.d<today&&!x.done;
  const soon=!overdue&&!x.done&&x.d&&(new Date(x.d)-new Date(today))/86400000<=7;
  const md=x.d?x.d.slice(5).replace('-','/'):'—';
  const title=x.url?`<a href="${esc(x.url)}" target="_blank">${esc(x.title)}</a>`:esc(x.title);
  return `<div class="tdo-row ${x.done?'done':''} ${overdue?'overdue':''} ${soon?'soon':''}">
    <input type="checkbox" ${x.done?'checked':''} onchange="toggleTodo('${x.id}',this.checked)">
    <span class="tdo-date">${md}</span>
    <span class="tdo-main">
      <span class="tdo-t">${TODO_ICO[x.cat]||'📍'} ${title}</span><span class="tdo-cat">${(TODO_CATS[x.cat]||'').replace(/^\S+\s/,'')}</span>
      ${x.desc?`<span class="tdo-desc">${esc(x.desc)}</span>`:''}
      ${overdue?'<span class="tdo-flag" style="color:var(--clay)">⚠ PAST DUE</span>':(soon?'<span class="tdo-flag" style="color:#B08A1F">DUE SOON</span>':'')}
    </span>
    ${compact?'':`<button class="tdo-x" onclick="editTodo('${x.id}')" style="color:var(--indigo)">✎</button>
    <button class="tdo-x" onclick="delTodo('${x.id}')" style="color:var(--clay);font-size:17px">×</button>`}
  </div>`;
}
function todoCalendarHTML(){
  const items=overrides.todos||[];
  const [y,m]=todoMonth.split('-').map(Number);
  const startDow=new Date(Date.UTC(y,m-1,1)).getUTCDay();
  const nDays=new Date(Date.UTC(y,m,0)).getUTCDate();
  const label=new Date(Date.UTC(y,m-1,1)).toLocaleDateString('en-US',{month:'long',year:'numeric',timeZone:'UTC'});
  const today=tokyoISO();
  let cells='';
  for(let i=0;i<startDow;i++)cells+='<div class="cal-c blank"></div>';
  for(let d=1;d<=nDays;d++){
    const iso=`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const its=items.filter(x=>x.d===iso);
    const trip=iso>='2026-11-15'&&iso<='2026-11-27';
    cells+=`<div class="cal-c ${trip?'trip':''} ${iso===today?'now':''} ${iso===todoDaySel?'sel':''}" onclick="pickTodoDay('${iso}')">
      <span class="cal-n">${d}</span>
      ${its.slice(0,2).map(x=>`<div class="cal-i ${x.done?'done':''}">${TODO_ICO[x.cat]||'📍'} ${esc(x.title)}</div>`).join('')}
      ${its.length>2?`<div class="cal-i">+${its.length-2} more</div>`:''}
    </div>`;
  }
  const sel=todoDaySel?items.filter(x=>x.d===todoDaySel):[];
  return `<div class="chead"><span class="cal-nav"><button onclick="shiftTodoMonth(-1)">‹</button>${label}<button onclick="shiftTodoMonth(1)">›</button></span>
      <span style="font:9px var(--mono);color:var(--grey)">shaded = trip days</span></div>
    <div class="cal">${['S','M','T','W','T','F','S'].map(d=>`<div class="cal-h">${d}</div>`).join('')}${cells}</div>
    ${todoDaySel?`<div style="border-top:1px solid var(--rule)"><div style="font:600 9px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--indigo);padding:8px 12px 2px;background:var(--washi2)">${todoDaySel}</div>${sel.length?sel.map(todoRow).join(''):'<div style="padding:10px 12px;font-size:11.5px;color:var(--grey)">Nothing on this day.</div>'}</div>`:''}`;
}
function todoDigest(windowDays){
  ensureTodos();
  const today=tokyoISO();
  return (overrides.todos||[]).filter(x=>{
    if(x.done)return false;
    if(!x.d)return false;
    if(x.d<today)return true;                       // overdue
    return (new Date(x.d)-new Date(today))/86400000<=windowDays;
  }).sort((a,b)=>a.d.localeCompare(b.d));
}
function todoCard(windowDays,title){
  const due=todoDigest(windowDays);
  if(!due.length)return '';
  const late=due.filter(x=>x.d<tokyoISO()).length;
  return `<div class="card"><div class="chead"><span>${title}</span><span>${late?late+' past due · ':''}${due.length} open</span></div>`+
    due.map(x=>todoRow(x,true)).join('')+
    `<div style="padding:7px 12px;font:9px var(--mono);color:var(--grey);border-top:1px dotted var(--rule)">Full list on the To-do tab</div></div>`;
}

function renderTodo(){
  ensureTodos();
  const items=(overrides.todos||[]).slice();
  const open=items.filter(x=>!x.done).length;
  const dated=items.filter(x=>x.d).sort((a,b)=>a.d.localeCompare(b.d));
  const undated=items.filter(x=>!x.d);
  const byDate={};dated.forEach(x=>{(byDate[x.d]=byDate[x.d]||[]).push(x);});
  const listHTML=Object.keys(byDate).map(d=>byDate[d].map(todoRow).join('')).join('')
    +(undated.length?`<div style="font:600 9px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--grey);padding:8px 12px 2px;background:var(--washi2)">No date</div>`+undated.map(todoRow).join(''):'')
    ||'<div style="padding:12px;font-size:11.5px;color:var(--grey)">Nothing tracked yet.</div>';
  panel.innerHTML=`<div class="stack" style="max-width:760px;margin:0 auto">
    <div class="card">
      <div class="chead"><span>Things to do</span><span>${open} open · ${items.length-open} done</span></div>
      <div class="plform">
        <div class="plrow1">
          <input id="td_date" type="date" value="${tokyoISO()}">
          <select id="td_cat">${Object.entries(TODO_CATS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
        </div>
        <input id="td_title" placeholder="What needs doing" maxlength="90">
        <input id="td_url" placeholder="Link (booking page, ticket site…) — optional">
        <div class="plrow1">
          <input id="td_desc" placeholder="Notes — optional" maxlength="240">
          <button class="pladd" id="td_btn" type="button" onclick="saveTodo()">+ Add</button>
        </div>
      </div>
      <div style="display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid var(--rule)">
        <button class="chip ${todoView==='list'?'on':''}" type="button" onclick="setTodoView('list')">List</button>
        <button class="chip ${todoView==='cal'?'on':''}" type="button" onclick="setTodoView('cal')">Calendar</button>
      </div>
      ${todoView==='list'?listHTML:todoCalendarHTML()}
    </div></div>`;
}
window.setTodoView=function(v){todoView=v;renderTodo();};
window.shiftTodoMonth=function(n){
  const [y,m]=todoMonth.split('-').map(Number);
  const d=new Date(Date.UTC(y,m-1+n,1));
  todoMonth=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
  renderTodo();
};
window.pickTodoDay=function(iso){todoDaySel=(todoDaySel===iso?null:iso);renderTodo();};
window.saveTodo=function(){
  const g=i=>document.getElementById(i);
  const title=g('td_title').value.trim();
  if(!title){g('td_title').focus();return;}
  overrides.todos=overrides.todos||[];
  let x;
  if(window._editTid){x=overrides.todos.find(t=>t.id===window._editTid);window._editTid=null;}
  if(!x){x={id:'t'+Date.now(),done:false};overrides.todos.push(x);}
  Object.assign(x,{d:g('td_date').value,cat:g('td_cat').value,title,url:g('td_url').value.trim(),desc:g('td_desc').value.trim()});
  saveOverrides();renderTodo();
};
window.toggleTodo=function(id,v){
  const x=(overrides.todos||[]).find(t=>t.id===id);
  if(x){x.done=v;saveOverrides();refreshPanel();}
};
window.delTodo=function(id){
  if(!confirm('Remove this item?'))return;
  overrides.todos=(overrides.todos||[]).filter(t=>t.id!==id);
  overrides.todoGone=[...new Set([...(overrides.todoGone||[]),id])];
  saveOverrides();refreshPanel();
};
window.editTodo=function(id){
  const x=(overrides.todos||[]).find(t=>t.id===id);
  if(!x)return;
  if(todoView!=='list'){todoView='list';}
  window._editTid=id;renderTodo();
  const g=i=>document.getElementById(i);
  g('td_date').value=x.d||'';g('td_cat').value=x.cat||'other';g('td_title').value=x.title;
  g('td_url').value=x.url||'';g('td_desc').value=x.desc||'';
  g('td_btn').textContent='✓ Update';g('td_btn').style.background='var(--moss)';
  g('td_title').scrollIntoView({behavior:'smooth',block:'center'});
};

/* ---------------- DAY PLANS ---------------- */
const PLAN_CATS={sight:'⛩ Sightseeing',cafe:'☕ Cafe',food:'🍽 Food',shop:'🛍 Shopping',transit:'🚃 Transit',other:'📍 Other'};
const PLAN_ICO={sight:'⛩',cafe:'☕',food:'🍽',shop:'🛍',transit:'🚃',other:'📍'};
const PLAN_CAT_TO_EXP={sight:'POI & Cafe',cafe:'POI & Cafe',food:'Food',shop:'Omiyage',transit:'Transit',other:'Other'};
const EXP_CARDS=['AMEX Platinum','AMEX Gold','AMEX Bonvoy Brilliant','Capital One Venture X','United Quest','Cash'];
window._editPid=null;
function tripDates(){
  const T=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{};
  const a=T.depart||[2026,10,15], b=T.end||[2026,10,27];
  const out=[]; const d=new Date(Date.UTC(a[0],a[1],a[2])); const stop=Date.UTC(b[0],b[1],b[2]);
  while(d.getTime()<=stop&&out.length<60){ out.push((d.getUTCMonth()+1)+'/'+d.getUTCDate()); d.setUTCDate(d.getUTCDate()+1); }
  return out;
}
function planMapUrl(p,cityName){
  return p.url&&/^https?:\/\//.test(p.url)?p.url:`https://www.google.com/maps/search/${encodeURIComponent(p.name+' '+cityName)}`;
}
function cityDefaultDate(c){
  const cfg=WX_CFG[c.id];
  if(cfg&&cfg.from)return TRIP_MON+'/'+Number(cfg.from.slice(-2));
  const T=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{};
  return T.arrive?((T.arrive[1]+1)+'/'+T.arrive[2]):(tripDates()[0]||TRIP_MON+'/1');
}
function refreshPanel(){
  const c=navCities()[ci]||CITIES[0];
  if(c.today){renderToday();}
  else if(c.stops){renderSide(c);}
  else{render();}
}
function planRow(p,cityName,showCity){
  const linked=(overrides.expenses||[]).find(e=>e.pid===p.id);
  const expTag=linked?(linked.planned===false?'✓ actual on Expenses':'planned est. on Expenses'):'on Expenses tab';
  const jpyLine=p.jpy?`<span class="pl-jpy">${CUR.sym}${Number(p.jpy).toLocaleString()}${p.card?' · '+esc(p.card):''} · ${expTag}</span>`:'';
  return `<div class="pl-row ${p.done?'done':''}">
    <input type="checkbox" ${p.done?'checked':''} onchange="togglePlanDone('${p.id}',this.checked)" title="Done">
    <span class="pl-time">${p.t||'—'}</span>
    <span class="pl-ic">${PLAN_ICO[p.cat]||'📍'}</span>
    <span class="pl-main"><a href="${esc(planMapUrl(p,cityName))}" target="_blank">${esc(p.name)}</a>${showCity?` <span style="font:9px var(--mono);color:var(--plum)">${cityName}</span>`:''}${jpyLine}</span>
    <button class="plx" onclick="editPlan('${p.id}')" title="Edit" style="color:var(--indigo)">✎</button>
    <button class="plx" onclick="delPlan('${p.id}')" title="Remove" style="color:var(--clay);font-size:17px">×</button>
  </div>`;
}
function renderPlansCard(c){
  const plans=(overrides.plans||[]).filter(p=>p.city===c.id);
  const byDate={};plans.forEach(p=>{(byDate[p.d]=byDate[p.d]||[]).push(p);});
  const defDate=cityDefaultDate(c);
  const listHTML=Object.keys(byDate).sort((a,b)=>+a.split('/')[1]-+b.split('/')[1]).map(d=>
    `<div class="pl-day">${d}</div>`+
    byDate[d].sort((a,b)=>(a.t||'99:99').localeCompare(b.t||'99:99')).map(p=>planRow(p,c.city,false)).join('')
  ).join('')||'<div style="padding:10px 12px;font-size:11.5px;color:var(--grey)">Nothing planned yet — add your first stop above.</div>';
  return `<div class="card"><div class="chead"><span>Day plans · ${c.city}</span><span>${plans.length} item${plans.length===1?'':'s'}</span></div>
    <div class="plform" id="plform">
      <div class="plrow1">
        <select id="pl_date">${tripDates().map(d=>`<option ${d===defDate?'selected':''}>${d}</option>`).join('')}</select>
        <input id="pl_time" type="time" title="Approx. time">
        <select id="pl_cat">${Object.entries(PLAN_CATS).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select>
      </div>
      <input id="pl_name" placeholder="Place / activity name" maxlength="80">
      <input id="pl_url" placeholder="Google Maps link (optional — auto-generated from name if blank)">
      <div class="plrow1">
        <input id="pl_jpy" type="number" min="0" placeholder="${CUR.sym} cost (optional)">
        <select id="pl_card"><option value="">Card?</option>${EXP_CARDS.map(cd=>`<option>${cd}</option>`).join('')}</select>
        <button class="pladd" id="pl_btn" type="button" onclick="savePlan('${c.id}')">+ Add</button>
      </div>
      <div class="plhint">A ${CUR.sym} amount logs a PLANNED estimate on the Expenses tab — not counted in totals until you mark it actual there (after fixing the real amount). Clearing ${CUR.sym} removes it.</div>
    </div>
    ${listHTML}
  </div>`;
}
function syncPlanExpense(p){
  overrides.expenses=overrides.expenses||[];
  const i=overrides.expenses.findIndex(e=>e.pid===p.id);
  if(!p.jpy){ if(i>-1)overrides.expenses.splice(i,1); return; }
  const prev=i>-1?overrides.expenses[i]:null;
  if(prev && prev.planned===false){
    // Already confirmed actual — keep the recorded amount & payment state,
    // refresh only the identity fields from the plan item.
    Object.assign(prev,{date:'2026-'+p.d.replace('/','-'),cat:PLAN_CAT_TO_EXP[p.cat]||'Other',desc:p.name});
    return;
  }
  const _n=netUsd({jpy:p.jpy,fhr:p.fhr});
  const usdVal=_n===null?Number((Number(p.jpy)/(CUR.fallback||150)).toFixed(2)):Number(_n.toFixed(2));
  const card=p.card||'AMEX Platinum';
  const exp={pid:p.id,date:'2026-'+p.d.replace('/','-'),usd:usdVal.toFixed(2),cat:PLAN_CAT_TO_EXP[p.cat]||'Other',card,desc:p.name+(p.fhr?` (after $${p.fhr} FHR credit)`:''),planned:true,paidUsd:0,paid:false};
  if(i>-1)overrides.expenses[i]=exp;else overrides.expenses.push(exp);
}
window.savePlan=function(cid){
  const g=id=>document.getElementById(id);
  const name=g('pl_name').value.trim();
  if(!name){g('pl_name').focus();return;}
  overrides.plans=overrides.plans||[];
  let p;
  if(window._editPid){
    p=overrides.plans.find(x=>x.id===window._editPid);
    window._editPid=null;
    if(!p){p={id:'p'+Date.now()};overrides.plans.push(p);}
  }else{
    p={id:'p'+Date.now()};
    overrides.plans.push(p);
  }
  Object.assign(p,{city:cid,d:g('pl_date').value,t:g('pl_time').value,cat:g('pl_cat').value,name,
    url:g('pl_url').value.trim(),jpy:g('pl_jpy').value?Number(g('pl_jpy').value):'',card:g('pl_card').value,done:p.done||false});
  syncPlanExpense(p);
  saveOverrides();
  refreshPanel();
};
window.delPlan=function(id){
  if(!confirm('Remove this plan item? Its linked expense (if any) is removed too.'))return;
  overrides.plans=(overrides.plans||[]).filter(x=>x.id!==id);
  const i=(overrides.expenses||[]).findIndex(e=>e.pid===id);
  if(i>-1)overrides.expenses.splice(i,1);
  saveOverrides();
  refreshPanel();
};
window.togglePlanDone=function(id,v){
  const p=(overrides.plans||[]).find(x=>x.id===id);
  if(p){p.done=v;saveOverrides();refreshPanel();}
};
window.editPlan=function(id){
  const p=(overrides.plans||[]).find(x=>x.id===id);
  if(!p)return;
  if(!CITIES[ci].stops||CITIES[ci].id!==p.city){
    ci=CITIES.findIndex(c=>c.id===p.city);
    render();
  }
  window._editPid=id;
  const g=i=>document.getElementById(i);
  g('pl_date').value=p.d;g('pl_time').value=p.t||'';g('pl_cat').value=p.cat;
  g('pl_name').value=p.name;g('pl_url').value=p.url||'';g('pl_jpy').value=p.jpy||'';g('pl_card').value=p.card||'';
  g('pl_btn').textContent='✓ Update';
  g('pl_btn').style.background='var(--moss)';
  g('plform').scrollIntoView({behavior:'smooth',block:'center'});
};

/* Wide screens: move the reference cards (hotel, weather, getting around) into
   the left column under the map. Narrow screens leave the DOM exactly as built,
   so the mobile stack is unchanged. */
const LC_MQ=window.matchMedia('(min-width:841px)');
function placeLeftCards(){
  const left=document.getElementById('sideleft'),side=document.getElementById('side');
  if(!left||!side||!LC_MQ.matches)return;
  ['.js-lc-hotel','.js-lc-wx','.js-lc-metro'].forEach(sel=>{
    const el=side.querySelector(sel);
    if(el)left.appendChild(el);
  });
}
if(LC_MQ.addEventListener)LC_MQ.addEventListener('change',()=>render());

/* ---------------- ADD RESTAURANT (organizer tool) ---------------- */
/* Pulls lat/lng out of a pasted Google Maps URL: @lat,lng / !3d..!4d.. / q=lat,lng */
function parseLatLng(u){
  if(!u)return null;
  let m=u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/); if(m)return [+m[1],+m[2]];
  m=u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/); if(m)return [+m[1],+m[2]];
  m=u.match(/[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/); if(m)return [+m[1],+m[2]];
  m=u.match(/^\s*(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)\s*$/); if(m)return [+m[1],+m[2]];
  return null;
}
function nextStopId(){
  const ids=allCityStops().map(s=>Number(s.id)||0);
  return Math.max(100,...ids)+1;
}
function renderAddRestaurant(){
  const cities=CITIES.filter(c=>c.stops);
  const mine=(overrides.stops||[]);
  const F=(id,label,ph,type)=>`<label style="display:block;margin-bottom:9px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">${label}</span>
    <input id="${id}" type="${type||'text'}" placeholder="${ph||''}" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)"></label>`;
  panel.innerHTML=`<div class="stack" style="max-width:720px;margin:0 auto">
    <div class="card">
      <div class="chead"><span>🛠 ${window._editStopId?'Edit restaurant':'Add a restaurant'}</span><span>${mine.length} added here</span></div>
      <div style="padding:13px 15px">
        <div class="note" style="margin-bottom:11px">Everything you add here is saved with this trip and behaves exactly like a built-in stop — map pin, meal card, budget, Still-to-book and the Vault.</div>
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          <label style="flex:1 1 150px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">City</span>
            <select id="ar_city" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)">${cities.map(c=>`<option value="${c.id}">${c.city}</option>`).join('')}</select></label>
          <label style="flex:1 1 110px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">Day</span>
            <select id="ar_day" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)">${tripDates().map(d=>`<option>${d}</option>`).join('')}</select></label>
          <label style="flex:1 1 110px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">Meal</span>
            <select id="ar_meal" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)"><option>Breakfast</option><option selected>Lunch</option><option>Dinner</option><option>Snack</option></select></label>
        </div>
        <div style="height:9px"></div>
        ${F('ar_name','Name','e.g. Tousuiro Gion')}
        ${F('ar_q','Local-language name (for the map link)','豆水楼 祇園店 — optional but makes Maps resolve')}
        ${F('ar_dish','Dish / what it is','Yudōfu & tofu kaiseki')}
        ${F('ar_hrs','Hours','11:30–14:00 · 17:00–21:00 daily')}
        ${F('ar_area','Area / address line','Bishamonchō, Higashiyama-ku · Gion')}
        ${F('ar_url','Google Maps link','paste the URL — the pin is read from it')}
        <div style="display:flex;gap:9px;flex-wrap:wrap">
          <label style="flex:1 1 120px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">Booking</span>
            <select id="ar_res" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)"><option value="book">To book</option><option value="ok">Booked</option><option value="walk">Walk-in</option></select></label>
          <label style="flex:1 1 120px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">Payment</span>
            <select id="ar_pay" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)"><option value="">—</option><option value="cash">Cash only</option><option value="card">Cards OK</option></select></label>
          <label style="flex:1 1 120px"><span style="display:block;font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey);margin-bottom:3px">Budget (${CUR.sym}, for two)</span>
            <input id="ar_jpy" type="number" min="0" placeholder="12000" style="width:100%;font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:7px 9px;background:var(--card,#fff)"></label>
        </div>
        <div style="height:2px"></div>
        ${F('ar_note','Note (blue box on the card)','')}
        ${F('ar_warn','Warning (red box — booking deadlines, closures)','')}
        <div style="display:flex;gap:9px;align-items:center;margin-top:11px">
          <button class="pladd" type="button" id="ar_btn" onclick="saveRestaurant()" style="padding:9px 16px;${window._editStopId?'background:var(--moss)':''}">${window._editStopId?'✓ Save changes':'+ Add restaurant'}</button>
          ${window._editStopId?`<button type="button" onclick="window._editStopId=null;renderAddRestaurant()" style="background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);padding:8px 12px;cursor:pointer;color:var(--grey)">Cancel</button>`:''}
          <span id="ar_msg" style="font:10px var(--mono);color:var(--grey)"></span>
        </div>
      </div>
    </div>
    <div class="card"><div class="chead"><span>All restaurants on this trip</span><span>✎ edit · × remove</span></div>
      ${CITIES.filter(c=>c.stops).map(c=>{
        const rows=stopsFor(c);
        if(!rows.length)return '';
        return `<div class="pl-day">${esc(c.city)}</div>`+rows.map(x=>{
          const e=eff(x), isCustom=(overrides.stops||[]).some(o=>o.id===x.id);
          const edited=!isCustom&&overrides[x.id]&&Object.keys(overrides[x.id]).length;
          return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(e.name)}</span>${isCustom?'<span class="tdo-cat">added in-app</span>':(edited?'<span class="tdo-cat">edited</span>':'')}<span class="tdo-desc">${esc(e.d)} · ${esc(e.m)} · ${esc(e.dish||'')}</span></span>
            <button class="tdo-x" onclick="editStopForm(${x.id})" style="color:var(--indigo)">✎</button>
            <button class="tdo-x" onclick="removeStop(${x.id})" style="color:var(--clay);font-size:17px">×</button></div>`;
        }).join('');
      }).join('')}
    </div>
    ${(overrides.removedStops||[]).length?`<div class="card"><div class="chead"><span>Removed built-ins</span><span>restorable</span></div>
      ${(overrides.removedStops||[]).map(id=>{const f=findStop.builtinName?null:null;
        let nm='#'+id;
        for(const c of CITIES.filter(c=>c.stops)){const st=c.stops.find(x=>x.id===id);if(st){nm=st.name+' · '+c.city;break;}}
        return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t" style="text-decoration:line-through;color:var(--grey)">${esc(nm)}</span></span>
          <button class="tdo-x" onclick="restoreStop(${id})" style="color:var(--moss);font-size:13px" title="Restore">↩︎</button></div>`;
      }).join('')}</div>`:''}
  </div>`;
}
window.editStopForm=function(id){
  const hit=findStop(id);
  if(!hit)return;
  window._editStopId=id;
  window._editStopCustom=hit.custom;
  renderAddRestaurant();
  const e=hit.custom?hit.rec:eff(hit.rec);
  const g=i=>document.getElementById(i), set=(i,val)=>{if(g(i))g(i).value=val??'';};
  set('ar_city',e.city);set('ar_day',e.d);set('ar_meal',e.m);set('ar_name',e.name);
  set('ar_q',e.q);set('ar_dish',e.dish);set('ar_hrs',e.hrs);set('ar_area',e.area);
  set('ar_url',e.url||(e.lat?e.lat+', '+e.lng:''));set('ar_res',e.res);set('ar_pay',e.pay||'');
  set('ar_jpy',e.jpy||'');set('ar_note',e.note);set('ar_warn',e.warn);
  if(!hit.custom&&g('ar_city'))g('ar_city').disabled=true;   // a built-in stays in its city
  g('ar_name').scrollIntoView({behavior:'smooth',block:'center'});
};
window.saveRestaurant=function(){
  const g=i=>document.getElementById(i), v=i=>(g(i)?g(i).value.trim():'');
  const msg=g('ar_msg');
  if(!v('ar_name')){msg.textContent='Name is required.';return;}
  const ll=parseLatLng(v('ar_url'));
  const fields={d:v('ar_day'),m:v('ar_meal'),name:v('ar_name'),dish:v('ar_dish')||'—',hrs:v('ar_hrs')||'—',
    area:v('ar_area')||'',res:v('ar_res'),jpy:Number(v('ar_jpy'))||0,
    q:v('ar_q'),pay:v('ar_pay'),note:v('ar_note'),warn:v('ar_warn'),url:v('ar_url')};
  if(ll){fields.lat=ll[0];fields.lng=ll[1];}
  const editing=window._editStopId;
  if(editing&&!window._editStopCustom){
    // Built-in: every field becomes a per-stop override in the synced data —
    // the trip file is never touched, and eff() merges these everywhere.
    overrides[editing]=Object.assign(overrides[editing]||{},fields);
  }else if(editing){
    const i=(overrides.stops||[]).findIndex(x=>x.id===editing);
    if(i>-1)overrides.stops[i]={...overrides.stops[i],...fields,city:v('ar_city')};
  }else{
    overrides.stops=overrides.stops||[];
    overrides.stops.push({id:nextStopId(),city:v('ar_city'),custom:true,...fields});
  }
  window._editStopId=null;window._editStopCustom=false;
  saveOverrides();
  renderAddRestaurant();
  const m2=document.getElementById('ar_msg');
  if(m2)m2.textContent=editing?'Saved ✓':(ll?'Added with a map pin ✓':'Added — no coordinates in that link, so no map pin.');
};
window.removeStop=function(id){
  const hit=findStop(id);
  if(!hit)return;
  if(hit.custom){
    if(!confirm('Remove "'+hit.rec.name+'"?'))return;
    overrides.stops=(overrides.stops||[]).filter(x=>x.id!==id);
  }else{
    if(!confirm('Remove "'+hit.rec.name+'" from the trip? It can be restored from the Removed list.'))return;
    overrides.removedStops=overrides.removedStops||[];
    if(!overrides.removedStops.includes(id))overrides.removedStops.push(id);
  }
  saveOverrides();renderAddRestaurant();
};
window.restoreStop=function(id){
  overrides.removedStops=(overrides.removedStops||[]).filter(x=>x!==id);
  saveOverrides();renderAddRestaurant();
};


/* ---------------- CRUISE (group trip) ---------------- */
function updateAvatar(){
  const b=document.getElementById('cruAvatar');
  if(!b)return;
  const on=!!(window._app&&window._app.uid&&tripSel);   // header avatar on any open trip
  b.style.display=on?'inline-flex':'none';
  if(on)b.textContent=(window._app.name||'?').slice(0,1);
}
window.cruProfile=function(){
  const old=document.getElementById('cruPop');
  if(old){old.remove();return;}
  const me=window._app||{};
  if(!me.uid)return;
  if(typeof exitEdit==='function'&&exitEdit())render(); // savebar (z1200) painted over the popup (z61); edit mode ends when profile opens
  const isMaster=me.uid==='admin';
  const u=appUsers().find(x=>x.uid===me.uid);
  const code=isMaster?CRUISE_MASTER:((u&&u.code)||'—');
  const lg=isMaster?((store.app&&store.app.adminLegal)||{}):{first:(u||{}).legalFirst,last:(u||{}).legalLast,dob:(u||{}).dob};
  const pop=document.createElement('div');
  pop.id='cruPop';
  const TRIP_TITLES=[['japan-2026','⛩ Japan · Nov 2026'],['korea-2027','🏯 Korea · May 2027'],['jeju-2027','🍊 Jeju · May 2027'],['cruise-2028','🚢 Star of the Seas · Jan 2028'],['hawaii-2028','🌺 Hawaii · Dec 2028'],['hawaii-2029','🏝 Hawaii · Mar 2029'],['orlando-universal','🎬 Orlando Universal · TBD'],['benefits','🧰 Benefits Assistant · tool']];
  const uAcc=(isMaster?null:(appUsers().find(x=>x.uid===me.uid)||{}).access)||{};
  /* Group-ness comes from the registry (cruise|group) — the same test 01-core,
     03 and 06 use. Since Stage A the landing card (incl. status) also lives in
     the registry under card:{}, so status vs group-ness can no longer drift
     across files. Off a group trip the organizer/member/guest ladder is
     meaningless, so everyone reads Participant. */
  const isGroupTrip=id=>{const td=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[id])||null;return !!(td&&(td.cruise||td.group));};
  const badge=(r,id)=>id==='benefits'?'<span class="pp-badge part">Access</span>'
    :r==='viewer'?'<span class="pp-badge">View-only</span>'
    :!isGroupTrip(id)?'<span class="pp-badge part">Participant</span>'
    :r==='organizer'?'<span class="pp-badge org">Organizer</span>'
    :r==='guest'?'<span class="pp-badge guest">Guest</span>'
    :'<span class="pp-badge member">Member</span>';
  const accRows=TRIP_TITLES.map(([id,label])=>{
    if(!isMaster&&me.role==='admin')return `<div class="pp-acc"><span>${label}</span><span class="pp-badge adm">${uAcc[id]?'Admin · participant':'Admin · full access'}</span></div>`;
    const r=isMaster?'organizer':(me.role==='designer'?'designer':uAcc[id]);
    if(!r)return `<div class="pp-acc"><span style="color:var(--grey)">${label}</span><span class="pp-badge none">No access</span></div>`;
    return `<div class="pp-acc"><span>${label}</span>${me.role==='designer'?`<span class="pp-badge ${uAcc[id]?'part':'dsgn'}">${uAcc[id]?'Participant · read-only':'Designer · read-only'}</span>`:badge(r,id)}</div>`;
  }).join('');
  pop.innerHTML=`<div class="cruPopBack" onclick="document.getElementById('cruPop').remove()"></div>
    <div class="cruPopCard pp-wide">
      <div class="pp-menu">
        <button type="button" class="on" onclick="ppTab(this,'pp_info')">👤 Info</button>
        <button type="button" onclick="ppTab(this,'pp_acc')">🔑 Access</button>
        <button type="button" onclick="ppTab(this,'pp_trav')">🎫 Travel</button>
      </div>
      <div class="pp-panes">
      <div id="pp_trav" style="display:none">
        <div style="font:600 9px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--grey);margin-bottom:9px">Memberships & cards — feeds the coming benefits assistant</div>
        ${(()=>{const t=travOf(me);
          const sel=(g,item,cur)=>`<div class="tv-row"><span>${item.n}</span><select id="tv_${g}_${item.id}">${item.tiers.map((tr,i)=>`<option ${((cur&&cur===tr)||(!cur&&i===0))?'selected':''}>${tr}</option>`).join('')}</select></div>`;
          return `<div class="tv-sec">✈ Airlines</div>${TRAV_CAT.air.map(a=>sel('a',a,(t.air||{})[a.id])).join('')}
          <div class="tv-sec">🏨 Hotels</div>${TRAV_CAT.hotel.map(h=>sel('h',h,(t.hotel||{})[h.id])).join('')}
          <div class="tv-sec">💳 Premium cards</div><div class="tv-cards">${TRAV_CAT.cards.map(cd=>`<label class="tv-card"><input type="checkbox" id="tv_c_${cd.id}" ${((t.cards||[]).includes(cd.id))?'checked':''}> ${cd.n}</label>`).join('')}</div>`;})()}
        <button class="pladd" type="button" onclick="saveTrav()" style="width:100%;padding:9px 0;margin-top:12px">Save travel profile</button>
      </div>
      <div id="pp_acc" style="display:none">
        <div style="font:600 9px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--grey);margin-bottom:9px">Where you can go — and as what</div>
        ${accRows}
        <div style="font-size:10px;color:var(--grey);margin-top:10px">Grants are set by the organizer in the Admin panel.</div>
      </div>
      <div id="pp_info">
      <div style="width:52px;height:52px;border-radius:50%;background:#0E7C86;color:#fff;font:700 22px var(--sans);display:flex;align-items:center;justify-content:center;margin:0 auto 12px">${esc((me.name||'?').slice(0,1))}</div>
      <label>Display name<input id="pf_name" value="${esc(me.name||'')}" maxlength="40"></label>
      <div style="display:flex;gap:8px">
        <label style="flex:1">Legal first (EN)<input id="pf_first" value="${esc(lg.first||'')}" maxlength="40" placeholder="as in passport"></label>
        <label style="flex:1">Legal last (EN)<input id="pf_last" value="${esc(lg.last||'')}" maxlength="40"></label>
      </div>
      <label>Date of birth<input id="pf_dob" type="date" value="${esc(lg.dob||'')}"></label>
      ${isMaster?`<label>Login code<div class="ro">${esc(code)}</div></label>`
        :`<label>Login code — make it yours<input id="pf_code" value="${esc(code)}" maxlength="12" autocomplete="off" style="letter-spacing:.18em;font-family:var(--mono);text-transform:uppercase"></label>
          <div id="pf_code_err" style="font:10px var(--mono);color:var(--clay);margin:-4px 0 6px"></div>`}
      <label>Role<div class="ro">${isMaster?'Super Admin':me.role==='admin'?'Admin':(me.role==='pending'?'Pending approval':'Member')}</div></label>
      <div style="display:flex;gap:8px;margin-top:4px">
        <button class="pladd" type="button" onclick="saveProfile()" style="flex:1;padding:8px 0">Save</button>
        <button type="button" onclick="document.getElementById('cruPop').remove();appSignOut()" style="flex:1;background:none;border:1px solid #C4D6E6;border-radius:2px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--grey);cursor:pointer">Sign out</button>
      </div>
      </div>
      </div>
    </div>`;
  document.body.appendChild(pop);
  const inp=document.getElementById('pf_name');
  if(inp){inp.focus();inp.select();}
};
/* Travel memberships catalog — ids are stable API for the future benefits
   assistant (lounge access by airport, elite perks per stay, card credits). */
const TRAV_CAT={
 air:[
  {id:'ua', n:'United MileagePlus', tiers:['No membership','Member','Silver','Gold','Platinum','1K']},
  {id:'dl', n:'Delta SkyMiles',     tiers:['No membership','Member','Silver','Gold','Platinum','Diamond']},
  {id:'aa', n:'American AAdvantage',tiers:['No membership','Member','Gold','Platinum','Platinum Pro','Executive Platinum']},
  {id:'ke', n:'Korean Air SKYPASS', tiers:['No membership','Member','Morning Calm','Morning Calm Premium','Million Miler']},
  {id:'oz', n:'Asiana Club',        tiers:['No membership','Member','Gold','Diamond','Diamond Plus','Platinum']},
  {id:'nh', n:'ANA Mileage Club',   tiers:['No membership','Member','Bronze','Platinum','Diamond']},
  {id:'jl', n:'JAL Mileage Bank',   tiers:['No membership','Member','Crystal','Sapphire','JGC Premier','Diamond']},
  {id:'ac', n:'Air Canada Aeroplan',tiers:['No membership','Member','25K','35K','50K','75K','Super Elite']}
 ],
 hotel:[
  {id:'bonvoy',n:'Marriott Bonvoy', tiers:['No membership','Member','Silver','Gold','Platinum','Titanium','Ambassador']},
  {id:'hilton',n:'Hilton Honors',   tiers:['No membership','Member','Silver','Gold','Diamond']},
  {id:'hyatt', n:'World of Hyatt',  tiers:['No membership','Member','Discoverist','Explorist','Globalist']},
  {id:'ihg',   n:'IHG One Rewards', tiers:['No membership','Club','Silver','Gold','Platinum','Diamond']}
 ],
 cards:[
  {id:'amexplat',n:'Amex Platinum'},
  {id:'amexbizplat',n:'Amex Business Platinum'},
  {id:'amexgold',n:'Amex Gold'},
  {id:'deltares',n:'Amex Delta Reserve'},
  {id:'bonvoybrill',n:'Amex Bonvoy Brilliant'},
  {id:'hiltonaspire',n:'Amex Hilton Aspire'},
  {id:'csr',n:'Chase Sapphire Reserve'},{id:'ritz',n:'Chase Ritz-Carlton'},
  {id:'unitedclub',n:'United Club Infinite'},
  {id:'unitedquest',n:'United Quest'},
  {id:'venturex',n:'Capital One Venture X'},
  {id:'aaexec',n:'Citi / AAdvantage Executive'},
  {id:'strataelite',n:'Citi Strata Elite'},
  {id:'boaelite',n:'BofA Premium Rewards Elite'},
  {id:'bilt',n:'Bilt Palladium'}
 ]
};
function travOf(me){
  if(me.uid==='admin')return (store.app&&store.app.adminTrav)||{};
  const u=appUsers().find(x=>x.uid===me.uid);
  return (u&&u.trav)||{};
}
window.saveTrav=function(){
  const me=window._app; if(!me||!me.uid)return;
  const t={air:{},hotel:{},cards:[]};
  TRAV_CAT.air.forEach(a=>{const e=document.getElementById('tv_a_'+a.id);if(e&&e.selectedIndex>0)t.air[a.id]=e.value;});
  TRAV_CAT.hotel.forEach(h=>{const e=document.getElementById('tv_h_'+h.id);if(e&&e.selectedIndex>0)t.hotel[h.id]=e.value;});
  TRAV_CAT.cards.forEach(cd=>{const e=document.getElementById('tv_c_'+cd.id);if(e&&e.checked)t.cards.push(cd.id);});
  if(me.uid==='admin'){APP().adminTrav=t;}
  else{const u=appUsers().find(x=>x.uid===me.uid);if(u)u.trav=t;}
  saveOverrides();
  flash('Travel memberships saved ✓','ok');
};
window.ppTab=function(btn,id){
  const card=btn.closest('.cruPopCard');
  card.querySelectorAll('.pp-menu button').forEach(b=>b.classList.toggle('on',b===btn));
  ['pp_info','pp_acc','pp_trav'].forEach(p=>{
    const el=card.querySelector('#'+p); if(el)el.style.display=p===id?'':'none';
  });
};
window.saveProfile=function(){
  const el=document.getElementById('pf_name');
  const v=el?el.value.trim():'';
  if(!v)return;
  if(window._app.uid!=='admin'&&!isKoreanName(v)){
    flash('한글 이름만 — display name must be a Korean name in Hangul','err');
    el&&el.focus();return;
  }
  const gf=i=>{const e=document.getElementById(i);return e?e.value.trim():'';};
  const first=gf('pf_first'), last=gf('pf_last'), dob=gf('pf_dob');
  const codeEl=document.getElementById('pf_code');
  if(codeEl){
    const nc=codeEl.value.trim().toUpperCase();
    const errEl=document.getElementById('pf_code_err');
    const taken=appUsers().some(u=>u.uid!==window._app.uid&&String(u.code).toUpperCase()===nc);
    if(!/^[A-Z0-9]{4,12}$/.test(nc)){if(errEl)errEl.textContent='Code: 4–12 letters/numbers.';codeEl.focus();return;}
    if(nc===CRUISE_MASTER||taken){if(errEl)errEl.textContent='That code is taken — pick another.';codeEl.focus();return;}
    const u=appUsers().find(x=>x.uid===window._app.uid);
    if(u)u.code=nc;
  }
  if(window._app.uid==='admin'){
    APP().adminName=v;
    APP().adminLegal={first,last,dob};
  }else{
    const u=appUsers().find(x=>x.uid===window._app.uid);
    if(u){u.name=v;u.legalFirst=first;u.legalLast=last;u.dob=dob;}
  }
  window._app.name=v;
  if(window._cru)window._cru.name=v;
  try{localStorage.setItem('jt_app',JSON.stringify(window._app));}catch(e){}
  saveOverrides();
  const pop=document.getElementById('cruPop');if(pop)pop.remove();
  updateAvatar();render();
};
function groupUsers(tripId){
  return appUsers().filter(u=>u.role!=='pending'&&u.access&&u.access[tripId])
    .map(u=>({...u,role:(u.access[tripId]==='organizer')?'admin':'participant'}));
}

/* ---------------- PERSON HOVER CARD (group trips) ----------------
   Group pages show bare names in a dozen places. uHov() wraps one in a
   hoverable span; a single delegated listener does the rest, so new call
   sites need no wiring.

   The role shown is the GLOBAL app role, read from the roster. It must not
   come from groupUsers(), which rewrites .role to admin|participant for its
   own per-trip purposes — a spread of that object would report the trip
   grant as if it were the app role. */
window.uPerson=function(uid){
  if(uid==='admin')return {uid:'admin',name:appAdminName(),
    legal:(store.app&&store.app.adminLegal)||{},role:'superadmin',
    trav:(store.app&&store.app.adminTrav)||{}};
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return null;
  return {uid:uid,name:u.name||'—',legal:{first:u.legalFirst,last:u.legalLast},
    role:u.role==='designer'?'designer':(u.role==='pending'?'pending':(u.role==='admin'?'admin':'member')),
    trav:u.trav||{}};
};
const U_ROLE={superadmin:['Super Admin','ub-sadm'],admin:['Admin','ub-adm'],
  designer:['Designer','ub-dsg'],member:['Member','ub-mem'],pending:['Pending','ub-pen']};
const U_FLAIR_SHORT={ua:'MileagePlus',dl:'SkyMiles',aa:'AAdvantage',ke:'SKYPASS',oz:'Asiana Club',nh:'ANA',
  bonvoy:'Bonvoy',hilton:'Hilton',hyatt:'Hyatt',ihg:'IHG'};
/* 2026 annual fees; only used to pick the single most expensive card to show. */
const U_CARD_AF={amexplat:['Amex Platinum',895],csr:['Sapphire Reserve',795],
  unitedclub:['United Club Infinite',695],deltares:['Delta Reserve',650],
  aaexec:['AAdvantage Executive',595],venturex:['Venture X',395],amexgold:['Amex Gold',325]};
function uFlair(trav){
  const chips=[];
  /* One chip per category, the single best. 'Notable' floor: tier index >= 3
     in the program's own ladder (Bonvoy Gold, Hilton Gold, Hyatt Explorist,
     UA Gold, AA Platinum, SKYPASS Morning Calm Premium ... and up); Silvers
     and base Members are not a flex. Across programs the winner is the
     highest NORMALIZED position — Hyatt Globalist (top of 4) outranks Bonvoy
     Platinum (4 of 6) even though the raw index is lower. */
  const best=(cat,sel)=>{let hit=null;
    (TRAV_CAT[cat]||[]).forEach(p=>{const tier=(sel||{})[p.id];if(!tier)return;
      const i=p.tiers.indexOf(tier);if(i<3)return;
      const score=i/(p.tiers.length-1);
      if(!hit||score>hit.score||(score===hit.score&&i>hit.i))hit={score,i,txt:(U_FLAIR_SHORT[p.id]||p.n)+' '+tier};});
    return hit&&hit.txt;};
  const h=best('hotel',trav.hotel); if(h)chips.push(['🏨',h,'uf-h']);
  const a=best('air',trav.air);     if(a)chips.push(['✈',a,'uf-a']);
  let card=null;(trav.cards||[]).forEach(id=>{const c=U_CARD_AF[id];if(c&&(!card||c[1]>card[1]))card=c;});
  if(card)chips.push(['💳',card[0],'uf-c']);
  return chips.length?`<div class="uc-flair">${chips.map(([ic,t,cls])=>`<span class="uc-chip ${cls}">${ic} ${esc(t)}</span>`).join('')}</div>`:'';
}
window.uHov=function(uid,txt){
  if(!uid)return esc(txt);
  return `<span class="uhov" data-uid="${esc(uid)}" tabindex="0">${esc(txt)}</span>`;
};
function uCardEl(){
  let c=document.getElementById('uCard');
  if(!c){c=document.createElement('div');c.id='uCard';document.body.appendChild(c);}
  return c;
}
function uCardShow(el){
  const p=uPerson(el.dataset.uid);
  const c=uCardEl();
  if(!p){c.style.display='none';return;}
  const [label,cls]=U_ROLE[p.role]||U_ROLE.member;
  const en=[p.legal&&p.legal.first,p.legal&&p.legal.last].filter(Boolean).join(' ');
  c.innerHTML=`<div class="uc-top">
      <span class="uc-ava">${esc((p.name||'?').slice(0,1))}</span>
      <span class="uc-id">
        <span class="uc-ko">${esc(p.name)}</span>
        <span class="uc-en">${en?esc(en):'<i>legal name not set</i>'}</span>
      </span>
    </div>
    <span class="uc-badge ${cls}">${label}</span>${uFlair(p.trav||{})}`;
  c.style.display='block';
  /* Measure after paint, then clamp into the viewport — the card is fixed, so
     a name near the right edge or the fold would otherwise render offscreen. */
  const r=el.getBoundingClientRect(), b=c.getBoundingClientRect(), G=10;
  let left=r.left, top=r.bottom+7;
  if(left+b.width>innerWidth-G) left=innerWidth-G-b.width;
  if(left<G) left=G;
  if(top+b.height>innerHeight-G) top=Math.max(G,r.top-b.height-7);
  c.style.left=left+'px';
  c.style.top=top+'px';
}
function uCardHide(){const c=document.getElementById('uCard');if(c)c.style.display='none';}
window.uCardHide=uCardHide;
document.addEventListener('mouseover',e=>{
  const el=e.target.closest&&e.target.closest('.uhov');
  if(el)uCardShow(el); else if(!(e.target.closest&&e.target.closest('#uCard')))uCardHide();
});
document.addEventListener('focusin',e=>{
  const el=e.target.closest&&e.target.closest('.uhov');
  if(el)uCardShow(el);
});
/* Touch has no hover: tap the name to toggle, tap anywhere else to dismiss. */
document.addEventListener('click',e=>{
  const el=e.target.closest&&e.target.closest('.uhov');
  const c=document.getElementById('uCard');
  if(el){e.stopPropagation();
    if(c&&c.style.display==='block'&&c.dataset.for===el.dataset.uid){uCardHide();return;}
    uCardShow(el);uCardEl().dataset.for=el.dataset.uid;return;}
  uCardHide();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')uCardHide();});
addEventListener('scroll',uCardHide,true);

function cruiseUsers(){ return groupUsers('cruise-2028'); }
function genCode(){
  const A='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let c='';for(let i=0;i<6;i++)c+=A[Math.floor(Math.random()*A.length)];
  return c;
}
window._editSched=null;
