# QUEXATLE brain lineage: digest for designing I1

Compiled 2026-09-25 from the Drive reports listed in the Sources section and from a read of `sim/main.js` (58,281 lines, 36 brain ids). Function names refer to `main.js`. "Arena" means the private-harness paired-deal round robins, where every trio plays all 6 seat orders and a tied first counts as **zero wins**. For binomial context, 60 appearances give a standard error of about 6 percentage points, and 18 appearances about 11.

---

## 0. Executive summary

1. **F8 and F5 are the strongest arena players.** In the only complete 120-game arenas that contain both F and G/H brains (strong-six Sep 13–14; H2 strong-six Sep 15–16), F8 won 28/60 and 25/60, and F5 won 27/60 and 15/60. Every G brain stayed at or below 26.7% until H2, which reached 30.0%. G4, G5, H1 and H2 were all built after F8 and all lose to it.
2. **Why F beats G/H.** F8's base policy (F1-v2) scores immediate points in raw currency (`ownGain*11.5` in `aiF1BoardMoveProfile`). The G line z-normalises three "lenses" across the candidate set (`aiG5Consensus`) and discounts immediate score early (`phaseWeight` in `aiG5MathLens`). The geometric lens *abstains* for non-placing moves, which then receive the placement mean (`aiG5ScoreLenses`). The result: the G line places for fewer points (3.18–3.48 vs F8 3.74 per placement), reaches board fill in the lead less often, and dumps to the pool more in the opening (106–129 vs 65–72 per 60 games). Overtime is net-negative for everyone. The game is mostly decided **at board fill**: the fill leader kept the win 51/116 times.
3. **The G/H line has good ideas that F8 lacks:** two clocks (deck and cells), overtime strike rules, late-regulation bank-before-dump, no hostage banks, two-opponent public rollout, and the H2 0-0-0 and opening-hunt guards. The move grader rewards these ideas (G4/G5 regret 7–11 vs F8/F5 16–17). The grader is not a strength measure, though. Its 12 positions are the exact failures the G line was patched to fix, and a harness bug made the F brains' graded moves come from a synchronous path that real play never uses.
4. **Recommended I1:** **F8 as the base**, keeping F1-v2's raw-point evaluator and 84-candidate / 22-root complete-turn search untouched in ordinary positions. Graft on, in priority order:
   - (P0) terminal/0-0-0 and opening-hunt fixes, plus four hard fixture rules from G5/H2;
   - (P1) a late-regulation survival-adjusted valuation, using a two-opponent erase forecast plus fragility insurance, to convert fill leads (F8 kept only 15 of 27);
   - (P1) F5's scarcity-aware pass/fish discipline and prospective pool-bonus contract, to cut F8's 61 pool wipes and raise pool conversion toward F5's level.

   Do **not** import lens z-fusion, the room-first head, or more banking. Screen against F8 and F5 only.

---

## 1. Timeline of brain families

Dates come from `*_EVIDENCE.builtAt/auditedAt/refreshedAt` in `main.js` and from the named docs. Win % is outright first; tied firsts count as losses.

### 1a. A–E generations (June–July 2026)

| Id | Date | Core idea | Measured results | Source |
|---|---|---|---|---|
| B1 `BASIC-RULES-HEURISTIC-v1` | pre-June | Rules-legal heuristic scorer | Old "Basic" tier: 25.5% of 483 seats in the overwrite dashboard summary | HUMAN_VS_AI_DEEP_ANALYSIS |
| A1 `ADVANCED-HUMAN-MODELED-v1` | ≤June | Human-modeled multipliers | 231 appearances, 39.8%, margin −2.8 (A3/A4 archive arena) | WINNING_STRATEGY_INSIGHTS (WSI) §July 18 |
| A2 `ADVANCED-SITUATIONAL-OPPORTUNIST-v1` | ≤June | Situational opportunist | 232 appearances, 41.4%, margin −3.0 | WSI |
| A3 audit planner / A4 turn planner | June; A4 shelved Jun 19 | Planner labels over an additive scorer | A3 26.4% (91 appearances, −9.7); A4 24.5% (327, −7.7). "The planner label did not create a true plan." | WSI |
| A5 `ADVANCED-CONSERVATIVE-GOVERNOR-v1` | ≤June | Conservative governor | Grader regret 8/3 positions (human2-all) | grader 09-10 |
| "Champion/Advanced" (June build `deck100-human-winner-pattern-ai-15`) | Jun 8 | — | vs human: AI seats won 3/60 (5%); human 27/30 | HUMAN_AI_TACTICAL_AUDIT, DEEP_ANALYSIS |
| C1/C2 `DATA-MINED-HUMAN-AUDIT-*` | June | Data-mined human audit weights | Grader regret 8/3 (human2-all) | grader 09-10 |
| D3 `SEARCH-LOOKAHEAD-D3-v1` | July | 1–2 ply lookahead | Grader 5/3 | grader 09-10 |
| D4 `PREDICTIVE-GAMBLER-D4-v1` | July | Predictive gambler; jewel-capacity profile (`aiD4StarterJewelMoveProfile`, still used by F1) | Top-half arena 1/18 (5.6%), 2.87 pts/placement | Top-half REPORT, THREE-LENS |
| D5 `DOCTRINE-SEARCH-D5-v1` | July | Doctrine + D4 score stack | Long-time tester default; top-half 0/18 | Top-half REPORT |
| D6 v1–v3 `COUPLED-STRATEGY-D6` | Jul 16–18 | Source–destination–continuation bundles; normalised evaluator; force-line (jewel-rooted path) gate; closed-board aura gate (≤12 cells) | r1 2-3 (5 games), r2 1-4, r3 1-4 (same as D5 control); top-half 0/18, banked the most (210) but converted the least pool (237) | WSI §D6, D6 handoff, THREE-LENS |
| D7 `ADVERSARIAL-TURN-SEARCH-D7(-RESTORED-v2)` | Jul 19–24 | Complete own turn + both opponents' greedy complete turns (`aiD7GreedyCompleteProgram`); build-parity rule | 495/660-game parity arenas (results not in the docs read); D7 machinery is reused by F1 advisors and G forecasts | WSI §D7 |
| E1 `DESTINATION-FIRST-E1-v1` | Jul 27 | Rank destinations first; reply risk only from the *actual next* player; tactical floor | 8/12 vs D5 with D6 as third seat; top-half 0/18 | WSI §E1 |

### 1b. F generation (Jul 30 – Aug 22)

| Id | Date | Core idea | Measured results | Source |
|---|---|---|---|---|
| F1-v2 `FLEXIBILITY-F1-v2` | corpus Jul 30 | Normalised human-corpus evaluator. Modes curate/stage/burst/purge/exploit/buffer/harvest. Prior brains (D5/D6/D7/E1) act as capped advisors. Complete own-turn programs. | **239/262 archived+current (91.2%)**, mostly against older rosters. Top-half 4/18 (22.2%), 3.84 pts/placement, 60 wipes. Grader regret 16/12 | `AI_F1_EVIDENCE`; THREE-LENS; grader 09-14 |
| F2 `PLANNED-AGENCY-F2-v2` | Aug 6 | Conditional policies, reserve contracts, next-player gift charge, nonlinear late aura | Aug 14 audit: 4.29 pts/board, 5.6/pool conversion. Top-half 7/18, highest pts/placement (3.91) and mean score (70.3), 66 wipes | WSI; THREE-LENS |
| F3 `TERRITORIAL-CONVERSION-F3-v1` | Aug 12 | Expiring real estate, private denial | Lost to F2 in audit game | WSI |
| F4 `WHOLE-BOARD-CONVERSION-F4-v2` | Aug 14 | Complete legal board audit, final-pool-slot fishing contract, compound cash-in, overtime readiness | Top-half 5/18, 3.32 pts/placement. Late efficiency decayed 4.33→3.00→1.33 per board in its audit game | WSI; THREE-LENS |
| **F5 `SITUATIONAL-ECONOMY-F5-v1`** | Aug 14 | F4 + continuous scarcity, explicit three-pass terminal decision, prospective bank→empty→pool-bonus contract, purposeful vs habitual purge, actor-relative gift dominance | Top-half 9/18 (50%); top-six 21/60 (35.0%); **strong-six 27/60 (45.0%)**; H2 arena 15/60 (25.0%). Highest pool conversion (661 pts/18 games) | reports; THREE-LENS |
| F6 `AUDIT-INVARIANTS-F6-v1` | Aug 15 | F5 + hard post-state invariants: keep last aura, restore own aura before proxy denial, same-tile Pareto dominance | Top-half 10/18; top-six 18/60 (30%); fewest wipes (15). Beat F8 in game 36 with three neutral overwrites (−26 to F8) | reports; THREE-LENS |
| F7 `GESTALT-SEQUENCE-F7-v1` | Aug 15 | Whole-position gestalt; complete hand beam (width 12); both opponents' public turns for 4 finalists | 9/19 (47.4%); comparable block 7/15 vs F1-v2's 14/15 | `AI_F8_EVIDENCE` |
| **F8 `FLEXIBILITY-TRILENS-F8-v1`** | Aug 22 | F1-v2 unchanged as chooser. F7 donor move accepted only on a terminal command, a terminal ≥tie proof, or a safe ≥2-move sequence that improves margin by **≥6** over the parent. Three lenses are *logged only*. | Top-half 5/18 (27.8%) but 3.88 pts/placement, 61 wipes, converted 5/9 fill leads. **Strong-six 28/60 (46.7%, 1st), mean margin −0.4.** **H2 arena 25/60 (41.7%, 1st).** Grader regret 16 | F8 doc; reports |

### 1c. G/H generation (Sep 6 – Sep 15)

| Id | Date | Core idea | Measured results | Source |
|---|---|---|---|---|
| G1 `TRIMODAL-PLAN-SEARCH-G1-v1` | Sep 6 | Three lenses **decide** (z-score fusion + consensus bonus); persistent plan; two-opponent public rollout; hidden-deck expectation | Screen: 9/15 in 105 games, but lost to F8 in 4 of 6 meetings. Top-half 11/18 (61.1%), won all 6 games where it led at the overwrite phase. Top-six 13/60 (21.7%, last) | code metadata; reports |
| G2 `PHASE-CLOCK-TRIMODAL-G2-v1` | Sep 7 | + clock with phase obligations; structural read (won/capped → "cage and starve" / "fish and arm"); placeability-based tile value; pass-wipe priced as a lost turn; overtime reserve | Screen: 8/15 in 95 games, +7.9, **lost all 5 games with an F brain**, overtime collapses of −39/−25. Top-half 8/18. Top-six 23/60 (38.3%, tied 1st). Strong-six 16/60 (26.7%). H2 arena 20/60 (33.3%, 2nd) | code metadata; reports |
| G3 `DECK-CLOCK-TRIMODAL-G3-v1` | Sep 7 | + deck clock at the observed consumption rate; late-regulation banking outranks dump; no fishing with a full hand of hostages; next-seat placeability gift pricing | Screen: 10/15 in 100 games, +9.3, OT +109, but **1 of 4 vs F trios**. Top-six 23/60 (38.3%). Strong-six 11/60 (18.3%, last). Human game: Scotty 75, G3 71, F1 54 | reports; `AI_G4_EVIDENCE` |
| G4 `BOARD-CLOCK-TRIMODAL-G4-v1` | Sep 9 | + board clock (open cells), gifts priced against both opponents, erasers/zero-point hand plays withheld late, frontier-trend rule (geometry weight up; accumulate→expand) | Screen: 8/15 in 105 games. **Top-half 12/18 (66.7%, 1st, weak schedule)**. Top-six 14/60 (23.3%). Strong-six 15/60 (25%). H2 arena 13/60 (21.7%, last). Grader best (7 unlimited / 11 budgeted). Human game: Scotty 69, G4 54, F1 51; passed twice in overtime holding two erasers | reports; grader |
| G5 `STRIKE-CLOCK-TRIMODAL-G5-v1` | Sep 13 | + atomic finalist forecasts and early soft-budget return (ChatGPT `FAIR-FORECAST-G5`). Never pass in overtime with an erase of ≥4. Hold an eraser only while an opponent group of ≥8 exists. Score rather than bank once armed. | **Strong-six 13/60 (21.7%, 5th)**: fewest gifts (44), smallest OT loss (−589), 3.18 pts/placement (lowest), in **all four 0-0-0 draws**. H2 arena 15/60 (25%). Grader 7 (unlimited) / 11 (3.8 s), same choices as G4 | ANALYSIS.md; reports |
| H1 `OPTION-ECONOMY-TRIMODAL-H1-v1` | Sep 15 | G5 + **room-first head**: rank by scoring room left (own-solid proxy placeability, `aiH1Room`) and pick by lens consensus only inside a 2.0 band | Arena stopped at 15/120: 2/9 (22.2%), mean score 50.4 (lowest). Tester loss to Scott: "refused to score", banked an opponent tile as gift denial | H1 REPORT; `AI_H2_EVIDENCE.h1Lesson` |
| H2 `OPTION-ECONOMY-TRIMODAL-H2-v1` | Sep 15 | H1 with points priced in room currency, 3.0 band, dead-bank room cost, Rule D (no terminal/0-0-0 pass without a lead), Rule E (no opponent-tile bank), opening hunt capped at 2 pool dumps before the jewel | **H2 arena 18/60 (30.0%, 3rd)**, 8 tied firsts (most), mean score 60.1; 14 draws, 2 without placement | H2 REPORT |

### 1d. Pooled arena view of current contenders (complete 120-game arenas only)

| Brain | Top-six (Sep 11) | Strong-six (Sep 13–14) | H2 arena (Sep 15–16) | Pooled |
|---|---|---|---|---|
| F8 | — | 28/60 | 25/60 | **53/120 = 44.2%** |
| F5 | 21/60 | 27/60 | 15/60 | 63/180 = 35.0% |
| G2 | 23/60 | 16/60 | 20/60 | 59/180 = 32.8% |
| G4 | 14/60 | 15/60 | 13/60 | 42/180 = 23.3% |
| G5 | — | 13/60 | 15/60 | 28/120 = 23.3% |
| G3 | 23/60 | 11/60 | — | 34/120 = 28.3% |
| H2 | — | — | 18/60 | 30.0% |

The top-half arena (18 games per brain, uneven schedule) ranked G4 > G1 > G3/F6 > F5 > G2 > F2 > F4/F8 > F1. Complete round robins then reversed most of that. The G4/G1 top-half results were helped by schedules that included D4/D5/D6 (THREE-LENS "Limits"). **Treat 18-game screens as noise-level.**

### 1e. Move-grader results (regret = points given away vs the judged best move)

| Run | Positions | Results |
|---|---|---|
| g5-first (Sep 14, unlimited) | 12 | G5 7, G4 7, G3 11, F1 16 |
| g5-vs-g4 budget6000 (Sep 14) | 12 | G5 11, G4 11, G3 14, F1 16 |
| f8-f5 budget6000 (Sep 15) | 12 | F8 16, F5 17 |
| human2-all (Sep 10) | 3 | G4 2, F4 4, D4/D5 5, F8/F1 5, G1 7, F5/F6/F7/F2 8 |
| human3-ot (Sep 14) | 1 | all 0 (G2/G3/G4/F1/F8 all find the overwrite) |

Grader caveats (ANALYSIS.md correction, Sep 15):
- The grader passed no legal-move list. The responsive search therefore returned null on 9/12 positions and the harness fell back to the synchronous evaluator, which real play never uses. F timings of 3,200 s and 260 s are artifacts; the real maximum is 70.9 s over more than 80,000 decisions.
- The 12 positions are exactly the failures that the G2→G5 fixture rules were written against (hostage bank, fishing with a full hand, late eraser dump, spending an eraser, overtime pass). The grader is partly circular for the G line. It is useful as a **regression fixture set**, not as a strength ranking.

---

## 2. What the current brains do in code

### 2.1 F1-v2 (F8's parent): `aiChooseF1FlexibilityMove[Responsive]` (~33684–33770)

**Situation** (`aiF1Situation`). Reads phase = board fill, score margin vs the best opponent, aura lead (`proAuraSummaryForPlayer`), hand "support" tiles (≥3 own sides), and the visible deck tile. It picks one mode:
- `buffer` in overtime or at phase ≥ 0.74;
- `stage`/`burst` before the jewel is down (the launch is delayed until support is loaded, phase ≥ 0.18, or turn ≥ 7);
- `purge` when a pass-wipe is legal with ≥4 pool tiles;
- `burst` when hand plays exist with 2+ tiles in hand;
- `exploit` when a pool tile with ≥3 own sides is placeable;
- `curate` when the visible deck tile has ≤1 own side, `harvest` when it has ≥3.

**Candidate generation** (`aiF1CandidateShortlist`). Cheap score (`aiF1CheapMoveScore`). Keeps the top 32, plus the top 2 per source group, one per destination, one per kind, and every full-capacity jewel site. Capped at **84** (`AI_F1_EXACT_CANDIDATE_LIMIT`). A blind-deck "commit" pseudo-move uses the public unseen-tile expectation (`aiPublicUnseenTileExpectation`).

**Exact evaluation** (`aiF1BoardMoveProfile`). Uses the engine simulation `simulateBoardMoveScore`:
- `score = ownGain*11.5 + oppLoss*7.5 − oppGain*9 + marginSwing*5.5 + contactValue*2.1 + contacts*2.2 + own*1.45 + open*0.72 − reply*1.35`
- aura delta × 3.1 early (phase < 0.66) or × 1.35 late; opponent aura gain −2.3, opponent aura loss +2.1; +4.2 for landing in own aura early.
- A "certificate" (a purpose: scores, erases, aura ≥ 1.15, or own-aura with ≥3 own and ≥3 open) is required. Without one: −21 minus a shortfall term. Off-colour tiles: −17. Pool conversion +5.5; hand play +3.5, or +7.5 with 2+ in hand.
- Jewel: capacity × 5.5, −8 per missing aura hex below 6, −45 if launched before support in the first 7 turns.
- Overtime adds marginSwing × 5 and oppLoss × 5.

**Point:** immediate own points dominate in raw units, and nothing normalises them away.

**Reserve moves** (`aiF1ReserveMoveProfile`):
- Bank: own × 5.2 with a +11/+1.5/−14 step by own count; −5.2 per held tile; late penalty from phase 0.68. Each bank creates a reserve contract with a deadline of ⌈open/14⌉ turns (2–6), which feeds `aiF1ReserveUrgency`.
- Deck→pool: +16 base, −8.5 per own side, minus the gift threat (`aiF1PoolGiftThreat`), plus the deck-search expectation (`aiDeckSearchExpectation`).
- Pass: `aiF1PoolWipeValue` × 1.7 + 7. The wipe is valued by the opponents' colour in the pool. **There is no scarcity term here.** This is why F1/F2/F8 wipe 60–66 times per 18 games (THREE-LENS).

**Advisor council** (`aiF1AdvisorPlan` / `aiF1ApplyAdvisorCouncil`). The mode calls two prior brains (D5/D6/D7/E1). They may surface moves, and their bonus is capped at 14. This is the main reason the synchronous path is slow.

**Programs** (`aiF1DistinctProgramRoots` → `aiF1ProgramForItem`):
- Up to **22 roots**, each expanded **greedily** for up to 3 same-turn actions: hand chain, then the hand-empty pool bonus through `aiF1ContinuationMoves`.
- `program = Σitem + 4.5·(actions−1) + 6·poolBonus + 2.5·marginΔ + auraLeadΔ·(1.8 or 0.7) − 0.85·replyRisk`.
- `aiF1PublicReplyRisk` is a **heuristic**, not a rollout: the best own-coloured pool tile for each opponent plus the public-hand threat, weighted 1.0 for the next seat and 0.58 for the seat after.

**Safety.** `aiF1FundamentallySafeProgram` → shared `aiApplyFundamentalMoveSafety` (19349): terminal three-pass rules, self-defeating actions, F6 invariants when F6/F7 is active, and compound dominance in fast mode. Same-turn plans are stored in `state.aiF1Plans`.

**Search depth.** Exact one-ply own complete turn, greedy continuation, heuristic reply risk. No opponent simulation.

### 2.2 F8: `aiChooseF8BoundedTriLensMove[Responsive]` (~37186–37377)

- `aiF8Situation`: computes the F1 and F7 situations. `enhancementEligible` is true if the position is terminal (F5 terminal mode ≠ normal), or if F7 reports a `decisiveSequence` (2+ hand tiles and scarcity ≥ 0.42, near overtime, a close race, or deck ≤ 18) **and** one of: overtime, deck ≤ 18, scarcity ≥ 0.52, or margin < 0.
- The parent move comes from F1-v2 inside `aiF8PreviewMoveSync`, which snapshots and restores `aiF1Plans/aiF2Plans/aiF1ReserveContracts`. The donor is F7 (`aiChooseF7GestaltSequenceMove`: whole-position gestalt, hand beam width 12 over 26 roots, both opponents' public turns forecast for 4 finalists), and only when eligible.
- `aiF8SelectCandidate`:
  - donor wins on a terminal command or a terminal ≥tie proof;
  - otherwise donor wins only if the sequence has ≥2 moves, `ownDelta ≥ 0`, `opponentGain ≤ 0`, and margin advantage ≥ `AI_F8_MARGIN_OVERRIDE_MIN = 6`;
  - otherwise the F1-v2 move stands.
- `aiF8StampDecision` logs the mathematical, geometric and verbal lenses (secure-the-gate / break-the-siege / hold-the-crossing / counterstroke / conversion / adaptive-campaign). The lenses **do not affect the choice.**
- Net effect: F8 is F1-v2 plus F7 in endgame hand sequences and terminal commands. Its donor terminal path goes through `aiF5TerminalDecision` (see Defect 1).

### 2.3 F5: `aiChooseF5SituationalEconomyMove[Responsive]` (~36710)

The stack is F2 shortlist (`aiF2CandidateShortlist`) → `aiF4AugmentCandidateSearch` → `aiF5ScoreMove`, which wraps `aiF4ScoreMove`, which wraps the F3/F2 profiles.

**Situation** (`aiF5Situation` = `aiF4Situation` plus):
- `aiF5ScarcityModel`: continuous, value = max(phase pressure, 0.42·deck + 0.46·space + 0.12·destinations). Bands: open < 0.28 ≤ tightening < 0.52 ≤ scarce < 0.78 ≤ critical.
- `aiF5TerminalDecision`: explicit three-pass logic with modes forced-survival / bank-terminal-win / improve- or protect-terminal-tie / unavailable-terminal-loss.
- `aiF5PoolBonusOpportunity`: the best non-gift hand-empty pool placement right now, via `aiF4ExactOutcome`.

**Scoring deltas** (`aiF5ScoreMove`):
- Board, scarcity ≥ 0.52, acceptable weak/flexible tile: the "zero-purpose" inhibition is removed; +132·s + own × 10 + gray/black × 4, and +44·s more if productive. Opponent gain: −(18 + 10s) per point.
- Hand, scarcity ≥ 0.52 and weak-flexible: score floor 48 + 128·s. `aiF5ProspectivePoolBonusPlan` (bank now → play to empty hand → claim the named pool target, net of an 18/turn reply discount) floors the bank at 112 + net value.
- Pool fishing, scarcity ≥ 0.52 with a hand or board alternative: −170·s, hard-inhibited at critical.
- Pass: a purposeful purge (pool ≥ 5 and dangerous or opponent-loaded) gets +70; otherwise, scarcity ≥ 0.52 gives −220·s and an inhibit when any board or hand move exists.
- F6 invariants are applied when F6 is active.

**Programs.** `aiF4ProgramForItem` (greedy own-turn continuation, depth 3) scored by `aiF4ProgramScore`:
- `aiF2ProgramScore`: chain × 13, pool bonus 19, marginΔ × 3.8, auraΔ × 4.2–7.5, reply risk × 1.35;
- plus compound cash-in 56 + 22/scoring placement, loaded burst, sector reach, overtime readiness +72 (+30 in a close race), and −140 per purposeless placement.

Then `aiF5ProgramEconomyScore` adds: +0.34 × prospective pool-bonus value, +18 per scarcity acceptance, +24 per purposeful purge, −90·s per habitual pass-dump.

**Selection.** `aiF5FundamentallySafeProgram`: the terminal target overrides everything, then non-inhibited programs, then shared safety.

**Depth.** Same as F1: own complete turn and a next-player heuristic reply (`aiF2PublicReplyRisk`). No advisors, no rollouts.

### 2.4 G4 → G5: `aiG5*` (~42312–43867), shared skeleton from G1

**Situation.**
- `aiG5Clock`: the deck clock runs at the observed consumption rate (≥ 3 × 1.4 tiles/turn) and the cell clock at ≥ 3 cells/round. `lateRegulation` is turnsLeft ≤ 4, deck ≤ 18, or open cells ≤ 12. `lastTurn` is also defined.
- `aiG5Structure`: mobility = usable aura + outlets + placeability agency, giving won / capped / contested. The `aiG5TilePlaceability` cache is skipped while > 60 cells are open.
- `aiG5FrontierTrend` over 3 turns; `aiG5OvertimeReserve` / `aiG5LargestGroup`; hostage detection (`aiG5IsHostage`); campaign (`aiG5Campaign`) with a persistent plan (`aiG5PlanFor`, `aiG5ValidatePlan`).
- Terminal state comes from `aiF5TerminalDecision`.

**Roots** (`aiG5RootCandidates`). The terminal target, top 10 by cheap score, one per kind, one per tile and one per sector, the top 6 by actorValue, and the top 4 by opponent loss. **Limit 22.** Only the root shortlist is exactly scored. There is no 84-wide exact pass as in F1.

**Programs** (`aiG5ExploreRoot`). A true beam (width 4, ≤ 4 actions, ≤ 10 continuations) over hand chains and the pool bonus.

**Forecast** (`aiG5ForecastProgram`). For 4 finalists, as an atomic batch: mask opponent hands, then apply the greedy complete turns of both opponents (`aiD7GreedyCompleteProgram`). Leaf = margin, aura, outlets.

**Lenses.**
- `aiG5MathLens`:
  - margin × phaseWeight (0.5 at open, rising to 1.0, +0.6 in overtime); own × 0.35; leader damage × 0.45; opponent gain −0.9; reply −0.25.
  - Bank terms: reserve value, conversion prospect, dead-weight −5 for non-eraser off-colour, late overtime-reserve value, over-bank −4.
  - Pool: gift × (1–1.5), opponent-solid −4, search, late-bank-first −9 to −13, self-harm fishing −5. Pass: tempo −(0.8·best + 4).
  - Late regulation: eraser-held (only when the largest opponent group ≥ 8), wasted placement −4/−6, fragility/insurance against opponent ammunition.
  - Overtime: gift ≤ −6, pass penalised when the best erase ≥ 4, strike bonus.
  - Forecast: (leafMargin − afterMargin)·(0.55 + 0.4s) − uncertainty.
- `aiG5GeometryLens`: aura-lead × (2.6–4) × "roads", mobility collapse, usable aura, outlets, crowding, opponent outlets and aura, line/growth/shape/choke, jewel. It **abstains for non-board programs**.
- `aiG5VerbalLens`: fit to the campaign and plan.

**Fusion** (`aiG5ConsensusWeights` / `aiG5Consensus`).
- Weights: math 0.45 + 0.25s (+0.05 behind, −0.12 when the frontier is falling); geometry 0.35 − 0.2s (+0.10 ahead, +0.12 falling); verbal 0.20.
- Each lens value is **z-scored across candidates** (std floored at 1). Agreement bonus +0.3 when all three rank top-3, +0.5 when all rank 1st.
- In `aiG5ScoreLenses`, abstaining programs get the placement mean for geometry.

**Selection** (`aiG5SelectProgram`). Terminal override → shared safety → `aiG5ApplyFixtureOverrides`:
- A: late regulation, a flipped own attacker (≥3) or eraser goes to a free hand slot, never the pool.
- B: never fish with a full hand holding a hostage; dump the hostage first.
- C: in overtime, never pass or draw while a board program erases ≥ 4 for a net margin gain.

**G4 vs G5.** G4 has the same skeleton without the atomic forecasts, the strike rule C, or the ≥ 8 eraser-hold condition (it holds erasers blanket-style). Grader choices are identical.

### 2.5 H1/H2: `aiH1*` (~40510–42170), `aiH2*` (~38665–40355)

- G5 plus a head. `aiH2Room` places an own-solid proxy tile over the open cells, counts legal cells, and simulates up to 12 to estimate "scoring room". `aiH2OpponentRoom` does the same for opponents.
- `aiH2OptionValue`:
  - own scoring-room Δ × 1.5 (× 0.8 late, × 0.4 in overtime), legal-room Δ × 0.25, opponent room −0.9, forecast room, and a room floor of 5;
  - in H2 also points = marginΔ + 0.3·own − 0.5·opponent gain, and a dead-slot −3 for a non-eraser off-colour bank.
- `aiH2SelectProgram`: when room-first applies (not overtime, not terminal, phase < 0.78), programs within `AI_H2_OPTION_BAND = 3.0` of the best option get +1000, and consensus decides among them. H1 used a 2.0 band and had no points term, so "scoring placements that closed a cell fell outside the band" and it refused to score.
- `aiH2ApplyFixtureOverrides` adds to A/B/C:
  - **Rule E:** never bank a tile with no own colour that is not an eraser.
  - **Rule D:** outside overtime, never pass at 0-0-0 or with 2 prior passes while not leading, if any board program exists.
- The opening hunt is capped: after `AI_H2_OPENING_HUNT_MAX = 2` pool dumps without a jewel down, the jewel launches (`openingHunt = −6`, around line 39597).
- Evidence cited in `AI_H2_EVIDENCE.optionEvidence`, all from replay: from deck 40, the AI seats made 146 non-placing decisions while a scoring placement was available; by turn 50 the AI had 0–4 scoring cells and Scott 20–60; Scott makes 22–28 aura hexes per game and the AIs 9–15; G5 matched only 17% of Scott's 281 winning decisions (37/170 in the opening, 10/111 after).

### 2.6 Why F8/F5 beat the G/H line (Sep 11–16 evidence)

Strong-six ANALYSIS.md table (60 games each):

| Brain | Pts/placement | Gift pts given | Led at fill | Held | OT gain | OT loss | OT net | OT passes (holding tiles) | Opening pool dumps |
|---|---|---|---|---|---|---|---|---|---|
| F8 | **3.74** | 94 | **27** | **15** | 488 | −767 | −279 | 8 (5) | **72** |
| F5 | 3.09 | 53 | 14 | 10 | 406 | −736 | −330 | 12 (3) | **65** |
| G2 | 3.48 | 75 | 27 | 9 | 395 | −762 | −367 | 17 (7) | 129 |
| G4 | 3.23 | 50 | 11 | 5 | 375 | −621 | −246 | 26 (11) | 106 |
| G5 | 3.18 | **44** | 14 | 6 | 312 | −589 | −277 | 19 (7) | 108 |
| G3 | 3.33 | 62 | 23 | 6 | 432 | −782 | −350 | 15 (0) | 108 |

1. **Regulation scoring per placement is the main lever.** F8 is highest at 3.74, with 3.88 in the top-half arena. G5 is lowest (3.18) and finishes 5th despite the best defensive numbers: fewest gifts, smallest OT loss. The mechanism in code:
   - F1 multiplies raw `ownGain` by 11.5.
   - G5 discounts margin to 0.5× at the open (`phaseWeight`).
   - z-normalisation turns "+8 vs +2 points" into roughly one standard deviation, the same size as a geometry or verbal deviation.
   - The geometry lens hands non-placing moves the placement mean, so banks, dumps and draws beat below-average placements.
   - H1's room-first head made this worse (mean score 50.4). H2's "points in room currency" partly repaired it (60.1 mean, 3rd).
2. **Lead at board fill decides games.** The fill leader kept the win 51/116 times, and overtime is net-negative for **every** brain. F8 led at fill 27 times, G4 11, G5 14. G2/G3 reached fill in the lead but held it only 9/27 and 6/23. "Gifts are cheap when your own placements score more": F8 gave the most gift points (94) and still won the most.
3. **Overtime is the smaller half.** The G5 strike rule works (fewest overtime losses, 7 passes holding tiles vs G4's 11), but it improves a phase that everyone loses. F8's OT net (−279) is mid-pack. Its fill-lead holding rate (15/27 = 56%) is still a real leak; see game 36 below.
4. **Opening pool dumping and pool gifts.** Every brain searches the deck on turn one (the `establish / load-support-before-launch` campaign, F1's `stage`/`curate` modes and the −45 jewel-delay term). The G line does it 106–129 times per 60 games, F 65–72. Opponents played 182–253 pooled tiles per brain for 764–918 points. The cost has not been measured yet.
5. **0-0-0 no-placement draws.** Games 15, 17, 73 and 78 all had G5 in them. Seat 1 and seat 2 each dump five deck tiles and pass-wipe. Seat 3, holding only its jewel, passes under `hold-the-crossing / protect-terminal-tie`, which comes from `aiF5TerminalDecision` returning `protect-terminal-tie`. All three "lose". F8 produced the opening dump-and-wipe as first mover in games 73 and 78, but F brains in third seat placed. H2 still had 2 no-placement draws in its arena. H1 had 1 in 15 games.
6. **Pool wipes and over-rejection.** F1/F2/F8 used 60–66 wipes per 18 games vs G4/G1/F6's 15–29 (THREE-LENS). This is a known F weakness F5 addresses with scarcity pass penalties, and is not yet fixed in F8.
7. **Search width.** F1 exactly scores up to 84 candidates before choosing 22 roots. G5 builds its 22 roots from a cheap score. Wide coverage of the scoring surface probably contributes to F's placement efficiency. This is a hypothesis; no ablation has been run.

---

## 3. Consolidated strategic truths

Evidence weights follow WSI's lanes:
- **H** = Scott's direct doctrine or audited replacement;
- **F** = complete human films (June 27-win audits; the Jul 18 harvest of 104 films, 5,459 decisions, human 92.3%);
- **A** = controlled arenas;
- **G** = grader.

Strength: ★★★ = multi-lane agreement; ★★ = two lanes or a large single lane; ★ = single observation or hypothesis.

**Scoring efficiency and conversion**

1. ★★★ **Score more per placement and avoid quiet placements.**
   - Humans 3.63–3.65 points per board placement vs AI 2.80–2.84, with quiet rates of 23.5–24.2% vs 34.4–34.5% (TACTICAL_AUDIT, ATOMIC).
   - Winning vs losing humans: 3.64 vs 3.17 per placement, 27.5% vs 38% quiet (HARVEST). Full-film winners 2.88 vs losers 2.40 (WSI Jul 16).
   - Arena: F8's 3.74 leads. **But efficiency alone is insufficient:** F2 was highest (3.91) and won only 7/18.
2. ★★★ **The late game is where AIs collapse.** AI late quiet rate 53% vs human 22%. AI late points per move 0.77 vs 1.62 (ATOMIC). "AI late quiet collapse" is the most common win recipe tag (20/27). Late winner placements average 2.70 vs losers 1.72 (WSI).
3. ★★★ **Hand chains and stored-tile cash-ins are a scoring engine.** Humans run 2.2–2.3 chains per game at 9.1–9.3 points; AI 1 at 4.5. Stored cash-ins are 17.4 points per game. **16 of 27 lock moves came from hand** (ATOMIC). Storage must have a target: D5/D6 losses banked as much as wins ("reserve without leverage", WSI), and D6 banked the most while converting the least.
4. ★★ **Pool is both power and danger.** Humans cash 15.3 pool points per game while opponents cash 18.5 from human-pooled tiles; AI cashed human-pooled tiles at 8.37 per conversion (TACTICAL). F5 converts the most pool (661). Arenas: 764–918 pool points per brain go to opponents. Price every deposit for **both** opponents, especially the next seat (E1 lesson). Opponent solids are near-certain sixes.
5. ★★ **Deck filtering is correct when the kept tile is strong.** Human filter runs keep own-rich tiles 69% of the time vs AI 50%, and kept tiles score 3.75 vs 3.15 (ATOMIC). Scott's final-pool-slot fishing contract: fill the last slot, then branch on the keep-card (own-colour → jewel-linked placement; BT → bank; no own colour → pass-dump all six; gray/black → bank) (WSI Aug 13).

**Aura and frontier**

6. ★★★ **Aura is the agency reserve, and it wins before the late game.**
   - At 66% of the game, humans average 7.19 aura vs the best AI's 1.07. Both AIs were at zero in 59% of wins by 66%, 74% by 75%, and 85% by 85% (AURA_FRONTIER).
   - Human middle-game aura lead: +3.25 in wins vs +0.07 in losses (HARVEST).
   - Frontier dominance at deck 65 preceded the win in 11/11 human films vs 44% of AI-vs-AI films (`AI_H2_EVIDENCE.humanEvidence`).
   - Scott creates 22–28 aura hexes per game, the AIs 9–15.
7. ★★ **Closed board (≤12 empty cells): hold aura, don't burn the last one.** Human wins held or grew aura on 85.2% of closed-board moves and burned the last aura on 3.0%; losses 45.2% and 12.9% (HARVEST). F6 invariant: don't consume the last aura while meaningful runway remains.
8. ★★ **Place the jewel for full six-aura value, early.** Delay can lose every six-aura site within one rotation (D6 traces). Build **jewel-rooted lines and vectors, not blobs**. Bury opponent-coloured sections against dead edges. Press opponent aura rather than backfilling (Scott, H). Open space is the "fourth player".
9. ★ **Aura without roads is worth less.** Outlets matter more than raw aura count (G4 geometry; Aug 22 review). Geometry weight alone did not produce wins: G4's geometry weight was > 0.4 on 170 decisions.

**Tempo, clocks, terminal**

10. ★★★ **Board fill is the decisive checkpoint.** The fill leader keeps the win about 44% of the time (51/116) and **OT is net-negative for all brains** (strong-six). G1 won 6/6 when leading at the overwrite phase. F8 converted 5/9 fill leads in top-half and 15/27 in strong-six.
11. ★★★ **Terminal three-pass logic is a hard gate, not a weight.** Trailing with two strikes means you must break the streak (F4 audit game move 106). Sole leader means take the third pass. Arena scoring counts a tied first as a loss, so a "protected tie" is a loss (0-0-0 draws).
12. ★★ **The deck clock runs at the observed rate.** Three fishing runs emptied a 30-tile deck in 13 moves. Overtime can also arrive by the cell clock (G3/G4 lessons). **Arm for overtime before regulation ends:** bank own attackers and gray/black erasers (grader positions phone-human-late-bank, arena56). Scott's winning late bank answered an 11-point raid.
13. ★★ **Overtime is net swing and denial.** Never pass while holding an eraser with a target of ≥ 4 (human3-ot). Never gift the leader when a pass is legal (phone-overtime-gift). Value what survives both opponents' replies: in game 36, F8 led 84–62 and lost 52 vs 62 after three neutral overwrites of 9, 8 and 9. In game 32, one 7-point overwrite flipped the result.

**Hand-slot economy**

14. ★★ **No hostage banks.** A tile that can never score for you is dead weight, except gray/black erasers (Scott, graders phone-hostage-bank-1/2; H2 Rule E). Don't fish with a full hand of hostages. Don't pass-wipe a pool you filled with your own colour (phone-green-pool-wipe: all brains fail, regret 3).
15. ★★ **Relax weak-tile rejection as scarcity rises.** A late weak converter is a resource. Planned bank → empty hand → pool bonus is a two-turn program (Scott, Aug 14; F5).
16. ★ **Don't spend a lone eraser for 0 points in regulation** (human2-g3-spends-eraser-early/late). Hold it only while a large exposed group (≥ 8) exists (G5's correction of G4's blanket holding).

**Meta-truths about brain building**

17. ★★★ **Additive stacks of the same features on different scales fail** (A4, D5/D6 in the millions). Lessons encoded as score bonuses get outweighed; lessons encoded as post-state invariants or rules hold (F6).
18. ★★★ **More of an activity is not better:** more banking (D6), more geometry weight (G4), more attack bonus. Each component must win a paired ablation.
19. ★★ **The human is far above every brain.** Scott wins 88–92%; F1-v2 went 239/262 against older AIs but loses to Scott. Game-play agreement with Scott is low: G5 matched 17% of Scott's winning decisions and took *more* immediate points than Scott in 31 of 39 midgame disagreements. **Structure first in the opening, points later** is the human pattern. The F line wins arenas by points-first play against other bots, not by matching Scott.

---

## 4. Known defects and unfinished ideas

| # | Defect / idea | Where | Status | Source |
|---|---|---|---|---|
| D1 | **0-0-0 terminal pass.** `aiF5TerminalDecision` returns `protect-terminal-tie` (third pass) when tied for first and no board row scores > 0. At an empty board the jewel scores 0, so the tie is "protected". Arena scoring counts that as a loss. Every G/H brain calls this function (lines 37669, 39176, 41020, 42785, 44471, 46066, 47581), as do F5/F6/F7, and F8 through its F7 donor on terminal commands. | shared | H1/H2 patch it with Rule D *after* selection; G2–G5 and F5/F8 still carry it. In F8 it is latent: no F third-seat pass was observed, but the path exists. | ANALYSIS.md; code |
| D2 | **Opening pool dumping.** The turn-one deck hunt feeds the pool (G: 106–129 per 60 games; F: 65–72). | F1 `stage/curate` modes and −45 jewel-delay term; G `establish` campaign | H1/H2 cap the hunt at 2 dumps. Cost not yet measured; "next thing to test with a fixture override". | ANALYSIS.md |
| D3 | **Fill-lead conversion leak.** F8 held 15/27 leads; G2 9/27; G3 6/23. | F1 has no opponent rollout, only the `aiF1PublicReplyRisk` heuristic | Proposed: survival-adjusted sequence value (game 36). Not implemented anywhere. | THREE-LENS; ANALYSIS.md |
| D4 | **F pool-wipe excess** (60–66 per 18 games) | `aiF1ReserveMoveProfile` pass branch has no scarcity term | F5 has the fix (`aiF5ScoreMove` pass/pool branches); F8 does not inherit it. | THREE-LENS |
| D5 | **Late eraser dump.** F1/F8 dump a gray/black eraser at deck ~10 (arena56, regret 3), while F5/G3–G5 bank it. | F1 reserve scoring | Fixed in G by Rule A. | graders |
| D6 | **Wiping a self-filled own-colour pool with a full hand.** Every graded brain fails (regret 3). | all | Open. | graders |
| D7 | **Spending an eraser for 0 points** (G3 positions): F5 regret 3–4; F8 dumps a different tile (regret 1–3). | all | Partly addressed by G5's eraser hold. | graders |
| D8 | **Grader harness bug.** No legal list was passed, so the synchronous fallback ran on 9/12 positions and the timings are invalid. | grader lib | Fixed in lib Sep 15; "re-graded timings will follow". None found on Drive. | ANALYSIS.md |
| D9 | **Grader fixture circularity.** The positions are the G line's own training fixtures, so the grader ranks the G line best while arenas rank it lower. | methodology | Open. Needs positions drawn from F8 and F5 arena losses (e.g. game 36). | synthesis |
| D10 | **H1 refused to score.** Room-first band too narrow; opponent-tile bank as gift denial. | `aiH1SelectProgram` / `aiH1OptionValue` | Fixed in H2 (band 3.0, points term, Rule E). H2 is still 3rd. | `AI_H2_EVIDENCE` |
| D11 | **G4 blanket eraser holding cost regulation points; passed twice in overtime holding two erasers** (gmtvynpyc) | G4 | Fixed in G5 (hold condition ≥ 8, Rule C). | G5 evidence |
| D12 | **Lens z-normalisation erases point magnitude; geometry abstain = placement mean** | `aiG5Consensus`, `aiG5ScoreLenses` (same in G1–H2) | Not recognised in the reports. It is the likely root cause of the G line's low points per placement. | code (this digest) |
| D13 | **Bounded-deadline and failsafe decisions** still occur in full responsive runs; the hard-deadline fallback once gifted the leader when a pass was legal. | shared deadline path | Partly addressed. | THREE-LENS; `AI_G2_EVIDENCE.liveGame` |
| U1 | Survival-adjusted value for complete scoring sequences: points now − credible damage after both opponents + value of reserves and surviving territory | proposed for G5; not built | Open | THREE-LENS |
| U2 | Belief over opponents' hidden hand slots, keyed to pass and bank behaviour; the pool read as a signal (Gin/Mahjong-like) | positioning doc | Open | POSITIONING |
| U3 | Learned evaluation plus 1–2 ply expectimax over the deck (TD-Gammon lineage); train on human-judged counterfactuals (356 audited replacements) | positioning doc; WSI root cause 6 | Open. The ML placeholder returns 0. | POSITIONING; WSI |
| U4 | Brain ladder at ≥ 65% per rung as a depth measure; evaluate by placement distribution, not only wins; leader-pressure term | positioning doc | Open | POSITIONING |
| U5 | Next-brain target stated by the Sep 14 decision: "regulation scoring per placement and the two defects above; screen first against F8 and F5, not the wide roster" | ANALYSIS.md | This digest's I1 | ANALYSIS.md |

---

## 5. Synthesis: a design for I1

### 5.1 Base choice: F8 (the F1-v2 chooser plus the bounded F7 donor), not G5/H2 and not F5

- **F8 has the best arena record** (pooled 44.2%) and the highest regulation points per placement. Its ordinary-position engine (F1-v2) produces the quantity that decides games: points at board fill.
- **F5 is the better economist** (pool conversion, scarcity, terminal clarity) but scores 3.09 per placement. Its gains come from rules that can be ported as scoring deltas.
- **G5/H2 contribute correct rules but a wrong chooser.** The lens fusion structurally under-prices points. Port their *rules and forecasts*, not their head.
- **Architecture principle (F8's own):** keep F1-v2's decision as the default and admit every graft through an explicit gate with a margin threshold or a hard fixture condition. Every graft must be switchable per component, for ablation.

### 5.2 Components, prioritised

**P0: correctness guards (cheap, no expected downside)**

1. **Tie-aware terminal logic.** In I1's copy of the terminal decision (do not edit the shared `aiF5TerminalDecision`; wrap it as `aiI1TerminalDecision`):
   - A shared first place is a loss under arena scoring.
   - At 0-0-0, or with 2 prior passes and not the *sole* leader, pass only when no board program exists. This is H2 Rule D, applied **before** program ranking, not after.
   - Prefer the best non-gift board row even when it scores 0, e.g. placing the jewel.
   - Regression fixtures: strong-six games 15, 17, 73, 78; the F4 move-106 position; gmsuxjl4s move 92.
2. **Opening hunt cap.** While the jewel is not down, allow at most 2 deck→pool dumps (H2 `AI_H2_OPENING_HUNT_MAX`). Then launch the best full-capacity jewel site or the best drawn own-rich tile. Scale down F1's −45 "launch before support" penalty once 2 tiles are pooled. Also charge each opening dump with `aiF1PoolGiftThreat` for **both** opponents (the next seat is currently weighted 1.0 and the seat after is missing from the gift threat). Target: opening dumps from 72 to ≤ 40 per 60 games. Measure the pool points opponents collect from I1 deposits.
3. **Port the G5/H2 fixture rules as a post-selection layer** (`aiI1ApplyFixtureOverrides`, modelled on `aiH2ApplyFixtureOverrides`):
   - A: late-regulation bank-before-dump for own attackers (≥ 3) and erasers. This fixes D5; F8 regret 3 on arena56.
   - B: dump a hostage before fishing with a full hand.
   - C: overtime strike before pass (erase ≥ 4 with net margin gain).
   - E: no off-colour non-eraser bank.
   - Plus a new rule F: never pass-wipe a pool whose best tile scores ≥ 4 for you when a hand slot or placement is available (D6; phone-green-pool-wipe).

   Use G5's clock (`aiG5Clock`, both deck and cells at observed rates) to define `lateRegulation`. F1's `phase ≥ 0.74` alone misses deck-driven endings.

**P1: convert the fill lead (largest expected gain after P0)**

4. **Late-regulation survival-adjusted value.** When `lateRegulation` or overtime holds and I1 is leading or within 6:
   - Run a G5-style atomic two-opponent public rollout (`aiG5ForecastProgram` pattern: mask hands, `aiD7GreedyCompleteProgram` for both seats) on the **top 4 F1 programs by F1 score**.
   - Add an **erase-exposure term**: for each opponent's public-hand or pool gray/black tile, the largest own group it can overwrite (reuse `aiG5LargestGroup` / fragility).
   - Re-rank with `F1score + k·(leafMargin − afterMargin) − exposure`, using k ≈ 2.5 so it sits on F1's scale (F1 uses marginΔ × 2.5).
   - Accept a re-rank only if it changes the choice by ≥ 3 projected margin points (the F8-style gate).

   Game 36 is the fixture: F8 led 84–62, then lost to three neutral overwrites.
5. **Overtime reserve contract.** From `lateRegulation`, if not armed (no eraser and no own attacker in hand), bank one flipped eraser or attacker (Rule A). If armed with 2 tiles, stop banking and score (G5 `overBank`). Keep G5's eraser-hold condition (largest opponent group ≥ 8). Target: raise OT net from −279 toward G4's −246 **without** lowering regulation points per placement.

**P1: F5 economy into the F1 evaluator**

6. **Scarcity-aware pass and fish discipline.** Insert `aiF5ScarcityModel` into I1's situation. In the reserve branch:
   - pass: if not a purposeful purge (pool ≥ 5 and opponent-loaded, `aiF4PoolPressure`), −220·s when s ≥ 0.52 and a board or hand move exists;
   - deck fishing: −170·s under the same condition.

   Target: pool wipes from 61 per 60 games to about 25, with no rise in gifts given. This is D4.
7. **Prospective pool-bonus contract.** Port `aiF5ProspectivePoolBonusPlan` (bank → play to empty → claim the named pool target, net of the reply discount) and cap its contribution on F1's scale, e.g. ≤ 12 program points. Pool conversion is where F5 beats everyone (661), and hand-empty chains are a human engine.
8. **Scarcity acceptance of weak converters late**, from F5's board branch, restricted to non-gift placements. F6 invariants stay on through shared safety: last-aura preservation and same-tile Pareto dominance.

**P2: measured experiments, each behind a flag, only after P0/P1 pass**

9. **Aura-frontier term in the midgame** (the human truth ★★★ #6). F1 already weights aura delta × 3.1 before phase 0.66. Try an *outlets/usable-aura* term from `aiG5FrontierProfile` at ≤ 30% of the aura weight, with a mobility-collapse penalty (`aiG5GeometryLens`) as an **invariant-style gate**: reject a non-decisive move that leaves ≤ 1 outlet while > 12 cells are open and an alternative keeps ≥ 2. Do not add z-fused lenses.
10. **Next-seat-aware reply risk.** Replace `aiF1PublicReplyRisk`'s pool/hand heuristic with the E1 "actual next player" bounded reply (the 1.0 / 0.58 weights stay) **only** for the final 4 programs, to control time.
11. **Advisor council trimming.** Measure whether the D5/D6/D7/E1 advisors (`aiF1AdvisorPlan`) change outcomes. If not, drop them and spend the time on item 4's rollouts, since the soft deadline currently truncates the tail of the candidate list.

**Explicitly avoid**

- Lens z-score fusion or any normalisation that equates a 6-point difference with a geometry deviation (D12).
- Room-first heads (H1 mean score 50.4).
- More banking or geometry weight as such (D6, G4).
- Changing ordinary-position F1 choices without a gate.
- Editing shared functions (`aiF5TerminalDecision`, `aiApplyFundamentalMoveSafety`). Wrap them instead, to preserve F5/F8/G/H identities (the build-parity rule).

### 5.3 Acceptance plan

- **Fixtures (must pass before any arena):**
  - the 12 grader positions at a real legal list and real responsive search. Target regret ≤ 8: F8 is 16 today; the Rule A/B/F fixes remove about 6–8;
  - strong-six games 15/17/73/78 (openings);
  - top-half game 36 (overwrite exposure) and game 32;
  - F4 move-106, F5 move-66 (actor-relative gift), F6 move-68 (last aura);
  - human3-ot (overtime strike).
- **Screen:** 120-game arenas of I1 + F8 + F5 + one rotating G2/H2/G4, all 20 trio×seat permutations per trio, paired deals. Primary metric: win % vs F8 and F5 head-to-head (rows ahead/behind). Report the ANALYSIS.md column set — pts/placement (keep ≥ 3.7), gift points, led-at-fill and held, OT gain/loss/net, OT passes holding tiles, opening dumps, pool wipes, pool points converted, no-placement draws (must be 0) — plus deadline and failsafe counts.
- **Ablations** (paired decks, same schedule): P0 alone; P0 + item 4; P0 + items 6–7; full. Keep a component only if it improves win % or held-lead rate without dropping pts/placement by more than 0.1.
- **Human check:** at least 3 Tester games against Scott with a full-film audit. Report decision-agreement with Scott's winning moves using the H2 "in my shoes" method (G5: 17%).

### 5.4 Expected outcome (hypothesis)

Opportunities in F8's current losses, from the strong-six numbers:
- ~12 fill leads not held;
- 2 games (73, 78) where F8's opening dump-and-wipe as first mover set up a 0-0-0 draw;
- about 36 excess wipes per 60 games;
- 72 opening dumps worth roughly 3.5 points each to opponents.

Recovering a third of the lost fill leads (+4 wins per 60) and eliminating the dump and draw leaks (+1–3) would move I1 to about 52–55% in the strong-six field. That is a clear margin over F8 (46.7%) and F5 (45%), detectable at 120 games per arena with pairing.

---

## Sources

**Drive:**
- `WINNING_STRATEGY_INSIGHTS.md` (1abx2FrDtJETC51GJikHtMkd3UOEjVHU_, Aug 14)
- `F8_BOUNDED_TRILENS_2026-08-22.md`
- `THREE-LENS-ANALYSIS-2026-09-11.md`
- strong-six `ANALYSIS.md` (1L99gZ96…) and `REPORT.md` (1V8dcy_v…)
- top-six `REPORT.md` (1lBgnsxd…); top-half `REPORT.md` (1LAD7Qc0…)
- H1 `REPORT.md` (stale at 15/120); H2 `REPORT.md` (complete 120/120)
- Move-grader results: 2026-09-15 f8-f5-budget6000; 2026-09-14 g5-vs-g4-budget6000; 2026-09-14 g5-first; 2026-09-10 human2-all; 2026-09-14 human3-ot
- `HEXXXAGON_HUMAN_WIN_ATOMIC_ANALYSIS`, `HUMAN_AI_TACTICAL_AUDIT`, `HUMAN_AURA_FRONTIER_ANALYSIS`, `HUMAN_VS_AI_DEEP_ANALYSIS` (all 2026-06-08)
- `HUMAN_STRATEGY_HARVEST_2026-07-18`; `D6_COUPLED_STRATEGY_HANDOFF_2026-07-18`
- `QUEXATLE_POSITIONING_AND_AI_REFERENCE_2026-09-07.md` (1Jsb6UWa…)

**Code:** `scratchpad/sim/main.js`:
- `AI_BRAIN_IDS` (~5260)
- F1 (32498–33770), F2–F4 (33779–35941), F5/F6/F7 (36020–37160), F8 (37162–37377)
- G1 (37380–38570), H2 (38575–40355), H1 (40480–42170), G5 (42300–43867), G4 (43990–45507), G3 (45620–47073), G2 (47180–48529)
- shared safety `aiApplyFundamentalMoveSafety` (19349)
- `*_EVIDENCE` blocks for per-brain screen results and live-game lessons

**Not found on Drive:**
- Separate G1–H2 design notes. The `strategy-analysis` folder holds only the F8 doc. The design rationale for G1–H2 lives in the header comments above `AI_H2_VERSION` in `main.js`, quoted in §2.4–2.5.
- The g4-first grader file (1Wv6vJHm…) was not read in full. Its results are superseded by the later g5 runs.
- A final H1 arena report: the H1 arena appears to have been stopped at 15/120 when H2 replaced it.
