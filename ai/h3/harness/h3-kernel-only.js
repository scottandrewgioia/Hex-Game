/*
 * h3-brain.js - brain "H3" (HUMAN-EDGE-F8-KERNEL-H3-v1), registered at runtime.
 *
 * One standalone script, inserted before </body> of the Tester / simulators
 * (install-h3-tester.js does this). It edits no engine source: it adds H3 to
 * AI_BRAIN_IDS / AI_BRAIN_QUICK_LABELS / CURRENT_GAME_AI_LEVELS and wraps
 * global functions, each wrapper delegating to the original for non-H3 seats.
 *
 * Play: H3 seats run the F8 kernel (F1-v2 parent + bounded F7 sequence donor,
 * search tier 15), then an H3 correction layer (H3.adjust) that replaces F8's
 * move only in specific situations drawn from arena and human-game evidence:
 *   R1a take a game-ending pass when sole leader;
 *   R1b never end the game by passing unless sole leader (tied first = no win);
 *   R2  (DISABLED in v3: harmful in the v1 arena, 3/30 wins vs F8 10/30) opponent-rich pool gifts;
 *   R3  at most 2 opening deck dumps before the jewel is down;
 *   R4  no zero-point hand placement when a 3+ point one exists;
 *   R5  late regulation: bank erasers (black-heavy / grey solid) instead of cheap use or pool dump;
 *   R6  overtime: strike (best net overwrite/placement) instead of passing;
 *   R7  regulation: do not spend an eraser from hand for <=0 net when another hand tile does better.
 * window.HEX_H3.stats counts decisions and each correction.
 */
(function(){
  "use strict";
  const g=window;
  if(g.HEX_H3 && g.HEX_H3.installed) return;
  const LABEL="H3";
  const ID="HUMAN-EDGE-F8-KERNEL-H3-v1";
  const DISPLAY="H3 Human-Edge (F8 kernel)";
  // Script-scope `const`s are not window properties; probe them with typeof.
  const missing=[];
  if(typeof AI_BRAIN_IDS!=="object") missing.push("AI_BRAIN_IDS");
  if(typeof AI_BRAIN_QUICK_LABELS!=="object") missing.push("AI_BRAIN_QUICK_LABELS");
  if(typeof CURRENT_GAME_AI_LEVELS!=="object") missing.push("CURRENT_GAME_AI_LEVELS");
  if(typeof state!=="object") missing.push("state");
  if(typeof PLAYERS!=="object") missing.push("PLAYERS");
  ["normalizeAILevel","currentPlayer","aiH2Active","aiChooseH2OptionEconomyMoveResponsive","aiHighEndSearchTier","selectableAIBrainOptions","aiBrainDisplayLabelForLevel"].forEach(n=>{ if(typeof g[n]!=="function") missing.push(n); });
  if(missing.length){ console.error("[H3] engine globals missing, H3 not installed:",missing); return; }

  const H3=g.HEX_H3={installed:true,label:LABEL,id:ID,version:"h3-f8-kernel-v3",stats:{decisions:0,overrides:0,errors:0}};
  const orig={}; H3.orig=orig;
  function wrap(name,factory){
    if(typeof g[name]!=="function") return false;
    orig[name]=g[name];
    g[name]=factory(orig[name]);
    return true;
  }

  /* ---------- 1. registration tables ---------- */
  AI_BRAIN_IDS[LABEL]=ID;
  AI_BRAIN_IDS["Advanced"+LABEL]=ID;
  AI_BRAIN_QUICK_LABELS[ID]=LABEL;
  if(!CURRENT_GAME_AI_LEVELS.includes(LABEL)) CURRENT_GAME_AI_LEVELS.push(LABEL);

  /* ---------- 2. seat predicate ---------- */
  function seatLevel(player){
    try{ return normalizeAILevel((state.aiLevel && state.aiLevel[player]) || "Advanced"); }catch(e){ return ""; }
  }
  function seatBrainId(player){
    try{
      return (state?.simulation?.brainSeats?.[player]?.brainId) || (state?.aiBrainIds?.[player]) || "";
    }catch(e){ return ""; }
  }
  g.aiH3Active=function(player=currentPlayer()){
    return seatLevel(player)===LABEL || seatBrainId(player)===ID;
  };
  H3.active=g.aiH3Active;

  /* ---------- 3. menus / labels / arena label map ---------- */
  wrap("selectableAIBrainOptions",o=>function(){
    const items=o.apply(this,arguments);
    if(!items.some(i=>i.id===ID)) items.push({quick:LABEL,id:ID,level:LABEL,label:DISPLAY});
    return items;
  });
  wrap("aiBrainDisplayLabelForLevel",o=>function(level){
    return normalizeAILevel(level)===LABEL ? DISPLAY : o.apply(this,arguments);
  });
  wrap("simulationArenaBrainIdForLabel",o=>function(label){ return label===LABEL ? ID : o.apply(this,arguments); });
  wrap("simulationArenaLevelsForGame",o=>function(i){
    const out=o.apply(this,arguments);
    try{
      const labels=simulationArenaBrainLabelsForGame(i);
      PLAYERS.forEach((p,idx)=>{ if(labels[idx]===LABEL) out[p]=LABEL; });
    }catch(e){}
    return out;
  });
  wrap("aiBrainSourceForLevel",o=>function(level,brainId){
    if(brainId===ID) return {version:H3.version,generation:null,source:"h3-runtime-injected-f8-kernel",fingerprint:ID,trainingBuild:typeof TRAINING_BUILD!=="undefined"?TRAINING_BUILD:null,learningMode:"f8-kernel-plus-h3-correction-layer",publishedAt:"2026-09-25"};
    return o.apply(this,arguments);
  });

  /* ---------- 4. kernel selection (H3 does not use the H2 kernel) ---------- */
  wrap("aiH2Active",o=>function(player=currentPlayer()){
    if(g.aiH3Active(player)) return H3.inheritH2!==false;
    return o.apply(this,arguments);
  });
  H3.inheritH2=false;
  // Same search tier as F8 (15).
  wrap("aiHighEndSearchTier",o=>function(player=currentPlayer()){
    if(g.aiH3Active(player)) return 15;
    return o.apply(this,arguments);
  });

  /* ---------- 5. decision layer ---------- */
  function stamp(move,player,note){
    if(!move || typeof move!=="object") return move;
    move.aiBrainId=ID;
    move.aiBrainQuickLabel=LABEL;
    // Keep the kernel's decision gate: aiFinalizeChosenMoveResponsive dispatches on it, and an
    // unknown gate makes the engine run its generic D4 "upgrade" finalizers over the move.
    move.aiH3Version=H3.version;
    if(note){ move.aiDecisionReasons=(move.aiDecisionReasons||[]).concat([String(note)]); }
    return move;
  }
  H3.stamp=stamp;
  wrap("aiChooseH2OptionEconomyMoveResponsive",o=>async function(player,moves=[],runToken=null,options={}){
    if(!g.aiH3Active(player)) return o.apply(this,arguments);
    H3.stats.decisions++;
    const self=this, args=arguments;
    const h2=()=>o.apply(self,args);
    let move=null;
    if(typeof H3.chooseMove==="function"){
      try{
        move=await H3.chooseMove({player,moves,runToken,options,h2,state});
        if(move) H3.stats.overrides++;
      }catch(e){
        H3.stats.errors++;
        console.warn("[H3] chooseMove failed; using H2 kernel",e);
        move=null;
      }
    }
    if(!move) move=await h2();
    return stamp(move,player);
  });
  // Synchronous twin (used by aiChooseMove / non-responsive paths).
  wrap("aiChooseH2OptionEconomyMove",o=>function(player){
    const move=o.apply(this,arguments);
    return g.aiH3Active(player) ? stamp(move,player) : move;
  });

  /* ---------- 6. H3 STRATEGY ----------
   * H3.chooseMove = async ({player,moves,runToken,options,h2,state}) => move|null
   *   moves   : complete rules-legal list from the engine (see API.md "Move objects").
   *             options.continuation is "hand"/"pool" for hand-chain / bonus
   *             follow-ups; options.allowBlindDeck says whether a blind deck
   *             draw may be returned (use aiBlindDeckCommitMove(player,moves)).
   *   h2()    : runs the full H2 search and returns its move (already legal).
   *   return a move object taken from `moves` (or null to fall back to H2).
   * Leave undefined to play exactly like H2 (the scaffold default).
   * Finer hooks: wrap H2 stages for H3 seats only, e.g.
   *   const base=aiH2SelectProgram;
   *   aiH2SelectProgram=function(player,programs,search,situation){
   *     if(!aiH3Active(player)) return base.apply(this,arguments);
   *     ...rerank programs...; return best; };
   */
  H3.chooseMove=H3.chooseMove||null;


  /* ---------- 6b. F8 KERNEL + H3 CORRECTION LAYER ---------- */
  wrap("aiF8Active",o=>function(player=currentPlayer()){
    if(g.aiH3Active(player)) return true;
    return o.apply(this,arguments);
  });
  // No worker ponder hand-off for H3 (the worker copy of the engine does not know H3).
  wrap("aiF1PonderHandoffConfig",o=>function(player){
    if(g.aiH3Active(player)) return null;
    return o.apply(this,arguments);
  });
  const OPP=p=>PLAYERS.filter(x=>x!==p);
  function scores(){ const o={}; PLAYERS.forEach(p=>{ try{o[p]=totalScoreForPlayer(p);}catch(e){o[p]=0;} }); return o; }
  function soleLeader(p){ const s=scores(); return OPP(p).every(o=>s[p]>s[o]); }
  function jewelDown(p){
    try{ return Object.values(state.board||{}).some(e=>{ const t=e&&e.tile; return t&&t.starter&&(t.owner===p||(Array.isArray(t.sides)&&t.sides.every(c=>c===p))); }); }catch(e){ return true; }
  }
  function colorCount(tile,c){ return tile&&Array.isArray(tile.sides)?tile.sides.filter(x=>x===c).length:0; }
  function boardEval(m,p){
    try{ const v=simulateBoardMoveScore(m,p); if(!v||v.ownGain<=-999) return null; return v.ownGain - 0.55*v.oppGain + 0.45*v.oppLoss; }catch(e){ return null; }
  }
  function isEraser(t){ if(!t||!Array.isArray(t.sides)) return false; const b=t.sides.filter(c=>c==="black").length; return b>=4||t.sides.every(c=>c==="gray"); }
  function isPass(m){ return m&&m.kind==="pass"; }
  function completesEnd(m){ return isPass(m) && m.passReason==="complete-three-pass-end"; }
  function bestAlternative(p,moves,filter){
    let best=null,bv=-Infinity;
    for(const m of moves){
      if(!m||!filter(m)) continue;
      let v;
      if(m.kind==="board"){ v=boardEval(m,p); if(v===null) continue; }
      else if(m.kind==="hand") v=0.35*(tilePlayerValue(m.tile,p)/10);
      else continue;
      if(v>bv){ bv=v; best=m; }
    }
    return best?{move:best,value:bv}:null;
  }
  H3.enableR2=false;
  H3.adjust=function(p,moves,move){
    if(!move||!Array.isArray(moves)||!moves.length) return {move,rule:null};
    // R1a: a pass that ends the game while we are the sole leader is a guaranteed win.
    if(!isPass(move)&&soleLeader(p)){ const end=moves.find(completesEnd); if(end) return {move:end,rule:"R1a-take-winning-end"}; }
    // R1b: never end the game by passing unless sole leader (a tied first counts as no win).
    if(completesEnd(move)&&!soleLeader(p)){
      const alt=bestAlternative(p,moves,m=>!isPass(m));
      if(alt) return {move:alt.move,rule:"R1b-no-losing-end-pass"};
    }
    // R2: do not feed an opponent-rich tile into the public pool when it can be banked or placed usefully.
    if(H3.enableR2&&move.kind==="pool"&&move.tile&&!move.finalDeckTile){
      const s=scores();
      const threat=OPP(p).sort((a,b)=>s[b]-s[a]);
      const rich=threat.find(o=>colorCount(move.tile,o)>=4);
      if(rich){
        const same=m=>m.source===move.source&&m.index===move.index;
        const alt=bestAlternative(p,moves,m=>same(m)&&(m.kind==="hand"||m.kind==="board"));
        if(alt&&(alt.move.kind==="hand"||alt.value>=0)) return {move:alt.move,rule:"R2-no-leader-gift-"+rich};
      }
    }
    // R3: opening pool fishing cap (at most 2 deck dumps before our jewel is down).
    if(move.kind==="pool"&&move.source==="deck"&&!jewelDown(p)&&Number(state.deckDumpsThisTurn||0)>=2){
      const alt=bestAlternative(p,moves,m=>m.source==="deck"&&(m.kind==="board"||m.kind==="hand"));
      if(alt) return {move:alt.move,rule:"R3-opening-dump-cap"};
    }
    // R4: no zero-point board placement of a held tile when a scoring placement of any held tile exists.
    if(move.kind==="board"&&move.source==="hand"&&!move.overwrite){
      const v=boardEval(move,p);
      if(v!==null&&v<=0){
        const alt=bestAlternative(p,moves,m=>m.kind==="board"&&m.source==="hand");
        if(alt&&alt.value>=3) return {move:alt.move,rule:"R4-no-zero-hand-placement"};
      }
    }

    // ---- v2: overtime ammunition ----
    const overtime=!!state.endgameOverwriteUnlocked;
    // R6: in overtime, never pass while a net-positive placement/overwrite exists.
    if(overtime&&isPass(move)&&move.passReason!=="complete-three-pass-end"){
      const alt=bestAlternative(p,moves,m=>m.kind==="board");
      if(alt&&alt.value>=1) return {move:alt.move,rule:"R6-overtime-strike"};
    }
    if(!overtime){
      let open=60; try{ open=openBoardCells().length; }catch(e){}
      const deck=Array.isArray(state.deck)?state.deck.length:100;
      const late=open<=14||deck<=22;
      // R5: late regulation, keep erasers for overtime.
      if(late&&move.tile&&isEraser(move.tile)&&(move.kind==="pool"||(move.kind==="board"&&move.source!=="hand"))){
        const cheap=move.kind==="pool"||(boardEval(move,p)??0)<4;
        if(cheap){
          const bank=moves.find(m=>m.kind==="hand"&&m.source===move.source&&m.index===move.index);
          if(bank) return {move:bank,rule:"R5-bank-eraser-late"};
        }
      }
      // R7: do not burn a held eraser for nothing in regulation.
      if(move.kind==="board"&&move.source==="hand"&&move.tile&&isEraser(move.tile)){
        const v=boardEval(move,p);
        if(v!==null&&v<=0){
          const alt=bestAlternative(p,moves,m=>m.kind==="board"&&m.source==="hand"&&!(m.tile&&isEraser(m.tile)));
          if(alt&&alt.value>v) return {move:alt.move,rule:"R7-keep-eraser"};
        }
      }
    }
    return {move,rule:null};
  };
  function h3Wrap(o){
    return function(player,moves){
      const r=o.apply(this,arguments);
      if(!g.aiH3Active(player)) return r;
      const fix=(m)=>{ if(!m) return m; let out=m,rule=null; try{ const a=H3.adjust(player,moves,m); out=a.move; rule=a.rule; }catch(e){ H3.stats.errors++; } if(rule){ H3.stats.overrides++; H3.stats[rule]=(H3.stats[rule]||0)+1; if(state.aiF8Plans) delete state.aiF8Plans[player]; } H3.stats.decisions++; return stamp(out,player,rule?("H3 correction "+rule):null); };
      return (r&&typeof r.then==="function")?r.then(fix):fix(r);
    };
  }
  wrap("aiChooseF8BoundedTriLensMoveResponsive",h3Wrap);
  wrap("aiChooseF8BoundedTriLensMove",h3Wrap);

  /* ---------- 7. live menus (Tester) ---------- */
  // Brain/level <select>s are rebuilt by renderAll() from the wrapped
  // functions above; this also patches any already-rendered menus.
  H3.refreshMenus=function(){
    try{
      document.querySelectorAll("select.brainSelect").forEach(sel=>{
        if(![...sel.options].some(o=>o.value===ID)){ const opt=document.createElement("option"); opt.value=ID; opt.textContent=`${LABEL} - ${ID}`; sel.appendChild(opt); }
      });
      document.querySelectorAll("select.skillSelect").forEach(sel=>{
        if([...sel.options].some(o=>o.value==="H2") && ![...sel.options].some(o=>o.value===LABEL)){ const opt=document.createElement("option"); opt.value=LABEL; opt.textContent=DISPLAY; sel.appendChild(opt); }
      });
    }catch(e){}
  };
  H3.refreshMenus();
  try{ if(typeof renderAll==="function") renderAll(); }catch(e){}
  console.info("[H3] registered",ID);
})();

;window.HEX_H3&&(window.HEX_H3.adjust=function(p,m,move){return {move:move,rule:null};});
