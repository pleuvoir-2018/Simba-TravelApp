/* MODULE js/01-core.js — Storage, cloud sync, role-aware merges (app + cruise), save pipeline, shared helpers
   Split from index.html with statement order preserved; load order matters. */

/* ---------------- DATA ---------------- */
const NRT={n:"Narita Airport (NRT)",lat:35.7719,lng:140.3929};

const CAT={sight:"⛩ Sights",cafe:"☕ Cafés",shop:"🛍 Shopping", gift:"🎁 Omiyage", conv:"🏪 Konbini"};




/* ---------------- STORAGE ---------------- */
const KEY='japan_trip_v2';
let store={},overrides={},mem=null;

/* ---- STEP 1: per-trip storage namespaces --------------------------------
   The blob becomes { _ts, trips: { <tripId>: {...} } } and `overrides` is a
   LIVE REFERENCE into store.trips[current], so every existing overrides.*
   call site keeps working untouched. Nothing else changes in this commit.
   tripKey() is defensive because `tripSel` is declared further down the
   file; a temporal-dead-zone read must not take the app down. */
function tripKey(){ try{ return tripSel||'japan-2026'; }catch(e){ return 'japan-2026'; } }
function normalizeStore(o){
  if(!o||typeof o!=='object')return {trips:{}};
  if(o.trips&&typeof o.trips==='object')return o;
  const legacy={};                       // pre-namespacing blob: all of it is Japan
  Object.keys(o).forEach(k=>{ if(k!=='trips'&&k!=='_ts')legacy[k]=o[k]; });
  return {_ts:o._ts,trips:{'japan-2026':legacy}};
}
function bindTrip(){
  if(!store||typeof store!=='object')store={};
  store.trips=store.trips||{};
  const k=tripKey();
  store.trips[k]=store.trips[k]||{};
  overrides=store.trips[k];
}
async function sGet(){
  // Read BOTH copies and keep whichever was written last (_ts). Taking the
  // cloud copy unconditionally would discard a local edit whose upload never
  // finished — e.g. the tab closed inside the save debounce.
  let cloud=null, local=null;
  try {
    const res = await fetch('/api/sync?t='+Date.now(), {cache:'no-store'});
    if (res.ok) { const data = await res.json(); if (data && data.value) cloud = data.value; }
  } catch(e) { console.error('Cloud load failed, falling back to local'); }
  try { const raw = localStorage.getItem(KEY); if (raw) local = JSON.parse(raw); } catch(e){}

  const ct = cloud ? Number(cloud._ts||0) : -1;
  const lt = local ? Number(local._ts||0) : -1;

  if (local && lt > ct) {
    // Local is ahead — adopt it and push it up once the app has settled.
    setTimeout(()=>{ try{ flushSave(); }catch(e){} }, 2000);
    return JSON.stringify(local);
  }
  if (cloud) return JSON.stringify(cloud);
  if (local) return JSON.stringify(local);
  return mem;
}

async function sSet(v){
  // 1. Try to save to Edge Config Cloud
  try {
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: v
    });
    if (res.ok) return 'cloud';
  } catch(e) { console.error('Cloud save failed, falling back to local'); }
  
  // 2. Fallback to local storage if offline
  try{localStorage.setItem(KEY,v);return'browser';}catch(e){}
  mem=v;return'memory';
}

async function sDel(){
  try {
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}) // Overwrites with empty object
    });
  } catch(e){}
  try{localStorage.removeItem(KEY);}catch(e){}
  mem=null;
}

window.saveLoc=function(loc){
  try{ if(!loc)localStorage.removeItem('jt_loc'); else localStorage.setItem('jt_loc',JSON.stringify(loc)); }catch(e){}
};
window.loadLoc=function(){
  try{ const s=localStorage.getItem('jt_loc'); return s?JSON.parse(s):null; }catch(e){ return null; }
};
window._bootLoc=window.loadLoc();   // snapshot BEFORE any render can touch storage
function mergeTodos(rt,lt){
  if(!rt.todos&&!lt.todos)return {};
  const gone=[...new Set([...(rt.todoGone||[]),...(lt.todoGone||[])])];
  const by={};
  (rt.todos||[]).forEach(t=>{if(t&&t.id)by[t.id]=t;});
  (lt.todos||[]).forEach(t=>{if(t&&t.id)by[t.id]=t;});     // local wins per id (your checkbox intent)
  const todos=Object.values(by).filter(t=>!gone.includes(t.id));
  const out={todos};
  if(gone.length)out.todoGone=gone;
  if(lt.todoSeed!==undefined||rt.todoSeed!==undefined)out.todoSeed=(lt.todoSeed!==undefined?lt.todoSeed:rt.todoSeed);
  return out;
}
function mergeApp(rA,lA){
  const sAp=window._app||{}; const me=sAp.uid||null;
  /* Admin lanes must key off the REMOTE roster, not the session. A roster
     admin who was just demoted still carries session role 'admin' at merge
     time (validateAppSession runs after the store is replaced), and letting
     that stale session win the users lane would push their local roster —
     where they are still admin — back over the demotion. The master keys on
     uid: they have no roster row and can never be demoted remotely. */
  const admin=me==='admin'||((rA&&rA.users)||[]).some(u=>u.uid===me&&u.role==='admin');
  const out={...rA,...lA};
  ['adminName','adminLegal','tripLabels','estimator'].forEach(k=>{
    const v=admin?(lA[k]!==undefined?lA[k]:rA[k]):(rA[k]!==undefined?rA[k]:lA[k]);
    if(v!==undefined)out[k]=v;
  });
  const R=rA.users, L=lA.users;
  if(admin){ if(L!==undefined||R!==undefined)out.users=L!==undefined?L:R; }
  else if(R!==undefined||L!==undefined){
    const meLocal=(L||[]).find(u=>u.uid===me);
    let list=(R||[]).map(u=>(u.uid===me&&meLocal)
      ?{...u,name:meLocal.name??u.name,code:meLocal.code??u.code,legalFirst:meLocal.legalFirst??u.legalFirst,legalLast:meLocal.legalLast??u.legalLast,dob:meLocal.dob??u.dob,
        /* self-owned payloads: without these the member's own saves roll
           back at the next merge — trav had exactly that bug before the
           Card ROI tool needed the same lane. */
        trav:meLocal.trav??u.trav,cardTrack:meLocal.cardTrack??u.cardTrack}
      :u);
    // self-registration lands only ever as pending with NO grants
    if(meLocal&&!list.some(u=>u.uid===me))list=list.concat([{...meLocal,role:'pending',access:{}}]);
    out.users=list;
  }
  /* Tickets (bug reports / enhancement requests): append-mostly, no hard
     delete — Declined is the terminal state, which is what lets this lane
     stay tombstone-free. Union by id; per item the ADMIN's copy wins (status
     and note changes land), a non-admin's copy of an EXISTING item never
     wins (submissions are immutable after submit, so a stale save cannot
     roll an admin's triage back), and a non-admin may only append items
     they authored (by===me) — you cannot file a ticket in someone else's
     name via a crafted local blob. */
  {
    const R=rA.tickets, L=lA.tickets;
    if(R!==undefined||L!==undefined){
      const map=new Map((R||[]).map(t=>[t.id,t]));
      (L||[]).forEach(t=>{
        if(map.has(t.id)){ if(admin)map.set(t.id,t); }
        else if(admin||t.by===me)map.set(t.id,t);
      });
      out.tickets=[...map.values()];
    }
  }
  return out;
}
async function loadOverrides(){
  try{ const v=await sGet(); if(v)store=JSON.parse(v); }catch(e){ store={}; }
  store=normalizeStore(store);
  // one-time lift of cruise-scoped users into the app directory
  store.app=store.app||{};
  const cru=(store.trips&&store.trips['cruise-2028'])||{};
  if((!store.app.users||!store.app.users.length)&&cru.users&&cru.users.length){
    store.app.users=cru.users.map(u=>({uid:u.uid,name:u.name,code:u.code,
      role:u.role==='pending'?'pending':'user',
      legalFirst:u.legalFirst,legalLast:u.legalLast,dob:u.dob,
      access:u.role==='pending'?{}:{'cruise-2028':(u.role==='admin')?'organizer':'guest'}}));
    if(cru.adminName)store.app.adminName=cru.adminName;
    if(cru.adminLegal)store.app.adminLegal=cru.adminLegal;
  }
  Object.keys(store.trips||{}).forEach(k=>{ store.trips[k]._seen=Date.now(); });
  bindTrip();
  validateAppSession();
}

/* Saving is two-stage: the local copy is written synchronously so a refresh
   can never lose an edit, and the cloud round-trip (GET-merge then POST) is
   debounced so a burst of edits costs one trip instead of one each. */
let _saveTimer=null,_savePending=false,_saveInFlight=false;
function saveOverrides(){
  if(window._realApp){flash('Viewing as '+((window._app||{}).name||'…')+' — read only, nothing saves','err');return;}
  if(typeof appRole==='function'&&appRole()==='designer'){flash('Design review account — read only, nothing saves','err');return;}
  if(tripSel&&typeof currentArchived==='function'&&currentArchived()){flash('This trip is archived — read only');return;}
  if(tripSel&&typeof tripGrantOf==='function'&&tripGrantOf(tripSel)==='viewer'){flash('View-only access to this trip — nothing saves','err');return;}
  store.trips=store.trips||{};
  if(tripSel)store.trips[tripKey()]=overrides;
  store._ts=Date.now();
  try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}
  flash('Saving…');
  _savePending=true;
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(flushSave,450);
}
/* Role-aware merge for the shared cruise namespace, so eight people's saves
   interleave instead of clobbering:
   - cexp/logi are per-person maps: MY slice comes from local (so my deletes
     stick), everyone else's from remote (so their latest survives my save)
   - users/charges/sched/ann are organizer-owned: admin's local wins;
     participants always take remote
   - rooms: admin's local wins wholesale; for participants the room LIST is
     remote (admin adds/removes cabins) and each slot merges individually —
     my claim or release stands, anyone else's newer action comes from remote */
function mergeCruise(rt,lt,base){
  const me=(window._cru||{}).uid||null;
  const admin=((window._cru||{}).role==='admin')||((window._app||{}).role==='admin');  // the app master is a cruise organizer wherever they act from
  const out={...base};
  ['cexp','logi','uoexp'].forEach(key=>{
    const R=rt[key]||{}, L=lt[key]||{};
    const m={...L};
    Object.keys(R).forEach(uid=>{ if(uid!==me)m[uid]=R[uid]; });
    if(Object.keys(m).length)out[key]=m;
  });
  ['charges','sched','ann','quotes','qSeedSkip','headcount','uoflights','uofees','uohotel','uotodoDone'].forEach(key=>{
    const v=admin?(lt[key]!==undefined?lt[key]:rt[key]):(rt[key]!==undefined?rt[key]:lt[key]);
    if(v!==undefined)out[key]=v;
  });
  {  // change requests: each guest owns their own; admin's decisions win
    const R=rt.reqs, L=lt.reqs;
    if(admin){ if(L!==undefined||R!==undefined)out.reqs=L!==undefined?L:R; }
    else if(R!==undefined||L!==undefined){
      out.reqs=[...(R||[]).filter(r=>r.uid!==me),...(L||[]).filter(r=>r.uid===me)];
    }
  }
  if(admin){ if(lt.rooms!==undefined||rt.rooms!==undefined)out.rooms=lt.rooms!==undefined?lt.rooms:rt.rooms; }
  else{
    const R=rt.rooms, L=lt.rooms||[];
    if(R!==undefined){
      out.rooms=R.map(r=>{
        const l=L.find(x=>x.id===r.id);
        if(!l)return r;
        const n=Math.max((l.slots||[]).length,(r.slots||[]).length,2);
        const slots=Array.from({length:n},(_,i)=>{
          const lv=(l.slots||[])[i]??null, rv=(r.slots||[])[i]??null;
          if(lv===rv)return lv;
          if(lv===me||rv===me)return lv;   // my own claim or release stands
          return rv;                        // someone else's newer action
        });
        return {...l,...r,slots};   // remote (admin) wins on fields; slots merged above
      });
    }
  }
  // Collaborative owned lists (group trips): union by id. Admin's copy wins
  // per item where present (and remote-only items are appended, so an admin's
  // stale copy cannot drop a guest's new item); otherwise each item follows
  // its owner (.by) — mine local, everyone else's remote. Votes are a per-uid
  // map merged separately: my vote is mine, everyone else's comes from remote.
  ['options','pins','gexp','links','uosched'].forEach(key=>{
    const R=rt[key], L=lt[key];
    if(R===undefined&&L===undefined)return;
    const Ra=R||[], La=L||[];
    const ids=[...new Set([...Ra.map(x=>x.id),...La.map(x=>x.id)])];
    out[key]=ids.map(id=>{
      const r=Ra.find(x=>x.id===id), l=La.find(x=>x.id===id);
      let item;
      if(admin)item=l||r;
      else if(r&&l)item=((l.by===me)?l:r);
      else if(l)item=(l.by===me||admin)?l:null;   // my creation (or admin's) may be new
      else item=r;
      if(!item)return null;
      if(key==='options'){
        const votes={...(r&&r.votes||{}),...(l&&l.votes||{})};
        const mergedVotes={};
        Object.keys(votes).forEach(uid=>{
          const lv=(l&&l.votes||{})[uid], rv=(r&&r.votes||{})[uid];
          const v=(uid===me)?lv:(rv!==undefined?rv:lv);
          if(v)mergedVotes[uid]=1;
        });
        item={...item,votes:mergedVotes};
      }
      return item;
    }).filter(Boolean);
    // Deletions. A non-admin's removal of THEIR OWN item sticks (it is absent
    // from their local list). An admin's removal of anything sticks unless the
    // item is remote-only (i.e. created after the admin last synced) — those
    // survive, which is exactly the stale-copy protection we want.
    out[key]=out[key].filter(x=>{
      const inL=La.some(y=>y.id===x.id), inR=Ra.some(y=>y.id===x.id);
      if(!admin)return (x.by===me)?inL:true;
      if(L===undefined)return true;          // admin never loaded this list — keep remote
      if(inL)return true;                    // in the admin's copy — keep
      // Absent from the admin's copy: deleted by admin, UNLESS it was created
      // after the admin's last sync (remote-only + newer timestamp) — keep those.
      return inR&&Number(x.ts||0)>Number(lt._seen||0);
    });
  });
  // Tombstones: a removed person stays removed on every device, no matter
  // whose stale copy merges later. Union the lists, then scrub every store.
  const dead=new Set([...(rt.removedUids||[]),...(lt.removedUids||[])]);
  if(dead.size){
    out.removedUids=[...dead];
    if(out.charges)out.charges=out.charges.filter(c=>!dead.has(c.uid));
    if(out.reqs)out.reqs=out.reqs.filter(r=>!dead.has(r.uid));
    ['cexp','logi'].forEach(k=>{ if(out[k])dead.forEach(uid=>{ delete out[k][uid]; }); });
    if(out.rooms)out.rooms=out.rooms.map(r=>({...r,slots:(r.slots||[]).map(u=>dead.has(u)?null:u)}));
  }
  return out;
}
async function flushSave(){
  if(_saveInFlight)return;              // the trailing call below picks it up
  _saveInFlight=true;_savePending=false;
  let mode='memory';
  try{
    try{ const r=await fetch('/api/sync?t='+Date.now(),{cache:'no-store'}); const d=await r.json();
      if(d&&d.value){
        // Merge per trip id so a save in one trip can never touch another.
        const remote=normalizeStore(d.value);
        const trips={...(remote.trips||{})};
        Object.keys(store.trips||{}).forEach(k=>{
          const rt=trips[k]||{}, lt=(store.trips||{})[k]||{};
          let m={...rt,...lt,vault:{...(rt.vault||{}),...(lt.vault||{})},...mergeTodos(rt,lt)};
          if(TRIP_DATA[k]&&(TRIP_DATA[k].cruise||TRIP_DATA[k].group))m=mergeCruise(rt,lt,m);
          trips[k]=m;
        });
        Object.keys(trips).forEach(k=>{ trips[k]._seen=Date.now(); });
        const appOut=mergeApp((remote.app||{}),(store.app||{}));
        store={...store,trips,app:appOut};
        bindTrip();
      }
    }catch(e){}
    mode=await sSet(JSON.stringify(store));
  }finally{ _saveInFlight=false; }
  flash(mode==='cloud'?'Saved to cloud ✓':mode==='browser'?'Saved to this browser (offline) ✓':'Saved in memory only — will not persist',
        mode==='cloud'?'ok':'err');
  if(_savePending)flushSave();
}
// Last-ditch flush if the tab closes mid-debounce (local copy is already written).
window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&_savePending){clearTimeout(_saveTimer);flushSave();}});

window.forceRefresh=async function(){
  flash('Refreshing from cloud…');
  try{
    const onAdmin=!!window._onAdmin;
    await loadOverrides();                     // same _ts-winner logic as boot — a newer local edit still wins
    if(onAdmin&&typeof renderAdminPage==='function'&&typeof appRole==='function'&&appRole()==='admin'){
      renderAdminPage();                       // stay on the Admin page the button lives on
    }else{
      if(typeof buildNav==='function')try{buildNav();}catch(e){}
      render();
    }
    const n=(((store||{}).app||{}).users||[]).length;
    flash('Refreshed ✓ — '+n+' people on file','ok');
  }catch(e){ flash('Refresh failed — check your connection','err'); }
};
async function resetAll(){
  if(!confirm('Discard all edits and expenses for this trip?'))return;
  store.trips=store.trips||{};
  store.trips[tripKey()]={};
  bindTrip();
  await sDel();
  render();
  flash('Reset ✓');
}

function exportData(){
  const blob=new Blob([JSON.stringify(overrides,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`japan-trip-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

let _toastTimer=null;
function flash(m,kind){
  const s=document.getElementById('savemsg');
  if(s){ const t=s.dataset.base||s.textContent; s.dataset.base=t; s.textContent=m; clearTimeout(s._t); s._t=setTimeout(()=>s.textContent=t,1800); }
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=m;
  el.className='toast show'+(kind?' '+kind:'');
  clearTimeout(_toastTimer);
  // "Saving…" holds until the result replaces it; results fade on their own.
  if(kind)_toastTimer=setTimeout(()=>{el.className='toast';},1600);
}

function eff(s){return{...s,...(overrides[s.id]||{})};}
function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

