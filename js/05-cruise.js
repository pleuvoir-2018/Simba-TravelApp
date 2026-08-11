/* MODULE js/05-cruise.js — Cruise module: overview, ship, rooms/quotes/requests, expenses & invoices, logistics, Discord
   Split from index.html with statement order preserved; load order matters. */
function renderCruise(c){
  if(!window._cru||!window._cru.uid){window._cru=appCruiseSession();if(!window._cru){backToTrips();return;}}
  const T=TRIP_DATA[tripKey()]||{};
  const admin=cruRole()==='admin';
  let body='';
  if(c.cruiseTab==='csum'){
    const me=(window._cru||{}).uid;
    const users=cruiseUsers();
    const nameOf=uid=>uid==='admin'?appAdminName():((users.find(u=>u.uid===uid)||{}).name||'—');
    const money=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    const charges=(overrides.charges||[]), rooms=(overrides.rooms||[]), logi=overrides.logi||{}, reqs=overrides.reqs||[];
    const legalOf=uid=>uid==='admin'?((store.app&&store.app.adminLegal)||{}):{first:(users.find(u=>u.uid===uid)||{}).legalFirst,last:(users.find(u=>u.uid===uid)||{}).legalLast,dob:(users.find(u=>u.uid===uid)||{}).dob};
    const legalMissing=uid=>{const l=legalOf(uid);return !(l&&l.first&&l.last&&l.dob);};
    // --- my reminders ---
    const rem=[];
    const myCh=charges.filter(x=>x.uid===me);
    const owe=myCh.reduce((a,x)=>a+Math.max(0,Number(x.amt)-(Number(x.paid)||0)),0);
    const depDue=myCh.filter(x=>x.dep&&(Number(x.paid)||0)<Number(x.dep)-0.005).reduce((a,x)=>a+Number(x.dep),0);
    if(owe>0.005)rem.push({ic:'💳',t:`Payment due to ${nameOf('admin')}: ${money(owe)} outstanding${depDue>0.005?` — deposit ${money(depDue)} due first`:''}`,tab:'cexp'});
    if(!((logi[me])||[]).length)rem.push({ic:'✈️',t:'Add your travel plans so ground transport can be arranged',tab:'clog'});
    if(legalMissing(me))rem.push({ic:'🪪',t:'Add your legal English name and date of birth (needed for the booking) — click your avatar top right',tab:null});
    // --- organizer reminders ---
    let orgRem=[];
    if(admin){
      const billed=charges.reduce((a,x)=>a+Number(x.amt||0),0), coll=charges.reduce((a,x)=>a+Number(x.paid||0),0);
      if(billed-coll>0.005)orgRem.push({ic:'💰',t:`${money(billed-coll)} still to collect across the group`,tab:'cexp'});
      const noLogi=users.filter(u=>!((logi[u.uid])||[]).length);
      if(noLogi.length)orgRem.push({ic:'✈️',t:`No travel info yet: ${noLogi.map(u=>u.name).join(', ')}`,tab:'clog'});
      const noLegal=users.filter(u=>legalMissing(u.uid));
      if(noLegal.length)orgRem.push({ic:'🪪',t:`Missing legal name / DOB: ${noLegal.map(u=>u.name).join(', ')}`,tab:null});
      const pendAccess=appUsers().filter(u=>u.role==='pending');
      if(pendAccess.length&&appRole()==='admin')orgRem.push({ic:'⏳',t:`${pendAccess.length} access request${pendAccess.length>1?'s':''} waiting on the app Admin page: ${pendAccess.map(u=>u.name).join(', ')}`,tab:null});
      const pendReqs=reqs.filter(r=>r.status==='pending');
      if(pendReqs.length)orgRem.push({ic:'🔁',t:`${pendReqs.length} room request${pendReqs.length>1?'s':''} to decide`,tab:'rooms'});
    }
    const remRow=r=>`<div class="tdo-row" ${r.tab?`onclick="gotoCruiseTab('${r.tab}')" style="cursor:pointer"`:''}>
      <span style="flex:0 0 22px;text-align:center">${r.ic}</span>
      <span class="tdo-main"><span style="font-size:12.5px">${r.t}</span></span>${r.tab?'<span style="color:var(--indigo2);font-size:12px">→</span>':''}</div>`;
    const myRoom=rooms.find(r=>(r.slots||[]).includes(me));
    const cats2=T.cats||[];
    const myLegs=((logi[me])||[]).slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    body=`
      <div class="card"><div class="chead"><span>🔔 Reminders</span><span>${rem.length||'all clear'}</span></div>
        ${rem.map(remRow).join('')||'<div style="padding:12px;font-size:12.5px;color:var(--moss)">Nothing outstanding — you are all set ✓</div>'}
      </div>
      ${admin&&orgRem.length?`<div class="card"><div class="chead"><span>🛠 Organizer reminders</span><span>${orgRem.length}</span></div>${orgRem.map(remRow).join('')}</div>`:''}
      <div class="card"><div class="chead"><span>🛏 My cabin</span></div>
        ${myRoom?`<div style="padding:12px 13px;font-size:13px"><b>Room ${rooms.indexOf(myRoom)+1}</b>${myRoom.num?' · Cabin '+esc(myRoom.num):''} · ${esc((cats2.find(k=>k.id===myRoom.cat)||{}).n||myRoom.cat)}${myRoom.locked?' 🔒':''}
          <span style="display:block;font-size:11.5px;color:var(--grey);margin-top:3px">Sharing with: ${(myRoom.slots||[]).filter(u=>u&&u!==me).map(nameOf).join(', ')||'nobody yet'}</span></div>`
        :`<div class="tdo-row" onclick="gotoCruiseTab('rooms')" style="cursor:pointer"><span class="tdo-main"><span style="font-size:12.5px">You're not in a cabin yet — pick a slot or request a room</span></span><span style="color:var(--indigo2)">→</span></div>`}
      </div>
      <div class="card"><div class="chead"><span>✈️ My travel</span><span>${myLegs.length} leg${myLegs.length===1?'':'s'}</span></div>
        ${myLegs.map(x=>`<div class="tdo-row"><span class="tdo-date">${esc((x.date||'').slice(5))||'—'}</span><span class="tdo-main"><span style="font-size:12.5px">${x.dir==='arrive'?'→':'←'} ${esc(x.flt||'—')}${x.ap?' · '+esc(x.ap):''}${x.time?' · '+esc(x.time):''}</span></span></div>`).join('')||`<div class="tdo-row" onclick="gotoCruiseTab('clog')" style="cursor:pointer"><span class="tdo-main"><span style="font-size:12.5px">Nothing yet — add your flights</span></span><span style="color:var(--indigo2)">→</span></div>`}
      </div>
      ${admin?(()=>{
        // Guest list = whoever holds a cabin slot, in room order — the booking manifest. DOB stays organizer-only.
        const seated=[];
        rooms.forEach((r,ri)=>(r.slots||[]).forEach(u=>{ if(u&&!seated.some(x=>x.uid===u))seated.push({uid:u,room:ri+1}); }));
        const roleBadge=uid=>{
          const org=uid==='admin'||((users.find(x=>x.uid===uid)||{}).role==='admin');
          return `<span style="margin-left:8px;border:1px solid ${org?'var(--indigo2)':'var(--grey)'};color:${org?'var(--indigo2)':'var(--grey)'};border-radius:2px;font:600 8px var(--mono);letter-spacing:.08em;text-transform:uppercase;padding:1px 5px;vertical-align:1px">${org?'organizer':'guest'}</span>`;
        };
        const row=x=>{
          const l=legalOf(x.uid);
          return `<div class="tdo-row"><span style="flex:0 0 30px;font:600 9px var(--mono);color:var(--grey);text-align:center">R${x.room}</span>
            <span class="tdo-main"><span class="tdo-t">${esc(nameOf(x.uid))}</span>${roleBadge(x.uid)}
            <span class="tdo-desc" style="margin-left:10px">${l&&l.first?esc(l.first+' '+(l.last||'')):'<i>legal name not set</i>'} · ${l&&l.dob?esc(l.dob):'<i>DOB not set</i>'}</span></span></div>`;
        };
        const seatedIds=new Set(seated.map(x=>x.uid));
        const unseated=['admin',...users.map(u=>u.uid)].filter(uid=>!seatedIds.has(uid));
        return `<div class="card"><div class="chead"><span>🪪 Guest list</span><span>${seated.length} in cabins · legal details</span></div>
          ${seated.map(row).join('')||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nobody has taken a cabin slot yet.</div>'}
          ${admin&&unseated.length?`<div style="padding:9px 13px;font-size:11px;color:var(--grey);border-top:1px solid var(--rule)">Not in a cabin yet: ${unseated.map(uid=>esc(nameOf(uid))).join(', ')}</div>`:''}
        </div>`;
      })():''}`;
  }
  if(c.cruiseTab==='ship'){
    const SI=T.shipInfo||{facts:[],hoods:[],note:''};
    body=`
      <div class="card"><div class="chead"><span>🛳️ ${esc(T.ship||'The ship')}</span><span>Icon class</span></div>
        <dl style="margin:0;padding:6px 13px 11px">${SI.facts.map(f=>`<div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px dotted var(--rule)"><dt style="flex:0 0 118px;font:600 9px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--grey);padding-top:2px">${esc(f[0])}</dt><dd style="flex:1;margin:0;font-size:12.5px">${esc(f[1])}</dd></div>`).join('')}</dl>
      </div>
      <div class="card"><div class="chead"><span>The eight neighborhoods</span></div>
        ${SI.hoods.map(h=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(h[0])}</span><span class="tdo-desc">${esc(h[1])}</span></span></div>`).join('')}
        ${SI.note?`<div style="padding:9px 13px;font-size:11px;color:var(--grey);border-top:1px solid var(--rule)">${esc(SI.note)}</div>`:''}
      </div>`;
  }
  if(c.cruiseTab==='board'){
    const ann=(overrides.ann||[]).slice().sort((a,b)=>b.ts-a.ts);
    body=`<div class="card"><div class="chead"><span>📣 Announcements</span><span>${ann.length}</span></div>
      ${admin?`<div class="plform"><textarea id="an_txt" rows="3" placeholder="Post to everyone…" style="font:13px var(--sans);border:1px solid var(--rule);border-radius:2px;padding:8px 10px;resize:vertical"></textarea>
        <button class="pladd" type="button" onclick="postAnn()" style="align-self:flex-start;padding:8px 14px">Post</button></div>`:''}
      ${ann.map(a=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-desc" style="color:var(--grey)">${new Date(a.ts).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span style="display:block;font-size:13px;margin-top:2px">${esc(a.txt)}</span></span>
        ${admin?`<button class="tdo-x" onclick="delAnn('${a.id}')" style="color:var(--clay);font-size:17px">×</button>`:''}</div>`).join('')||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nothing posted yet.</div>'}
    </div>`;
  }
  if(c.cruiseTab==='sched'){
    const plans=(overrides.sched||[]);
    body=`<div class="card"><div class="chead"><span>🗺 The route</span><span>MCO · Port Canaveral · ports of call</span></div>
      <div id="crmap" style="height:330px"></div></div>`+
    (admin?`<div class="card"><div class="chead"><span>${window._editSched?'Edit plan':'Add to the schedule'}</span></div>
      <div class="plform">
        <div class="plrow1">
          <select id="sc_day">${(T.itinerary||[]).map(d=>`<option value="${d.day}">Day ${d.day} · ${d.port.split('—')[0].split(',')[0]}</option>`).join('')}</select>
          <input id="sc_t" type="time">
        </div>
        <input id="sc_txt" placeholder="What's happening — dinner at Izumi, AquaDome show, meet at Royal Promenade…" maxlength="120">
        <input id="sc_loc" placeholder="Where on the ship / ashore (optional)" maxlength="80">
        <div style="display:flex;gap:8px">
          <button class="pladd" type="button" onclick="saveSched()" style="padding:8px 14px;${window._editSched?'background:var(--moss)':''}">${window._editSched?'✓ Save':'+ Add'}</button>
          ${window._editSched?'<button type="button" onclick="window._editSched=null;render()" style="background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);padding:7px 11px;cursor:pointer;color:var(--grey)">Cancel</button>':''}
        </div>
      </div></div>`:'')+
    (T.itinerary||[]).map(d=>{
      const its=plans.filter(p=>+p.day===d.day).sort((a,b)=>(a.t||'99:99').localeCompare(b.t||'99:99'));
      return `<div class="card"><div class="chead"><span>Day ${d.day} · ${esc(d.date)}</span><span>${esc(d.hrs)}</span></div>
        <div style="padding:9px 12px;font-size:13px;font-weight:600;color:var(--indigo)">${esc(d.port)}</div>
        ${its.map(p=>`<div class="tdo-row"><span class="tdo-time" style="flex:0 0 44px;font:600 10px var(--mono);color:var(--grey)">${p.t||'—'}</span>
          <span class="tdo-main"><span style="font-size:13px">${esc(p.txt)}</span>${p.loc?`<span class="tdo-desc">${esc(p.loc)}</span>`:''}</span>
          ${admin?`<button class="tdo-x" onclick="editSched('${p.id}')" style="color:var(--indigo)">✎</button><button class="tdo-x" onclick="delSched('${p.id}')" style="color:var(--clay);font-size:17px">×</button>`:''}</div>`).join('')||'<div style="padding:6px 12px 10px;font-size:11.5px;color:var(--grey)">Free day so far.</div>'}
      </div>`;
    }).join('');
  }
  if(c.cruiseTab==='rooms'){
    const cats=T.cats||[], rooms=(overrides.rooms||[]);
    const users=cruiseUsers();
    const nameOf=uid=>uid==='admin'?appAdminName():((users.find(u=>u.uid===uid)||{}).name||'—');
    const me=(window._cru||{}).uid;
    const mine=rooms.find(r=>(r.slots||[]).includes(me));
    const placed=new Set(rooms.flatMap(r=>(r.slots||[]).filter(Boolean)));
    const unplaced=users.filter(u=>!placed.has(u.uid));
    // Quotes are a list now: same type can be offered at 2, 3 or 4 people.
    // Old object-form quotes ({cat:{q,img}}) migrate on the fly as 2-person entries.
    const quotesRaw=overrides.quotes;
    const quoteList=Array.isArray(quotesRaw)?quotesRaw
      :(quotesRaw&&typeof quotesRaw==='object'
        ?Object.entries(quotesRaw).filter(([k,v])=>v&&Number(v.q)>0).map(([k,v])=>({id:'mig_'+k,cat:k,ppl:2,q:Number(v.q),img:v.img||''}))
        :[]);
    const reqs=overrides.reqs||[];
    const money=n=>'$'+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0});
    const qFor=cat=>quoteList.filter(x=>x.cat===cat);
    const qMin=cat=>{const a=qFor(cat).map(x=>Number(x.q)).filter(n=>n>0);return a.length?Math.min(...a):0;};
    const quoteAdmin=`<div class="card"><div class="chead"><span>${window._editQuote?'💵 Edit quote':'💵 Quotes'}</span><span>${quoteList.length} on offer</span></div>
      <div class="plform">
        <div class="plrow1">
          <select id="qt_cat">${cats.map(k=>`<option value="${k.id}">${esc(k.n)}</option>`).join('')}</select>
          <select id="qt_ppl"><option value="2">2 people</option><option value="3">3 people</option><option value="4">4 people</option></select>
          <input id="qt_amt" type="number" min="0" step="0.01" placeholder="$ quote">
        </div>
        <input id="qt_img" placeholder="Image link (optional) — right-click a photo on Royal's site → Copy Image Address">
        <div style="display:flex;gap:8px">
          <button class="pladd" type="button" onclick="addQuote()" style="padding:8px 14px;${window._editQuote?'background:var(--moss)':''}">${window._editQuote?'✓ Save quote':'+ Add quote'}</button>
          ${window._editQuote?'<button type="button" onclick="window._editQuote=null;render()" style="background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);padding:7px 11px;cursor:pointer;color:var(--grey)">Cancel</button>':''}
        </div>
        <div class="plhint">Guests see each quote as its own card. Quote the same type at different occupancies freely.</div>
      </div>
      ${quoteList.map(q=>{const k=cats.find(x=>x.id===q.cat)||{n:q.cat};return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(k.n)}</span><span class="tdo-desc" style="margin-left:10px">${q.ppl} people · ${money(q.q)}${q.img?' · 🖼 image set':''}</span></span>
        <button class="tdo-x" onclick="editQuote('${q.id}')" title="Edit" style="color:var(--indigo)">✎</button>
        <button class="tdo-x" onclick="delQuote('${q.id}')" style="color:var(--clay);font-size:17px">×</button></div>`;}).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">Nothing quoted yet.</div>'}
    </div>`;
    const pend=reqs.filter(r=>r.status==='pending');
    const reqAdmin=`<div class="card"><div class="chead"><span>🔁 Room-type change requests</span><span>${pend.length} pending</span></div>
      ${reqs.slice().sort((a,b)=>b.ts-a.ts).slice(0,10).map(r=>{
        const room=rooms.find(x=>x.id===r.rid); const ri=room?rooms.indexOf(room)+1:'?';
        const fromN=(cats.find(k=>k.id===r.from)||{}).n||r.from, toN=(cats.find(k=>k.id===r.to)||{}).n||r.to;
        return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(nameOf(r.uid))}${r.kind==='new'?'':' · Room '+ri}</span>
          <span class="tdo-desc">${r.kind==='new'?`<b>NEW ROOM</b> · ${esc(toN)} · sleeps ${r.ppl||2}`:`${esc(fromN)} → <b>${esc(toN)}</b>`}${r.note?' · '+esc(r.note):''} · ${r.status}</span></span>
          ${r.status==='pending'?`<button class="tdo-x" onclick="decideReq('${r.id}',1)" title="Approve — applies immediately" style="color:var(--moss)">✓</button><button class="tdo-x" onclick="decideReq('${r.id}',0)" title="Deny" style="color:var(--clay);font-size:16px">×</button>`:''}</div>`;
      }).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">No requests yet.</div>'}
    </div>`;
    const quoteShow=quoteList.length?`<div class="card"><div class="chead"><span>💵 Rooms on offer</span><span>quotes from 조상연</span></div>
      ${quoteList.map(q=>{const k=cats.find(x=>x.id===q.cat)||{n:q.cat,sq:'',d:'',tone:'#5B7185'};return `<div style="display:flex;gap:12px;padding:12px 13px;border-bottom:1px dotted var(--rule);align-items:center">
        ${q.img?`<img src="${esc(q.img)}" alt="${esc(k.n)}" loading="lazy" style="flex:0 0 110px;width:110px;height:78px;object-fit:cover;border-radius:3px" onerror="this.style.display='none'">`:`<span style="flex:0 0 110px;height:78px;border-radius:3px;background:${k.tone};display:flex;align-items:center;justify-content:center;color:#fff;font:600 10px var(--mono)">${esc((k.n||'').slice(0,2).toUpperCase())}</span>`}
        <span style="flex:1;min-width:0"><span style="font-size:13.5px;font-weight:600">${esc(k.n)}</span>
          <span style="display:inline-block;margin-left:7px;border:1px solid var(--indigo2);color:var(--indigo2);border-radius:2px;font:600 8.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:1px 6px;vertical-align:1px">sleeps ${q.ppl}</span>
          <span style="display:block;font:600 9px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--indigo2);margin-top:2px">${esc(k.sq)}</span>
          <span style="display:block;font-size:11.5px;color:var(--grey);margin-top:2px">${esc(k.d)}</span></span>
        <span style="flex:0 0 auto;text-align:right"><span style="font-family:var(--serif);font-size:19px;font-weight:700;color:var(--indigo)">${money(q.q)}</span>
          <span style="display:block;font:600 8.5px var(--mono);color:var(--grey)">for ${q.ppl}</span></span>
      </div>`;}).join('')}
    </div>`:'';
    const myPendReq=reqs.find(r=>r.uid===me&&r.status==='pending');
    const myLastReq=reqs.filter(r=>r.uid===me&&r.status!=='pending').sort((a,b)=>(b.decided||b.ts)-(a.decided||a.ts))[0];
    const newRoomCard=(!admin&&!mine)?`<div class="card"><div class="chead"><span>🛏 Request a room</span></div>
      ${myPendReq?`<div style="padding:12px 13px;font-size:12.5px">Pending with ${nameOf('admin')}: <b>${myPendReq.kind==='new'?'new ':''}${esc((cats.find(k=>k.id===myPendReq.to)||{}).n||myPendReq.to)}</b>${myPendReq.ppl?' · sleeps '+myPendReq.ppl:''}${myPendReq.note?' · '+esc(myPendReq.note):''}
        <button onclick="cancelReq('${myPendReq.id}')" style="margin-left:10px;background:none;border:1px solid var(--rule);border-radius:2px;font:600 9px var(--mono);text-transform:uppercase;color:var(--clay);padding:4px 8px;cursor:pointer">Cancel</button></div>`
      :`<div class="plform">
        ${myLastReq?`<div class="plhint">Your last request (${esc((cats.find(k=>k.id===myLastReq.to)||{}).n||myLastReq.to)}) was <b>${myLastReq.status}</b>.</div>`:''}
        <div class="plrow1">
          <select id="rn_to">${cats.map(k=>`<option value="${k.id}">${esc(k.n)}${qMin(k.id)?' — from '+money(qMin(k.id)):''}</option>`).join('')}</select>
          <select id="rn_ppl"><option value="2">Sleeps 2</option><option value="3">Sleeps 3</option><option value="4">Sleeps 4</option></select>
        </div>
        <input id="rn_note" placeholder="Anything ${esc(nameOf('admin'))} should know (optional)" maxlength="80">
        <button class="pladd" type="button" onclick="requestRoom()" style="align-self:flex-start;padding:8px 14px">Send request</button>
        <div class="plhint">If approved, the room is created and you take its first slot automatically.</div>
      </div>`}
    </div>`:'';
    const reqCard=(!admin&&mine)?(mine.locked?`<div class="card"><div class="chead"><span>🔁 Room-type changes</span><span>Room ${rooms.indexOf(mine)+1}</span></div>
      <div style="padding:12px 13px;font-size:12.5px;color:var(--grey)">🔒 Your room is locked by 조상연 — type changes are closed${myPendReq?'; your pending request will still be decided':''}.</div>
    </div>`:`<div class="card"><div class="chead"><span>🔁 Request a room-type change</span><span>Room ${rooms.indexOf(mine)+1}</span></div>
      ${myPendReq?`<div style="padding:12px 13px;font-size:12.5px">Pending with 조상연: <b>${esc((cats.find(k=>k.id===myPendReq.to)||{}).n||myPendReq.to)}</b>${myPendReq.note?' · '+esc(myPendReq.note):''}
        <button onclick="cancelReq('${myPendReq.id}')" style="margin-left:10px;background:none;border:1px solid var(--rule);border-radius:2px;font:600 9px var(--mono);text-transform:uppercase;color:var(--clay);padding:4px 8px;cursor:pointer">Cancel</button></div>`
      :`<div class="plform">
        ${myLastReq?`<div class="plhint">Your last request (${esc((cats.find(k=>k.id===myLastReq.to)||{}).n||myLastReq.to)}) was <b>${myLastReq.status}</b>.</div>`:''}
        <select id="rq_to">${cats.filter(k=>k.id!==mine.cat).map(k=>`<option value="${k.id}">${esc(k.n)}${qMin(k.id)?' — from '+money(qMin(k.id)):''}</option>`).join('')}</select>
        <input id="rq_note" placeholder="Anything 조상연 should know (optional)" maxlength="80">
        <button class="pladd" type="button" onclick="reqChange()" style="align-self:flex-start;padding:8px 14px">Send request</button>
        <div class="plhint">Once approved, your cabin's type changes automatically — nothing else to do.</div>
      </div>`}
    </div>`):newRoomCard;
    body=(admin?`<div class="card"><div class="chead"><span>${window._editRoom?'Edit cabin':'Add a cabin'}</span></div>
      <div class="plform">
        <div class="plrow1">
          <input id="rm_num" placeholder="Cabin no. (optional — Royal often assigns near sailing)" maxlength="10">
          <select id="rm_cat">${cats.map(k=>`<option value="${k.id}">${k.n}</option>`).join('')}</select>
          <select id="rm_cap" title="How many this room sleeps"><option value="2">Sleeps 2</option><option value="3">Sleeps 3</option><option value="4">Sleeps 4</option></select>
        </div>
        <input id="rm_note" placeholder="Deck / note (optional)" maxlength="60">
        <div style="display:flex;gap:8px">
          <button class="pladd" type="button" onclick="addRoom()" style="padding:8px 14px;${window._editRoom?'background:var(--moss)':''}">${window._editRoom?'✓ Save cabin':'+ Add cabin'}</button>
          ${window._editRoom?'<button type="button" onclick="window._editRoom=null;render()" style="background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);padding:7px 11px;cursor:pointer;color:var(--grey)">Cancel</button>':''}
        </div>
      </div></div>`+quoteAdmin+reqAdmin:quoteShow)+
      `<div class="card"><div class="chead"><span>🛏 Cabins</span><span>${placed.size}/${rooms.reduce((a,r)=>a+(Number(r.cap)||((r.slots||[]).length)||2),0)} slots taken</span></div>
      ${rooms.length?rooms.map((r,ri)=>{
        const k=cats.find(x=>x.id===r.cat)||{n:r.cat,d:'',sq:'',tone:'#5B7185'};
        const cap=Number(r.cap)||((r.slots||[]).length)||2;
        const slots=Array.from({length:cap},(_,i)=>((r.slots||[])[i])??null);
        return `<div style="display:flex;gap:11px;padding:11px 13px;border-bottom:1px dotted var(--rule);align-items:flex-start">
          <span style="flex:0 0 42px;height:42px;border-radius:3px;background:${k.tone};display:flex;align-items:center;justify-content:center;color:#fff;font:600 9px var(--mono)">${esc((k.n||'').slice(0,2).toUpperCase())}</span>
          <span style="flex:1;min-width:0">
            <span style="font-size:13.5px;font-weight:600;color:var(--ink)">Room ${ri+1}${r.locked?' <span title="Locked — type changes closed">🔒</span>':''}${r.num?` <span style="font-weight:400;color:var(--grey);font-size:12px">· Cabin ${esc(r.num)}</span>`:''}</span>
            <span style="display:block;font:600 9px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--indigo2);margin-top:1px">${esc(k.n)}${k.sq?' · '+esc(k.sq):''}</span>
            ${k.d?`<span style="display:block;font-size:11px;color:var(--grey);margin-top:2px">${esc(k.d)}</span>`:''}
            ${r.note?`<span style="display:block;font-size:11px;color:var(--grey);margin-top:2px">${esc(r.note)}</span>`:''}
            <span style="display:flex;gap:7px;margin-top:7px;flex-wrap:wrap">
              ${slots.map((uid,i)=>{
                if(uid) return `<span style="flex:1 1 120px;border:1.5px solid ${uid===me?'var(--moss)':'var(--rule)'};background:${uid===me?'rgba(47,125,107,.09)':'var(--washi2)'};border-radius:2px;padding:6px 9px;font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:6px">
                  <b>${esc(nameOf(uid))}</b>${(uid===me||admin)?`<button onclick="leaveSlot('${r.id}',${i})" style="background:none;border:none;color:var(--clay);cursor:pointer;font:600 9px var(--mono);text-transform:uppercase">${uid===me?'Release':'Clear'}</button>`:''}</span>`;
                return `<button onclick="takeSlot('${r.id}',${i})" style="flex:1 1 120px;border:1.5px dashed var(--indigo2);background:none;border-radius:2px;padding:6px 9px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;color:var(--indigo2);cursor:pointer">${mine&&mine.id===r.id?'Take 2nd slot':'Take this slot'}</button>`;
              }).join('')}
            </span>
          </span>
          ${admin?`<span style="display:flex;flex-direction:column;gap:2px"><button class="tdo-x" onclick="editRoom('${r.id}')" style="color:var(--indigo)">✎</button><button class="tdo-x" onclick="toggleRoomLock('${r.id}')" title="${r.locked?'Unlock — reopen type changes':'Lock — close type changes'}" style="font-size:13px">${r.locked?'🔒':'🔓'}</button><button class="tdo-x" onclick="delRoom('${r.id}')" style="color:var(--clay);font-size:17px">×</button></span>`:''}
        </div>`;
      }).join(''):'<div style="padding:13px;font-size:12px;color:var(--grey)">No cabins added yet.</div>'}
      </div>`+reqCard+`
      ${unplaced.length?`<div class="card"><div class="chead"><span>Not in a cabin yet</span><span>${unplaced.length}</span></div>
        <div style="padding:10px 13px;font-size:12.5px;color:var(--grey)">${unplaced.map(u=>esc(u.name)).join(' · ')}</div></div>`:''}`;
  }
  if(c.cruiseTab==='cexp'){
    const CFX={USD:'$',CAD:'CA$',NZD:'NZ$',KRW:'₩'};
    let cpref='USD';try{cpref=localStorage.getItem('jt_cru_cur')||'USD';}catch(e){}
    if(!CFX[cpref])cpref='USD';
    const crate=cpref==='USD'?1:((window._cruFx||{})[cpref]||null);
    const cfmt=n=>CFX[cpref]+(n*crate).toLocaleString('en-US',{minimumFractionDigits:cpref==='KRW'?0:2,maximumFractionDigits:cpref==='KRW'?0:2});
    const curSel=`<select onchange="setCruCur(this.value)" style="font:600 10px var(--mono);border:1px solid var(--rule);border-radius:2px;padding:2px 4px;background:#fff;color:var(--ink)">${Object.keys(CFX).map(k=>`<option ${k===cpref?'selected':''}>${k}</option>`).join('')}</select>`;
    const cvtLine=(pairs)=>cpref==='USD'?'':(crate
      ?`<div style="padding:7px 12px;border-top:1px dotted var(--rule);font:11px var(--mono);color:var(--indigo2);text-align:center">≈ ${pairs.map(([l,v])=>`${cfmt(v)} ${l}`).join(' · ')} <span style="color:var(--grey)">@ 1 USD = ${crate.toFixed(cpref==='KRW'?0:4)} ${cpref}</span></div>`
      :`<div style="padding:7px 12px;border-top:1px dotted var(--rule);font:11px var(--mono);color:var(--grey);text-align:center">fetching ${cpref} rate…</div>`);
    const me=(window._cru||{}).uid;
    const users=cruiseUsers();
    const nameOf=uid=>uid==='admin'?appAdminName():((users.find(u=>u.uid===uid)||{}).name||'—');
    const charges=(overrides.charges||[]);
    const money=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
    const myCharges=charges.filter(x=>x.uid===me);
    const mine=(overrides.cexp&&overrides.cexp[me])||[];
    const myPersonal=mine.reduce((a,x)=>a+Number(x.amt||0),0);
    const myBilled=myCharges.reduce((a,x)=>a+Number(x.amt||0),0);
    const myPaid=myCharges.reduce((a,x)=>a+Number(x.paid||0),0);
    const chargeRow=x=>{
      const pd=Number(x.paid||0), dep=Number(x.dep||0);
      const st=pd>=Number(x.amt)-0.005?['PAID','var(--moss)']
        :(dep>0&&pd>=dep-0.005?['DEPOSIT PAID','#0E7C86']
        :(pd>0.005?['PARTIAL','#B0761F']:['UNPAID','var(--clay)']));
      const depLine=dep>0&&pd<Number(x.amt)-0.005
        ?` · deposit ${'$'+dep.toLocaleString('en-US',{minimumFractionDigits:2})} ${pd>=dep-0.005?'✓ received':'due'}`:'';
      return `<div class="tdo-row"><span class="tdo-main">
        <span class="tdo-t">${esc(x.desc)}</span>
        <span class="tdo-desc">${x.kind==='cruise'?'cruise':x.kind==='transport'?'transport':x.kind}${depLine}${x.items&&x.items.length?` · <a href="#" onclick="event.preventDefault();toggleInv('${x.id}')" style="color:var(--indigo2)">${window._inv===x.id?'hide invoice':'view itemized invoice'}</a>`:''}</span>
        ${window._inv===x.id&&x.items?invoiceHTML(x,nameOf(x.uid)):''}
      </span>
      <span style="text-align:right;flex:0 0 auto"><b style="font-family:var(--mono);font-size:13px">${money(x.amt)}</b>
        <span style="display:block;font:600 8.5px var(--mono);letter-spacing:.08em;color:${st[1]}">${st[0]}</span></span></div>`;
    };
    const myRows=mine.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(x=>`<div class="tdo-row">
      <span class="tdo-date">${esc((x.date||'').slice(5))||'—'}</span>
      <span class="tdo-main"><span style="font-size:13px">${esc(x.desc)}</span></span>
      <b style="font-family:var(--mono);font-size:12.5px;flex:0 0 auto">${money(x.amt)}</b>
      <button class="tdo-x" onclick="delMyExp('${x.id}')" style="color:var(--clay);font-size:17px">×</button></div>`).join('');
    const myBlock=`
      <div class="card"><div class="chead"><span>My trip total</span><span style="display:flex;gap:8px;align-items:center">${money(myBilled+myPersonal)} ${curSel}</span></div>
        <div style="display:flex;gap:0;text-align:center">
          <div style="flex:1;padding:11px 6px;border-right:1px dotted var(--rule)"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Billed by organizer</div><div style="font-family:var(--serif);font-size:19px;font-weight:700;color:var(--indigo)">${money(myBilled)}</div></div>
          <div style="flex:1;padding:11px 6px;border-right:1px dotted var(--rule)"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Paid</div><div style="font-family:var(--serif);font-size:19px;font-weight:700;color:var(--moss)">${money(myPaid)}</div></div>
          <div style="flex:1;padding:11px 6px"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">My own spend</div><div style="font-family:var(--serif);font-size:19px;font-weight:700;color:var(--indigo2)">${money(myPersonal)}</div></div>
        </div>${cvtLine([['billed',myBilled],['paid',myPaid],['own',myPersonal]])}</div>
      <div class="card"><div class="chead"><span>Charges from the organizer</span><span>${myCharges.length}</span></div>
        ${myCharges.map(chargeRow).join('')||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nothing billed to you yet.</div>'}</div>
      <div class="card"><div class="chead"><span>My expenses</span><span>${money(myPersonal)}</span></div>
        <div class="plform"><div class="plrow1">
          <input id="mx_date" type="date">
          <input id="mx_desc" placeholder="Flight to MCO, hotel night, parking…" maxlength="60">
          <input id="mx_amt" type="number" min="0" step="0.01" placeholder="$">
          <button class="pladd" type="button" onclick="addMyExp()" style="flex:0 0 auto;padding:8px 13px">+ Add</button>
        </div></div>
        ${myRows||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nothing yet — flights, hotel nights, parking, whatever is yours alone.</div>'}</div>`;
    if(!admin){ body=myBlock; }
    else{
      const billed=charges.reduce((a,x)=>a+Number(x.amt||0),0);
      const collected=charges.reduce((a,x)=>a+Number(x.paid||0),0);
      const byUser={};charges.forEach(x=>{(byUser[x.uid]=byUser[x.uid]||[]).push(x);});
      body=`
      <div class="card"><div class="chead"><span>💰 Collection dashboard</span><span style="display:flex;gap:8px;align-items:center">${money(billed-collected)} still to collect ${curSel}</span></div>
        <div style="display:flex;text-align:center">
          <div style="flex:1;padding:11px 6px;border-right:1px dotted var(--rule)"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Billed</div><div style="font-family:var(--serif);font-size:20px;font-weight:700;color:var(--indigo)">${money(billed)}</div></div>
          <div style="flex:1;padding:11px 6px;border-right:1px dotted var(--rule)"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Collected</div><div style="font-family:var(--serif);font-size:20px;font-weight:700;color:var(--moss)">${money(collected)}</div></div>
          <div style="flex:1;padding:11px 6px"><div style="font:600 8.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">Outstanding</div><div style="font-family:var(--serif);font-size:20px;font-weight:700;color:var(--clay)">${money(billed-collected)}</div></div>
        </div>${cvtLine([['billed',billed],['collected',collected],['outstanding',billed-collected]])}
        <div style="border-top:1px solid var(--rule)">
        ${Object.keys(byUser).map(uid=>{
          const b=byUser[uid].reduce((a,x)=>a+Number(x.amt||0),0), pd=byUser[uid].reduce((a,x)=>a+Number(x.paid||0),0);
          return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(nameOf(uid))}</span></span>
            <span style="font:11px var(--mono);color:${pd>=b-0.005?'var(--moss)':'var(--clay)'};flex:0 0 auto">${money(pd)} / ${money(b)}</span></div>`;
        }).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">No charges assigned yet.</div>'}
        </div></div>
      <div class="card"><div class="chead"><span>${window._editCharge?'✎ Edit charge':'Bill someone'}</span>${window._editCharge?'<span>payments already recorded are kept</span>':''}</div>
        <div class="plform">
          <div class="plrow1">
            <select id="ch_uid">${users.map(u=>`<option value="${u.uid}">${esc(u.name)}</option>`).join('')}</select>
            <select id="ch_kind"><option value="cruise">Cruise fare</option><option value="room">Room</option><option value="transport">Transport</option><option value="other">Other</option></select>
          </div>
          <input id="ch_desc" placeholder="Description — e.g. Star of the Seas · balcony share" maxlength="80">
          <span style="font:600 9px var(--mono);letter-spacing:.09em;text-transform:uppercase;color:var(--grey)">Line items — optional; leave empty to bill a single amount</span>
          <div id="ch_items_box"></div>
          <button type="button" onclick="addChLine()" style="align-self:flex-start;background:none;border:1px dashed var(--indigo2);color:var(--indigo2);border-radius:2px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;padding:6px 11px;cursor:pointer">+ Add line</button>
          <div class="plrow1">
            <input id="ch_amt" type="number" min="0" step="0.01" placeholder="$ total (ignored when line items are set)" oninput="updateChTotal()">
            <input id="ch_dep" type="number" min="0" step="0.01" placeholder="$ deposit (optional)" title="Royal's booking deposit — tracked as its own milestone" style="flex:0 1 150px">
            <button class="pladd" type="button" onclick="addCharge()" style="flex:0 0 auto;padding:8px 14px;${window._editCharge?'background:var(--moss)':''}">${window._editCharge?'✓ Save':'Bill'} · <span id="ch_total">$0.00</span></button>
            ${window._editCharge?'<button type="button" onclick="window._editCharge=null;window._chItems=[];render()" style="flex:0 0 auto;background:none;border:1px solid var(--rule);border-radius:2px;font:600 10px var(--mono);padding:7px 11px;cursor:pointer;color:var(--grey)">Cancel</button>':''}
            <span id="ch_msg" style="font:10px var(--mono);color:var(--clay);align-self:center"></span>
          </div>
          <div class="plhint">Guests see ONE line on their tracker; the invoice shows every line with its category.</div>
        </div></div>
      <div class="card"><div class="chead"><span>All charges</span><span>record payments here</span></div>
        ${charges.map(x=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(nameOf(x.uid))} · ${esc(x.desc)}</span>
            <span class="tdo-desc">${money(x.amt)} · ${x.kind}${x.dep?` · dep ${money(x.dep)} ${Number(x.paid||0)>=Number(x.dep)-0.005?'✓':'due'}`:''}${x.items?` · ${x.items.length} lines`:''}</span></span>
          <label style="flex:0 0 auto;font:600 8px var(--mono);color:var(--grey);text-transform:uppercase;text-align:right">Paid $<br>
            <input type="number" min="0" step="0.01" value="${Number(x.paid||0)>0.005?Number(x.paid).toFixed(2):''}" placeholder="0" onchange="setChargePaid('${x.id}',this.value)" style="width:78px;font:12px var(--mono);border:1px solid var(--rule);border-radius:2px;padding:3px 5px;text-align:right;background:#fff;margin-top:2px"></label>
          <button class="tdo-x" onclick="editCharge('${x.id}')" title="Edit" style="color:var(--indigo)">✎</button>
          ${x.dep&&Number(x.paid||0)<Number(x.dep)-0.005?`<button class="tdo-x" onclick="setChargePaid('${x.id}','${Number(x.dep)}')" title="Deposit received" style="color:#0E7C86;font:700 9px var(--mono)">✓dep</button>`:''}
          <button class="tdo-x" onclick="setChargePaid('${x.id}','${Number(x.amt)}')" title="Mark fully paid" style="color:var(--moss);font-size:13px">✓</button>
          <button class="tdo-x" onclick="delCharge('${x.id}')" style="color:var(--clay);font-size:17px">×</button></div>`).join('')||'<div style="padding:12px;font-size:12px;color:var(--grey)">No charges yet.</div>'}
      </div>
      <div class="card"><div class="chead"><span>My own expenses (organizer)</span></div>
        <div class="plform"><div class="plrow1">
          <input id="mx_date" type="date">
          <input id="mx_desc" placeholder="Description" maxlength="60">
          <input id="mx_amt" type="number" min="0" step="0.01" placeholder="$">
          <button class="pladd" type="button" onclick="addMyExp()" style="flex:0 0 auto;padding:8px 13px">+ Add</button>
        </div></div>
        ${myRows||'<div style="padding:12px;font-size:12px;color:var(--grey)">Nothing yet.</div>'}
      </div>`;
    }
  }
  if(c.cruiseTab==='clog'){
    const me=(window._cru||{}).uid;
    const users=cruiseUsers();
    const nameOf=uid=>uid==='admin'?appAdminName():((users.find(u=>u.uid===uid)||{}).name||'—');
    const logi=overrides.logi||{};
    const mine=(logi[me]||[]);
    const legRow=(x,owner)=>`<div class="tdo-row">
      <span class="tdo-date">${esc((x.date||'').slice(5))||'—'}</span>
      <span class="tdo-main"><span class="tdo-t">${x.dir==='arrive'?'→':'←'} ${esc(x.flt||x.mode||'—')}</span>
        <span class="tdo-desc">${esc(x.ap||'')}${x.time?' · '+esc(x.time):''}${owner?' · '+esc(nameOf(owner)):''}${x.note?' · '+esc(x.note):''}</span></span>
      ${owner?'':`<button class="tdo-x" onclick="delLogi('${x.id}')" style="color:var(--clay);font-size:17px">×</button>`}</div>`;
    const myForm=`<div class="card"><div class="chead"><span>${admin?'My travel (organizer)':'My travel to the ship'}</span></div>
      <div class="plform">
        <div class="plrow1">
          <select id="lg_dir"><option value="arrive">Arriving (before Jan 9)</option><option value="depart">Departing (after Jan 16)</option></select>
          <input id="lg_date" type="date">
          <input id="lg_time" type="time" title="Local time">
        </div>
        <div class="plrow1">
          <input id="lg_flt" placeholder="Flight / how (UA 1642, driving, Brightline…)" maxlength="40">
          <input id="lg_ap" placeholder="Airport / place (MCO, FLL, Port Canaveral…)" maxlength="30">
        </div>
        <input id="lg_note" placeholder="Note — bags, +1 in tow, hotel night before… (optional)" maxlength="80">
        <button class="pladd" type="button" onclick="addLogi()" style="align-self:flex-start;padding:8px 14px">+ Add</button>
        <div class="plhint">This feeds the organizer's coordination view so shuttles and pickups can be planned.</div>
      </div>
      ${mine.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).map(x=>legRow(x,null)).join('')||'<div style="padding:11px 13px;font-size:12px;color:var(--grey)">Nothing added yet.</div>'}
    </div>`;
    if(!admin){ body=myForm; }
    else{
      const everyone=['admin',...users.map(u=>u.uid)];
      const all=everyone.flatMap(uid=>(logi[uid]||[]).map(x=>({...x,uid})));
      const arr=all.filter(x=>x.dir==='arrive').sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time)));
      const dep=all.filter(x=>x.dir!=='arrive').sort((a,b)=>String(a.date+a.time).localeCompare(String(b.date+b.time)));
      const silent=users.filter(u=>!(logi[u.uid]||[]).length);
      body=`
      <div class="card"><div class="chead"><span>🧭 Transport coordination</span><span>${all.length} legs from ${everyone.filter(uid=>(logi[uid]||[]).length).length} people</span></div>
        <div style="font:600 9px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--indigo2);padding:9px 13px 2px;background:var(--washi2)">Arrivals — before embark Jan 9</div>
        ${arr.map(x=>legRow(x,x.uid)).join('')||'<div style="padding:9px 13px;font-size:12px;color:var(--grey)">No arrivals logged.</div>'}
        <div style="font:600 9px var(--mono);letter-spacing:.12em;text-transform:uppercase;color:var(--indigo2);padding:9px 13px 2px;background:var(--washi2)">Departures — after Jan 16</div>
        ${dep.map(x=>legRow(x,x.uid)).join('')||'<div style="padding:9px 13px;font-size:12px;color:var(--grey)">No departures logged.</div>'}
        ${silent.length?`<div style="padding:10px 13px;border-top:1px solid var(--rule);font-size:12px;color:var(--clay)"><b>No travel info yet:</b> ${silent.map(u=>esc(u.name)).join(' · ')}</div>`:''}
        <div style="padding:10px 13px;border-top:1px solid var(--rule);font-size:11.5px;color:var(--grey)">Booked a van or shuttle? Bill it from the <a href="#" onclick="event.preventDefault();gotoCruiseTab('cexp')" style="color:var(--indigo2)">Expenses tab</a> as kind "Transport" — it lands on each person's tracker and invoice with paid/unpaid like everything else.</div>
      </div>
      ${myForm}`;
    }
  }
  if(c.cruiseTab==='cadmin'){
    body=`<div class="card"><div class="chead"><span>👥 Guests & access</span></div>
      <div style="padding:13px 15px;font-size:12.5px;color:var(--grey)">People, codes, roles and per-destination access now live in the app-wide <b>⚙ Admin</b> page on the trip picker (top right). Cruise organizer/guest rights are the cruise column there.</div>
    </div>
    <div class="card"><div class="chead"><span>🔔 Discord integration</span></div>
      <div class="plform">
        <input id="dc_hook" placeholder="Discord webhook URL — https://discord.com/api/webhooks/…" value="${esc(overrides.discordHook||'')}">
        <div style="display:flex;gap:8px">
          <button class="pladd" type="button" onclick="saveHook()" style="padding:8px 14px">Save</button>
          <button type="button" onclick="testHook()" style="background:none;border:1px solid var(--indigo2);color:var(--indigo2);border-radius:2px;font:600 10px var(--mono);letter-spacing:.05em;text-transform:uppercase;padding:7px 12px;cursor:pointer">Send test</button>
        </div>
        <div class="plhint">Server Settings → Integrations → Webhooks → New Webhook, pick the channel, copy the URL. Every announcement posted here pings that channel. Clear the field and Save to disconnect.</div>
      </div></div>`;
  }
  panel.innerHTML=`<div class="stack" style="max-width:760px;margin:0 auto">${body}</div>`;
  if(c.cruiseTab==='cexp'&&admin)renderChItems();
  if(c.cruiseTab==='sched'&&document.getElementById('crmap'))drawCruiseMap(T);
}
function drawCruiseMap(T){
  map=L.map('crmap',{scrollWheelZoom:false});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'&copy; Esri'}).addTo(map);
  const pin=(emoji,size)=>L.divIcon({className:'',html:`<div style="font-size:${size||20}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${emoji}</div>`,iconSize:[size||20,size||20],iconAnchor:[(size||20)/2,(size||20)/2]});
  const stops=(T.itinerary||[]).filter(d=>typeof d.lat==='number');
  const bounds=[];
  if(T.airport){
    L.marker([T.airport.lat,T.airport.lng],{icon:pin('✈️',19)}).addTo(map).bindPopup(`<b>${esc(T.airport.n)}</b><br>${esc(T.airport.note||'')}`);
    bounds.push([T.airport.lat,T.airport.lng]);
  }
  const seen=new Set();
  stops.forEach(d=>{
    const key=d.lat+','+d.lng;
    if(!seen.has(key)){
      seen.add(key);
      const home=d.port.indexOf('Port Canaveral')>-1;
      L.marker([d.lat,d.lng],{icon:pin(home?'🚢':'🏝',home?24:20)}).addTo(map)
        .bindPopup(`<b>${esc(d.port)}</b><br>Day ${d.day} · ${esc(d.date)}`);
    }
    bounds.push([d.lat,d.lng]);
  });
  if(stops.length>1){
    L.polyline(stops.map(d=>[d.lat,d.lng]),{color:'#0E7C86',weight:2.5,dashArray:'7 7',opacity:.85}).addTo(map);
  }
  if(T.airport&&stops.length){
    L.polyline([[T.airport.lat,T.airport.lng],[stops[0].lat,stops[0].lng]],{color:'#5B7185',weight:1.5,dashArray:'2 6',opacity:.8}).addTo(map);
  }
  if(bounds.length)map.fitBounds(bounds,{padding:[28,28]});
}
window.postAnn=function(){
  const el=document.getElementById('an_txt');
  if(!el||!el.value.trim())return;
  const txt=el.value.trim();
  overrides.ann=overrides.ann||[];
  overrides.ann.push({id:'a'+Date.now(),ts:Date.now(),txt});
  saveOverrides();render();
  pingDiscord('📣 **New announcement** — '+txt);
};
function pingDiscord(msg){
  const hook=overrides.discordHook;
  if(!hook||!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(hook))return;
  try{
    fetch(hook,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({content:String(msg).slice(0,1900),username:'Icon Cruise'})})
      .then(r=>{ if(!r.ok)flash('Discord ping failed ('+r.status+')','err'); })
      .catch(()=>flash('Discord ping failed — check the webhook URL','err'));
  }catch(e){}
}
window.saveHook=function(){
  const el=document.getElementById('dc_hook');
  overrides.discordHook=(el?el.value.trim():'');
  saveOverrides();
  flash(overrides.discordHook?'Webhook saved ✓':'Webhook cleared','ok');
};
window.testHook=function(){
  window.saveHook();
  if(overrides.discordHook)pingDiscord('🔧 Test from the cruise app — webhook connected.');
};
window.delAnn=function(id){
  overrides.ann=(overrides.ann||[]).filter(a=>a.id!==id);
  saveOverrides();render();
};
window.saveSched=function(){
  const g=i=>document.getElementById(i);
  const txt=g('sc_txt').value.trim();
  if(!txt){g('sc_txt').focus();return;}
  overrides.sched=overrides.sched||[];
  let p;
  if(window._editSched){p=overrides.sched.find(x=>x.id===window._editSched);window._editSched=null;}
  if(!p){p={id:'s'+Date.now()};overrides.sched.push(p);}
  Object.assign(p,{day:g('sc_day').value,t:g('sc_t').value,txt,loc:g('sc_loc').value.trim()});
  saveOverrides();render();
};
window.editSched=function(id){
  const p=(overrides.sched||[]).find(x=>x.id===id);
  if(!p)return;
  window._editSched=id;render();
  const g=i=>document.getElementById(i);
  g('sc_day').value=p.day;g('sc_t').value=p.t||'';g('sc_txt').value=p.txt;g('sc_loc').value=p.loc||'';
  g('sc_txt').scrollIntoView({behavior:'smooth',block:'center'});
};
window.delSched=function(id){
  if(!confirm('Remove this from the schedule?'))return;
  overrides.sched=(overrides.sched||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
window.gotoCruiseTab=function(id){
  const i=navCities().findIndex(c=>c.id===id);
  if(i>-1){ci=i;render();}
};
window.addLogi=function(){
  const g=i=>document.getElementById(i);
  const flt=g('lg_flt').value.trim();
  if(!flt){g('lg_flt').focus();return;}
  const me=(window._cru||{}).uid;
  overrides.logi=overrides.logi||{};
  overrides.logi[me]=overrides.logi[me]||[];
  overrides.logi[me].push({id:'l'+Date.now(),dir:g('lg_dir').value,date:g('lg_date').value,time:g('lg_time').value,
    flt,ap:g('lg_ap').value.trim(),note:g('lg_note').value.trim()});
  saveOverrides();render();
};
window.delLogi=function(id){
  const me=(window._cru||{}).uid;
  if(!overrides.logi||!overrides.logi[me])return;
  overrides.logi[me]=overrides.logi[me].filter(x=>x.id!==id);
  saveOverrides();render();
};
window._inv=null;
window.toggleInv=function(id){window._inv=(window._inv===id?null:id);render();};
window.addMyExp=function(){
  const g=i=>document.getElementById(i);
  const desc=g('mx_desc').value.trim(), amt=Number(g('mx_amt').value);
  if(!desc||!(amt>0)){(!desc?g('mx_desc'):g('mx_amt')).focus();return;}
  const me=(window._cru||{}).uid;
  overrides.cexp=overrides.cexp||{};
  overrides.cexp[me]=overrides.cexp[me]||[];
  overrides.cexp[me].push({id:'x'+Date.now(),date:g('mx_date').value,desc,amt});
  saveOverrides();render();
};
window.delMyExp=function(id){
  const me=(window._cru||{}).uid;
  if(!overrides.cexp||!overrides.cexp[me])return;
  overrides.cexp[me]=overrides.cexp[me].filter(x=>x.id!==id);
  saveOverrides();render();
};
const CH_CATS={fare:'🚢 Cruise fare',taxes:'🏛 Taxes & fees',grat:'🤵 Gratuities',pkg:'🍹 Drink / dining pkg',excur:'🏝 Excursion',room:'🛏 Room',transport:'🚐 Transport',other:'📦 Other'};
function chItemIco(c){return (CH_CATS[c]||CH_CATS.other).split(' ')[0];}
window._chItems=[];
function renderChItems(){
  const box=document.getElementById('ch_items_box');
  if(!box)return;
  box.innerHTML=window._chItems.map((it,i)=>`
    <div class="plrow1" style="margin-bottom:6px">
      <select onchange="syncChItem(${i},'c',this.value)" style="flex:1 1 34%">${Object.entries(CH_CATS).map(([v,l])=>`<option value="${v}" ${it.c===v?'selected':''}>${l}</option>`).join('')}</select>
      <input placeholder="Detail — e.g. Infinite Balcony · 2 guests" value="${esc(it.d||'')}" oninput="syncChItem(${i},'d',this.value)" style="flex:2 1 40%">
      <input type="number" min="0" step="0.01" placeholder="$" value="${it.amt||''}" oninput="syncChItem(${i},'amt',this.value)" style="flex:1 1 88px">
      <button type="button" onclick="delChLine(${i})" style="flex:0 0 auto;background:none;border:none;color:var(--clay);font-size:17px;cursor:pointer;padding:0 4px">×</button>
    </div>`).join('')||'<div style="font-size:11px;color:var(--grey);padding:2px 0 4px">No lines yet — the single $ total below will be billed as-is.</div>';
  updateChTotal();
}
window.syncChItem=function(i,k,v){ if(window._chItems[i]){window._chItems[i][k]=v; if(k==='amt')updateChTotal();} };
window.addChLine=function(){
  window._chItems.push({c:window._chItems.length?'other':'fare',d:'',amt:''});
  renderChItems();
};
window.delChLine=function(i){ window._chItems.splice(i,1); renderChItems(); };
function updateChTotal(){
  const t=window._chItems.reduce((a,x)=>a+(Number(x.amt)||0),0);
  const amtEl=document.getElementById('ch_amt');
  const el=document.getElementById('ch_total');
  if(el)el.textContent='$'+(t||(amtEl?Number(amtEl.value)||0:0)).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
}
function invoiceHTML(x,billedTo){
  const money=n=>'$'+Number(n||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const bal=Number(x.amt)-Number(x.paid||0);
  const settled=bal<=0.005;
  return `<span style="display:block;margin-top:9px;border:1px solid #0B2545;border-radius:3px;overflow:hidden;background:#fff;box-shadow:0 2px 10px rgba(11,37,69,.10)">
    <span style="display:flex;justify-content:space-between;align-items:center;background:#0B2545;color:#DCEAF9;padding:10px 14px">
      <span><span style="display:block;font:600 8px var(--mono);letter-spacing:.18em">STAR OF THE SEAS · JAN 9–16, 2028</span>
        <span style="display:block;font-family:var(--serif);font-size:17px;font-weight:700;margin-top:2px">Invoice</span></span>
      ${settled
        ?`<span style="border:1.5px solid #7FD8A4;color:#7FD8A4;border-radius:2px;padding:4px 10px;font:700 10px var(--mono);letter-spacing:.16em;transform:rotate(-4deg)">PAID</span>`
        :`<span style="border:1.5px solid #F0B45C;color:#F0B45C;border-radius:2px;padding:4px 10px;font:700 9.5px var(--mono);letter-spacing:.12em">BALANCE DUE</span>`}
    </span>
    <span style="display:flex;justify-content:space-between;gap:10px;padding:9px 14px 3px;font-size:11px;color:var(--grey)">
      <span>Billed to <b style="color:var(--ink)">${esc(billedTo)}</b></span><span style="text-align:right">${esc(x.desc)}</span></span>
    <span style="display:block;padding:5px 14px 12px">
      ${x.items.map(it=>`<span style="display:flex;align-items:center;gap:9px;font-size:12.5px;padding:6px 0;border-bottom:1px dotted var(--rule)">
        <span style="flex:0 0 19px;text-align:center">${chItemIco(it.c)}</span>
        <span style="flex:1;min-width:0">${esc(it.d)}${it.c&&CH_CATS[it.c]?`<span style="display:block;font:600 7.5px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--grey)">${CH_CATS[it.c].slice(2).trim()}</span>`:''}</span>
        <span style="font-family:var(--mono);font-size:12.5px">${money(it.amt)}</span></span>`).join('')}
      <span style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;padding-top:9px"><span>Total</span><span style="font-family:var(--mono)">${money(x.amt)}</span></span>
      ${Number(x.dep||0)>0?`<span style="display:flex;justify-content:space-between;font-size:11.5px;color:${Number(x.paid||0)>=Number(x.dep)-0.005?'var(--moss)':'#B0761F'};padding-top:3px"><span>Deposit ${Number(x.paid||0)>=Number(x.dep)-0.005?'✓ received':'— due at booking'}</span><span style="font-family:var(--mono)">${money(x.dep)}</span></span>`:''}
      <span style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--moss);padding-top:2px"><span>Paid to date</span><span style="font-family:var(--mono)">− ${money(x.paid||0)}</span></span>
      <span style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:${settled?'var(--moss)':'var(--clay)'};border-top:1.5px solid var(--ink);margin-top:6px;padding-top:6px"><span>${settled?'Settled — thank you':'Balance due'}</span><span style="font-family:var(--mono)">${money(Math.max(bal,0))}</span></span>
    </span>
  </span>`;
}
window.setCruCur=function(v){
  try{localStorage.setItem('jt_cru_cur',v);}catch(e){}
  if(v!=='USD'&&!(window._cruFx&&window._cruFx[v])){
    fetch('https://latest.currency-api.pages.dev/v1/currencies/usd.json')
      .then(r=>r.json())
      .then(d=>{
        window._cruFx=window._cruFx||{};
        [['cad','CAD'],['nzd','NZD'],['krw','KRW']].forEach(([k,K])=>{ if(d&&d.usd&&d.usd[k])window._cruFx[K]=d.usd[k]; });
        render();
      })
      .catch(()=>{ flash('Rate fetch failed — showing USD','err'); render(); });
  }
  render();
};
window._editCharge=null;
window.addCharge=function(){
  const g=i=>document.getElementById(i);
  const msg=g('ch_msg');
  const desc=g('ch_desc').value.trim();
  if(!desc){if(msg)msg.textContent='Description needed.';g('ch_desc').focus();return;}
  // An amount on a line is enough — a blank detail inherits its category name.
  const items=window._chItems
    .map(x=>({c:x.c||'other',d:String(x.d||'').trim(),amt:Number(x.amt)}))
    .filter(x=>isFinite(x.amt)&&x.amt>0)
    .map(x=>({...x,d:x.d||(CH_CATS[x.c]||CH_CATS.other).slice(2).trim()}));
  const amt=items.length?items.reduce((a,x)=>a+x.amt,0):Number(g('ch_amt').value);
  if(!(amt>0)){if(msg)msg.textContent='Add an amount on a line item, or a single total.';g(items.length?'ch_desc':'ch_amt').focus();return;}
  const dep=Number(g('ch_dep')?g('ch_dep').value:0);
  overrides.charges=overrides.charges||[];
  if(window._editCharge){
    const x=overrides.charges.find(c=>c.id===window._editCharge);
    window._editCharge=null;
    if(x){
      x.uid=g('ch_uid').value;x.kind=g('ch_kind').value;x.desc=desc;
      x.amt=Number(amt.toFixed(2));
      x.paid=Math.min(Number(x.paid||0),x.amt);     // keep payments, clamped to the new total
      if(dep>0)x.dep=Number(Math.min(dep,x.amt).toFixed(2)); else delete x.dep;
      if(items.length)x.items=items; else delete x.items;
    }
  }else{
    const rec={id:'c'+Date.now(),uid:g('ch_uid').value,kind:g('ch_kind').value,desc,amt:Number(amt.toFixed(2)),paid:0};
    if(dep>0)rec.dep=Number(Math.min(dep,amt).toFixed(2));
    if(items.length)rec.items=items;
    overrides.charges.push(rec);
  }
  window._chItems=[];
  saveOverrides();render();
};
window.editCharge=function(id){
  const x=(overrides.charges||[]).find(c=>c.id===id);
  if(!x)return;
  window._editCharge=id;
  window._chItems=(x.items||[]).map(it=>({c:it.c||'other',d:it.d,amt:it.amt}));
  render();                                   // paints the form + item rows
  const g=i=>document.getElementById(i);
  if(g('ch_uid'))g('ch_uid').value=x.uid;
  if(g('ch_kind'))g('ch_kind').value=x.kind;
  if(g('ch_desc'))g('ch_desc').value=x.desc;
  if(g('ch_dep'))g('ch_dep').value=x.dep||'';
  if(g('ch_amt'))g('ch_amt').value=x.items?'':x.amt;
  updateChTotal();
  g('ch_desc').scrollIntoView({behavior:'smooth',block:'center'});
};
window.setChargePaid=function(id,v){
  const x=(overrides.charges||[]).find(c=>c.id===id);
  if(!x)return;
  x.paid=Math.min(Math.max(Number(v)||0,0),Number(x.amt));
  saveOverrides();render();
};
window.delCharge=function(id){
  const x=(overrides.charges||[]).find(c=>c.id===id);
  if(x&&confirm('Remove this charge to '+x.desc+'?')){
    overrides.charges=(overrides.charges||[]).filter(c=>c.id!==id);
    saveOverrides();render();
  }
};
function quoteListNow(){
  const q=overrides.quotes;
  if(Array.isArray(q))return q;
  if(q&&typeof q==='object')return Object.entries(q).filter(([k,v])=>v&&Number(v.q)>0).map(([k,v])=>({id:'mig_'+k,cat:k,ppl:2,q:Number(v.q),img:v.img||''}));
  return [];
}
window._editQuote=null;
window.addQuote=function(){
  const g=i=>document.getElementById(i);
  const amt=Number(g('qt_amt').value);
  if(!(amt>0)){g('qt_amt').focus();return;}
  overrides.quotes=quoteListNow();
  const fields={cat:g('qt_cat').value,ppl:Math.min(4,Math.max(2,Number(g('qt_ppl').value)||2)),q:Number(amt.toFixed(2)),img:g('qt_img').value.trim()};
  if(window._editQuote){
    const q=overrides.quotes.find(x=>x.id===window._editQuote);
    window._editQuote=null;
    if(q)Object.assign(q,fields);
  }else{
    overrides.quotes.push({id:'qt'+Date.now(),...fields});
  }
  saveOverrides();render();
};
window.editQuote=function(id){
  const q=quoteListNow().find(x=>x.id===id);
  if(!q)return;
  overrides.quotes=quoteListNow();      // pin the migrated array so the edit lands on it
  window._editQuote=id;
  render();
  const g=i=>document.getElementById(i);
  g('qt_cat').value=q.cat;g('qt_ppl').value=String(q.ppl||2);g('qt_amt').value=q.q;g('qt_img').value=q.img||'';
  g('qt_amt').scrollIntoView({behavior:'smooth',block:'center'});
};
window.delQuote=function(id){
  overrides.quotes=quoteListNow().filter(x=>x.id!==id);
  saveOverrides();render();
};
window.reqChange=function(){
  const g=i=>document.getElementById(i);
  const me=(window._cru||{}).uid;
  const rooms=overrides.rooms||[];
  const mine=rooms.find(r=>(r.slots||[]).includes(me));
  if(!mine||!g('rq_to'))return;
  if(mine.locked){flash('This room is locked — type changes are closed','err');return;}
  overrides.reqs=(overrides.reqs||[]).filter(r=>!(r.uid===me&&r.status==='pending'));
  overrides.reqs.push({id:'q'+Date.now(),uid:me,rid:mine.id,from:mine.cat,to:g('rq_to').value,
    note:g('rq_note')?g('rq_note').value.trim():'',ts:Date.now(),status:'pending'});
  saveOverrides();render();
};
window.requestRoom=function(){
  const g=i=>document.getElementById(i);
  const me=(window._cru||{}).uid;
  if(!me||!g('rn_to'))return;
  const inRoom=(overrides.rooms||[]).some(r=>(r.slots||[]).includes(me));
  if(inRoom){flash('You already have a room — use the change request instead','err');render();return;}
  overrides.reqs=(overrides.reqs||[]).filter(r=>!(r.uid===me&&r.status==='pending'));
  overrides.reqs.push({id:'q'+Date.now(),uid:me,kind:'new',to:g('rn_to').value,
    ppl:Math.min(4,Math.max(2,Number(g('rn_ppl')?g('rn_ppl').value:2)||2)),
    note:g('rn_note')?g('rn_note').value.trim():'',ts:Date.now(),status:'pending'});
  saveOverrides();render();
};
window.cancelReq=function(id){
  overrides.reqs=(overrides.reqs||[]).filter(r=>r.id!==id);
  saveOverrides();render();
};
window.toggleRoomLock=function(id){
  const r=(overrides.rooms||[]).find(x=>x.id===id);
  if(!r)return;
  r.locked=!r.locked;
  saveOverrides();render();
};
window.decideReq=function(id,ok){
  const r=(overrides.reqs||[]).find(x=>x.id===id);
  if(!r)return;
  if(ok){
    if(r.kind==='new'){
      // Approval creates the room with the requester already in slot 1.
      const cap=Math.min(4,Math.max(2,Number(r.ppl)||2));
      overrides.rooms=overrides.rooms||[];
      overrides.rooms.forEach(rr=>{rr.slots=(rr.slots||[]).map(u=>u===r.uid?null:u);});
      const slots=Array.from({length:cap},()=>null); slots[0]=r.uid;
      overrides.rooms.push({id:'r'+Date.now(),num:'',cat:r.to,note:'',cap,slots});
    }else{
      const room=(overrides.rooms||[]).find(x=>x.id===r.rid);
      if(room)room.cat=r.to;        // the approval IS the change
    }
    r.status='approved';
  }else r.status='denied';
  r.decided=Date.now();
  saveOverrides();render();
};
window._editRoom=null;
window.addRoom=function(){
  const g=i=>document.getElementById(i);
  const num=g('rm_num').value.trim();   // optional: cabin numbers often come later
  const cap=Math.min(4,Math.max(2,Number(g('rm_cap')?g('rm_cap').value:2)||2));
  overrides.rooms=overrides.rooms||[];
  if(window._editRoom){
    const r=overrides.rooms.find(x=>x.id===window._editRoom);
    if(r){
      const occupants=(r.slots||[]).filter(Boolean);
      if(occupants.length>cap){alert('This room has '+occupants.length+' people in it — move someone out before shrinking it to sleep '+cap+'.');return;}
      const slots=Array.from({length:cap},(_,i)=>((r.slots||[])[i])??null);
      // shrinking must not drop anyone: compact occupants into the remaining slots
      if(occupants.length&&slots.filter(Boolean).length<occupants.length){
        for(let i=0;i<cap;i++)slots[i]=occupants[i]??null;
      }
      Object.assign(r,{num,cat:g('rm_cat').value,note:g('rm_note').value.trim(),cap,slots});
    }
    window._editRoom=null;
  }else{
    overrides.rooms.push({id:'r'+Date.now(),num,cat:g('rm_cat').value,note:g('rm_note').value.trim(),cap,slots:Array.from({length:cap},()=>null)});
  }
  saveOverrides();render();
};
window.editRoom=function(id){
  const r=(overrides.rooms||[]).find(x=>x.id===id);
  if(!r)return;
  window._editRoom=id;render();
  const g=i=>document.getElementById(i);
  g('rm_num').value=r.num||'';g('rm_cat').value=r.cat;g('rm_note').value=r.note||'';
  if(g('rm_cap'))g('rm_cap').value=String(Number(r.cap)||((r.slots||[]).length)||2);
  g('rm_num').scrollIntoView({behavior:'smooth',block:'center'});
};
window.delRoom=function(id){
  const rooms=(overrides.rooms||[]);
  const r=rooms.find(x=>x.id===id);
  if(!r)return;
  const label='Room '+(rooms.indexOf(r)+1)+(r.num?' (Cabin '+r.num+')':'');
  const occupied=(r.slots||[]).filter(Boolean).length;
  if(!confirm('Remove '+label+(occupied?' and unassign '+occupied+' guest'+(occupied>1?'s':''):'')+'?'))return;
  overrides.rooms=(overrides.rooms||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
window.takeSlot=function(rid,i){
  const me=(window._cru||{}).uid;
  if(!me)return;
  overrides.rooms=overrides.rooms||[];
  const r=overrides.rooms.find(x=>x.id===rid);
  if(!r)return;
  r.slots=r.slots||[null,null];
  if(r.slots[i]){alert('Someone just took that slot.');render();return;}
  // one slot per person: release anything else held first
  overrides.rooms.forEach(rr=>{rr.slots=(rr.slots||[null,null]).map(u=>u===me?null:u);});
  r.slots[i]=me;
  saveOverrides();render();
};
window.leaveSlot=function(rid,i){
  const me=(window._cru||{}).uid, admin=cruRole()==='admin';
  const r=(overrides.rooms||[]).find(x=>x.id===rid);
  if(!r)return;
  if(r.slots[i]!==me&&!admin)return;
  if(r.slots[i]!==me&&admin&&!confirm('Clear this slot?'))return;
  r.slots[i]=null;
  saveOverrides();render();
};

/* Static stops from the trip file + anything added in the app. */
function stopsFor(c){
  if(!c||!c.stops)return (c&&c.stops)||[];
  const gone=overrides.removedStops||[];
  const base=gone.length?c.stops.filter(s=>!gone.includes(s.id)):c.stops;
  const extra=(overrides.stops||[]).filter(x=>x.city===c.id);
  return extra.length?base.concat(extra):base;
}
function findStop(id){
  const custom=(overrides.stops||[]).find(x=>x.id===id);
  if(custom)return {rec:custom,custom:true};
  for(const c of CITIES.filter(c=>c.stops)){
    const s=c.stops.find(x=>x.id===id);
    if(s)return {rec:{...s,city:c.id},custom:false};
  }
  return null;
}
function allCityStops(){ return CITIES.filter(c=>c.stops).flatMap(c=>stopsFor(c)); }

function renderSide(c){
  const hotel=HOTELS[c.hotel];
  const total=stopsFor(c).reduce((a,s)=>a+(Number(eff(s).jpy)||0),0);
  const spent=stopsFor(c).reduce((a,s)=>a+(Number(eff(s).actualJpy)||0),0);
  const visPois=c.pois.map((p,i)=>({...p,i})).filter(p=>cat==='all'||p.c===cat);
  document.getElementById('side').innerHTML=`
    ${renderPlansCard(c)}
    <div class="card"><div class="chead"><span>Meals</span><span>Plan ${CUR.sym}${total.toLocaleString()}${spent?` · Spent ${CUR.sym}${spent.toLocaleString()}`:''}</span></div>${stopsFor(c).map(mealCard).join('')||`<div style="padding:11px 13px;font-size:12px;color:var(--grey)">No restaurants yet — turn on Developer mode in the sidebar and use the Add restaurant tab.</div>`}</div>
    <div class="card"><div class="chead"><span>Getting there & away</span></div>
      ${c.legs.map(l=>`<div class="leg"><div class="lr">${l.r}</div><div class="lm">${l.m}</div><div class="note">${l.n}</div></div>`).join('')}</div>
    ${c.lounges?`<div class="card"><div class="chead"><span>Airport lounges</span><span>with Amex Plat / Priority Pass</span></div>
      ${c.lounges.map(l=>`<div class="leg"><div class="lr">${esc(l.n)}</div><div class="lm">${esc(l.loc)}</div><div class="note warn">${esc(l.access)}</div><div class="note">${esc(l.note)}</div></div>`).join('')}</div>`:''}
    <div class="card js-lc-wx"><div class="chead"><span>Weather · ${c.city}</span></div>
      <div id="wxbody" style="padding:10px 12px;"><div class="note">Loading forecast…</div></div></div>
    <div class="card hotel-card js-lc-hotel"><div class="chead"><span>Hotel</span></div><dl>
      <dt>Name</dt><dd><b>${hotel.n}</b></dd>
      <dt>Address</dt><dd>${hotel.addr}</dd>
      <dt>Nearest station</dt><dd>${hotel.stn}</dd>
      <dt>Phone</dt><dd><a href="tel:${hotel.tel.replace(/[^+\d]/g,'')}">${hotel.tel}</a></dd>
      <dt>Email</dt><dd>${hotel.mail.includes('@')?`<a href="mailto:${hotel.mail}">${hotel.mail}</a>`:hotel.mail}</dd>
      <dt>Note</dt><dd>${hotel.note}</dd></dl></div>
    <div class="card js-lc-metro"><div class="chead"><span>Getting around</span></div>
      <div class="metro">${c.metro.map(m=>`<div class="row"><b>${m[0]}</b><br>${m[1]}</div>`).join('')}</div></div>
    <div class="card"><div class="chead"><span>While you're there</span><span>◆ on map</span></div>
      <div class="chips">
        <button class="chip ${cat==='all'?'on':''}" data-cat="all">All</button>
        ${Object.entries(CAT).map(([k,l])=>`<button class="chip ${cat===k?'on':''}" data-cat="${k}">${l}</button>`).join('')}
      </div>
      <div class="poi-list">${visPois.map(p=>`<div class="prow ${selPoi===p.i?'on':''}" data-poi="${p.i}">
        <span class="icon">${p.ic}</span><span><b>${p.n}</b> — ${p.d} <span class="anchor">· near ${p.a}</span></span></div>`).join('')||'<div style="padding:8px 0;font-size:12px;color:var(--grey)">Nothing in this category here.</div>'}</div></div>`;

  placeLeftCards();

  document.querySelectorAll('.chip').forEach(ch=>ch.onclick=()=>{cat=ch.dataset.cat;selPoi=null;render();});
  document.querySelectorAll('.prow').forEach(el=>el.onclick=()=>{
    selPoi=+el.dataset.poi;sel=null;
    if(!showPoi){showPoi=true;render();return;}
    renderSide(c);refreshIcons(c);
    const mk=markers['p'+selPoi];if(mk){map.panTo(mk.getLatLng());mk.openPopup();}});
  document.querySelectorAll('.meal').forEach(el=>el.onclick=e=>{
    if(e.target.matches('input,select,textarea,option,label'))return;
    sel=+el.dataset.n;selPoi=null;renderSide(c);refreshIcons(c);
    const mk=markers['m'+sel];if(mk){map.panTo(mk.getLatLng());mk.openPopup();}});
  const onRow=document.querySelector('.prow.on');
  if(onRow)onRow.scrollIntoView({block:'nearest'});

  document.querySelectorAll('[data-f]').forEach(inp=>{inp.onchange=()=>{
    const id=+inp.dataset.id, f=inp.dataset.f;
    overrides[id]=overrides[id]||{};
    overrides[id][f]=(f==='jpy'||f==='actualJpy')?Number(inp.value):inp.value;
    if(f==='actualJpy'||f==='actualCard') syncMealExpense(id);
  };});

  loadWeather(c.id);
}

function syncMealExpense(id){
  const stop = allCityStops().find(s=>s.id===id);
  if(!stop) return;
  const o = overrides[id]||{};
  overrides.expenses = overrides.expenses||[];
  const i = overrides.expenses.findIndex(e=>e.mid===id);

  // Cleared the field → remove the linked expense
  if(!o.actualJpy){ if(i>-1) overrides.expenses.splice(i,1); saveOverrides(); return; }

  const card = o.actualCard || 'AMEX Platinum';
  const usdVal = Number((Number(o.actualJpy)/liveRate).toFixed(2));
  const prev = i>-1 ? overrides.expenses[i] : null;
  const prevPaid = prev ? (prev.paidUsd!==undefined ? Number(prev.paidUsd) : (prev.paid ? Number(prev.usd) : 0)) : 0;
  const paidUsd = card==='Cash' ? usdVal : Math.min(prevPaid, usdVal);
  const exp = {
    mid: id,
    date: (((typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{}).depart||[2026])[0] + '-' + stop.d.split(' ')[0].replace('/','-'),
    usd: usdVal.toFixed(2),
    cat: 'Food',
    card,
    desc: stop.name,
    paidUsd,
    paid: paidUsd >= usdVal - 0.005
  };
  if(i>-1) overrides.expenses[i]=exp; else overrides.expenses.push(exp);
  saveOverrides();
}

function vaultRow(key,label,sub){
  const v=esc((overrides.vault||{})[key]||'');
  return `<div style="display:flex;gap:10px;align-items:center;border-bottom:1px dotted var(--rule);padding:8px 0;flex-wrap:wrap;">
    <div style="flex:1;min-width:180px;">
      <div style="font-family:var(--serif);font-size:13.5px;font-weight:700;">${label}</div>
      <div style="font:9.5px var(--mono);color:var(--grey);">${sub}</div>
    </div>
    <input data-vault="${key}" value="${v}" placeholder="conf # / seats / notes"
      style="flex:1;min-width:160px;font:12px var(--mono);border:1px solid var(--rule);border-radius:2px;padding:6px 8px;background:#fff;">
  </div>`;
}

/* ---------------- PRIVACY LOCK (casual, not real security) ---------------- */
window._lockRetry=false;

function renderVault(){
  const meals=CITIES.filter(c=>c.stops).flatMap(c=>stopsFor(c).map(s=>({...s,cityName:c.city})));
  const sec=t=>`<div style="font:600 10px var(--mono);color:var(--indigo);text-transform:uppercase;margin:14px 0 4px;">${t}</div>`;
  panel.innerHTML=`<div class="card" style="max-width:850px;margin:0 auto;">
    <div class="chead"><span>Reservation Vault</span><span>saves on blur · syncs to cloud</span></div>
    <div style="padding:8px 16px 16px;">
      ${(((typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{}).vault||[]).map(([title,rows])=>sec(title)+rows.map(r=>vaultRow(r[0],r[1],r[2])).join('')).join('')}
      ${sec('Hotels')}
      ${Object.entries(HOTELS).map(([k,h])=>vaultRow('h_'+k,h.n,'confirmation # · Bonvoy/Hyatt member #')).join('')}
      ${sec('Restaurants')}
      ${meals.map(s=>vaultRow('m_'+s.id,`${s.id}. ${s.name}`,`${s.d} · ${s.m} · ${s.cityName}`)).join('')}
    </div></div>`;
  panel.querySelectorAll('[data-vault]').forEach(inp=>{
    inp.onchange=()=>{
      overrides.vault=overrides.vault||{};
      overrides.vault[inp.dataset.vault]=inp.value;
      saveOverrides();
    };
  });
}

function renderExpenses() {
  const exps = overrides.expenses || [];

  // Partial-payment helpers: paidUsd (number) is the source of truth; legacy boolean `paid` still honored
  const paidAmt = e => {
    if (e.paidUsd !== undefined && e.paidUsd !== '') return Math.min(Number(e.paidUsd), Number(e.usd));
    return e.paid ? Number(e.usd) : 0;          // legacy boolean fallback
  };
  const isFullyPaid = e => paidAmt(e) >= Number(e.usd) - 0.005;

  const isPlanned = e => e.planned === true;
  const actuals = exps.filter(e => !isPlanned(e));
  const plannedExps = exps.filter(isPlanned);
  const plannedTotal = plannedExps.reduce((s, e) => s + Number(e.usd), 0);

  const total = actuals.reduce((sum, e) => sum + Number(e.usd), 0);
  const totalPaid = actuals.reduce((sum, e) => sum + paidAmt(e), 0);
  const totalUnpaid = Math.max(0, total - totalPaid);
  const paidPct = total > 0 ? Math.min(100, (totalPaid / total) * 100) : 0;

  // Budget vs. actual — meal plan (live, respects your edits) vs. logged Food + POI & Cafe spend
  const mealBudgetJpy = allCityStops()
      .reduce((a,s)=>a+Number(eff(s).jpy),0);
  const mealBudgetUsd = mealBudgetJpy / liveRate;
  const foodSpentUsd  = actuals.filter(e=>e.cat==="Food"||e.cat==="POI & Cafe")
      .reduce((a,e)=>a+Number(e.usd),0);
  const foodPct  = mealBudgetUsd>0 ? Math.min(100,(foodSpentUsd/mealBudgetUsd)*100) : 0;
  const foodOver = foodSpentUsd > mealBudgetUsd;
  
  const cats = ["Food", "POI & Cafe", "Shinkansen", "Transit", "Hotel", "Flight", "Omiyage", "Other"];
  const cards = ["AMEX Platinum", "AMEX Gold", "AMEX Bonvoy Brilliant", "Capital One Venture X", "United Quest", "Cash"];

  // Calculate summaries
  const catTotals = {};
  cats.forEach(c => catTotals[c] = 0);
  const cardTotals = {};
  cards.forEach(c => cardTotals[c] = { paid: 0, unpaid: 0, total: 0 });

  actuals.forEach(e => {
    const amt = Number(e.usd);
    if(catTotals[e.cat] !== undefined) catTotals[e.cat] += amt;
    if(cardTotals[e.card] !== undefined) {
      const p = paidAmt(e);
      cardTotals[e.card].total  += amt;
      cardTotals[e.card].paid   += p;
      cardTotals[e.card].unpaid += (amt - p);
    }
  });

  panel.innerHTML = `<div class="card" style="max-width:850px; margin: 0 auto;">
    <div class="chead"><span>Expense Tracker</span><span>Total: $${total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${plannedTotal>0.005?` · +$${plannedTotal.toLocaleString('en-US',{minimumFractionDigits:2})} planned`:''}</span></div>

    <div style="padding:12px 16px; border-bottom:1px solid var(--rule);">
      <div style="display:flex; justify-content:space-between; font:600 10px var(--mono); text-transform:uppercase; margin-bottom:6px;">
        <span style="color:var(--moss);">Paid $${totalPaid.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
        <span style="color:${totalUnpaid>0.005?'var(--clay)':'var(--moss)'};">${totalUnpaid>0.005?'Unpaid $'+totalUnpaid.toLocaleString('en-US',{minimumFractionDigits:2}):'All settled ✓'}</span>
      </div>
      <div style="height:6px; background:var(--washi2); border-radius:3px; overflow:hidden;">
        <div style="height:100%; width:${paidPct}%; background:var(--moss); transition:width .3s;"></div>
      </div>
      <div style="font:9px var(--mono); color:var(--grey); margin-top:5px;">
        Settled ${paidPct.toFixed(0)}% of $${total.toLocaleString('en-US',{minimumFractionDigits:2})} · partials counted at their paid amount
      </div>
    </div>

    <div style="padding:12px 16px; border-bottom:1px solid var(--rule);">
      <div style="display:flex; justify-content:space-between; font:600 10px var(--mono); text-transform:uppercase; margin-bottom:6px;">
        <span style="color:var(--indigo);">Food budget vs. actual</span>
        <span style="color:${foodOver?'var(--clay)':'var(--moss)'};">
          $${foodSpentUsd.toLocaleString('en-US',{minimumFractionDigits:2})} of ~$${mealBudgetUsd.toLocaleString('en-US',{maximumFractionDigits:0})}
          ${foodOver?'· OVER':''}
        </span>
      </div>
      <div style="height:6px; background:var(--washi2); border-radius:3px; overflow:hidden;">
        <div style="height:100%; width:${foodPct}%; background:${foodOver?'var(--clay)':foodPct>80?'#C9A227':'var(--moss)'}; transition:width .3s;"></div>
      </div>
      <div style="font:9px var(--mono); color:var(--grey); margin-top:5px;">
        Budget = your ${allCityStops().length} planned meals (${CUR.sym}${mealBudgetJpy.toLocaleString()})${CUR.code==='USD'?'':" at today's rate"} · counts Food + POI & Cafe expenses
      </div>
    </div>
    
    <div style="display:flex; gap:24px; padding:16px; border-bottom:1px solid var(--rule); background:var(--washi2); flex-wrap:wrap;">
      <div style="flex:1; min-width:200px;">
        <div style="font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase; margin-bottom:8px;">By Category</div>
        ${cats.filter(c => catTotals[c] > 0).map(c => `
          <div style="display:flex; justify-content:space-between; font-size:12px; border-bottom:1px dotted var(--rule); padding:5px 0;">
            <span>${c}</span> <b>$${catTotals[c].toLocaleString('en-US', {minimumFractionDigits: 2})}</b>
          </div>`).join('') || '<div style="font-size:11px; color:var(--grey);">No data yet.</div>'}
      </div>
      <div style="flex:1.5; min-width:250px;">
        <div style="font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase; margin-bottom:8px;">By Card</div>
        ${cards.filter(c => cardTotals[c].total > 0).map(c => `
          <div style="display:flex; justify-content:space-between; font-size:12px; border-bottom:1px dotted var(--rule); padding:5px 0; align-items:flex-start;">
            <span>${c}</span> 
            <span style="text-align:right;">
              <b>$${cardTotals[c].total.toLocaleString('en-US', {minimumFractionDigits: 2})}</b><br>
              <span style="font-size:9.5px; font-family:var(--mono); color:var(--moss);">${cardTotals[c].paid > 0.005 ? 'PAID: $' + cardTotals[c].paid.toLocaleString('en-US', {minimumFractionDigits: 2}) : ''}</span>
              ${cardTotals[c].paid > 0.005 && cardTotals[c].unpaid > 0.005 ? ' <span style="color:var(--grey)">|</span> ' : ''}
              <span style="font-size:9.5px; font-family:var(--mono); color:var(--clay);">${cardTotals[c].unpaid > 0.005 ? 'UNPAID: $' + cardTotals[c].unpaid.toLocaleString('en-US', {minimumFractionDigits: 2}) : ''}</span>
            </span>
          </div>`).join('') || '<div style="font-size:11px; color:var(--grey);">No data yet.</div>'}
      </div>
    </div>

    <div style="padding:16px;">
      <form id="expForm" data-edit-idx="" style="display:flex; flex-wrap:wrap; gap:12px; margin-bottom:24px; align-items:flex-end; background:rgba(34,64,107,.04); padding:12px; border:1px solid var(--rule); border-radius:2px;">
        
        <label style="flex:1; min-width:110px; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">Date<br>
          <input type="date" id="exDate" required style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;">
        </label>

        <div style="flex:1.5; min-width:160px; display:flex; gap:6px;">
          <label style="flex:1; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">${CUR.sym} ${CUR.code}<br>
            <input type="number" id="exJpy" style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;" placeholder="0">
          </label>
          <label style="flex:1; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">$ USD<br>
            <input type="number" step="0.01" id="exUsd" required style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;" placeholder="0.00">
          </label>
        </div>
        
        <label style="flex:1; min-width:110px; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">Category<br>
          <select id="exCat" style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;">
            ${cats.map(c=>`<option>${c}</option>`).join('')}
          </select>
        </label>
        
        <label style="flex:1.5; min-width:130px; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">Card Used<br>
          <select id="exCard" style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;">
            ${cards.map(c=>`<option>${c}</option>`).join('')}
          </select>
        </label>
        
        <label style="flex:2; min-width:150px; font:600 10px var(--mono); color:var(--indigo); text-transform:uppercase;">Description<br>
          <input type="text" id="exDesc" required style="width:100%; font:inherit; font-size:12px; border:1px solid var(--rule); border-radius:2px; padding:6px; margin-top:4px; background:#fff;" placeholder="e.g., Cat collars for Simba & Ahri">
        </label>
        
        <label style="flex:0 0 auto; font:600 10px var(--mono); color:#B08A1F; text-transform:uppercase; display:flex; align-items:center; gap:5px; height:30px; cursor:pointer;">
          <input type="checkbox" id="exPlanned" style="width:14px; height:14px; accent-color:#B08A1F;"> Planned
        </label>

        <button id="expSubmitBtn" type="submit" style="font:600 11px var(--mono); text-transform:uppercase; letter-spacing:0.08em; background:var(--clay); color:#fff; border:none; padding:7px 14px; border-radius:2px; cursor:pointer; height:30px; transition: background 0.2s;">+ Add</button>
      </form>

      <div>
        ${exps.length === 0 ? '<div class="note">No expenses logged yet.</div>' : ''}
        ${(() => {
          const expRow = (e, i) => {
            const amt = Number(e.usd), p = paidAmt(e);
            const planned = isPlanned(e);
            const full = !planned && isFullyPaid(e), partial = !planned && p > 0.005 && !full;
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dotted var(--rule); padding:10px 0; ${full ? 'opacity:0.6;' : ''}">
              <div style="display:flex; align-items:center; gap:12px;">
                ${planned
                  ? `<span title="Planned estimate" style="width:16px; text-align:center; color:#B08A1F; font-size:13px;">◔</span>`
                  : `<input type="checkbox" ${full ? 'checked' : ''} onchange="togglePaid(${i}, this.checked)" title="Mark fully paid" style="width:16px; height:16px; accent-color:var(--moss); cursor:pointer;">`}
                <div>
                  <div style="font-family:var(--serif); font-size:15px; font-weight:700; color:var(--ink); ${full ? 'text-decoration:line-through;' : ''}">${esc(e.desc)}</div>
                  <div style="font-family:var(--mono); font-size:9.5px; color:var(--grey); margin-top:2px; text-transform:uppercase;">${e.date} · ${e.cat} · ${e.card}${e.pid?' · from day plan':''}${e.mid?' · from meal':''}</div>
                  ${partial ? `<div style="font:600 9.5px var(--mono); color:var(--clay); margin-top:2px;">PARTIAL · $${p.toFixed(2)} PAID · $${(amt - p).toFixed(2)} LEFT</div>` : ''}
                  ${planned ? `<div style="font:600 9.5px var(--mono); color:#B08A1F; margin-top:2px;">PLANNED ESTIMATE — not in totals</div>` : ''}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:12px;">
                ${planned
                  ? `<button onclick="setExpPlanned(${i}, false)" style="font:600 9px var(--mono); letter-spacing:.05em; text-transform:uppercase; border:1.5px solid var(--moss); background:none; color:var(--moss); border-radius:2px; padding:5px 8px; cursor:pointer;">✓ Make actual</button>`
                  : `<label style="font:600 8.5px var(--mono); color:var(--grey); text-transform:uppercase; text-align:right;">Paid $<br>
                      <input type="number" step="0.01" min="0" max="${amt}" value="${p > 0.005 ? p.toFixed(2) : ''}" placeholder="0"
                        onchange="setPaidAmt(${i}, this.value)"
                        style="width:72px; font:12px var(--mono); border:1px solid var(--rule); border-radius:2px; padding:3px 5px; text-align:right; background:#fff; margin-top:2px;">
                    </label>`}
                <div style="font-family:var(--mono); font-weight:700; color:${planned?'#B08A1F':'var(--indigo)'}; font-size:14px;">$${amt.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                <div style="display:flex; gap:6px;">
                  <button onclick="editExp(${i})" title="Edit" style="background:none; border:none; color:var(--indigo); cursor:pointer; font-size:14px; padding:0 4px;">✎</button>
                  <button onclick="deleteExp(${i})" title="Delete" style="background:none; border:none; color:var(--clay); cursor:pointer; font-size:18px; line-height:1; padding:0 4px;">×</button>
                </div>
              </div>
            </div>`;
          };
          const idxed = exps.map((e,i)=>({e,i}));
          const actualRows = idxed.filter(x=>!isPlanned(x.e)).reverse().map(x=>expRow(x.e,x.i)).join('');
          const plannedRows = idxed.filter(x=>isPlanned(x.e)).reverse().map(x=>expRow(x.e,x.i)).join('');
          return actualRows + (plannedRows ? `
            <div style="margin-top:18px; padding:8px 0 4px; border-top:2px solid var(--rule); display:flex; justify-content:space-between; font:600 10px var(--mono); letter-spacing:.1em; text-transform:uppercase;">
              <span style="color:#B08A1F;">◔ Planned expenses — estimates</span>
              <span style="color:#B08A1F;">$${plannedTotal.toLocaleString('en-US',{minimumFractionDigits:2})}</span>
            </div>
            <div style="font:9px var(--mono); color:var(--grey); margin-bottom:4px;">Not counted in totals, categories, cards, or the budget bar. Edit the amount to the real figure, then hit "✓ Make actual" once paid.</div>
            ${plannedRows}` : '');
        })()}
      </div>
    </div>
  </div>`;

  // Pre-fill date
  document.getElementById('exDate').value = new Date().toISOString().split('T')[0];

  // Auto-calculate JPY to USD at the live rate
  document.getElementById('exJpy').addEventListener('input', (e) => {
    if(e.target.value) {
      document.getElementById('exUsd').value = (Number(e.target.value) / liveRate).toFixed(2);
    } else {
      document.getElementById('exUsd').value = '';
    }
  });

  // Handle Add/Update submission
  document.getElementById('expForm').onsubmit = (ev) => {
    ev.preventDefault();
    overrides.expenses = overrides.expenses || [];
    const form = document.getElementById('expForm');
    const idx = form.dataset.editIdx;

    const newExp = {
      date: document.getElementById('exDate').value,
      usd: document.getElementById('exUsd').value,
      cat: document.getElementById('exCat').value,
      card: document.getElementById('exCard').value,
      desc: document.getElementById('exDesc').value,
      planned: document.getElementById('exPlanned').checked
    };

    if (idx !== "") { // We are UPDATING an existing expense
      const prev = overrides.expenses[idx];
      if (prev.mid !== undefined) newExp.mid = prev.mid;                    // keep meal link
      if (prev.pid !== undefined) newExp.pid = prev.pid;                    // keep day-plan link
      const prevPaid = prev.paidUsd !== undefined ? Number(prev.paidUsd) : (prev.paid ? Number(prev.usd) : 0);
      newExp.paidUsd = newExp.card === 'Cash' ? Number(newExp.usd) : Math.min(prevPaid, Number(newExp.usd));
      overrides.expenses[idx] = newExp;
      form.dataset.editIdx = ""; // Reset edit mode
    } else { // We are ADDING a new expense
      newExp.paidUsd = newExp.card === 'Cash' ? Number(newExp.usd) : 0;   // cash = settled instantly
      overrides.expenses.push(newExp);
    }
    if (newExp.planned) { newExp.paidUsd = 0; }
    newExp.paid = newExp.paidUsd >= Number(newExp.usd) - 0.005;

    saveOverrides();
    renderExpenses();
  };
}

// Global Handlers
window.deleteExp = function(idx) {
  if(!confirm("Delete this expense?")) return;
  overrides.expenses.splice(idx, 1);
  saveOverrides();
  renderExpenses();
};

window.togglePaid = function(idx, isChecked) {
  const e = overrides.expenses[idx];
  e.paidUsd = isChecked ? Number(e.usd) : 0;
  e.paid = isChecked;
  saveOverrides();
  renderExpenses();
};

window.setPaidAmt = function(idx, val) {
  const e = overrides.expenses[idx];
  const amt = Number(e.usd);
  const p = Math.max(0, Math.min(Number(val) || 0, amt));   // clamp 0..total
  e.paidUsd = p;
  e.paid = p >= amt - 0.005;
  saveOverrides();
  renderExpenses();
};

window.setExpPlanned = function(idx, planned) {
  const e = overrides.expenses[idx];
  e.planned = planned === true;
  if (e.planned) { e.paidUsd = 0; e.paid = false; }
  else if (e.card === 'Cash') { e.paidUsd = Number(e.usd); e.paid = true; }
  saveOverrides();
  renderExpenses();
};

window.editExp = function(idx) {
  const e = overrides.expenses[idx];
  document.getElementById('exDate').value = e.date;
  document.getElementById('exUsd').value = e.usd;
  document.getElementById('exJpy').value = ''; // clear JPY since we saved in USD
  document.getElementById('exCat').value = e.cat;
  document.getElementById('exCard').value = e.card;
  document.getElementById('exDesc').value = e.desc;
  document.getElementById('exPlanned').checked = e.planned === true;

  // Change UI to "Update" mode
  const form = document.getElementById('expForm');
  const btn = document.getElementById('expSubmitBtn');
  form.dataset.editIdx = idx;
  btn.textContent = "✓ Update";
  btn.style.background = "var(--moss)";
  
  // Smooth scroll back up to the form
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

/* ---------------- TODAY VIEW ---------------- */

/* ---- STEP 2: trip-scoped static data ------------------------------------
   TRIP_DATA holds a reference to each trip's content. Opening a trip points
   the live bindings above at that trip's data. Only Japan exists so far, so
   this commit changes nothing a user can see. */


const TRIP_DATA=window.TRIPS_REGISTRY||{};

/* ================= JEJU GROUP MODULE =================
   A collaborative land trip: decisions (car/flights) with voting, a shared
   map+schedule everyone can pin, group-vs-personal money, and a file-links
   vault. Rides the same _cru session and role-aware merge as the cruise. */
function jjUsers(){ return groupUsers(tripKey()); }
function jjName(uid){ return uid==='admin'?appAdminName():((jjUsers().find(u=>u.uid===uid)||{}).name||'—'); }
function jjMoney(n){ return CUR.sym+Number(n||0).toLocaleString('en-US',{maximumFractionDigits:0}); }
function jjEveryone(){ return ['admin',...jjUsers().map(u=>u.uid)]; }

function renderJeju(c){
  if(!window._cru||!window._cru.uid){window._cru=appGroupSession(tripKey());if(!window._cru){backToTrips();return;}}
  const T=TRIP_DATA[tripKey()]||{};
  const admin=cruRole()==='admin';
  const me=(window._cru||{}).uid;
  const dates=tripDates();
  let body='';

  if(c.jjTab==='jsum'){
    const opts=overrides.options||[];
    const car=opts.find(o=>o.kind==='car'&&o.chosen), fl=opts.find(o=>o.kind==='flight'&&o.chosen);
    const links=(overrides.links||[]).length;
    const pins=(overrides.pins||[]).length;
    const st=T.stay||{};
    body=`
      <div class="card"><div class="chead"><span>🏨 Where we're staying — set</span></div>
        <div style="padding:12px 13px;font-size:13px"><b>${esc(st.n||'')}</b>
          <span style="display:block;font-size:11.5px;color:var(--grey);margin-top:3px">${esc(st.addr||'')} · ${esc(st.tel||'')}</span>
          <span style="display:block;font-size:12px;margin-top:6px">${esc(st.note||'')}</span></div>
      </div>
      <div class="card"><div class="chead"><span>🗳 Where we've landed</span><span>${admin?'you decide — everyone votes':'vote on the Decisions tab'}</span></div>
        <div class="tdo-row" onclick="gotoJjTab('jvote')" style="cursor:pointer"><span style="flex:0 0 26px;text-align:center">🚗</span>
          <span class="tdo-main"><span class="tdo-t">${car?esc(car.title)+' · '+jjMoney(car.cost):'Rental car — not decided yet'}</span></span><span style="color:var(--indigo2)">→</span></div>
        <div class="tdo-row" onclick="gotoJjTab('jvote')" style="cursor:pointer"><span style="flex:0 0 26px;text-align:center">✈️</span>
          <span class="tdo-main"><span class="tdo-t">${fl?esc(fl.title)+' · '+jjMoney(fl.cost):'Flights — not decided yet'}</span></span><span style="color:var(--indigo2)">→</span></div>
      </div>
      <div class="card"><div class="chead"><span>🧭 The trip so far</span></div>
        <div class="tdo-row" onclick="gotoJjTab('jsched')" style="cursor:pointer"><span class="tdo-main"><span style="font-size:12.5px">${pins} place${pins===1?'':'s'} pinned on the map</span></span><span style="color:var(--indigo2)">→</span></div>
        <div class="tdo-row" onclick="gotoJjTab('jlinks')" style="cursor:pointer"><span class="tdo-main"><span style="font-size:12.5px">${links} confirmation${links===1?'':'s'} filed</span></span><span style="color:var(--indigo2)">→</span></div>
      </div>`;
  }

  if(c.jjTab==='jvote'){
    const opts=overrides.options||[];
    const kinds=[['car','🚗 Rental car','company / class — e.g. Lotte Rent-a-Car · SUV'],['flight','✈️ Flights','route / airline — e.g. GMP→CJU · Korean Air 1207']];
    body=kinds.map(([kind,label,ph])=>{
      const list=opts.filter(o=>o.kind===kind);
      const chosen=list.find(o=>o.chosen);
      return `<div class="card"><div class="chead"><span>${label}</span><span>${chosen?'✓ decided':'collecting options'}</span></div>
        ${list.map(o=>{
          const n=Object.keys(o.votes||{}).length;
          const iVoted=!!(o.votes||{})[me];
          const voters=Object.keys(o.votes||{}).map(jjName).join(', ');
          return `<div class="tdo-row" style="${o.chosen?'background:rgba(94,127,76,.08)':''}">
            <span class="tdo-main"><span class="tdo-t">${o.chosen?'✓ ':''}${esc(o.title)}</span>
              <span class="tdo-desc" style="margin-left:10px">${jjMoney(o.cost)}${o.per==='pp'?' / person':' total'}${o.note?' · '+esc(o.note):''}${o.url?` · <a href="${esc(o.url)}" target="_blank" rel="noopener">link</a>`:''}
                · by ${esc(jjName(o.by))}${n?` · 👍 ${n} (${esc(voters)})`:''}</span></span>
            <button class="tdo-x" onclick="jjVote('${o.id}')" title="${iVoted?'Un-vote':'Vote for this'}" style="font-size:14px;${iVoted?'':'filter:grayscale(1);opacity:.55'}">👍</button>
            ${admin?`<button class="tdo-x" onclick="jjChoose('${o.id}')" title="${o.chosen?'Un-choose':'Choose this one'}" style="color:var(--moss);font:700 10px var(--mono)">${o.chosen?'undo':'✓ pick'}</button>`:''}
            ${(admin||o.by===me)?`<button class="tdo-x" onclick="jjDelOpt('${o.id}')" style="color:var(--clay);font-size:16px">×</button>`:''}
          </div>`;}).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">No options yet — add the first.</div>'}
        <div class="plform" style="border-top:1px solid var(--rule)">
          <input id="jo_t_${kind}" placeholder="${ph}" maxlength="70">
          <div class="plrow1">
            <input id="jo_c_${kind}" type="number" min="0" placeholder="${CUR.sym} cost">
            <select id="jo_p_${kind}"><option value="tot">total</option><option value="pp">per person</option></select>
            <input id="jo_u_${kind}" placeholder="link (optional)">
          </div>
          <input id="jo_n_${kind}" placeholder="Note (optional)" maxlength="80">
          <button class="pladd" type="button" onclick="jjAddOpt('${kind}')" style="align-self:flex-start;padding:8px 14px">+ Add option</button>
        </div>
      </div>`;}).join('')+`
      <div style="font:10.5px var(--mono);color:var(--grey);padding:2px 4px">Anyone adds options and votes; the organizer picks. The chosen CAR feeds the group pot; the chosen FLIGHT is individual — everyone books and pays their own, and it shows as a guide price under 'My own spending'.</div>`;
  }

  if(c.jjTab==='jsched'){
    const pins=(overrides.pins||[]).slice();
    body=`
      <div class="card"><div class="chead"><span>🗺 Our map</span><span>${pins.length} pinned</span></div>
        <div id="jjmap" style="height:330px"></div></div>
      <div class="card"><div class="chead"><span>＋ Pin a place</span><span>paste a Google Maps link</span></div>
        <div class="plform">
          <input id="jp_name" placeholder="Place name" maxlength="60">
          <input id="jp_url" placeholder="Google Maps link — coordinates are read from it automatically">
          <div class="plrow1">
            <select id="jp_day"><option value="">Any day</option>${dates.map(d=>`<option>${d}</option>`).join('')}</select>
            <input id="jp_time" placeholder="Time (optional)" maxlength="12">
            <select id="jp_cat"><option value="sight">⛰ Sight</option><option value="food">🍽 Food</option><option value="cafe">☕ Café</option><option value="other">📍 Other</option></select>
          </div>
          <input id="jp_note" placeholder="Note (optional)" maxlength="90">
          <button class="pladd" type="button" onclick="jjAddPin()" style="align-self:flex-start;padding:8px 14px">+ Pin it</button>
          <div class="plhint">Share → Copy link in Google Maps works; so does the browser URL with @lat,lng in it.</div>
        </div>
      </div>
      ${['',...dates].map(day=>{
        const list=pins.filter(p=>String(p.day||'')===day).sort((a,b)=>String(a.time||'').localeCompare(String(b.time||'')));
        if(!list.length)return '';
        return `<div class="card"><div class="chead"><span>${day?('5/'===day.slice(0,2)?day:day):'📍 Unscheduled ideas'}${day?' · '+({'5/10':'Wed — arrive','5/11':'Thu','5/12':'Fri','5/13':'Sat','5/14':'Sun — depart'}[day]||''):''}</span><span>${list.length}</span></div>
          ${list.map(p=>`<div class="tdo-row">
            <span style="flex:0 0 26px;text-align:center">${({sight:'⛰',food:'🍽',cafe:'☕',other:'📍'})[p.cat]||'📍'}</span>
            <span class="tdo-main"><span class="tdo-t">${esc(p.n)}</span>
              <span class="tdo-desc" style="margin-left:10px">${p.time?esc(p.time)+' · ':''}${p.note?esc(p.note)+' · ':''}by ${esc(jjName(p.by))} · <a href="${esc(p.url)}" target="_blank" rel="noopener">map</a></span></span>
            ${(admin||p.by===me)?`<button class="tdo-x" onclick="jjDelPin('${p.id}')" style="color:var(--clay);font-size:16px">×</button>`:''}
          </div>`).join('')}
        </div>`;}).join('')}`;
  }

  if(c.jjTab==='jexp'){
    const opts=overrides.options||[];
    const N=Math.max(1,Number(overrides.headcount)||Number(T.headcount)||jjEveryone().length);
    const chosenCosts=opts.filter(o=>o.chosen&&o.kind==='car').map(o=>({desc:'🚗 '+o.title,amt:o.per==='pp'?Number(o.cost)*N:Number(o.cost)}));
    const flightPick=opts.find(o=>o.chosen&&o.kind==='flight');
    const flightEach=flightPick?(flightPick.per==='pp'?Number(flightPick.cost):Number(flightPick.cost)/N):0;
    const gexp=(overrides.gexp||[]);
    const groupTotal=chosenCosts.reduce((a,x)=>a+x.amt,0)+gexp.reduce((a,x)=>a+Number(x.amt),0);
    const share=N?groupTotal/N:0;
    const paidBy={}; jjEveryone().forEach(u=>paidBy[u]=0);
    gexp.forEach(x=>{ paidBy[x.payer]=(paidBy[x.payer]||0)+Number(x.amt); });
    const mine=(overrides.cexp&&overrides.cexp[me])||[];
    const myPersonal=mine.reduce((a,x)=>a+Number(x.amt||0),0);
    body=`
      <div class="card"><div class="chead"><span>👥 Group pot</span><span style="display:flex;gap:7px;align-items:center">${jjMoney(groupTotal)} · ${jjMoney(share)}/person
        ${admin?`<span style="display:flex;gap:4px;align-items:center">÷ <input type="number" min="1" max="50" value="${N}" onchange="jjSetHead(this.value)" title="How many people the pot splits across" style="width:46px;font:600 11px var(--mono);border:1px solid var(--rule);border-radius:2px;padding:2px 4px;text-align:center;background:#fff"></span>`:`÷ ${N} people`}</span></div>
        ${chosenCosts.map(x=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(x.desc)}</span><span class="tdo-desc" style="margin-left:10px">decided on the Decisions tab</span></span><b style="font-family:var(--mono);font-size:12px">${jjMoney(x.amt)}</b></div>`).join('')}
        ${gexp.map(x=>`<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(x.desc)}</span><span class="tdo-desc" style="margin-left:10px">paid by ${esc(jjName(x.payer))}${x.note?' · '+esc(x.note):''}</span></span><b style="font-family:var(--mono);font-size:12px">${jjMoney(x.amt)}</b>
          ${(admin||x.by===me)?`<button class="tdo-x" onclick="jjDelGexp('${x.id}')" style="color:var(--clay);font-size:16px">×</button>`:''}</div>`).join('')||''}
        <div class="plform" style="border-top:1px solid var(--rule)">
          <div class="plrow1">
            <input id="jg_d" placeholder="Group expense — e.g. groceries, fuel" maxlength="60">
            <input id="jg_a" type="number" min="0" placeholder="${CUR.sym} amount">
            <select id="jg_p">${jjEveryone().map(u=>`<option value="${u}" ${u===me?'selected':''}>paid by ${esc(jjName(u))}</option>`).join('')}</select>
          </div>
          <button class="pladd" type="button" onclick="jjAddGexp()" style="align-self:flex-start;padding:8px 14px">+ Add group expense</button>
        </div>
      </div>
      <div class="card"><div class="chead"><span>⚖️ Who's paid what</span><span>even share = ${jjMoney(share)}</span></div>
        ${jjEveryone().map(u=>{const d=(paidBy[u]||0)-share;return `<div class="tdo-row"><span class="tdo-main"><span class="tdo-t">${esc(jjName(u))}</span>
          <span class="tdo-desc" style="margin-left:10px">paid ${jjMoney(paidBy[u]||0)}</span></span>
          <b style="font-family:var(--mono);font-size:11.5px;color:${d>=0?'var(--moss)':'var(--clay)'}">${d>=0?'+':''}${jjMoney(d)}</b></div>`;}).join('')}
        <div style="padding:8px 13px;font:10px var(--mono);color:var(--grey)">Split across ${N} people${N!==jjEveryone().length?` (${jjEveryone().length} with app accounts — people without accounts settle in cash with whoever fronted)`:''}. Positive = the group owes them; negative = they owe the pot. Chosen car/flight costs count into the pot but aren't assigned a payer until you log who actually paid, as a group expense.</div>
      </div>
      <div class="card"><div class="chead"><span>💳 My own spending</span><span>${jjMoney(myPersonal)}</span></div>
        ${flightPick?`<div class="tdo-row" style="background:rgba(74,110,158,.08)"><span style="flex:0 0 26px;text-align:center">✈️</span>
          <span class="tdo-main"><span class="tdo-t">${esc(flightPick.title)} — the chosen flight</span>
          <span class="tdo-desc" style="margin-left:10px">≈ ${jjMoney(flightEach)} each · book your own and log it here once paid</span></span></div>`:''}
        ${mine.map(x=>`<div class="tdo-row"><span class="tdo-date">${esc((x.date||'').slice(5))}</span><span class="tdo-main"><span class="tdo-t">${esc(x.desc)}</span></span><b style="font-family:var(--mono);font-size:12px">${jjMoney(x.amt)}</b>
          <button class="tdo-x" onclick="jjDelMy('${x.id}')" style="color:var(--clay);font-size:16px">×</button></div>`).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">Nothing yet — souvenirs, coffees, your own meals.</div>'}
        <div class="plform" style="border-top:1px solid var(--rule)">
          <div class="plrow1">
            <input id="jm_date" type="date" value="2027-05-10">
            <input id="jm_d" placeholder="What" maxlength="50">
            <input id="jm_a" type="number" min="0" placeholder="${CUR.sym}">
          </div>
          <button class="pladd" type="button" onclick="jjAddMy()" style="align-self:flex-start;padding:8px 14px">+ Add</button>
          <div class="plhint">Personal — only you see your own list; totals stay yours.</div>
        </div>
      </div>`;
  }

  if(c.jjTab==='jlinks'){
    const links=(overrides.links||[]).slice().sort((a,b)=>(b.ts||0)-(a.ts||0));
    body=`
      <div class="card"><div class="chead"><span>📁 Confirmations & files</span><span>Google Drive links</span></div>
        ${links.map(l=>`<div class="tdo-row">
          <span style="flex:0 0 26px;text-align:center">${l.url&&l.url.indexOf('drive.google')>-1?'🟢':'🔗'}</span>
          <span class="tdo-main"><span class="tdo-t"><a href="${esc(l.url)}" target="_blank" rel="noopener" style="color:var(--indigo)">${esc(l.t)}</a></span>
            <span class="tdo-desc" style="margin-left:10px">by ${esc(jjName(l.by))}</span></span>
          ${(admin||l.by===me)?`<button class="tdo-x" onclick="jjDelLink('${l.id}')" style="color:var(--clay);font-size:16px">×</button>`:''}
        </div>`).join('')||'<div style="padding:11px;font-size:12px;color:var(--grey)">Nothing filed yet — car confirmation, flight PDFs, the hotel booking.</div>'}
        <div class="plform" style="border-top:1px solid var(--rule)">
          <input id="jl_t" placeholder="What is it — e.g. Rental car confirmation" maxlength="60">
          <input id="jl_u" placeholder="Paste the Google Drive share link (Anyone with the link → Viewer)">
          <button class="pladd" type="button" onclick="jjAddLink()" style="align-self:flex-start;padding:8px 14px">+ File it</button>
          <div class="plhint">Links only — the file itself stays in Drive. Set sharing to 'Anyone with the link' so the group can open it.</div>
        </div>
      </div>`;
  }

  panel.innerHTML=`<div class="stack" style="max-width:760px;margin:0 auto">${body}</div>`;
  if(c.jjTab==='jsched'&&document.getElementById('jjmap'))drawJejuMap(T);
}

function drawJejuMap(T){
  map=L.map('jjmap',{scrollWheelZoom:false});
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'&copy; Esri'}).addTo(map);
  const pin=(emoji,size)=>L.divIcon({className:'',html:`<div style="font-size:${size||18}px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.4))">${emoji}</div>`,iconSize:[size||18,size||18],iconAnchor:[(size||18)/2,(size||18)/2]});
  const bounds=[];
  const st=T.stay;
  if(st&&st.lat){ L.marker([st.lat,st.lng],{icon:pin('🏨',22)}).addTo(map).bindPopup(`<b>${esc(st.n)}</b><br>home base`); bounds.push([st.lat,st.lng]); }
  (overrides.pins||[]).forEach(p=>{
    if(typeof p.lat!=='number')return;
    L.marker([p.lat,p.lng],{icon:pin(({sight:'⛰',food:'🍽',cafe:'☕',other:'📍'})[p.cat]||'📍',18)}).addTo(map)
      .bindPopup(`<b>${esc(p.n)}</b><br>${p.day?esc(p.day)+' · ':''}${p.time?esc(p.time)+' · ':''}by ${esc(jjName(p.by))}`);
    bounds.push([p.lat,p.lng]);
  });
  if(bounds.length)map.fitBounds(bounds,{padding:[30,30]}); else map.setView([33.38,126.53],10);
}

window.gotoJjTab=function(tab){
  const i=navCities().findIndex(x=>x.jjTab===tab);
  if(i>=0){ci=i;render();}
};
window.jjAddOpt=function(kind){
  const g=i=>document.getElementById(i);
  const t=g('jo_t_'+kind).value.trim();
  const cost=Number(g('jo_c_'+kind).value);
  if(!t){g('jo_t_'+kind).focus();return;}
  if(!(cost>=0)){g('jo_c_'+kind).focus();return;}
  overrides.options=(overrides.options||[]);
  overrides.options.push({id:'o'+Date.now(),kind,title:t,cost,per:g('jo_p_'+kind).value,url:g('jo_u_'+kind).value.trim(),note:g('jo_n_'+kind).value.trim(),by:(window._cru||{}).uid,ts:Date.now(),votes:{}});
  saveOverrides();render();
};
window.jjVote=function(id){
  const o=(overrides.options||[]).find(x=>x.id===id);
  if(!o)return;
  const me=(window._cru||{}).uid;
  o.votes=o.votes||{};
  if(o.votes[me])delete o.votes[me]; else o.votes[me]=1;
  saveOverrides();render();
};
window.jjChoose=function(id){
  const opts=overrides.options||[];
  const o=opts.find(x=>x.id===id);
  if(!o)return;
  const was=o.chosen;
  opts.forEach(x=>{ if(x.kind===o.kind)delete x.chosen; });
  if(!was)o.chosen=true;
  saveOverrides();render();
};
window.jjDelOpt=function(id){
  overrides.options=(overrides.options||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
window.jjAddPin=function(){
  const g=i=>document.getElementById(i);
  const n=g('jp_name').value.trim(), url=g('jp_url').value.trim();
  if(!n){g('jp_name').focus();return;}
  const ll=parseLatLng(url);
  if(!ll){flash('Could not read coordinates from that link — paste a Google Maps link','err');g('jp_url').focus();return;}
  overrides.pins=(overrides.pins||[]);
  overrides.pins.push({id:'p'+Date.now(),n,url,lat:ll.lat,lng:ll.lng,day:g('jp_day').value,time:g('jp_time').value.trim(),cat:g('jp_cat').value,note:g('jp_note').value.trim(),by:(window._cru||{}).uid,ts:Date.now()});
  saveOverrides();render();
};
window.jjDelPin=function(id){
  overrides.pins=(overrides.pins||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
window.jjSetHead=function(v){
  const n=Math.max(1,Math.min(50,Number(v)||1));
  overrides.headcount=n;
  saveOverrides();render();
};
window.jjAddGexp=function(){
  const g=i=>document.getElementById(i);
  const d=g('jg_d').value.trim(), a=Number(g('jg_a').value);
  if(!d){g('jg_d').focus();return;}
  if(!(a>0)){g('jg_a').focus();return;}
  overrides.gexp=(overrides.gexp||[]);
  overrides.gexp.push({id:'g'+Date.now(),desc:d,amt:a,payer:g('jg_p').value,by:(window._cru||{}).uid,ts:Date.now()});
  saveOverrides();render();
};
window.jjDelGexp=function(id){
  overrides.gexp=(overrides.gexp||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
window.jjAddMy=function(){
  const g=i=>document.getElementById(i);
  const d=g('jm_d').value.trim(), a=Number(g('jm_a').value);
  const me=(window._cru||{}).uid;
  if(!d){g('jm_d').focus();return;}
  if(!(a>0)){g('jm_a').focus();return;}
  overrides.cexp=overrides.cexp||{};
  overrides.cexp[me]=overrides.cexp[me]||[];
  overrides.cexp[me].push({id:'x'+Date.now(),date:g('jm_date').value,desc:d,amt:a});
  saveOverrides();render();
};
window.jjDelMy=function(id){
  const me=(window._cru||{}).uid;
  if(!overrides.cexp||!overrides.cexp[me])return;
  overrides.cexp[me]=overrides.cexp[me].filter(x=>x.id!==id);
  saveOverrides();render();
};
window.jjAddLink=function(){
  const g=i=>document.getElementById(i);
  const t=g('jl_t').value.trim(), u=g('jl_u').value.trim();
  if(!t){g('jl_t').focus();return;}
  if(!/^https?:\/\//.test(u)){flash('Paste a full link (https://…)','err');g('jl_u').focus();return;}
  overrides.links=(overrides.links||[]);
  overrides.links.push({id:'l'+Date.now(),t,url:u,by:(window._cru||{}).uid,ts:Date.now()});
  saveOverrides();render();
};
window.jjDelLink=function(id){
  overrides.links=(overrides.links||[]).filter(x=>x.id!==id);
  saveOverrides();render();
};
