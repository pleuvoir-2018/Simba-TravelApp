/* 07c-ghibli.js — the Ghibli Park day tab (11/25). Renders GHIBLI_PLAN from
   the trip registry: date · ticket · entry chips, a timed area timeline with
   PREMIUM pills on the five premium buildings, the dinner connection, tips. */
function renderGhibli(){
  const G=((typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||{}).ghibli;
  const panel=document.getElementById('panel');
  if(!G){ panel.innerHTML='<div class="card"><div class="td-empty">No Ghibli plan seeded for this trip.</div></div>'; return; }
  const chip=t=>`<span class="gh-chip">${esc(t)}</span>`;
  const item=it=>`<div class="gh-item"><div class="gh-n">${esc(it.n)}${it.prem?'<span class="tag prem">Premium</span>':''}${it.by?`<span class="gh-by">enter by ${esc(it.by)}</span>`:''}</div>${it.d?`<div class="gh-d">${esc(it.d)}</div>`:''}</div>`;
  const step=s=>`<div class="gh-step${/transit/i.test(s.area)?' transit':''}"><div class="gh-time">${esc(s.t)}</div><div class="gh-body"><div class="gh-area">${esc(s.area)}</div><div class="gh-title">${esc(s.title||'')}</div>${(s.items||[]).map(item).join('')}</div></div>`;
  panel.innerHTML=`<div class="card gh-card">
    <div class="chead"><span>Ghibli Park · Premium day plan</span><span>${esc(G.hours||'')}</span></div>
    <div class="gh-hero">${chip(G.date)}${chip(G.ticket)}${chip(G.entry)}</div>
    <div class="gh-steps">${(G.steps||[]).map(step).join('')}</div>
  </div>
  <div class="card gh-card"><div class="chead"><span>Tips & reminders</span></div>
    ${(G.tips||[]).map(t=>`<div class="gh-tip"><b>${esc(t.h)}</b> ${esc(t.d)}</div>`).join('')}
  </div>`;
}
window.renderGhibli=renderGhibli;
