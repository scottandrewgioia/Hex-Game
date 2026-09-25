const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch();
  const page=await browser.newPage();
  await page.route('**/*',r=>{const u=r.request().url(); return (u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:'))?r.continue():r.abort();});
  await page.goto('file://'+require('path').resolve('../sim.html')+'?simMode=1');
  await page.addScriptTag({path:'page-runtime.js'});
  const r=await page.evaluate(()=>{
    const sig=s=>s.startingPlayer+":"+s.deck.slice(0,8).map(t=>t.sides.join("")).join("|");
    __HX.config={seed:5}; const a=sig(createState()), b=sig(createState());
    __HX.config={seed:6}; const c=sig(createState());
    // stock arena seeding (Math.random only)
    __HX.config=null; const d=sig(withSimulationArenaSeed(42,()=>createState())), e=sig(withSimulationArenaSeed(42,()=>createState()));
    return {sameSeedEqual:a===b, diffSeedDiffers:a!==c, stockArenaSeedReproducible:d===e};
  });
  console.log(JSON.stringify(r));
  await browser.close();
})();
