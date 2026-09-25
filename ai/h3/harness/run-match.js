#!/usr/bin/env node
/*
 * run-match.js - headless QUEXATLE/Hexxxagon match runner.
 *
 * Loads ../sim.html (unmodified) in headless Chromium via Playwright, injects
 * page-runtime.js (+ optional brain scripts), and plays N complete 3-player
 * games through the engine's own simulator path (runAI -> brain -> commit),
 * one fresh page per game, W pages in parallel.
 *
 * Usage:
 *   node run-match.js --seats F8,F5,H2 [--games 3] [--workers 3] [--seed 1000]
 *                     [--rotate] [--first red] [--inject h3-brain.js ...]
 *                     [--budget-scale 1] [--work-scale 1] [--handoff-scale 1]
 *                     [--turn-cap-ms 0] [--ruleset overwrite-endgame|classic]
 *                     [--timeout-min 90] [--out results.jsonl] [--keep-moves]
 *                     [--decisions] [--quiet]
 *
 * --seats   red,green,blue brain labels (B1 A1 A2 A5 C1 C2 D3..D7 E1 F1..F8
 *           G1..G5 H1 H2, any label registered by an injected script such as
 *           H3, or a full brain id).
 * --rotate  game i uses the seat list rotated by i (balances seat order).
 * --seed    base seed; game i uses seed+i (deck order + first player + Math.random
 *           during setup are then reproducible; AI search is time-sliced so
 *           move choices are not guaranteed bit-identical).
 * Output: one JSON object per game (stdout, and appended to --out if given),
 *         then a summary object.
 */
"use strict";
const path=require("path");
const fs=require("fs");
const {execSync}=require("child_process");

function loadPlaywright(){
  const tries=["playwright"];
  try{ tries.push(path.join(execSync("npm root -g",{stdio:["ignore","pipe","ignore"]}).toString().trim(),"playwright")); }catch(e){}
  tries.push("/opt/node22/lib/node_modules/playwright","/usr/local/lib/node_modules/playwright","/usr/lib/node_modules/playwright");
  for(const t of tries){ try{ return require(t); }catch(e){} }
  throw new Error("playwright not found; tried "+tries.join(", "));
}

function parseArgs(argv){
  const a={games:1,workers:1,seed:null,rotate:false,first:null,inject:[],budgetScale:1,workScale:1,handoffScale:1,turnCapMs:0,ruleset:null,timeoutMin:90,out:null,keepMoves:false,decisions:false,quiet:false,renderMs:600000,page:path.resolve(__dirname,"..","sim.html"),headful:false};
  for(let i=2;i<argv.length;i++){
    const k=argv[i], v=()=>argv[++i];
    switch(k){
      case "--seats": a.seats=v().split(",").map(s=>s.trim()); break;
      case "--games": a.games=parseInt(v(),10); break;
      case "--workers": a.workers=parseInt(v(),10); break;
      case "--seed": a.seed=Number(v()); break;
      case "--rotate": a.rotate=true; break;
      case "--first": a.first=v(); break;
      case "--inject": a.inject.push(path.resolve(v())); break;
      case "--budget-scale": a.budgetScale=Number(v()); break;
      case "--work-scale": a.workScale=Number(v()); break;
      case "--handoff-scale": a.handoffScale=Number(v()); break;
      case "--turn-cap-ms": a.turnCapMs=Number(v()); break;
      case "--ruleset": a.ruleset=v(); break;
      case "--timeout-min": a.timeoutMin=Number(v()); break;
      case "--out": a.out=path.resolve(v()); break;
      case "--keep-moves": a.keepMoves=true; break;
      case "--decisions": a.decisions=true; break;
      case "--quiet": a.quiet=true; break;
      case "--render-ms": a.renderMs=Number(v()); break;
      case "--page": a.page=path.resolve(v()); break;
      case "--headful": a.headful=true; break;
      case "-h": case "--help": console.log(fs.readFileSync(__filename,"utf8").split("*/")[0]); process.exit(0);
      default: throw new Error("unknown arg "+k);
    }
  }
  if(!a.seats || a.seats.length!==3) throw new Error("--seats red,green,blue is required (3 labels)");
  return a;
}

const PLAYERS=["red","green","blue"];
const log=(opts,...m)=>{ if(!opts.quiet) console.error(new Date().toISOString().slice(11,19),...m); };

function summarizeDecisions(decisions){
  const by={};
  for(const d of decisions){
    const k=d.brain||d.player;
    const s=by[k]||(by[k]={n:0,total:0,max:0});
    s.n++; s.total+=d.ms; s.max=Math.max(s.max,d.ms);
  }
  for(const s of Object.values(by)){ s.avgMs=Math.round(s.total/s.n); s.totalMs=s.total; delete s.total; }
  return by;
}

async function playOneGame(browser,opts,gameIndex,workerId){
  const rot=opts.rotate ? gameIndex%3 : 0;
  const labels=PLAYERS.map((_,i)=>opts.seats[(i+rot)%3]);
  const seats=Object.fromEntries(PLAYERS.map((p,i)=>[p,labels[i]]));
  const seed=opts.seed==null ? null : ((opts.seed+gameIndex)>>>0);
  const context=await browser.newContext({viewport:{width:560,height:900}});
  const page=await context.newPage();
  const errors=[];
  const blocked=new Set();
  await page.route("**/*",route=>{
    const u=route.request().url();
    if(u.startsWith("file:")||u.startsWith("data:")||u.startsWith("blob:")) return route.continue();
    blocked.add(u.split("?")[0]);
    return route.abort();
  });
  page.on("pageerror",e=>errors.push("pageerror: "+String(e.message).slice(0,300)));
  page.on("console",m=>{ if(m.type()==="error") errors.push("console: "+m.text().slice(0,300)); });
  const t0=Date.now();
  let out={gameIndex,workerId,seats,seed,rotate:rot};
  try{
    const url="file://"+opts.page+"?simMode=1&simVisuals=off&simRenderMs="+opts.renderMs;
    await page.goto(url,{waitUntil:"load",timeout:60000});
    await page.addScriptTag({path:path.join(__dirname,"page-runtime.js")});
    for(const f of opts.inject) await page.addScriptTag({path:f});
    const start=await page.evaluate(cfg=>window.__HX.runGame(cfg),{
      seats,seed,first:opts.first,ruleset:opts.ruleset,budgetScale:opts.budgetScale,workScale:opts.workScale,handoffScale:opts.handoffScale,turnCapMs:opts.turnCapMs,keepMoves:opts.keepMoves
    });
    out.seatInfo=start.seatInfo;
    const deadline=t0+opts.timeoutMin*60000;
    let st, lastLog=0;
    for(;;){
      await new Promise(r=>setTimeout(r,1000));
      st=await page.evaluate(()=>window.__HX.status());
      if(st.done) break;
      if(Date.now()>deadline){ st.error="harness timeout after "+opts.timeoutMin+" min"; break; }
      if(Date.now()-lastLog>30000){ lastLog=Date.now(); log(opts,`[w${workerId} g${gameIndex}] turn ${st.progress.turn} moves ${st.progress.moves} deck ${st.progress.deck} ${st.progress.current}${st.progress.thinking?"("+st.progress.thinking+")":""} scores ${JSON.stringify(st.progress.scores)}${st.progress.overtime?" OVERTIME":""}`); }
    }
    const detail=await page.evaluate(()=>({decisions:window.__HX.decisions,turns:window.__HX.turns,events:window.__HX.events,h3:window.HEX_H3?{version:window.HEX_H3.version,stats:window.HEX_H3.stats}:null}));
    const r=st.result||{};
    const byPlayerSeat=Object.fromEntries(PLAYERS.map(p=>[p,{brain:seats[p],brainId:out.seatInfo?.[p]?.brainId,score:r.scores?r.scores[p]:null}]));
    out=Object.assign(out,{
      ok:!st.error && !!st.result,
      error:st.error||null,
      scores:r.scores||null,
      winner:r.winner||null,
      winnerBrains:(r.winners||[]).map(p=>seats[p]),
      seatsDetail:byPlayerSeat,
      startingPlayer:r.startingPlayer||null,
      endReason:r.endReason||null,
      turns:r.turns||st.progress?.turn||null,
      moveCount:r.moveCount||st.progress?.moves||null,
      durationMs:Date.now()-t0,
      decisionTiming:summarizeDecisions(detail.decisions),
      aiInvocationTiming:summarizeDecisions(detail.turns),
      result:r,
      pageErrors:errors.slice(0,20),
      blockedRequests:[...blocked].slice(0,10),
      events:(process.env.HX_ALL_EVENTS?detail.events:detail.events.slice(-10)),
      h3:detail.h3
    });
    if(opts.decisions) out.decisions=detail.decisions;
  }catch(e){
    out=Object.assign(out,{ok:false,error:String(e&&e.stack||e).slice(0,1000),durationMs:Date.now()-t0,pageErrors:errors.slice(0,20)});
  }finally{
    await context.close().catch(()=>{});
  }
  return out;
}

async function main(){
  const opts=parseArgs(process.argv);
  const {chromium}=loadPlaywright();
  const browser=await chromium.launch({headless:!opts.headful,args:["--disable-background-timer-throttling","--disable-renderer-backgrounding","--disable-backgrounding-occluded-windows","--disable-features=IntensiveWakeUpThrottling,CalculateNativeWinOcclusion"]});
  const results=[];
  let next=0;
  const t0=Date.now();
  async function worker(id){
    while(next<opts.games){
      const gi=next++;
      log(opts,`[w${id}] game ${gi} start`);
      const res=await playOneGame(browser,opts,gi,id);
      results.push(res);
      const line=JSON.stringify(res);
      console.log(line);
      if(opts.out) fs.appendFileSync(opts.out,line+"\n");
      log(opts,`[w${id}] game ${gi} ${res.ok?"done":"FAILED"} in ${(res.durationMs/1000).toFixed(1)}s: ${res.error||""} ${JSON.stringify(res.scores)} winner=${res.winner} (${(res.winnerBrains||[]).join("/")}) moves=${res.moveCount} end=${res.endReason}`);
    }
  }
  await Promise.all(Array.from({length:Math.max(1,Math.min(opts.workers,opts.games))},(_,i)=>worker(i)));
  await browser.close();
  // Summary per brain label.
  const brains={};
  for(const r of results){
    if(!r.ok) continue;
    for(const p of PLAYERS){
      const b=r.seats[p];
      const s=brains[b]||(brains[b]={games:0,wins:0,ties:0,scoreTotal:0,marginTotal:0});
      const sc=r.scores[p];
      const best=Math.max(...PLAYERS.filter(x=>x!==p).map(x=>r.scores[x]));
      s.games++; s.scoreTotal+=sc; s.marginTotal+=sc-best;
      if(r.winner===p) s.wins++; else if(r.winner==="tie" && sc>=best) s.ties++;
    }
  }
  for(const s of Object.values(brains)){ s.avgScore=+(s.scoreTotal/s.games).toFixed(2); s.avgMarginVsBestOpp=+(s.marginTotal/s.games).toFixed(2); }
  const summary={summary:true,games:results.length,ok:results.filter(r=>r.ok).length,wallMs:Date.now()-t0,avgGameMs:Math.round(results.reduce((a,r)=>a+(r.durationMs||0),0)/Math.max(1,results.length)),brains};
  console.log(JSON.stringify(summary));
  if(opts.out) fs.appendFileSync(opts.out,JSON.stringify(summary)+"\n");
}
main().catch(e=>{ console.error(e); process.exit(1); });
