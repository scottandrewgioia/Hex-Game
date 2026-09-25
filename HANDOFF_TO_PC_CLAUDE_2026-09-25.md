# Handoff: cloud Claude session → Claude on Scott's PC (works alongside Codex)

Written 2026-09-25 by the cloud Claude session (claude.ai/code/session_01GZqaQyCcrpi5XQNKo8abKW).
Also saved to Google Drive: `hex/H3 brain/HANDOFF_TO_PC_CLAUDE_2026-09-25.md`.

## Who you are and why this handoff exists
- You should be a Claude Code session running **on Scott's PC** in `C:\Hex\hex-fork-t` (Drive at `G:\My Drive\hex`),
  controlled from Scott's phone with **Remote Control**. That lets you read Codex's files, edit the real game builds,
  and save them straight to Drive. The cloud session could do none of that (no PC disk, 10 MB Drive limit).
- Scott's rules (see `CLAUDE.md` in the `Hex-Game` repo): check you are **remote** at the start of every session and
  alert Scott at once, in plain words, if you are not. Explain simply; Scott works from their phone.
  Keep the old workflow: **update the game → put it on Drive.** Don't invent new steps for Scott.

## First thing to do
1. Read `HANDOFF_TO_CLAUDE_TESTER_GAME_2026-09-25.md`. Codex wrote it on the PC, probably in `C:\Hex\hex-fork-t`
   (it never reached Drive or GitHub, so the cloud session could not read it). It describes Scott's Tester game
   against H3 today: Scott won, and said H3 "played well".
2. Use that game to find what Scott did to beat H3 and turn it into the next H3 rules (see "Next work" below).
3. Ask Codex, or tell Scott to ask it, to save future handoffs for Claude to `G:\My Drive\hex\handoffs\`.

## Where everything is
- **GitHub** `scottandrewgioia/Hex-Game`, branch `claude/remote-session-qn2ufy` (PR #1 open into `main`):
  - `ai/h3/h3-brain.js`: **H3 v5b, the current brain** (version string `h3-f8-kernel-v5b`, 17,344 bytes).
  - `ai/h3/install-h3-tester.js`: installs H3 into a Tester file (backs up first, `--rollback` supported,
    refuses Android/PC product builds, runs `tools/verify-game-engine-lock.js` if present).
  - `ai/h3/harness/`: headless arena (`run-match.js` + `page-runtime.js`), rules (`RULES.md`), engine API notes (`API.md`).
  - `ai/h3/sim.html`: the Sep 15 simulator the harness loads ("H2 All-Brains Block-Balanced Simulator").
  - `ai/h3/research/`: `LINEAGE.md` (all brains A→H2), `HUMAN_ANALYSIS.md` (Sep human games), `CODEX_STRATEGY.md`
    (what Scott and the Codex agents already worked out about strategy).
  - `ai/h3/results/h3v5b-arena30.jsonl`: the arena results below.
  - `builds/QUEXATLE-TESTER-WITH-H3.html`: Tester (Sep 15 build) with H3 v5b installed, 24,140,706 bytes,
    SHA-256 `6bece1dc…c0055c`. Scott is playing this copy now (downloaded from a claude.ai download page).
- **Drive** `hex/H3 brain/` (id `1ZUL2G6GTmHcEQlui9zF6WZPX7Kv5n_Dq`): `h3-brain.js` (v5b), `install-h3-tester.js`,
  two `OLD-buggy-*` files (ignore), `H3_HANDOFF_FOR_PC_SESSION.md` (older, shorter note).
- The Tester on Drive, `hex/hexxxagon-test-latest.html`, is **still the old build without H3**.

## Put H3 into the real Tester (the job the cloud session could not do)
From `C:\Hex\hex-fork-t`, with Scott's OK:
```
node "G:\My Drive\hex\H3 brain\install-h3-tester.js" --brain "G:\My Drive\hex\H3 brain\h3-brain.js" hexxxagon-test-latest.html
```
Then open it, check the brain lists end with **"H3 Human-Edge (F8 kernel)"**, and copy it to `G:\My Drive\hex\`
the usual way. Tester/simulators only. Never Android or PC product builds unless Scott asks.
Also: Scott temporarily set the Drive Tester to "anyone with the link" so the cloud session could download it.
Remind Scott to set it back to **Restricted**.

## What H3 is
- Wraps the F8 brain (F1-v2 parent + F7 donor, tier 15) at runtime. No engine functions are edited.
- **Critical bug fixed in v5b:** earlier versions renamed F8's decision gate (`aiDecisionGate = "f8-f1-bounded-trilens"`).
  The engine then ran its generic D4 "upgrade" finalizers on H3's moves, which scrambled them. **Never rename a
  brain's gate when wrapping it.** With the gate kept, a rule-free H3 copies F8 move for move (tested on a seeded game).
  Results from v1–v4 are invalid.
- On top of F8, v5b adds: R1a/R1b end-of-game pass rules, R3 opening dump cap, R4 no zero-point hand placement,
  R5 save erasers for late game, R6 overwrite instead of passing in overtime, R7 keep an eraser in regulation,
  R8 cut-point defense. R2 is off. It also **removes F1's contact bonus**
  (`contactValue*2.1 + contacts*2.2` inside `aiF1BoardMoveProfile`). That bonus double-counted points and made the AI
  clump. Scott wants it removed from H3 and "probably all or at least most advanced brains". There is no old
  vertex bonus left (`vertexBonusScoreForPlayer` returns 0).

## Results (headless, H3 v5b vs F8 vs F5, seats rotated, seed 8200; all 30 games finished)
| Brain | Wins | Avg score |
|---|---|---|
| **H3 v5b** | **16** (+1 shared first) | **64.4** |
| F5 | 9 | 59.0 |
| F8 | 5 | 60.6 |
So H3 v5b is the strongest brain measured so far. Before this, F8 was best (~44% in strong-six arenas; H2 30%).
Run: `node ai/h3/harness/run-match.js --seats H3,F8,F5 --inject ai/h3/h3-brain.js --games 30 --workers 3 --rotate --seed 8200 --out out.jsonl`
(needs Playwright + Chromium; games take about 10 minutes each).

## Next work (in order)
1. Read Codex's handoff about Scott's H3 game, work out how Scott won, and add counter-rules.
2. Find out which change made H3 stronger: test the no-contact change alone on F8, then all v5b rules without it.
3. If no-contact helps on its own, add a switch to remove the contact bonus from other F-line brains (Scott asked for this).
4. Improve the rules using `CODEX_STRATEGY.md`:
   - Cap opening dumps by how much they give away, not by tile count.
   - Ban only moves with zero net value.
   - Overwrite only when it doesn't help an opponent just as much.
   - Save erasers only when there is a target to hit.
   - Defend cut points against chained overwrites, weighting the next player and the leader.
   - Once the board is full, play for the widest margin.
   - Use aura defensively.
   - Build lines, not clumps.
5. Humans still beat the AI most of the time (27/30 in June). The goal is a brain that beats Scott.

## Don'ts
- Game rules and engine are frozen unless Scott explicitly asks.
- Don't change Drive sharing or Firebase, or publish products, without Scott's explicit OK.
- Playtest material is confidential.
