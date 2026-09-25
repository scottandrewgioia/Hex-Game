const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch();
  const page=await browser.newPage();
  await page.route('**/*',r=>{const u=r.request().url(); return (u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:'))?r.continue():r.abort();});
  page.on('pageerror',e=>console.log('PAGEERROR',e.message));
  page.on('console',m=>console.log('CONSOLE',m.type(),m.text().slice(0,200)));
  await page.goto('file://'+require('path').resolve('../sim.html')+'?simMode=1');
  await page.addScriptTag({path:'page-runtime.js'});
  await page.addScriptTag({path:'h3-brain.js'});
  const r=await page.evaluate(()=>{
    const seat=__HX.resolveSeat('H3');
    state.aiLevel.green='H3';
    return {seat, opts:selectableAIBrainOptions().slice(-2), levels:CURRENT_GAME_AI_LEVELS.slice(-3), h2ActiveGreen:aiH2Active('green'), h3ActiveGreen:aiH3Active('green'), h3ActiveBlue:aiH3Active('blue'), tier:aiHighEndSearchTier('green'), budget:aiThinkingBudgetMs('green'), human:isPlayerHuman('green'), lvl:state.aiLevel.green, disp:aiBrainDisplayLabelForLevel('H3'), brainSel:[...document.querySelectorAll('select.brainSelect')].length, skillSel:[...document.querySelectorAll('select.skillSelect')].map(s=>[...s.options].map(o=>o.value).slice(-2))};
  });
  console.log(JSON.stringify(r,null,1));
  await browser.close();
})();
