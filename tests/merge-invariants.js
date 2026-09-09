// tests/merge-invariants.js — run: node tests/merge-invariants.js
// Teeth for Stage C: (1) every overrides field written anywhere in js/ must
// have a merge lane; (2) the table-driven merge preserves the exact semantics
// the app has always had. Run from repo root; part of the pre-push chain.
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');

// ---------- (1) lane coverage ----------
const written=new Set();
for(const f of fs.readdirSync(path.join(root,'js')).filter(f=>f.endsWith('.js'))){
  const src=fs.readFileSync(path.join(root,'js',f),'utf8');
  for(const m of src.matchAll(/overrides\.([a-zA-Z_][a-zA-Z0-9_]*)\s*=[^=]/g))written.add(m[1]);
}
const core=fs.readFileSync(path.join(root,'js','01-core.js'),'utf8');
const ctx=vm.createContext({});vm.runInContext('window=globalThis',ctx);
vm.runInContext(core.match(/window\.MERGE_LANES=\{[\s\S]*?\n\};/)[0],ctx);
vm.runInContext('window._mergeUnknown=[];',ctx);
const M=ctx.window.MERGE_LANES;
const laned=new Set([...Object.keys(M.fields),...M.perPerson,...M.adminWins,...M.ownedUnion,...M.special]);
const missing=[...written].filter(k=>!laned.has(k));
if(missing.length)throw new Error('FIELDS WITHOUT A MERGE LANE (add to MERGE_LANES in 01-core): '+missing.join(', '));

// ---------- (2) semantics through the real functions ----------
vm.runInContext('window._cru={uid:"g1",role:"guest"};window._app={role:"member"};',ctx);
for(const fn of ['mergeTodos','mlLane','m3','mergeTripBase','mergeCruise']){
  const m=core.match(new RegExp('function '+fn+'\\(([^)]*)\\)\\{[\\s\\S]*?\\n\\}'));
  if(!m)throw new Error('cannot extract '+fn);
  vm.runInContext(m[0]+';globalThis.'+fn+'='+fn+';',ctx);
}
const {mergeTripBase,mergeCruise}=ctx;
const eq=(a,b,msg)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error(msg+': '+JSON.stringify(a)+' vs '+JSON.stringify(b));};

// base: localWins fields
let m=mergeTripBase({expenses:[1],stops:['r']},{expenses:[2]});
eq(m.expenses,[2],'expenses localWins');eq(m.stops,['r'],'remote-only preserved');
// ---------- Stage D: three-way (stale tab must not lose remote work) ----------
const A={id:'pA',n:'a'},B_={id:'pB',n:'b'},A2={id:'pA',n:'a-edited'};
// stale tab: base [A], remote [A,B], local [A] (untouched) -> B survives
m=mergeTripBase({plans:[A,B_]},{plans:[A]},{plans:[A]});eq(m.plans.map(p=>p.id).sort(),['pA','pB'],'3way: remote add survives stale tab');
// local delete sticks; remote add still arrives
m=mergeTripBase({plans:[A,B_]},{plans:[]},{plans:[A]});eq(m.plans.map(p=>p.id),['pB'],'3way: local delete sticks, remote add kept');
// concurrent: local edited A, remote added B -> both
m=mergeTripBase({plans:[A,B_]},{plans:[A2]},{plans:[A]});eq(m.plans.map(p=>p.n).sort(),['a-edited','b'],'3way: local edit + remote add');
// remote edited A, local untouched -> remote edit wins
m=mergeTripBase({plans:[A2]},{plans:[A]},{plans:[A]});eq(m.plans[0].n,'a-edited','3way: remote edit flows in');
// remote delete, local untouched -> gone
m=mergeTripBase({plans:[]},{plans:[A]},{plans:[A]});eq(m.plans,[],'3way: remote delete respected');
// eff() lane (per-stop key): untouched local defers to remote; edited local wins
m=mergeTripBase({5:{note:'cloud'}},{5:{note:'old'}},{5:{note:'old'}});eq(m[5].note,'cloud','3way: untouched note defers');
m=mergeTripBase({5:{note:'cloud'}},{5:{note:'mine'}},{5:{note:'old'}});eq(m[5].note,'mine','3way: edited note wins');
// removedStops as a set of deltas
m=mergeTripBase({removedStops:[1,2]},{removedStops:[2,3]},{removedStops:[2]});eq(m.removedStops.map(String).sort(),['1','2','3'],'3way: removedStops deltas');
// 9/9 incident: KEYLESS manual expenses must survive a three-way merge
const K1={date:'2026-11-17',usd:'120.00',desc:'N\'EX',card:'Amex',cat:'Transport'},K2={date:'2026-11-18',usd:'40.00',desc:'Itoya',card:'Amex',cat:'Shopping'};
m=mergeTripBase({expenses:[K1,K2]},{expenses:[K1,K2]},{expenses:[K1,K2]});eq(m.expenses.length,2,'3way: keyless expenses survive (was 0)');
m=mergeTripBase({expenses:[K1]},{expenses:[K1,K2]},{expenses:[K1]});eq(m.expenses.length,2,'3way: keyless local add survives');
m=mergeTripBase({expenses:[K1,K2]},{expenses:[K1]},{expenses:[K1,K2]});eq(m.expenses.length,1,'3way: keyless local delete sticks');
// expenses keyed by pid when no id
m=mergeTripBase({expenses:[{pid:'x',usd:1},{pid:'y',usd:2}]},{expenses:[{pid:'x',usd:1}]},{expenses:[{pid:'x',usd:1}]});eq(m.expenses.length,2,'3way: expenses by pid');
// old behavior would have lost B — prove the stale-tab bug is what we fixed
m=mergeTripBase({plans:[A,B_]},{plans:[A]});eq(m.plans.map(p=>p.id),['pA'],'legacy 2-arg still localWins (regression guard)');
// base: vault shallow
m=mergeTripBase({vault:{a:1,b:1}},{vault:{b:2}});eq(m.vault,{a:1,b:2},'vault shallow');
// base: todos union + tombstone
m=mergeTripBase({todos:[{id:'a'},{id:'b'}]},{todos:[{id:'a',t:'mine'}],todoGone:['b']});
eq(m.todos.map(t=>t.id),['a'],'tombstone sticks');eq(m.todos[0].t,'mine','local todo wins per id');
// base: UNKNOWN field preserved both directions + recorded
m=mergeTripBase({futureField:7},{});eq(m.futureField,7,'unknown remote preserved');
m=mergeTripBase({},{futureField:8});eq(m.futureField,8,'unknown local preserved');
if(!ctx.window._mergeUnknown.includes('futureField'))throw new Error('unknown field not recorded');
// cruise: perPerson — mine local, theirs remote
let c=mergeCruise({cexp:{g1:['stale'],g2:['theirs']}},{cexp:{g1:['mine']}},{});
eq(c.cexp,{g1:['mine'],g2:['theirs']},'perPerson');
// cruise: adminWins from guest & from admin
c=mergeCruise({charges:[1]},{charges:[2]},{});eq(c.charges,[1],'adminWins: guest takes remote');
vm.runInContext('window._app={role:"admin"}',ctx);
c=mergeCruise({charges:[1]},{charges:[2]},{});eq(c.charges,[2],'adminWins: admin local');
vm.runInContext('window._app={role:"member"}',ctx);
// cruise: ownedUnion — my edit wins on my item; others from remote; my deletion sticks
c=mergeCruise({pins:[{id:'p1',by:'g1',v:1},{id:'p2',by:'g2',v:1}]},{pins:[{id:'p1',by:'g1',v:2}],_seen:0},{});
eq(c.pins.find(p=>p.id==='p1').v,2,'own item local');
eq(c.pins.find(p=>p.id==='p2').v,1,'other item remote');
c=mergeCruise({pins:[{id:'p1',by:'g1'},{id:'p2',by:'g2'}]},{pins:[],_seen:0},{});
eq(c.pins.map(p=>p.id),['p2'],'own deletion sticks, others survive');
// cruise: removedUids scrub
c=mergeCruise({removedUids:['x'],charges:[{uid:'x'},{uid:'y'}]},{},{});
eq(c.charges.map(z=>z.uid),['y'],'tombstoned person scrubbed');
console.log('merge-invariants: lane coverage ('+laned.size+' laned / '+written.size+' written) + 13 semantic assertions — all pass');
