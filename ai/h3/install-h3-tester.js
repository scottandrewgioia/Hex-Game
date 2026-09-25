#!/usr/bin/env node
/*
 * install-h3-tester.js - add brain H3 to the QUEXATLE Tester (and optionally simulators).
 *
 * Usage (from the workspace root, e.g. C:\Hex\hex-fork-t):
 *   node install-h3-tester.js                     # patches hexxxagon-test-latest.html (+ hex.html if present)
 *   node install-h3-tester.js path\to\file.html   # patch specific file(s)
 *   node install-h3-tester.js --rollback          # restore the most recent backups made by this tool
 *
 * h3-brain.js must sit next to this installer (or pass --brain path\to\h3-brain.js).
 * What it does, per target file:
 *   1. refuses Android/PC products (data-visual-build android-fast / pc-deluxe without data-testing-build),
 *   2. backs the file up to backups\<timestamp>-before-h3-brain\<name>,
 *   3. removes any earlier H3 block (so re-running upgrades in place),
 *   4. inserts <script id="h3BrainRuntime" data-h3-version="..."> ... </script> before the LAST </body>,
 *   5. runs tools\verify-game-engine-lock.js if it exists (H3 adds no engine function edits).
 * H3 registers itself at runtime; no engine function is edited. Rollback = restore the backup.
 */
"use strict";
const fs=require("fs");
const path=require("path");
const {execFileSync}=require("child_process");

const args=process.argv.slice(2);
const rollback=args.includes("--rollback");
let brainPath=path.join(__dirname,"h3-brain.js");
const bi=args.indexOf("--brain");
if(bi>=0){ brainPath=args[bi+1]; args.splice(bi,2); }
const targetsArg=args.filter(a=>!a.startsWith("--"));
const cwd=process.cwd();
const defaults=["hexxxagon-test-latest.html","hex.html"].map(f=>path.join(cwd,f)).filter(f=>fs.existsSync(f));
const targets=(targetsArg.length?targetsArg.map(f=>path.resolve(f)):defaults);
const START="<!-- H3 BRAIN BEGIN -->", END="<!-- H3 BRAIN END -->";

function fail(msg){ console.error("ERROR: "+msg); process.exit(1); }

if(rollback){
  const dir=path.join(cwd,"backups");
  const runs=fs.existsSync(dir)?fs.readdirSync(dir).filter(d=>d.endsWith("-before-h3-brain")).sort():[];
  if(!runs.length) fail("no h3 backups found in "+dir);
  const last=path.join(dir,runs[runs.length-1]);
  const manifest=JSON.parse(fs.readFileSync(path.join(last,"manifest.json"),"utf8"));
  for(const m of manifest.files){ fs.copyFileSync(path.join(last,m.backup),m.target); console.log("restored",m.target); }
  process.exit(0);
}

if(!targets.length) fail("no target files found (run from the workspace root or pass file paths)");
if(!fs.existsSync(brainPath)) fail("h3-brain.js not found at "+brainPath);
const brain=fs.readFileSync(brainPath,"utf8");
if(brain.includes("</script")) fail("h3-brain.js contains </script which would break the page");
const version=(brain.match(/version:"([^"]+)"/)||[])[1]||"unknown";

const stamp=new Date().toISOString().replace(/[:.]/g,"-");
const backupDir=path.join(cwd,"backups",stamp+"-before-h3-brain");
fs.mkdirSync(backupDir,{recursive:true});
const manifest={tool:"install-h3-tester.js",h3Version:version,createdAt:new Date().toISOString(),files:[]};

for(const target of targets){
  if(!fs.existsSync(target)) fail("missing "+target);
  let html=fs.readFileSync(target,"utf8");
  const root=(html.match(/<html[^>]*>/i)||[""])[0];
  const product=/data-visual-build="(android-fast|pc-deluxe)"/.test(root) && !/data-testing-build="true"/.test(root) && !/data-simulation-build="true"/.test(root);
  if(product) fail(target+" looks like an Android/PC product build; H3 is for the Tester/simulators only");
  const backupName=path.basename(target);
  fs.copyFileSync(target,path.join(backupDir,backupName));
  manifest.files.push({target,backup:backupName,bytesBefore:Buffer.byteLength(html)});
  const s=html.indexOf(START), e=html.indexOf(END);
  if(s>=0 && e>s) html=html.slice(0,s)+html.slice(e+END.length);
  const at=html.toLowerCase().lastIndexOf("</body>");
  if(at<0) fail("no </body> in "+target);
  const block=`${START}\n<script id="h3BrainRuntime" data-h3-version="${version}">\n${brain}\n</script>\n${END}\n`;
  html=html.slice(0,at)+block+html.slice(at);
  fs.writeFileSync(target,html);
  manifest.files[manifest.files.length-1].bytesAfter=Buffer.byteLength(html);
  console.log(`installed H3 ${version} into ${target}`);
}
fs.writeFileSync(path.join(backupDir,"manifest.json"),JSON.stringify(manifest,null,2));
console.log("backup:",backupDir);

const lock=path.join(cwd,"tools","verify-game-engine-lock.js");
if(fs.existsSync(lock)){
  try{ execFileSync(process.execPath,[lock],{stdio:"inherit",cwd}); console.log("engine lock: ok"); }
  catch(err){ console.error("engine lock FAILED - restoring backups"); for(const m of manifest.files) fs.copyFileSync(path.join(backupDir,m.backup),m.target); process.exit(2); }
}
console.log("Open the Tester, pick H3 in a seat's brain menu (\"H3 Human-Edge (F8 kernel)\"). Re-download on phones after uploading to Drive.");
