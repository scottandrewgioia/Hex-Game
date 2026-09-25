(function(){
  const g=window; const log=(x)=>{ try{ (g.__HX&&g.__HX.events||[]).push(x); }catch(e){} };
  const names=Object.keys(g).filter(n=>/^aiChoose[A-Za-z0-9]*Responsive$/.test(n)&&typeof g[n]==="function");
  names.forEach(n=>{ const o=g[n]; g[n]=async function(player){ const r=await o.apply(this,arguments); try{ if(r&&typeof g.aiH3Active==="function"&&g.aiH3Active(player)&&state.turnNumber<=60) log({t:state.turnNumber,fn:n,gate:r.aiDecisionGate||null,kind:r.kind,src:r.source}); }catch(e){} return r; }; });
  ["aiChooseTurnContinuationResponsively","aiChooseFailsafeMove","aiApplyFundamentalMoveSafety","aiApplyUniversalFinishMemory","aiApplyTerminalSelfPreservation"].forEach(n=>{ const o=g[n]; if(typeof o!=="function") return; g[n]=function(player){ const r=o.apply(this,arguments); const note=(m)=>{ try{ if(m&&g.aiH3Active(player)&&state.turnNumber<=60) log({t:state.turnNumber,fn:n,gate:m.aiDecisionGate||null,kind:m.kind,src:m.source}); }catch(e){} return m; }; return (r&&typeof r.then==="function")?r.then(note):note(r); }; });
  log({dbgWrapped:names.length});
})();
