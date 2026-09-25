# Simulator / engine API (sim.html, "Hexxxagon H2 All-Brains Block-Balanced Simulator", 2026-09-15)

Line numbers refer to `../main.js` (the extracted main inline script). Everything below is a **global** in the
page: top-level `function` declarations are writable `window` properties that the engine resolves at call time
(the engine itself re-binds `runAI` this way, main.js ~51760), and top-level `const`/`let` live in the shared
global lexical scope (readable from any later classic `<script>` / `page.evaluate`, `let`s are assignable;
`const` bindings cannot be reassigned but their objects/arrays are mutable, none are frozen except where noted).

## 1. State (`let state=createState()`, main.js 368)

| Field | Meaning |
|---|---|
| `gameId`, `ruleset` (`"classic"`/`"overwrite-endgame"`) | identity / ruleset |
| `turnIndex` (0..2 into `PLAYERS`), `turnNumber` (1-based, +1 per turn), `startingTurnIndex`, `startingPlayer` | turn order; `currentPlayer()` = `PLAYERS[state.turnIndex]` |
| `board` | `{ "q,r": {tile} }`; `"0,0"` is the center grey. Tile = `{uid, kind:"solid"|"bicolor"|"tricolor", sides:[6 colours], rotation, starter?, owner?, auraPlacedBy?, bitmapSrc, bitmapSides}` |
| `deck` | array of tiles (index 0 = next flip). Hidden from AIs (information model). |
| `pool` | 5 slots (tile or null). `poolLockedThisTurn[5]` = per-slot lock `{source,player}` for tiles placed there this turn. |
| `hands` | `{red:[3], green:[3], blue:[3]}`; slot 0 public. |
| `selected` | currently selected tile `{source:"deck"|"hand"|"pool", index, tile, finalDeckTile, poolDumpAllowed, forcedBoard, ...}` — a flipped deck tile lives here until resolved (`revealedDeckTilePending()`). |
| `placementsThisTurn`, `firstPlacedSource`, `handBoardPlacementsThisTurn`, `bonusPoolPlacementsThisTurn`, `lastPlaced` | per-turn chain state (`markResolvedPlacement`). |
| `deckDumpRunActive`, `deckDumpsThisTurn`, `deckDumpLimitThisTurn` | deck→pool dump run. |
| `openingPlaced{p}`, `openingBoardPlacementsThisTurn{p}` | opening turn bookkeeping. |
| `noPlacementTurnStreak`, `consecutivePassPlayers[]` | 3-pass end counter. |
| `endgameOverwriteUnlocked`, `overwriteUnlockReason`, `boardFilledMoveNumber`, `scoresAtBoardFill`, `leaderAtBoardFill`, `overwriteMoves`, `overtimeDeckTile`, `overtimePoolOfferRevealed`, `overtimePoolRevealActive`, `overtimeRevealedPoolSlots`, `overtimePrepareBlockedForTurn` | overtime phase. |
| `projectedAura` (legacy), `auraHexesCreated{p}` | aura bookkeeping (actual aura is derived from `board` each call: `auraTouchMap`/`auraControlAt`). |
| `discardedTiles`, `endPendingReason`, `gameOver`, `winner` (`"red"`/.../`"tie"`) | end state. |
| `aiLevel{p}` | level label per seat (`"Human"`, `"Basic"`, `"A5"`, `"Advanced"`, `"D4"`..`"H2"`). `isPlayerHuman()` normalises it through `currentPlayableAILevel()` (unknown labels become `"Advanced"`, so a new label must be in `CURRENT_GAME_AI_LEVELS`). |
| `aiBrainIds{p}` | optional per-seat brain-id override (Tester brain picker). |
| `simulation` | simulator metadata incl. `brainSeats{p}.brainId` (authoritative seat→brain map during arena games), `randomSeed`, `fullAICompletionRequired:true`, `arenaPattern`. `null` in normal play. |
| `trainingMoves[]`, `trainingMoveNumber`, `playByTurnMoves[]` | move log (`recordTrainingMove`). |
| `trainingLastResult` | result object built by `recordTrainingGameResult` (scores, winners, aiBrainResults, audits, moves...). |
| `aiInformationAudit` | blind-deck / hidden-information audit counters. |

Useful pure-ish queries: `totalScoreForPlayer(p)`, `compactScores()`, `linkedScoringComponentsForPlayer(p)`,
`isBoardPlacementLegal(p,tile,q,r,false,source)`, `auraControlAt(q,r)`, `isOwnAuraPlacementSpace`,
`isOpponentJewelAuraSpace`, `openBoardCells()`, `boardPlacementCandidateCells()`, `boardHasNoOpenSpaces()`,
`isEndgameOverwriteActive()`, `endConditionReason()`, `aiTileRotations(tile)`, `rotateTileClone(tile,n)`,
`clone(x)` (JSON deep copy), `snapshotState()`.

## 2. Move generation

- `aiPossibleFirstMoves(player)` (main.js 23008) — complete rules-legal action list for the current decision
  point (start of turn, hand-chain continuation, bonus, revealed deck tile, overtime...). Async twin:
  `aiPossibleFirstMovesResponsive(player, runToken, seed)` (23181), same set, yields to the event loop.
- Hidden-deck draw is NOT in that list: a brain returns `aiBlindDeckCommitMove(player,moves)`
  (`{source:"deck",kind:"draw",blindDeckChoice:true}`) when `aiCanCommitBlindDeck(player)`.
- Continuations inside a turn: `aiBestHandBoardMoveResponsive(player)` (hand chain) and
  `aiBestPoolBoardMoveResponsive(player)` (hand-empty bonus) build their own candidate lists and go through
  `aiChooseTurnContinuationResponsively(player,moves,runToken,kind,compute)`.
- Rotated placements: `addAIRotatedBoardMoves(moves,player,source,index,tile,extra)` (22636); hand→pool:
  `addAIHandPoolMoves`; passes: `aiCreatePassMove`/`addAIPassMove` (`passReason` strings:
  `complete-three-pass-end`, `finish-hand-play`, `skip-empty-hand-pool-bonus`, `no-legal-action`,
  `finish-full-board-hand-chain`, `discard-overtime-pool-choices`, `overtime-pass`,
  and the revealed-deck `discard-full-pool-plus-flipped-deck`).

Move object fields: `source` ("hand"|"pool"|"deck"|"none"), `player`, `index` (source slot, -1 for deck),
`kind` ("board"|"hand"|"pool"|"pass"|"draw"), `q`,`r`,`rotation`,`tile` (already rotated), `handIndex`,
`poolIndex`, `overwrite`, `legalSource`, `overtimeChoice`, `opening`, `bonus`, `handEmptyBonusSetup`,
`revealedDeckTile`, `finalDeckTile`, `passReason`, `aiPassChoice`, `blindDeckChoice`; brains add
`aiBrainId`, `aiBrainQuickLabel`, `aiDecisionGate`, `aiDecisionReason(s)`, `aiDecisionContext`.

## 3. Applying moves

There is no single pure `applyMove(state,move)`. AI moves are executed inside `runAI()` (main.js 51027-51760):
`drawFromSpecificSource(move)` + `removeFromSource(move)` → `placeBoardTileWithOverwrite(tile,q,r,source,player)`
(board, incl. aura projection & overwrite) / write to `state.hands` / `state.pool` + `markPoolSlotLockedThisTurn`
→ `markResolvedPlacement(source,onBoard)` → `recordTrainingMove(...)` → `noteBoardFillForOverwrite()` →
end-of-turn: `applyEndOfTurnPlacementStreak`, `maybeEndGame()`, `finishTurnAdvance()` (→ `advanceTurn()` →
`maybeAutoRunAI()`). Deck: `tryDrawDeck()` / `flipFinalDeckTileForPlacement()`. Passes: `aiExecutePassChoice`,
`discardFullPoolForPassRound`, `discardOvertimeChoices`. Overtime reveal: `revealOvertimePoolOffer`.
Human UI path: `placeSelectedOnBoard(q,r)` → `afterSuccessfulPlacement`, `endTurn()`.
For look-ahead, brains mutate `state` temporarily and restore it (e.g. `simulateBoardMoveScore`, `aiH2WithState`).

## 4. Brains: ids, labels, dispatch

- `AI_BRAIN_IDS` (5244): level/label → brain id (`H2:"OPTION-ECONOMY-TRIMODAL-H2-v1"`, `AdvancedH2` alias, ...; `Advanced` = D3 id).
- `AI_BRAIN_QUICK_LABELS` (5294): brain id → quick label (B1, A1..H2).
- `CURRENT_GAME_AI_LEVELS` (1446): selectable levels; `normalizeAILevel`, `currentPlayableAILevel`.
- `selectableAIBrainOptions()` (1537): brain-picker list (hard-coded array; wrap to extend). `makeAIBrainSelect`,
  `makeAILevelSelect` build Tester menus from it (only when `playtestBrainPickerEnabled()`).
- `aiBrainIdForLevel`, `activeBrainIdForPlayer`, `aiBrainIdOverrideForPlayer`, `applyPlayerBrainSelection`.
- Arena: `SIM_ARENA_ALL_BRAINS` (24 labels; D7, E1, F3 retired), `SIM_ARENA_SCHEDULE`,
  `simulationArenaBrainIdForLabel`, `simulationArenaLevelsForGame`, `simulationArenaBrainIdsForGame`,
  `simulationArenaSeedForGame`, `simulationBrainSeatsForLevels`.
- Per-brain predicate: `aiXxActive(player)` (e.g. `aiH2Active` 38685) = `level==="H2"` or seat brainId is H2's
  (checks `state.simulation.brainSeats[p].brainId`, then Tester override, then `aiBrainIdForLevel`).
- Search tier: `aiHighEndSearchTier(player)` (level→tier; H2 22 ... F1 8, D4 4, else 0). Drives
  `aiThinkingBudgetMs` and `aiThinkingWorkLimitFor`.

Dispatch per AI turn (`runAI`, 51027):
1. `aiPossibleFirstMovesResponsive` → complete legal set.
2. `aiChooseObviousRevealedOwnSolidMoveResponsive` (legacy shortcut; skipped for F3..H2).
3. `aiComputeResponsively(player, ()=>aiChooseMoveResponsive(player,runToken,moves,{allowBlindDeck:true}), 0, failsafe, ponderHandoff)`.
4. `aiChooseMoveResponsive` (50116) is a fixed chain: H2 → H1 → G5 → G4 → G3 → G2 → G1 → F8 → F7 → F6 → F5 → F4 → F3 → F2 → F1 → E1 → D7 → D6 → D5-starter → blind-deck heuristic → D4/D5 simulation → tester fast move → D5 vector → D4 safe → D5 doctrine → modular (`hexChooseModularMoveResponsive`, used by B1/A*/C*/D3) → `aiChooseMove`. Each `aiChooseXxMoveResponsive` returns `null` unless its `aiXxActive(player)` is true; the first non-null result goes through `aiFinalizeChosenMoveResponsive`.
5. Shared post-filters: `aiApplyFundamentalMoveSafety`, `aiApplyUniversalFinishMemory`, `aiApplyTerminalSelfPreservation`, `aiStampPublicInformationDecision`, `attachExpandedDecisionAudit`.
6. Execution (§3); hand-chain / bonus follow-ups call `aiBestHandBoardMoveResponsive` / `aiBestPoolBoardMoveResponsive` → `aiChooseTurnContinuationResponsively` (saved plans `aiPreparedH2ContinuationMove` ... then the brain chooser with `{continuation:"hand"|"pool"}`).
7. A Web Worker ponder (`aiPonderWorkerMain`, blob URL) speculates during other seats' turns; `aiF1PonderHandoffConfig` gives F1-H2 an early hand-off at `AI_F1_PONDER_HANDOFF_MS=60000` when ≥512 legal moves.

## 5. Timing knobs

| Knob | Where | Value | Effect |
|---|---|---|---|
| `hexSimulationFastMode()` | 3291 | true in sim build during arena games | all `aiPacingDelay` / `aiTileVisualDelay` / reveal / handoff delays become event-loop yields (0 ms); `scheduleAIRunTimer` uses a MessageChannel task. |
| `?simVisuals=off` / `simStrippedVisualMode()` | 3315 | default on in sim build | no animations/SFX delays. |
| `?simRenderMs=N` | `simVisualRenderIntervalMs` 3338 | default 420 ms | `renderAll()` throttle; harness uses 600000 (renders only at game end). |
| `aiThinkingBudgetMs(player)` | 20072 | tier≥8: 8500 ms desktop / 6500 mobile (×1.08 late, ×1.15 very late); tier 7: 7000; 6: 5600; 5: 3600; 4: 2700; others 150-980 | soft deadline (`aiThinkingSoftDeadlineExceeded`, `aiThinkingTimeExceeded`) brains poll to stop search. |
| `aiThinkingWorkLimitFor(player)` | 20115 | tier≥10: 148 checkpoints; 8-9: 124; ... Basic 12 | deterministic search cut-off (count of `aiThinkingTimeExceeded()` calls). |
| `AI_TURN_COMPLETE_MAX_MS` / `AI_TURN_WORK_MAX_MS` | 862-864 | 90 000 / 70 000 ms | whole-turn hard ceiling (`ensureAIWholeTurnDeadline`, `armAIWholeTurnWorkDeadline`); on expiry the engine uses `aiChooseFailsafeMove` → game marked invalid by `simulationAIDecisionAuditFromMoves`, or (timeout) asks to reload and retry (`retryFullSimulatorDecisionTimeout`). |
| `aiHardThinkingLimitMs` / `AI_FULL_SIM_HARD_LIMIT_MS` | 20258 / 20257 | 90 000 in full sim | per-compute hard limit. |
| `AI_F1_PONDER_HANDOFF_MS` | 851 | 60 000 | early hand-off from worker ponder. |
| `hexSimulationAIShortcutMode()` | 3301 | hard-coded `false` | would cap budgets at 1.2-6.5 s; deliberately disabled ("never reduced game or AI logic"). |
| `aiBudgetMobileMode()` | 16147 | false on desktop | mobile budgets. |

The harness (`page-runtime.js`) exposes `budgetScale` (× `aiThinkingBudgetMs`), `workScale`
(× `aiThinkingWorkLimitFor`), `handoffScale` (× ponder hand-off), `turnCapMs` (shrinks the whole-turn deadline;
overruns produce failsafe moves → audit failure; smoke tests only). Scaled runs are no longer "full parity".

## 6. How the simulator runs a game / arena and records results

`startSimArenaSession(options)` (4853) → `inGameSimulation={active:true,mode:"survival",...}` →
`beginNextInGameSimulationGame()` (4583): picks levels/brainIds/seed from the schedule, `state=withSimulationArenaSeed(seed,createState)`,
fills `state.simulation` (incl. `brainSeats`), `maybeAutoRunAI()`. The game is then driven entirely by `runAI` re-scheduling itself.
`finalizeGame(reason)` (18322) → `recordTrainingGameResult(scores,winners)` (6848; builds `state.trainingLastResult` with
rotation / AI-decision / hidden-information audits, uploads via `uploadTrainingGameRecord` to the local recorder
`http://127.0.0.1:8132` or Firebase) → `scheduleNextInGameSimulationGame(scores,winners)` (4728: focus stats for H2 vs F1,
page recycle every 5 games, next game). `options.dedicatedRunner/workerGameIndex` plays exactly one scheduled game and
sets `window.__hexDedicatedWorkerResult`.

**Engine finding:** `withSimulationArenaSeed` only replaces `Math.random`, but `buildDeck` → `shuffleDeck` → `randomDeckIndex`
and `randomStartingTurnIndex` use `crypto.getRandomValues`, so the stock arena "paired deal" seeds do **not**
reproduce deals. The harness seeds `crypto.getRandomValues` (and `Math.random`) during `createState`.

## 7. Harness hook points (page-runtime.js)

Injected after load with `page.addScriptTag`; it wraps (never edits): `uploadTrainingGameRecord`,
`updateHumanPlayerCloudForFinishedGame`, `saveHumanGameCheckpoint`, `saveSimArenaSessionState`, `saveSimArenaLastRun`,
`requestSimulationWakeLock`, `releaseSimulationWakeLock`, `shouldRecycleSimulatorArenaPage`, `reloadSimulatorArenaPage`,
`saveTrainingStore`, `simulationArenaBrainLabelsForGame`, `simulationArenaLevelsForGame`, `simulationArenaBrainIdsForGame`,
`simulationArenaPatternForGame`, `simulationArenaSeedForGame`, `createState`, `aiThinkingBudgetMs`,
`aiThinkingWorkLimitFor`, `aiF1PonderHandoffConfig`, `ensureAIWholeTurnDeadline`, `aiChooseMoveResponsive` (timing),
`runAI` (timing), `scheduleNextInGameSimulationGame` (result capture; stops after one game). Game start:
`startSimArenaSession({localRecorderReady:true,dedicatedRunner:true,workerGameIndex:1,...})`.
API: `__HX.runGame({seats:{red,green,blue},seed,first,ruleset,budgetScale,workScale,handoffScale,turnCapMs,keepMoves})`,
`__HX.status()`, `__HX.resolveSeat(label)`, `__HX.decisions` (per main decision ms), `__HX.turns` (per runAI ms).
Network: run-match.js aborts every non-file/data/blob request (Firebase, Apps Script, local recorder).

## 8. Registering a new brain (e.g. H3) without editing the engine — `h3-brain.js`

One classic script, inserted after the engine script (Playwright `--inject h3-brain.js`, or `<script src>` /
inline before `</body>` of sim.html or the Tester). It relies on exactly these engine globals:

Mutable tables (added to, never replaced): `AI_BRAIN_IDS` (adds `H3`, `AdvancedH3`), `AI_BRAIN_QUICK_LABELS`
(adds id→"H3"), `CURRENT_GAME_AI_LEVELS` (push "H3" — required, otherwise `isPlayerHuman()` rewrites the level to
"Advanced").

Read-only globals: `state`, `PLAYERS`, `currentPlayer()`, `normalizeAILevel()`, `renderAll()` (optional), `TRAINING_BUILD` (optional),
`simulationArenaBrainLabelsForGame` (optional, sim only).

Wrapped functions (each wrapper delegates to the original for non-H3 seats; any that is absent is skipped):
`selectableAIBrainOptions` (brain picker entry), `aiBrainDisplayLabelForLevel` (level menu text),
`simulationArenaBrainIdForLabel`, `simulationArenaLevelsForGame` (arena label "H3" → level "H3"), `aiBrainSourceForLevel`
(seat identity), `aiH2Active` (H3 seats inherit the whole H2 kernel: chooser, saved continuations, ponder hand-off),
`aiHighEndSearchTier` (H3 = 22, same budgets as H2), `aiChooseH2OptionEconomyMoveResponsive` (H3 decision layer →
`HEX_H3.chooseMove`, falls back to H2; stamps `aiBrainQuickLabel:"H3"`, `aiBrainId`, gate `h3-...`),
`aiChooseH2OptionEconomyMove` (sync twin, stamping only). Defines `window.aiH3Active(player)` and `window.HEX_H3`.
Hard requirements checked at install: `AI_BRAIN_IDS`, `AI_BRAIN_QUICK_LABELS`, `CURRENT_GAME_AI_LEVELS`, `state`,
`PLAYERS`, `normalizeAILevel`, `currentPlayer`, `aiH2Active`, `aiChooseH2OptionEconomyMoveResponsive`,
`aiHighEndSearchTier`, `selectableAIBrainOptions`, `aiBrainDisplayLabelForLevel`.
`initialPlayableAIBrainIdsForBuild` / `initialPlayableAILevelsForBuild` are NOT touched (Tester defaults stay H2/F1);
wrap them to make H3 a default seat.

Selecting H3: run-match `--seats F8,H3,H2`; in page `state.aiLevel[p]="H3"` (or Tester menus, which call
`applyPlayerBrainSelection(p, "OPTION-ECONOMY-TRIMODAL-H3-v1")`); arena: `simulationArenaBrainIdForLabel("H3")`.
Writing H3 logic: set `HEX_H3.chooseMove=async ({player,moves,runToken,options,h2,state})=>move|null`
(return an element of `moves`, `aiBlindDeckCommitMove(player,moves)` when `options.allowBlindDeck`, or null for H2),
or wrap individual H2 stages for H3 seats only (`aiH2Situation`, `aiH2RootCandidates`, `aiH2ExploreRoot`,
`aiH2ScoreLenses`, `aiH2Consensus`, `aiH2ApplyForecastsResponsive`, `aiH2SelectProgram`, `aiH2AttachDecision`).
Honour `aiChoiceCancelled(runToken)` and `aiThinkingTimeExceeded()`/`aiThinkingSoftDeadlineExceeded()` and `await aiResponsiveYield()`
in long loops, or the 70 s work deadline produces a failsafe move and the simulator marks the game invalid.
A brain that does not want the H2 kernel should set `HEX_H3.inheritH2=false` and add its own dispatch by wrapping
`aiChooseMoveResponsive` and `aiChooseTurnContinuationResponsively` (both take `(player, moves, runToken, ...)`).

## 9. Harness usage and measured performance (this container: 4 vCPU, headless Chromium 1194)

```
node run-match.js --seats F8,F5,H2 --games 3 --workers 3 --rotate --seed 1000 --out results.jsonl
node run-match.js --seats H3,F5,H2 --inject h3-brain.js --games 6 --workers 3 --rotate --seed 2000
```
Each game = fresh browser context loading `../sim.html?simMode=1&simVisuals=off&simRenderMs=600000`
(~0.4 s), page-runtime.js + injected scripts, `__HX.runGame`, poll `__HX.status()` every 1 s.
Output per game: seats, seatInfo (level + brainId), scores, winner (`"tie"` possible), winnerBrains, startingPlayer,
endReason (`tiles`/`no-moves`/`board`), turns, moveCount, durationMs, decisionTiming / aiInvocationTiming per brain
(n, avgMs, max, totalMs), result (audits, overtime reason, overwrites, discarded tiles, ...), pageErrors;
`--decisions` adds every decision record; `--keep-moves` adds the engine move log.

Full-budget (engine default) F8/F5/H2, 3 games in parallel (verify-f8-f5-h2.jsonl): 632 s, 684 s, 685 s per game
(wall 685 s for all 3); 128-160 moves, 80-85 turns. Main decision time per brain: F8 avg 2.1-2.4 s, F5 2.8-2.9 s,
H2 2.9-3.6 s; max ≈10.3-10.7 s (= 8.5 s soft budget × 1.15 late-game + overhead); whole runAI invocation max 20 s.
All AI-decision audits passed (0 fallback moves).
`--budget-scale 0.25`: 330-379 s per game, decisions avg 1.2-1.8 s, but H2 still peaks at 10-18 s
(work-checkpoint limit, forecasts and saved continuations are not time-scaled) and results shift markedly
(3-game sample: H2 went from 2 wins + 1 tie to 0 wins + 1 tie), so reduced budgets are not strength-preserving.
Workers: each page is effectively single-threaded (plus a ponder Web Worker); use workers ≤ cores-1.
