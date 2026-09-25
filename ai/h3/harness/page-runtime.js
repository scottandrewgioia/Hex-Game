/*
 * QUEXATLE / Hexxxagon headless harness runtime.
 *
 * Injected (as a classic <script>) into sim.html AFTER the page has loaded.
 * It never edits engine source; it only re-binds a few global function
 * declarations (top-level `function` bindings are writable global properties,
 * and the engine resolves them through the global object at call time) and
 * reads/writes top-level `let` variables (shared global lexical scope).
 *
 * Exposes window.__HX with:
 *   __HX.runGame(config) -> starts ONE full game through the engine's own
 *                           arena runner (startSimArenaSession, dedicated
 *                           single-game mode) and returns immediately.
 *   __HX.status()        -> poll result {done, error, result, progress}.
 *   __HX.resolveSeat(label) -> {label, level, brainId}
 */
(function(){
  "use strict";
  if(window.__HX && window.__HX.installed) return;
  const HX=window.__HX={installed:true, version:"hx-runtime-1", events:[], config:null, done:false, error:null, result:null, decisions:[], turns:[]};
  const g=window;
  const orig={};
  function wrap(name,factory){
    if(typeof g[name]!=="function") { HX.events.push("missing:"+name); return false; }
    orig[name]=g[name];
    g[name]=factory(orig[name]);
    return true;
  }
  HX.orig=orig;

  /* ---------- seeded PRNG ---------- */
  function mulberry(seed){
    let v=(Number(seed)>>>0)||1;
    return function(){
      v=(v+0x6D2B79F5)>>>0;
      let t=v;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
  }
  HX.mulberry=mulberry;

  /* ---------- offline / persistence stubs ---------- */
  // Cloud + desktop-recorder uploads: never leave the page.
  wrap("uploadTrainingGameRecord",()=>function(){ return Promise.resolve({skipped:"harness-offline"}); });
  wrap("updateHumanPlayerCloudForFinishedGame",()=>function(){ return null; });
  wrap("saveHumanGameCheckpoint",()=>function(){ return false; });
  wrap("saveSimArenaSessionState",()=>function(){ return false; });
  wrap("saveSimArenaLastRun",(o)=>function(status,detail){ HX.events.push({lastRun:status,detail:String(detail||"").slice(0,400),at:Date.now()}); return null; });
  wrap("requestSimulationWakeLock",()=>function(){ return Promise.resolve(null); });
  wrap("releaseSimulationWakeLock",()=>function(){ return null; });
  wrap("shouldRecycleSimulatorArenaPage",()=>function(){ return false; });
  wrap("reloadSimulatorArenaPage",()=>function(reason){
    // The engine asks for a page reload after a decision timeout (retry). In the
    // harness that is reported as an error for this game instead.
    HX.error=HX.error || ("engine requested page reload: "+reason);
    HX.done=true;
    try{ inGameSimulation.active=false; state.paused=true; }catch(e){}
    return null;
  });
  // Keep the per-game localStorage training store from growing without bound.
  wrap("saveTrainingStore",()=>function(){ return true; });

  /* ---------- seating ---------- */
  // Level label -> {level, brainId}. Level is what state.aiLevel[player] holds;
  // brainId is what state.simulation.brainSeats[player].brainId holds.
  function resolveSeat(label){
    const raw=String(label||"").trim();
    const L=raw.toUpperCase();
    if(!L) throw new Error("empty seat label");
    // Full brain ids are accepted too.
    const byId=Object.entries(AI_BRAIN_QUICK_LABELS).find(([id])=>id.toUpperCase()===L);
    const quick=byId ? byId[1] : (L==="BASIC" ? "B1" : L);
    let level, brainId;
    if(quick==="B1"){ level="Basic"; brainId=AI_BRAIN_IDS.Basic; }
    else if(["A1","A2","C1","C2"].includes(quick)){ level=quick==="A1"?"A1":quick==="C1"?"C1":quick==="C2"?"C2":"Advanced"; brainId=simulationArenaBrainIdForLabel(quick); }
    else if(quick==="A5"){ level="A5"; brainId=AI_BRAIN_IDS.A5; }
    else if(AI_BRAIN_IDS[quick]){ level=quick; brainId=AI_BRAIN_IDS[quick]; }
    else throw new Error("unknown brain label "+raw+" (known: "+Object.keys(AI_BRAIN_IDS).filter(k=>!/^Advanced/.test(k)).join(",")+")");
    if(byId) brainId=byId[0];
    return {label:quick, level, brainId};
  }
  HX.resolveSeat=resolveSeat;

  wrap("simulationArenaBrainLabelsForGame",(o)=>function(i){ return HX.config ? PLAYERS.map(p=>HX.config.seatInfo[p].label) : o(i); });
  wrap("simulationArenaLevelsForGame",(o)=>function(i){ return HX.config ? Object.fromEntries(PLAYERS.map(p=>[p,HX.config.seatInfo[p].level])) : o(i); });
  wrap("simulationArenaBrainIdsForGame",(o)=>function(i){ return HX.config ? Object.fromEntries(PLAYERS.map(p=>[p,HX.config.seatInfo[p].brainId])) : o(i); });
  wrap("simulationArenaPatternForGame",(o)=>function(i){ return HX.config ? PLAYERS.map(p=>HX.config.seatInfo[p].label).join("-") : o(i); });
  wrap("simulationArenaSeedForGame",(o)=>function(i){ return HX.config && HX.config.seed!=null ? (Number(HX.config.seed)>>>0) : o(i); });

  // NOTE (engine finding): withSimulationArenaSeed() only patches Math.random,
  // but buildDeck()/randomStartingTurnIndex() draw from crypto.getRandomValues,
  // so the stock arena "paired deal seed" does not actually fix the deal.
  // The harness seeds crypto.getRandomValues too while createState() runs.
  wrap("createState",(o)=>function(){
    const cfg=HX.config;
    if(!cfg || cfg.seed==null) return applyFirst(o.apply(this,arguments),cfg);
    const rnd=mulberry((Number(cfg.seed)>>>0)^0x5EED1234);
    const c=g.crypto;
    const origGRV=c.getRandomValues;
    const origRandom=Math.random;
    try{
      c.getRandomValues=function(arr){ for(let i=0;i<arr.length;i++){ arr[i]=Math.floor(rnd()*4294967296)>>>0; } return arr; };
      Math.random=rnd;
      return applyFirst(o.apply(this,arguments),cfg);
    }finally{
      c.getRandomValues=origGRV;
      Math.random=origRandom;
    }
  });
  function applyFirst(st,cfg){
    if(st && cfg && cfg.first && PLAYERS.includes(cfg.first)){
      const idx=PLAYERS.indexOf(cfg.first);
      st.turnIndex=idx; st.startingTurnIndex=idx; st.startingPlayer=cfg.first;
    }
    return st;
  }

  /* ---------- budget knobs ---------- */
  wrap("aiThinkingBudgetMs",(o)=>function(){ const v=o.apply(this,arguments); const s=HX.config?.budgetScale; return (s!=null && s!==1) ? Math.max(1,Math.round(v*s)) : v; });
  wrap("aiThinkingWorkLimitFor",(o)=>function(){ const v=o.apply(this,arguments); const s=HX.config?.workScale; return (s!=null && s!==1 && v) ? Math.max(1,Math.round(v*s)) : v; });
  wrap("aiF1PonderHandoffConfig",(o)=>function(player,moves,afterMs){
    const s=HX.config?.handoffScale;
    if(s!=null && s!==1 && Number.isFinite(Number(afterMs))) afterMs=Math.max(1,Math.round(Number(afterMs)*s));
    return o.call(this,player,moves,afterMs);
  });
  // Optional whole-turn wall-clock cap (ms). Shrinks the engine's 70 s work /
  // 90 s complete deadlines for the current turn. A brain that overruns it is
  // cut off and the engine's failsafe move is used -> the game's aiDecisionAudit
  // will FAIL (fallback detected). Use only for smoke tests.
  wrap("ensureAIWholeTurnDeadline",(o)=>function(player){
    const r=o.apply(this,arguments);
    const cap=Number(HX.config?.turnCapMs||0);
    if(cap>0 && aiWholeTurnStartedAt){
      const workAt=aiWholeTurnStartedAt+cap;
      if(aiWholeTurnWorkDeadlineAt>workAt){
        aiWholeTurnWorkDeadlineAt=workAt;
        aiWholeTurnCompleteDeadlineAt=Math.min(aiWholeTurnCompleteDeadlineAt,workAt+Math.max(2000,Math.round(cap*0.3)));
      }
    }
    return aiWholeTurnCompleteDeadlineAt;
  });

  /* ---------- instrumentation ---------- */
  const now=()=>performance.now();
  function seatLabel(player){ return HX.config?.seatInfo?.[player]?.label || ""; }
  // Main decision (brain chooser) per AI turn.
  wrap("aiChooseMoveResponsive",(o)=>async function(player,runToken,moves,options){
    const t=now();
    let move=null, err=null;
    try{ move=await o.apply(this,arguments); return move; }
    catch(e){ err=e; throw e; }
    finally{
      if(HX.config) HX.decisions.push({player,brain:seatLabel(player),turn:state.turnNumber,ms:Math.round(now()-t),legal:Array.isArray(moves)?moves.length:null,kind:move?.kind||(move===null?"null":undefined),source:move?.source,blind:!!move?.blindDeckChoice,err:err?String(err.message||err).slice(0,120):undefined});
    }
  });
  // Whole AI invocation (one runAI call = one decision + its execution; a turn
  // can contain several runAI calls, e.g. deck-to-pool dumps).
  wrap("runAI",(o)=>async function(){
    const player=currentPlayer();
    const turn=state.turnNumber;
    const t=now();
    try{ return await o.apply(this,arguments); }
    finally{ if(HX.config) HX.turns.push({player,brain:seatLabel(player),turn,ms:Math.round(now()-t)}); }
  });

  /* ---------- game completion ---------- */
  wrap("scheduleNextInGameSimulationGame",(o)=>function(scores,winners){
    if(!HX.config){ return o.apply(this,arguments); }
    try{
      const res=state.trainingLastResult || {};
      HX.result={
        scores:clone(scores),
        winners:Array.isArray(winners)?winners.slice():[],
        winner:state.winner,
        endReason:state.endPendingReason||null,
        turns:state.turnNumber,
        rounds:typeof currentRoundNumber==="function"?currentRoundNumber():null,
        moveCount:Number(state.trainingMoveNumber||0),
        startingPlayer:state.startingPlayer,
        deckRemaining:(state.deck||[]).length,
        discardedTiles:state.discardedTiles||0,
        overwriteMoves:state.overwriteMoves||0,
        boardFilledMoveNumber:state.boardFilledMoveNumber||null,
        scoresAtBoardFill:state.scoresAtBoardFill||null,
        endgameOverwriteUnlocked:!!state.endgameOverwriteUnlocked,
        overwriteUnlockReason:state.overwriteUnlockReason||null,
        gameId:state.gameId,
        ruleset:state.ruleset,
        simulationInvalid:!!res.simulationInvalid,
        simulationInvalidReason:res.simulationInvalidReason||null,
        integrityInvalid:!!res.integrityInvalid,
        aiDecisionAudit:res.aiDecisionAudit?{status:res.aiDecisionAudit.status,fallbackMoves:res.aiDecisionAudit.fallbackMoves,boundedDeadlineMoves:res.aiDecisionAudit.boundedDeadlineMoves}:null,
        rotationAuditFailed:!!res.rotationAudit?.failed,
        hiddenInformationAuditFailed:!!res.hiddenInformationAudit?.failed,
        aiTurnGuardAborts:state.aiTurnGuardAborts||0,
        auraHexesCreated:res.auraHexesCreated||null
      };
      if(HX.config.keepMoves) HX.result.moves=res.moves||[];
      if(HX.config.keepFinalBoard) HX.result.finalBoard=clone(state.board);
    }catch(e){ HX.error=HX.error||("result capture failed: "+(e&&e.message||e)); }
    HX.done=true;
    try{ clearInGameSimulationTimer(); inGameSimulation.active=false; }catch(e){}
    return null;
  });

  HX.runGame=function(cfg){
    cfg=Object.assign({budgetScale:1,workScale:1,handoffScale:1,turnCapMs:0,keepMoves:false,keepFinalBoard:false},cfg||{});
    const seats=cfg.seats||{};
    cfg.seatInfo={};
    for(const p of PLAYERS){
      if(!seats[p]) throw new Error("missing seat "+p);
      cfg.seatInfo[p]=resolveSeat(seats[p]);
    }
    HX.config=cfg; HX.done=false; HX.error=null; HX.result=null; HX.decisions=[]; HX.turns=[]; HX.events=[];
    HX.startedAt=Date.now();
    try{ stopInGameSimulations({pause:true,silent:true}); }catch(e){}
    if(cfg.ruleset){
      try{ setPreferredRuleset(cfg.ruleset); }catch(e){}
      g.inGameSimulationRulesetForGame=function(){ return normalizeRuleset(cfg.ruleset); };
    }
    startSimArenaSession({localRecorderReady:true,dedicatedRunner:true,workerGameIndex:1,targetGames:SIM_ARENA_MIN_BALANCED_GAMES,workerId:"harness",captureFilm:false});
    return {started:true,seatInfo:cfg.seatInfo,active:!!inGameSimulation.active,firstPlayer:currentPlayer()};
  };

  HX.status=function(){
    let failure="";
    try{ failure=inGameSimulation.rotationAuditFailure||inGameSimulation.storageFailure||""; }catch(e){}
    const stopped=!HX.done && HX.config && !inGameSimulation.active && (Date.now()-HX.startedAt>1500);
    return {
      done:HX.done || !!stopped,
      error:HX.error || (stopped ? ("simulator stopped without result: "+(failure||"unknown")) : null),
      result:HX.result,
      progress:{turn:state.turnNumber,moves:state.trainingMoveNumber,deck:(state.deck||[]).length,current:currentPlayer(),thinking:inGameSimulation.thinkingBrain||"",scores:typeof compactScores==="function"?compactScores():null,overtime:!!state.endgameOverwriteUnlocked},
      decisions:HX.decisions.length
    };
  };
})();
