/* MODULE js/03-identity-home.js — Trip cards, IAM admin page, labels, sessions, login/pending, profile & theme, openTrip
   Split from index.html with statement order preserved; load order matters. */
/* ---------------- TRIPS / LANDING ---------------- */
const wm=f=>`https://commons.wikimedia.org/wiki/Special:FilePath/${f}?width=900`;
const TRIPS=[
 {id:'japan-2026',country:'Japan',emoji:'⛩',title:'Japan, November 2026',dates:'15–27 November 2026',
  blurb:'Vancouver · Yokohama · Nara · Osaka · Kyoto · Nagoya · Tokyo',
  photo:wm('Kiyomizu-dera,_Kyoto,_November_2016_-02.jpg'),
  credit:'Kiyomizu-dera in autumn · Martin Falbisoner, CC BY-SA 4.0',status:'active'},
 {id:'korea-2027',country:'South Korea',emoji:'🏯',title:'Korea, May 2027',dates:'7–18 May 2027',
  blurb:'Planning starts later — Seoul and beyond',
  photo:wm('Gyeonghoeru_(Royal_Banquet_Hall)_at_Gyeongbokgung_Palace,_Seoul.jpg'),
  credit:'Gyeonghoeru, Gyeongbokgung · Wikimedia Commons',status:'wip',code:'THEO1218'},
 {id:'jeju-2027',country:'South Korea · Jeju',title:'Jeju, May 2027',dates:'10–14 May 2027 · group trip',emoji:'🍊',
  photo:wm('Seongsan_Ilchulbong_from_the_air.jpg'),credit:'Seongsan Ilchulbong · KOCIS, CC BY-SA 2.0',status:'group',theme:'ocean'},
 {id:'cruise-2028',country:'Caribbean',title:'Icon Class Cruise, January 2028',dates:'9–16 January 2028 · Star of the Seas',emoji:'🚢',
  photo:wm('Icon_of_the_Seas.jpg'),credit:'Icon of the Seas · Wikimedia Commons',status:'group',theme:'ocean'},
 {id:'hawaii-2028',country:'The 10th Anniversary',title:'Hawaii, December 2028',dates:'10–19 December 2028',emoji:'🌺',
  photo:wm('Coast_of_Kauai,_Hawaii.jpg'),credit:'Nā Pali coast, Kauaʻi · Paul Bica, CC BY 2.0',status:'wip'},
 {id:'hawaii-2029',country:'Spring Break',title:'Hawaii, March 2029',dates:'9–18 March 2029',emoji:'🏝',
  photo:wm('Waikiki_Beach_(2024)-L1004709.jpg'),credit:'Waikīkī & Diamond Head · Frank Schulenburg, CC BY-SA 4.0',status:'wip'}
];
let tripSel=null;                 // never restored from storage: every reload

window.openAdmin=function(){ window._onAdmin=true; renderAdminPage(); };
function renderAdminPage(){
  window._onAdmin=true;
  if(appRole()!=='admin'){renderHome();return;}
  document.body.classList.add('home');
  document.body.style.setProperty('--tripac','#22406B');
  const users=appUsers();
  const dests=TRIPS.filter(t=>TRIP_DATA[t.id]);
  const labels=(store.app&&store.app.tripLabels)||{};
  panel.innerHTML=`<div class="stack" style="max-width:860px;margin:0 auto">
    <div class="home-hero" style="position:relative">
      <div class="hk">IAM · access & labels</div>
      <h1>Admin</h1>
      <div style="position:absolute;top:0;right:0"><button type="button" onclick="renderHome()" style="background:none;border:1.5px solid var(--ink);border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;height:34px;display:inline-flex;align-items:center;padding:0 12px;cursor:pointer;color:var(--ink)">← Trips</button></div>
    </div>
    <div class="card"><div class="chead"><span>👥 People & access</span><span style="display:flex;gap:9px;align-items:center">${users.length} people · master ${CRUISE_MASTER}<button type="button" onclick="forceRefresh()" title="Pull the latest data now" style="font:600 9px var(--mono);letter-spacing:.06em;border:1px solid currentColor;background:none;color:inherit;border-radius:4px;padding:4px 9px;cursor:pointer">⟳ REFRESH</button></span></div>
      ${users.map(u=>{
        const acc=u.access||{};
        return `<div class="urow">
          <div class="urow-top">
            <span class="urow-id"><b>${esc(u.name)}</b><span class="urow-code">${esc(u.code)}</span>
              ${u.role==='pending'?'<span class="urow-badge">⏳ pending</span>':''}</span>
            <span class="urow-ops">
              ${u.role!=='pending'?`<button class="tdo-x" onclick="appViewAs('${u.uid}')" title="View the app as ${esc(u.name)}" style="font-size:13px">👁</button>`:''}
              ${u.role==='pending'?`<button class="tdo-x" onclick="appApprove('${u.uid}')" title="Approve" style="color:var(--moss);font:700 11px var(--mono)">✓ approve</button>`
                :`<select onchange="appSetRole('${u.uid}',this.value)" title="App role">
                    <option value="user" ${u.role!=='designer'?'selected':''}>Member</option>
                    <option value="designer" ${u.role==='designer'?'selected':''}>Designer</option>
                  </select>`}
              <button class="tdo-x" onclick="appRename('${u.uid}')" title="Rename" style="color:var(--indigo)">✎</button>
              <button class="tdo-x" onclick="appRegen('${u.uid}')" title="New code" style="color:var(--indigo);font-size:13px">↻</button>
              <button class="tdo-x" onclick="appDel('${u.uid}')" style="color:var(--clay);font-size:17px">×</button>
            </span>
          </div>
          ${u.role==='designer'?`<div style="margin-top:7px;font:10.5px var(--mono);color:var(--indigo2)">🎨 Designer — opens every destination for review; Expenses, Vault and all money tabs are hidden, and nothing they do saves.</div>`
          :u.role==='pending'?'':`<div class="ggrid">
            ${dests.map(d=>{
              const td=TRIP_DATA[d.id];
              const roled=td.cruise||td.group;
              return `<label class="gcell"><span class="gname">${d.emoji||''} ${esc(d.country)}</span>
                <select onchange="appGrant('${u.uid}','${d.id}',this.value)">
                  <option value="" ${!acc[d.id]?'selected':''}>No access</option>
                  ${roled?`<option value="guest" ${acc[d.id]==='guest'?'selected':''}>Guest</option>
                  <option value="organizer" ${acc[d.id]==='organizer'?'selected':''}>Organizer</option>`
                  :`<option value="yes" ${acc[d.id]?'selected':''}>Access</option>`}
                </select></label>`;
            }).join('')}
          </div>`}
        </div>`;
      }).join('')||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nobody yet — people appear here when they request access, or add one below.</div>'}
      <div class="plform" style="border-top:1px solid var(--rule)">
        <div class="plrow1">
          <input id="ad_name" placeholder="Add a person by name" maxlength="40">
          <button class="pladd" type="button" onclick="appAdd()" style="flex:0 0 auto;padding:8px 14px">+ Add & generate code</button>
        </div>
      </div>
    </div>
    <div class="card"><div class="chead"><span>🏷 Destination labels</span><span>shown on the landing cards</span></div>
      ${dests.map(d=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${d.emoji||''} ${esc(d.title)}</span></span>
        <select onchange="appLabel('${d.id}',this.value)" style="font:11px var(--mono);border:1px solid var(--rule);border-radius:2px;padding:3px 5px;background:var(--card,#fff)">
          ${Object.entries(TRIP_LABELS).map(([v,[t]])=>`<option value="${v}" ${tripLabelOf(TRIPS.find(x=>x.id===d.id))===v?'selected':''}>${t}</option>`).join('')}
        </select></div>`).join('')}
    </div>
  </div>`;
}
window.appSetRole=function(uid,val){
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  u.role=(val==='designer')?'designer':'user';
  saveOverrides();renderAdminPage();
  flash(u.name+(val==='designer'?' is now a Designer (read-only, no money tabs)':' is a Member')+' ✓','ok');
};
window.appApprove=function(uid){
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  u.role='user';u.access=u.access||{};
  saveOverrides();renderAdminPage();flash(u.name+' approved ✓','ok');
};
window.appGrant=function(uid,tripId,val){
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  u.access=u.access||{};
  if(val)u.access[tripId]=(val==='yes')?true:val; else delete u.access[tripId];
  saveOverrides();
};
window.appLabel=function(tripId,val){
  APP().tripLabels=APP().tripLabels||{};
  APP().tripLabels[tripId]=val;
  saveOverrides();
};
window.appAdd=function(){
  const el=document.getElementById('ad_name');
  const name=el?el.value.trim():'';
  if(!name){el&&el.focus();return;}
  APP().users=appUsers().concat([{uid:'u'+Date.now(),name,code:genCode(),role:'user',access:{}}]);
  saveOverrides();renderAdminPage();
};
window.appRename=function(uid){
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  const v=prompt('Name:',u.name);
  if(v===null||!v.trim())return;
  u.name=v.trim();saveOverrides();renderAdminPage();
};
window.appRegen=function(uid){
  const u=appUsers().find(x=>x.uid===uid);
  if(u&&confirm('Issue a new code for '+u.name+'? The old one stops working.')){u.code=genCode();saveOverrides();renderAdminPage();}
};
window.appDel=function(uid){
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  if(!confirm('Remove '+u.name+'? Their code stops working, and on the cruise they are pulled out of their cabin and their billing, travel plans and requests are deleted.'))return;
  APP().users=appUsers().filter(x=>x.uid!==uid);
  // cascade through the cruise slice
  store.trips=store.trips||{};
  const c=store.trips['cruise-2028'];
  if(c){
    (c.rooms||[]).forEach(r=>{ r.slots=(r.slots||[]).map(x=>x===uid?null:x); });
    if(c.charges)c.charges=c.charges.filter(x=>x.uid!==uid);
    if(c.reqs)c.reqs=c.reqs.filter(x=>x.uid!==uid);
    if(c.cexp)delete c.cexp[uid];
    if(c.logi)delete c.logi[uid];
    c.removedUids=[...new Set([...(c.removedUids||[]),uid])];
  }
  saveOverrides();renderAdminPage();
};
/* ---- About us ---- */
const AB_TEAM=[
 {n:'Wesley Cho',role:'Product Lead',img:'', // paste a photo link here when ready
  bio:'Planner-in-chief. Sets the vision, owns the itineraries, negotiates with reservation lines across three time zones, and field-tests every feature on real trips.'},
 {n:'Jayden We',role:'UI/UX Designer',img:'', // paste a photo link here when ready
  bio:'Shaped the design language the app speaks today — the dashboard layout, the card system, the calendar, and the Lora + Inter typography.'},
 {n:'Fable 5 (Claude)',role:'Developer',img:'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2250%22%20fill%3D%22%23D97757%22/%3E%3Cg%20stroke%3D%22%23FAF6EE%22%20stroke-width%3D%227.5%22%20stroke-linecap%3D%22round%22%3E%3Cline%20x1%3D%2263.9%22%20y1%3D%2251.9%22%20x2%3D%2289.6%22%20y2%3D%2255.6%22/%3E%3Cline%20x1%3D%2261.0%22%20y1%3D%2258.6%22%20x2%3D%2276.8%22%20y2%3D%2270.9%22/%3E%3Cline%20x1%3D%2255.2%22%20y1%3D%2263.0%22%20x2%3D%2262.7%22%20y2%3D%2281.5%22/%3E%3Cline%20x1%3D%2248.1%22%20y1%3D%2263.9%22%20x2%3D%2244.4%22%20y2%3D%2289.6%22/%3E%3Cline%20x1%3D%2241.4%22%20y1%3D%2261.0%22%20x2%3D%2229.1%22%20y2%3D%2276.8%22/%3E%3Cline%20x1%3D%2237.0%22%20y1%3D%2255.2%22%20x2%3D%2218.5%22%20y2%3D%2262.7%22/%3E%3Cline%20x1%3D%2236.1%22%20y1%3D%2248.1%22%20x2%3D%2210.4%22%20y2%3D%2244.4%22/%3E%3Cline%20x1%3D%2239.0%22%20y1%3D%2241.4%22%20x2%3D%2223.2%22%20y2%3D%2229.1%22/%3E%3Cline%20x1%3D%2244.8%22%20y1%3D%2237.0%22%20x2%3D%2237.3%22%20y2%3D%2218.5%22/%3E%3Cline%20x1%3D%2251.9%22%20y1%3D%2236.1%22%20x2%3D%2255.6%22%20y2%3D%2210.4%22/%3E%3Cline%20x1%3D%2258.6%22%20y1%3D%2239.0%22%20x2%3D%2270.9%22%20y2%3D%2223.2%22/%3E%3Cline%20x1%3D%2263.0%22%20y1%3D%2244.8%22%20x2%3D%2281.5%22%20y2%3D%2237.3%22/%3E%3C/g%3E%3C/svg%3E',
  bio:'An AI assistant made by Anthropic. Built this app pair-programming with Wesley across late-night sessions: the trip engine, the group-travel and cruise modules, the access system, and a few hundred fixes shipped one screenshot at a time. Runs on curiosity and cache-busted deploys.'}
];
window.openAbout=function(){
  let ov=document.getElementById('aboutOv');
  if(ov){ov.style.display='flex';return;}
  ov=document.createElement('div');
  ov.id='aboutOv';
  ov.innerHTML=`<div class="ab-card">
    <button class="ab-x" onclick="closeAbout()" aria-label="Close">✕</button>
    <div class="ab-kick">Trip journal</div>
    <h2 class="ab-h">About us</h2>
    <p class="ab-sub">The small team behind the journal.</p>
    ${AB_TEAM.map(p=>`<div class="ab-row">
      ${p.img?`<img class="ab-ava" src="${esc(p.img)}" alt="" data-ini="${esc(p.n.split(' ').map(x=>x[0]).join('').slice(0,2))}" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'ab-ava ab-ini',textContent:this.dataset.ini}))">`
        :`<span class="ab-ava ab-ini">${esc(p.n.split(' ').map(x=>x[0]).join('').slice(0,2))}</span>`}
      <div class="ab-main">
        <div class="ab-name">${esc(p.n)}<span class="ab-role">${esc(p.role)}</span></div>
        <div class="ab-bio">${esc(p.bio)}</div>
      </div>
    </div>`).join('')}
    <div class="ab-note">Photos coming soon — image slots are ready in the team list.</div>
  </div>`;
  ov.addEventListener('click',e=>{if(e.target===ov)closeAbout();});
  document.body.appendChild(ov);
};
window.closeAbout=function(){const ov=document.getElementById('aboutOv');if(ov)ov.style.display='none';};
function renderHome(){
  window._onAdmin=false;
  document.body.classList.add('home');
  document.body.style.setProperty('--tripac','#22406B');
  panel.innerHTML=`
  <div class="home-hero" style="position:relative">
    <div style="position:absolute;top:0;right:0;display:flex;gap:8px;align-items:center">
      ${appRole()==='admin'?'<button type="button" onclick="openAdmin()" title="Access & labels" style="background:none;border:1.5px solid var(--ink);border-radius:2px;font:600 10px var(--mono);letter-spacing:.06em;text-transform:uppercase;height:34px;display:inline-flex;align-items:center;padding:0 12px;cursor:pointer;color:var(--ink)">⚙ Admin</button>':''}
      ${themeBtn()}
      <button type="button" onclick="cruProfile()" title="Your profile" style="width:34px;height:34px;border-radius:50%;background:#0E7C86;color:#fff;font:700 14px var(--sans);border:2px solid #fff;box-shadow:0 1px 5px rgba(11,37,69,.35);cursor:pointer">${esc(((window._app||{}).name||'?').slice(0,1))}</button>
    </div>
    <div class="hk">Trip journal</div>
    <h1>Where to?</h1>
    <p>Pick a trip to open its plans, meals, maps and expenses. Finished trips stay here as a record of where you have been.</p>
  </div>
  <div class="trips">
    ${TRIPS.map(t=>`
      <button class="trip ${t.theme==='ocean'?'ocean':''} ${t.status==='idea'||!canOpen(t.id)?'soon':''} ${tripArchived(t)?'soon':''}" type="button" ${t.status==='idea'?'disabled aria-disabled="true"':`onclick="openTrip('${t.id}')"`}>
        ${(()=>{const L=tripLabelOf(t);return `<span class="ribbon" style="background:${TRIP_LABELS[L][1]}">${TRIP_LABELS[L][0]}</span>`;})()}
        ${t.status!=='idea'&&canOpen(t.id)?'<span class="ribbon" style="top:34px;background:var(--moss)">✓ Access granted</span>':''}
        <div class="ph">
          <img src="${t.photo}" alt="${esc(t.country)}" loading="lazy"
               onerror="this.style.display='none'">
          <div class="cap">
            <div class="cn">${t.emoji?t.emoji+' ':''}${esc(t.country)}</div>
            <div class="ct">${esc(t.title)}</div>
            <div class="cd">${esc(t.dates)}</div>
          </div>
        </div>
        <div class="bar"><span title="${!canOpen(t.id)&&t.status!=='idea'?'Ask the organizer for access':''}">${t.status==='idea'?'Not planned yet':(!canOpen(t.id)?'🔒 No access':(tripArchived(t)?'Open · read-only →':'Open trip →'))}</span>
          <span class="credit">${esc(t.credit)}</span></div>
      </button>`).join('')}
  </div>
  <div class="home-foot">Photos via Wikimedia Commons under their stated licences.</div>
  <div class="home-foot" style="margin-top:6px"><a href="https://creativecommons.org/licenses/by-sa/2.0/" target="_blank" rel="noopener license"><img src="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20132%2031%22%20width%3D%22132%22%20height%3D%2231%22%3E%3Ccircle%20cx%3D%2215%22%20cy%3D%2215%22%20r%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%2314161B%22%20stroke-width%3D%222.4%22/%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2215%22%20r%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%2314161B%22%20stroke-width%3D%222.4%22/%3E%3Ccircle%20cx%3D%2279%22%20cy%3D%2215%22%20r%3D%2212%22%20fill%3D%22none%22%20stroke%3D%22%2314161B%22%20stroke-width%3D%222.4%22/%3E%3Ctext%20x%3D%2215%22%20y%3D%2219.5%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-size%3D%2211%22%20font-weight%3D%22700%22%20fill%3D%22%2314161B%22%3ECC%3C/text%3E%3Ccircle%20cx%3D%2247%22%20cy%3D%2210.5%22%20r%3D%223.1%22%20fill%3D%22%2314161B%22/%3E%3Cpath%20d%3D%22M40.5%2022.5%20a6.5%206.5%200%200%201%2013%200%20z%22%20fill%3D%22%2314161B%22/%3E%3Cpath%20d%3D%22M85.5%2012%20a7%207%200%201%200%201%206%22%20fill%3D%22none%22%20stroke%3D%22%2314161B%22%20stroke-width%3D%222.4%22/%3E%3Cpath%20d%3D%22M83%208%20l4.5%204.5%20-6%201.5%20z%22%20fill%3D%22%2314161B%22/%3E%3Ctext%20x%3D%2297%22%20y%3D%2213%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-size%3D%2210.5%22%20font-weight%3D%22700%22%20fill%3D%22%2314161B%22%3EBY-SA%3C/text%3E%3Ctext%20x%3D%2297%22%20y%3D%2225%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-size%3D%2210.5%22%20font-weight%3D%22700%22%20fill%3D%22%2314161B%22%3E2.0%3C/text%3E%3C/svg%3E" alt="CC BY-SA 2.0" width="132" height="31" style="opacity:.8"></a></div>
  <div class="home-foot"><a href="#" class="ab-link" onclick="openAbout();return false">About us →</a></div>`;
}
const TRIP_LABELS={live:['Live','var(--moss)'],wip:['Work in progress','#B0761F'],group:['Group travel','#0B2545'],soon:['Coming soon','var(--plum)'],done:['Trip completed','var(--grey)']};
function tripPastEnd(t){
  const d=t&&typeof TRIP_DATA!=='undefined'&&TRIP_DATA[t.id]&&TRIP_DATA[t.id].end;
  if(!d)return false;
  return Date.now()>Date.UTC(d[0],d[1],d[2])+86400000*2;
}
function tripLabelOf(t){
  const ov=(store.app&&store.app.tripLabels)||{};
  if(ov[t.id]&&TRIP_LABELS[ov[t.id]])return ov[t.id];   // the admin's word is final
  if(tripPastEnd(t))return 'done';                       // default only — override to reopen
  return t.status==='group'?'group':(t.status==='wip'?'wip':(t.status==='idea'?'soon':'live'));
}
/* A trip becomes read-only once its own end date has passed. Purely per trip:
   an archived trip never affects a live one. */
function tripArchived(t){
  return tripLabelOf(t)==='done';    // 'Trip completed' IS the edit lock now
}
function currentArchived(){
  const t=(typeof TRIPS!=='undefined')&&TRIPS.find(x=>x.id===tripKey());
  return t?tripArchived(t):false;
}
const CRUISE_MASTER='THEO1218';   // now the APP master code
window._cru=null;                  // cruise-scope session, derived from the app session
window._app=null;                  // app-wide session
try{const raw=localStorage.getItem('jt_app');if(raw)window._app=JSON.parse(raw);}catch(e){}
window.toggleTheme=function(){
  const dark=!document.body.classList.contains('dark');
  document.body.classList.toggle('dark',dark);
  try{localStorage.setItem('jt_theme',dark?'dark':'light');}catch(e){}
  document.querySelectorAll('.themebtn').forEach(b=>b.textContent=dark?'☀️':'🌙');
};
(function(){try{if(localStorage.getItem('jt_theme')==='dark')document.body.classList.add('dark');}catch(e){}})();
function themeBtn(){return `<button type="button" class="themebtn" onclick="toggleTheme()" title="Light / dark">${document.body.classList.contains('dark')?'☀️':'🌙'}</button>`;}
function APP(){ if(!store.app||typeof store.app!=='object')store.app={}; return store.app; }
function appUsers(){ return (store.app&&store.app.users)||[]; }
function appAdminName(){ return (store.app&&store.app.adminName)||'조상연'; }
function appRole(){ return window._app&&window._app.role; }
function cruRole(){return window._cru&&window._cru.role;}
function cruName(){return (window._cru&&window._cru.name)||'';}
function validateAppSession(){
  if(window._realApp){ // impersonating: refresh the viewed user's role from the roster, never the master's
    const u=appUsers().find(x=>x.uid===(window._app||{}).uid);
    if(u){window._app.name=u.name;window._app.role=(u.role==='pending')?'pending':(u.role==='designer'?'designer':'user');}
    else appViewExit();  // the viewed user was deleted mid-view
    return;
  }
  if(!window._app||!window._app.uid)return false;
  if(window._app.uid==='admin'){
    window._app.name=appAdminName();
    try{localStorage.setItem('jt_app',JSON.stringify(window._app));}catch(e){}
    return true;
  }
  const u=appUsers().find(x=>x.uid===window._app.uid);
  if(u){
    window._app.name=u.name;
    window._app.role=(u.role==='pending')?'pending':(u.role==='designer'?'designer':'user');
    try{localStorage.setItem('jt_app',JSON.stringify(window._app));}catch(e){}
    return true;
  }
  window._app=null;
  try{localStorage.removeItem('jt_app');}catch(e){}
  return false;
}
function canOpen(id){
  const sAp=window._app;
  if(!sAp||!sAp.uid)return false;
  if(sAp.role==='admin')return true;
  if(sAp.role==='designer')return !!TRIP_DATA[id];   // every destination — sensitive tabs are stripped elsewhere
  if(sAp.role!=='user')return false;
  const u=appUsers().find(x=>x.uid===sAp.uid);
  return !!(u&&u.access&&u.access[id]);
}
function appGroupSession(tripId){
  const sAp=window._app;
  if(!sAp||!sAp.uid)return null;
  if(sAp.role==='admin')return {uid:'admin',name:appAdminName(),role:'admin'};
  if(sAp.role==='designer')return {uid:sAp.uid,name:sAp.name,role:'participant'};   // guest view; writes are blocked at the save layer
  const u=appUsers().find(x=>x.uid===sAp.uid);
  const g=u&&u.access&&u.access[tripId];
  if(!g)return null;
  return {uid:u.uid,name:u.name,role:g==='organizer'?'admin':'participant'};
}
function appCruiseSession(){ return appGroupSession('cruise-2028'); }
window.appViewAs=function(uid){
  if(appRole()!=='admin'||window._realApp)return;
  const u=appUsers().find(x=>x.uid===uid);
  if(!u)return;
  window._realApp=window._app;
  window._app={role:(u.role==='pending')?'pending':(u.role==='designer'?'designer':'user'),name:u.name,uid:u.uid};
  window._cru=null;
  tripSel=null;
  viewAsBanner();
  if(window._app.role==='pending')renderPendingApp(); else renderHome();
};
window.appViewExit=function(){
  if(!window._realApp)return;
  window._app=window._realApp;
  window._realApp=null;
  window._cru=null;
  tripSel=null;
  const b=document.getElementById('viewAsBar');
  if(b)b.remove();
  document.body.style.paddingTop='';
  renderAdminPage();
};
function viewAsBanner(){
  let b=document.getElementById('viewAsBar');
  if(!b){
    b=document.createElement('div');
    b.id='viewAsBar';
    document.body.appendChild(b);
  }
  b.innerHTML=`<span>👁 Viewing as <b>${esc((window._app||{}).name||'')}</b> — read only, exactly what they see</span>
    <button type="button" onclick="appViewExit()">Exit ✕</button>`;
  document.body.style.paddingTop='40px';
}
window.appSignOut=function(){
  window._app=null;window._cru=null;tripSel=null;
  try{localStorage.removeItem('jt_app');localStorage.removeItem('jt_cru');}catch(e){}
  const pp=document.getElementById('cruPop');if(pp)pp.remove();
  document.body.classList.remove('cruise');
  if(typeof updateAvatar==='function')updateAvatar();
  renderLogin();
};
function renderLogin(){
  document.body.classList.add('home');
  document.body.style.setProperty('--tripac','#22406B');
  if(typeof updateAvatar==='function')updateAvatar();
  panel.innerHTML=`<div style="position:fixed;top:14px;right:16px;z-index:50">${themeBtn()}</div>
    <div class="stack" style="max-width:430px;margin:26px auto 0">
    <div class="home-hero" style="text-align:center;margin-bottom:14px">
      <div class="hk">Trip journal</div>
      <h1 style="margin-top:6px">Sign in</h1>
    </div>
    <div class="card">
      <div class="plform" style="padding:16px 15px 8px">
        <label style="font:600 9px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Your access code
          <input id="al_code" maxlength="12" autocomplete="off" style="margin-top:4px;letter-spacing:.2em;font-family:var(--mono);text-transform:uppercase" onkeydown="if(event.key==='Enter')doAppLogin()"></label>
        <button class="pladd" type="button" onclick="doAppLogin()" style="align-self:flex-start;padding:9px 18px">Sign in</button>
        <div id="al_err" style="font:10px var(--mono);color:var(--clay)"></div>
      </div>
      <div style="border-top:1px solid var(--rule);padding:13px 15px 15px">
        <div style="font:600 9px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey);margin-bottom:7px">No code yet? Request access</div>
        <div class="plform" style="padding:0">
          <input id="al_name" placeholder="이름 — Korean name in Hangul only" maxlength="15" onkeydown="if(event.key==='Enter')doAppRequest()">
          <button type="button" onclick="doAppRequest()" style="align-self:flex-start;background:none;border:1px solid var(--indigo2);color:var(--indigo2);border-radius:2px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;padding:8px 14px;cursor:pointer">Request access</button>
          <div class="plhint">Korean names only (한글) — your legal English name is collected separately in your profile for bookings. You get a login code immediately; the organizer grants access to each destination.</div>
        </div>
      </div>
    </div>
  </div>`;
  const i=document.getElementById('al_code'); if(i)i.focus();
}
function renderPendingApp(){
  document.body.classList.add('home');
  const me=window._app||{};
  const u=appUsers().find(x=>x.uid===me.uid);
  panel.innerHTML=`<div style="position:fixed;top:14px;right:16px;display:flex;gap:8px;align-items:center;z-index:50">
      ${themeBtn()}
      <button type="button" onclick="cruProfile()" title="Your profile" style="width:34px;height:34px;border-radius:50%;background:#0E7C86;color:#fff;font:700 14px var(--sans);border:2px solid #fff;box-shadow:0 1px 5px rgba(11,37,69,.35);cursor:pointer;padding:0">${esc((me.name||'?').slice(0,1))}</button>
    </div>
    <div class="stack" style="max-width:430px;margin:26px auto 0">
    <div class="card"><div class="chead"><span>⏳ Access pending</span></div>
      <div style="padding:16px 15px">
        <div style="font-size:14px;font-weight:600;margin-bottom:6px">${esc(me.name||'')}, your access request is being reviewed.</div>
        <div style="font-size:12.5px;color:var(--grey);margin-bottom:11px">Once approved, sign in again or tap Check status and the destinations you have been granted will open.</div>
        <div style="font:600 9px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Your login code — keep it</div>
        <div style="font:700 19px var(--mono);letter-spacing:.28em;color:var(--indigo);margin:4px 0 13px">${esc((u&&u.code)||'—')}</div>
        <div style="font-size:11.5px;color:var(--grey);margin-bottom:12px">While you wait: click your avatar (top right) and add your legal English name and date of birth — needed for bookings.</div>
        <div style="display:flex;gap:8px">
          <button class="pladd" type="button" onclick="checkAppStatus()" style="padding:8px 14px">Check status</button>
          <button type="button" onclick="appSignOut()" style="background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--grey);padding:7px 12px;cursor:pointer">Sign out</button>
        </div>
      </div></div>
  </div>`;
  if(typeof updateAvatar==='function')updateAvatar();
}
window.doAppLogin=function(){
  const el=document.getElementById('al_code'), err=document.getElementById('al_err');
  const code=String(el?el.value:'').trim().toUpperCase();
  if(!code){el&&el.focus();return;}
  if(code===CRUISE_MASTER){
    window._app={role:'admin',name:appAdminName(),uid:'admin'};
  }else{
    const u=appUsers().find(u=>String(u.code).toUpperCase()===code);
    if(!u){
      if(err)err.textContent=(!store._ts)
        ?'Still syncing — give it a second and try again.'
        :'Code not recognized — ask the organizer, or request access below.';
      return;
    }
    window._app={role:(u.role==='pending')?'pending':(u.role==='designer'?'designer':'user'),name:u.name,uid:u.uid};
  }
  try{localStorage.setItem('jt_app',JSON.stringify(window._app));}catch(e){}
  if(typeof updateAvatar==='function')updateAvatar();
  if(appRole()==='pending')renderPendingApp(); else renderHome();
};
function isKoreanName(v){
  // Hangul syllables only, 2-6 characters, optional single space (성 이름)
  return /^[가-힣]{2,6}( [가-힣]{1,6})?$/.test(String(v||'').trim());
}
window.doAppRequest=function(){
  const el=document.getElementById('al_name');
  const err=document.getElementById('al_err');
  const name=String(el?el.value:'').trim();
  if(!name){el&&el.focus();return;}
  if(!isKoreanName(name)){
    if(err)err.textContent='한글 이름만 가능합니다 — Korean name (Hangul) only, e.g. 조상연.';
    el&&el.focus();return;
  }
  const rec={uid:'u'+Date.now(),name,code:genCode(),role:'pending',ts:Date.now(),access:{}};
  APP().users=appUsers().concat([rec]);
  window._app={role:'pending',name,uid:rec.uid};
  try{localStorage.setItem('jt_app',JSON.stringify(window._app));}catch(e){}
  saveOverrides();
  if(typeof updateAvatar==='function')updateAvatar();
  renderPendingApp();
};
window.checkAppStatus=async function(){
  try{ const v=await sGet(); if(v){store=normalizeStore(JSON.parse(v));bindTrip();} }catch(e){}
  validateAppSession();
  if(typeof updateAvatar==='function')updateAvatar();
  if(!window._app)renderLogin();
  else if(appRole()==='pending')renderPendingApp();
  else{renderHome();flash('You are in ✓','ok');}
};
window.cruSignOut=function(){ appSignOut(); };
window.openTrip=function(id){
  if(!canOpen(id)){flash('No access to this trip — ask the organizer','err');return;}
  const td=TRIP_DATA[id];
  if(td&&(td.cruise||td.group)){
    window._cru=appGroupSession(id);
    if(!window._cru){flash('No access to this group trip — ask the organizer','err');return;}
  }
  tripSel=id;
  applyTripData(id);
  bindTrip();
  updateAvatar();
  buildNav();
  document.body.classList.remove('home');
  render();
};
window.backToTrips=function(){ tripSel=null; document.body.classList.remove('cruise'); const pp=document.getElementById('cruPop'); if(pp)pp.remove(); if(typeof updateAvatar==='function')updateAvatar(); renderHome(); };

