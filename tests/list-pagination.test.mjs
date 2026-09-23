// The GET/guard/based-on reads must see the NEWEST blob even when the store holds more blobs
// than one list() page — the bug behind "every edit starts a fresh dataset" (9/22).
import fs from 'node:fs'; import vm from 'node:vm';
const src=fs.readFileSync(new URL('../api/sync.js',import.meta.url),'utf8');
const ctx={}; vm.createContext(ctx);
vm.runInContext("const VER_PREFIX='state/japan_trip_v2-'; const list=()=>{throw new Error('default list must not be used in tests')};",ctx);
for(const fn of ['listAll','newestVersion']){ const m=src.match(new RegExp('async function '+fn+'\\([^)]*\\) \\{[\\s\\S]*?\\n\\}')); if(!m)throw new Error('cannot extract '+fn); vm.runInContext(m[0]+';globalThis.'+fn+'='+fn+';',ctx); }
const {listAll,newestVersion}=ctx;
// 45 versions, oldest-first pages of 20 (what the SDK does); newest ts is last
const N=45, base=1758000000000, all=Array.from({length:N},(_,i)=>({pathname:'state/japan_trip_v2-'+(base+i*1000)+'.json',url:'u'+i}));
const calls=[];
const fakeList=async(o)=>{ calls.push(o); const start=o.cursor?Number(o.cursor):0; const page=all.slice(start,start+20); const next=start+20; return {blobs:page,hasMore:next<N,cursor:next<N?String(next):undefined}; };
const got=await listAll('state/japan_trip_v2-',fakeList);
if(got.length!==N)throw new Error('listAll must walk every page: '+got.length);
if(calls.length!==3)throw new Error('expected 3 pages, got '+calls.length);
const nv=await newestVersion(fakeList);
if(nv.pathname!==all[N-1].pathname)throw new Error('newestVersion must return the last-written blob, got '+nv.pathname);
// a single capped page would have returned all[19] — assert we are NOT that
if(nv.pathname===all[19].pathname)throw new Error('still reading newest-of-first-page');
// ignores non-13-digit junk and returns null when empty
const nv2=await newestVersion(async()=>({blobs:[{pathname:'state/japan_trip_v2-x.json'}],hasMore:false}));
if(nv2!==null)throw new Error('junk pathname must not be picked');
console.log('list-pagination: 5 assertions — all pass');
