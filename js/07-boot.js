/* MODULE js/07-boot.js — Boot sequence
   Split from index.html with statement order preserved; load order matters. */
// Paint immediately (login wall or picker), and let the network-bound storage
// load finish behind it. The picker re-renders once grants are known.
if(window._app){ if(appRole()==='pending')renderPendingApp(); else renderHome(); } else renderLogin();
loadOverrides().then(()=>{
  buildNav();drawCountdown();
  if(!window._app)renderLogin();
  else if(appRole()==='pending')renderPendingApp();
  else if(tripSel)render();
  else{
    const loc=loadLoc();
    if(loc&&loc.ba&&typeof renderBenefitsPage==='function'){ tripSel=null; renderBenefitsPage(loc.ba); }
    else if(loc&&loc.trip&&TRIP_DATA[loc.trip]&&canOpen(loc.trip)){
      openTrip(loc.trip);
      if(tripSel===loc.trip&&Number.isInteger(loc.ci)&&loc.ci>0&&loc.ci<navCities().length){ ci=loc.ci; render(); }
    }
    else renderHome();
  }
});

/* ---------------- COUNTDOWN ---------------- */
function drawCountdown(){
  const el=document.getElementById('countdown');
  if(!el) return;
  const t=(typeof TRIP_DATA!=='undefined'&&TRIP_DATA[tripKey()])||null;
  const D=(a,f)=>a?new Date(a[0],a[1],a[2]):f;
  const MS=86400000;
  const today=new Date(); today.setHours(0,0,0,0);
  const dep=D(t&&t.depart,new Date(2026,10,15));
  const arr=D(t&&t.arrive,new Date(2026,10,17));
  const end=D(t&&t.end,new Date(2026,10,27));
  const d=Math.round((dep-today)/MS);
  if(d>1)            el.textContent=`${d} days to go ✈`;
  else if(d===1)     el.textContent=`Tomorrow ✈`;
  else if(d===0)     el.textContent=`Departure day ✈`;
  else if(today<=end)el.textContent=`Day ${Math.round((today-arr)/MS)+1} of ${Math.round((end-arr)/MS)+1}`;
  else               el.textContent=`Trip complete`;
}
  
/* ---------------- LIVE EXCHANGE RATE ---------------- */
var liveRate = 150.00; // fallback until the live fetch lands


async function fetchExchangeRate() {
  try {
    const res = await fetch('https://latest.currency-api.pages.dev/v1/currencies/usd.json');
    if (res.ok) {
      const data = await res.json();
      if (data && data.usd && data.usd.jpy) {
        if(data.usd[CUR.key])liveRate = data.usd[CUR.key];
        // If the user is already looking at the Calc or Expense tab, refresh it to show the live rate
        if (CITIES[ci].calc || CITIES[ci].expenses) render();
      }
    }
  } catch(e) { console.error('Could not fetch live rate, using offline fallback.'); }
}

// Kick off the fetch immediately
fetchExchangeRate();
