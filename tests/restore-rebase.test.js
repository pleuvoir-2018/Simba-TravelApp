// 9/23: Restore re-added 16 expenses, then the three-way merge dropped them again because the
// tab's base still held them and the cloud did not. Pin the mechanism and the fix (rebase).
const fs=require('fs'),vm=require('vm');
const src=fs.readFileSync(require('path').join(__dirname,'..','js','01-core.js'),'utf8');
const ctx=vm.createContext({window:{},console});
vm.runInContext(src.slice(src.indexOf('window.MERGE_LANES='),src.indexOf('function mergeApp(')),ctx);
const {mergeTripBase}=ctx.window;
const exp=Array.from({length:16},(_,i)=>({id:'e'+i,usd:10+i}));
const withExp={expenses:exp,101:{name:'edited'}}, without={expenses:[],101:{name:'edited'}};
// base = the version this tab loaded (had the rows); remote = cloud now (lost them); local = after Restore (has them again)
const stale=mergeTripBase(without,withExp,withExp);
if((stale.expenses||[]).length!==0)throw new Error('mechanism check: with a stale base the merge should drop them (that is the bug we are pinning)');
if(!stale[101])throw new Error('scalar edits survive the same merge — matches the field report');
// fix: base rebased to the cloud → restored rows are local adds
const fixed=mergeTripBase(without,withExp,without);
if((fixed.expenses||[]).length!==16)throw new Error('after rebase the restored rows must survive: '+(fixed.expenses||[]).length);
// unknown base (rebase fetch failed) → union, still survives
const unk=mergeTripBase(without,withExp,{});
if((unk.expenses||[]).length!==16)throw new Error('unknown base must union');
// the rebase hook exists and Restore awaits it before saving
if(!/window\.rebaseFromCloud=async function/.test(src))throw new Error('rebaseFromCloud missing');
const cruise=fs.readFileSync(require('path').join(__dirname,'..','js','05-cruise.js'),'utf8');
if(!/await window\.rebaseFromCloud\(\);\s*\/\/[^\n]*\n\s*saveOverrides\(\)/.test(cruise))throw new Error('expRestore must rebase before saveOverrides');
console.log('restore-rebase: 5 assertions — all pass');
