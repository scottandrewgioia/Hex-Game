# QUEXATLE: what winning human play does that the AI brains don't (September 2026 human games)

Scope: human-vs-AI films from Sep 6–15, 2026, plus two move-grader reports (Sep 10 and Sep 14), the Sep 8 HANDOFF notes on the Sep 7 phone game, and the June human analyses for comparison. Everything was extracted in this folder by `analyze.py`, `analyze2.py`, `analyze3.py` and `dump.py`. Outputs: `inventory.csv`, `games.json`, `seats.csv` (one row per seat, about 60 metrics), `moves.csv` (a readable row for every move), `games_extra*.json`, and the film layout in `FILM_SCHEMA.md`.

## 0. Sample and caveats (read first)

- **12 human-involved films exist in Drive** (`inventory.csv`). **4 complete games and 1 abandoned game could be analysed at move level.** Six films (6.8–13.9 MB) and the 10.3 MB ndjson bundle could not be downloaded. Any download over about 6.5 MB returned "session expired" and disconnected the Drive MCP; files over 10 MB are over the stated limit. For three of those games only indirect notes exist (HANDOFF, grader reports).
- The 4 complete games are: `gmtpnzat6_pou1hd` (Sep 6), `gmu0hxclj_vwhhjz`, `gmu1nmgk0_ooyuwb` and `gmu1r10jq_lfeg8i` (Sep 14–15, android). **In all 4 the same human (Scotty, always red) played two FLEXIBILITY-F1-v2 seats.** The F1 build was `deck100-f7-universal-finish-memory-ai-61` (Aug 16 profile), not the G-series. **The human won all 4.** That gives n = 4 human seats against n = 8 F1 seats. "Per brain faced" therefore collapses to F1 only. G1, G3 and G4 appear only in the unreadable films and in grader notes (§4.6).
- Every number below is a 4-game number. Treat differences under about 20% as noise unless they appear in all 4 games; the text says when they do. The June corpus (30 games, 27 human wins; `raw/june-*.md`) is used as a cross-check.

## 1. Inventory (Sep 6 onward)

| game | played (UTC) | seats (R/G/B) | moves | fill R/G/B | final R/G/B | winner | status |
|---|---|---|---|---|---|---|---|
| gmtpnzat6_pou1hd | Sep 6 10:24–13:57 | **Human** / F1-v2 / F1-v2 | 129 | 88/54/46 | 84/55/50 | Human +29 | complete, analysed |
| gmtrdgi35_2al7bg | Sep 7 | **Human** / G1 v1.2 / F1 | ? | 77/53/64* | 70/53/60* | Human +10* | 12.0 MB, not readable (*HANDOFF l.222) |
| gmttai2kz_qgfvls | Sep 8–9 | **Human** / G3 / F1 (grader) | ≥133 | ? | ? | ? | 13.2 MB, not readable |
| gmtvxd00j_c0zgoc | Sep 10 19:33 | **Human** / G4 BOARD-CLOCK / F1-v2 | 14 | – | 0/0/0 | – | abandoned after 4 turns (deck 87) |
| gmtvynpyc_jvh3hm | Sep 10 | **Human** / G4 / F1 (grader) | ≥141 | ? | ? (red led G4 by 17 in overtime) | ? | 13.9 MB, not readable |
| gmu0hxclj_vwhhjz | Sep 14 00:40–10:40 | **Human** / F1-v2 / F1-v2 | 137 | 77/60/64 | 82/64/66 | Human +16 | complete, analysed |
| gmu1ag53z_oh4cwl | Sep 14 | android, unknown | ? | ? | ? | ? | 6.9 MB, download failed |
| gmu1nmgk0_ooyuwb | Sep 14 19:47 – Sep 15 01:02 | **Human** / F1-v2 / F1-v2 | 135 | 80/68/69 | 70/63/61 | Human +7 | complete, analysed |
| gmu1r10jq_lfeg8i | Sep 14 21:23 – Sep 15 13:25 | **Human** / F1-v2 / F1-v2 | 129 | 81/63/50 | 69/67/64 | Human +2 | complete, analysed |
| gmu0p4o7e_5mux99 | Sep 14–15 | android, unknown | ? | ? | ? | ? | 6.8 MB, download failed |
| gmu2z8l11_9viy3p | Sep 15 18:00–18:34 | ? / ? / "Blue F1 Champion" | ? | ? | ? | ? | 7.2 MB, download failed |
| android-human-games-20260914.ndjson | Sep 14 | bundle | | | | | 10.3 MB, over the limit |

Readable outcomes: human 5/5 (4 films plus gmtrdgi35 from the HANDOFF). **No readable Sep game has an AI beating the human.** The closest call is gmu1r10jq: 69–67, where an 18-point lead at board fill fell to 2 in overtime (§4.4).

## 2. Headline numbers (human seat vs F1 seat, averages per seat per game)

| metric | Human (n=4) | F1-v2 (n=8) | note |
|---|---|---|---|
| score at board fill / final | 81.5 / 76.3 | 59.3 / 61.3 | human ahead at fill in 4/4 games |
| margin over best opponent at fill → final | **+19.0 → +13.5** | −22.3 → −15.0 | lead shrinks in overtime in 3/4 games |
| overtime net change (final − fill) | **−5.3** (+5, −10, −12, −4) | +2.0 | the AIs hit the leader in overtime |
| board placements (reg + OT) | 20.3 | 18.8 | |
| **points per board placement** | **4.19** (339/81) | 3.45 (518/150) | +21%; human ahead in 4/4 games |
| – from deck | 4.07 (43) | 3.35 (71) | |
| – from hand | **4.39** (18) | 2.87 (31) | +53% |
| – from pool | 4.25 (20) | 3.98 (48) | |
| **aura hexes created** | **25.5** | 12.3 | 2.1×; human higher in 4/4 games |
| aura created per board placement | 1.26 | 0.65 | |
| banks (stores) | 3.5 (5 of 14 **from the pool**) | 2.9 (3 of 23 from the pool) | |
| points per stored-tile cash-in | **5.6** (79/14) | 3.9 (89/23) | |
| **erasers (all gray/black) banked** | **0.75** (3 total) | **0** (0/8 seats) | |
| multi-placement turns | 1.75/game at 12.6 pts | 1.0/seat at 10.4 pts | |
| hand-empty pool bonus | 1.5/game, 21 pts total | 0.5/seat, 24 pts total | |
| pool deposits (deck→pool) | 20.8 | 18.0 | |
| points opponents made from the seat's deposits | 32.8 (1.58/deposit) | 17.9 (0.99/deposit) | the human gifts *more* per deposit (§3.6) |
| points the seat made from opponents' deposits | 28.3 | 25.8 | |
| AI deposits holding ≥4 sections of the human's colour | — | **22 in 4 games**; the human picked up 12 (11 placed for 56 pts, 1 banked red solid) | |
| pass-wipes | 2.25 | 2.38 | about the same |
| overtime overwrites (count / opponent pts erased) | 1.25 / 6.3 | 1.75 / 5.8 (all 46 pts erased by AIs landed on the human) | |
| jewel placed on own turn # (move #) | **3.0** (move 14.8) | **1.0** (move 3.1) | 8/8 AI seats play the jewel on their first turn |
| first scoring move | own turn 2–5 (move 9–25) | own turn 2–3 | the human often trails early |
| last 4 regulation turns, points | 8.8 | 5.9 | |

By regulation phase (thirds of the pre-overtime moves):

| phase | Human pts/turn | F1 pts/turn | Human aura/turn | F1 aura/turn | Human boards/turn | F1 boards/turn |
|---|---|---|---|---|---|---|
| early | 4.62 | 3.42 | 1.84 | 1.12 | 1.03 | 0.94 |
| mid | 3.48 | 2.62 | 1.15 | 0.42 | 0.78 | 0.84 |
| late | 2.85 | 1.96 | 0.44 | **0.02** | 0.78 | **0.54** |

Cross-check with June: in June the human made 3.63 points per board placement against 2.84 for the AI (+0.79); in September it is 4.19 against 3.45 (+0.74). **The per-placement efficiency gap has not closed between the June brains and F1-v2.** June's "AI goes quiet late" finding also survives: F1's late-game boards per turn fall to 0.54 and its aura to about 0.

Think time (all 4 complete films, gaps over 10 minutes dropped; 11 of the 13 such breaks came before human moves; AI times include UI pacing):

| move | Human median | AI median |
|---|---|---|
| first board move of a turn | 21.7 s | 12.9 s |
| first move of a turn that goes to the pool | 28.4 s | 11.4 s |
| continuation pool flip | 2.1 s | 9.3 s |
| pass-wipe | 1.7 s | 8.0 s |

The human thinks hard once per turn and then fishes fast. Once the plan is set, each new flip is a quick yes/no against it.

## 3. What the numbers say (with evidence)

### 3.1 "Jewel sandwich" opening: delay the jewel, then play jewel + banked tile + pool bonus in one turn (4/4 games)
In every game the human **did not place the starter jewel on turn 1**. He banked an own-rich tile first (four or more red sections, or a red solid). Then he placed the jewel and the banked tile in the same turn, which emptied his hand and earned the hand-empty pool bonus:

| game | banked before the jewel | jewel turn (own #) | that turn | points | aura |
|---|---|---|---|---|---|
| gmtpnzat6 | m3 tri r4k2 (deck) | t6 (2nd) | jewel → hand tri r4k2 (+10) → pool bonus (+3) | **13** | 10 |
| gmu0hxclj | m3 tri r4g2, m11 tri r2g2b2 | t13 (5th) | jewel → r4g2 (+10) → r2g2b2 (+2) → pool bonus (0) | **12** | 9 |
| gmu1nmgk0 | m5 red solid | t6 (2nd) | jewel → red solid (+12) → pool bonus (+3) | **15** | 10 |
| gmu1r10jq | m13 tri r4g2 | t8 (3rd) | jewel → r4g2 (+10) → pool bonus (+2) | **12** | 8 |

F1 places its jewel on its first turn in 8/8 seats for 0 points: a lone jewel cannot score. It then scores 2–9 per turn. The cost of the sandwich is an early deficit: the human's minimum margin was −9, −18, −8 and −16. In gmu0hxclj he had 0 points until move 25 while the AIs had 18 and 15. It paid back quickly. The human was ahead by the 50% mark in 3/4 games and at board fill in 4/4. Uncertainty: 4 games from one player. The benefit of turning a 0-point jewel move into one 12–15-point turn is structural, but the delay also costs tempo and aura. A search should test it, not hard-code it.

### 3.2 Aura and outlets matter more than contact count (android decisionAudit, 56 human vs 60 F1 board decisions)
The films re-score every legal move with `tri-lens-decision-audit-v1`. That evaluator's top pick matches the human's board move **1 time in 61 (1.6%)** and F1's **47 in 115 (41%)**. Human board moves sit at a mean percentile of 0.25 against 0.17 for F1. Yet the human's board moves score 21% more. Comparing the human's move with the evaluator's top pick when they differ (median of chosen − top; the source was the same in 96% of cases):

| feature | Human chosen − top | F1 chosen − top |
|---|---|---|
| ownScoreGain | +0.32 (median 0) | +0.47 (0) |
| auraGain | **+0.66** | +0.10 |
| auraClaims | **+0.62** | +0.03 |
| projectedAuraOpenAfter | **+1 (median)** | 0 |
| ring (distance from centre) | **+1 (median)** | 0 |
| scoringContacts | **−1** | 0 |
| scoringContactValue | **−11.5** | 0 |
| lineExtension | **−524** | 0 |
| futureGrowth | **−4660** | −795 |
| shapeConnectivity | **−118** | −4 |

At equal immediate points, the human picks the placement that **creates and claims aura, keeps his own aura outlets open, and sits further out toward the rim**. He passes up placements that maximise contact, line extension and "future growth" by clumping into shared contact zones. The evaluator's weights (futureGrowth, lineExtension, scoringContacts) point the other way from winning play. The observed 2.1× aura creation fits this. Uncertainty: this compares against a reconstruction lens, not F1's internal score, but F1 agrees with the lens 41% of the time on the board.

### 3.3 Bank own-rich tiles, including from the pool, and cash them in chains
- The human banks at a similar rate (3.5 against 2.9), but **5 of his 14 banks came from the pool**, against 3 of 23 for F1. He takes an own-rich tile from the pool into hand and cashes it later: gmtpnzat6 m35 stored the red solid green had just dumped, then m39–40 went hand solid +8 → pool bonus solid +6 = 14.
- Cash-in value is 5.6 points against 3.9. Multi-placement turns are worth 12.6 points against 10.4.
- F1's banking is dominated by `bank-obvious-revealed-own-solid` (7 of the 17 F1 banks in the android games). Those solids were often cashed weakly: gmu1nmgk0 m102 placed a banked green solid for **0** under `responsive-search-hard-deadline`, and m20 `thinking-timeout-failsafe` placed a tile for 0.

### 3.4 Keep scoring in late regulation; F1 goes into "buffer"
F1 `aiDecisionReason` in the three android games: `buffer` covered 35 pool dumps, 7 banks, 19 boards and 3 passes, almost all after about deck 25. Late regulation F1 made 0.54 boards per turn and 0.02 aura per turn. The human made 0.78 and 0.44, and outscored F1 in the last 4 regulation turns (8.8 vs 5.9). June reported the same pattern: AI quiet-board rate 53% late.

### 3.5 Overtime is where the human gives points back; ammunition decides it
- The human's overtime score change was +5, −10, −12 and −4; his margin fell in 3/4 games: +13→+16 (after trailing 67–72 mid-overtime), +11→+7, +18→+2 and +34→+29. F1 seats gained +2 on average. Of the 46 points F1 erased in overtime, 41 came off the human, **9–12 in every game (4/4)**. F1's forced **final-deck-tile overwrite landed on red in 3/4 games** (−9, −10, −4).
- The human's defence was **banking overtime ammunition in late regulation**: gray/black erasers and black+red attackers.
  - gmu0hxclj: banked tri k4r2 (m60), bicolor r3k3 taken from the pool (m107), and the gray solid final deck tile (m130).
  - gmu1nmgk0: tri y4k2 taken back from the pool at m113 after he had "parked" it there himself; bicolor y3k3 at m121.
  - gmtpnzat6: tri k4r2 at m108.
  - In the one game with an empty hand at overtime (gmu1r10jq) he was forced to pass (m126) and took −12 net. He won by 2.
- F1 banked **zero erasers in 8 seats**. It entered overtime holding own solids (green sgggggg ×2 plus tggggrr; blue sbbbbbb ×2) that add at most +4…+6 by overwriting. Blue's banked r3k3 attacker (gmu1r10jq m109 → m129, −7 red) was F1's single most effective overtime play.
- Grader evidence from the unreadable games points the same way. G3 spent its only green/black eraser for 0 at moves 108 and 133 of gmttai2kz and entered overtime unarmed "where Scotty erased 6 and 6 with a banked gray/black". In gmtvynpyc G4 pass-wiped twice in overtime (m135, m138) while holding two erasers and 17 behind (5/5 brains judge "erase now" best when graded cold).

### 3.6 Pool: the human fishes deeper and gifts more; the AIs gift the leader
- Fate of human deposits (83): 46% wiped by himself (fill the pool, then pass-wipe as a private search), 36% taken by opponents (30 tiles, 131 points), 4% reclaimed. His gift per deposit (1.58) is *higher* than F1's (0.99). **Deep pool fishing is not the human's edge, and the data does not support copying it wholesale.** He accepts a gift tax in exchange for search depth: continuation flips take him 2 s and he fishes up to 6 tiles.
- The asymmetry is what the AIs feed the leader. F1 deposited **22 tiles with ≥4 red sections** into the pool, including red solids: gmtpnzat6 m31–32, gmu1nmgk0 m43 and m81, gmu0hxclj m76 and m79, the last two wiped by blue itself. The human picked up 12 of them: 11 placed for 56 points, plus 1 banked solid, about 14 points per game. By game this was 8, 27, 11 and 10 points, which is more than the final margin in 2 of the 4 games (27 > 7 and 11 > 2).
- Pass-wipe rates are equal (2.25 vs 2.38 per seat). Neither side wiped in overtime.

## 4. Game narratives (the decisive sequences)

### 4.1 gmtpnzat6_pou1hd (Sep 6; Human 84, F1 green 55, F1 blue 50): the cleanest win, locked at move 14
- m3: banks tri r4k2 instead of anything else. t6 (m8–10): jewel, then r4k2 from hand +10, then pool-bonus bicolor +3, for 13 points and 10 aura in one turn. F1 green and blue had placed their jewels on turn 1 for 0.
- m14: red solid from the deck +6. The human leads for the rest of the game (lock at move 14, margin 9 → 16 → 17 at the 25/50/75% marks).
- m31–32: F1 green (`curate`) dumps **two red solids** into the pool. m35 the human banks one; m39–40 plays the hand solid +8, then the pool-bonus solid +6 (14 points).
- The human's late regulation keeps scoring: m84 +7, m91 +6, m98 +7, m118 +4. Blue spends m100–101 and m113–117 on pool dumps and banks (this older film records no AI reason codes).
- Overtime: green's final-deck overwrite takes −9 from red. The human's m108-banked tri k4r2 answers (+5 / blue −5). Fill 88–54–46, final 84–55–50.

### 4.2 gmu0hxclj_vwhhjz (Sep 14; Human 82, F1 blue 66, F1 green 64): won by overtime ammunition
- The human scores 0 for the first 24 moves: pools and banks, trailing 0–18–15 at m24. t13 (m24–27): jewel → r4g2 +10 → r2g2b2 +2 → pool bonus, for 12 points and 9 aura. The lead first appears at m34 (+2).
- Mid-game steady scoring: m43 +6, m47 +6, m74 solid +6, m102 solid +6, while F1 green's `curate` dumps and `purge-deck-to-pass` wipes cost it tempo. Fill 77–60–64 (+13).
- Late regulation: banks tri k4r2 (m60), takes bicolor r3k3 from the pool into hand (m107), banks the gray solid final deck tile (m130).
- Overtime: green overwrites three times from banked own solids (+16), and blue's tri b2y2k2 erases red −9 (m134). **Red now trails 67–72.** The human's last turn chains three hand tiles: r3k3 into an empty cell +10, k4r2 overwrite +5/green −2, gray-solid eraser on a green solid −6. **Final 82–64–66.** Without the three banked tiles the human loses about 67–72. This is the most instructive game in the set.

### 4.3 gmu1nmgk0_ooyuwb (Sep 14–15; Human 70, F1 green 63, F1 blue 61): fed by AI gifts, protected by erasers
- t6 (m11–13): jewel → banked red solid +12 → pool bonus bicolor +3 = 15.
- F1 hands the leader points through the pool: green m36 tri r4y2 → red m41 +8, blue m43 red solid → red m45 +6, green m67 tri r4y2 → red m70 +7, green m81 red solid → red m84 +6. That is 27 points from AI deposits. Lock at m41; margins −5 → +7 → +19.
- F1 green banks its own solid twice (`bank-obvious-revealed-own-solid`, m82, m85). At m101–102 it plays them for +6 and **0** (hard deadline).
- Overtime: green's final-deck tri k4r2 overwrite takes −10 from red (80→70). The human's two banked erasers (tri y4k2, **parked in the pool at m98 and reclaimed at m113**, and bicolor y3k3 from m121) erase −6 and −6, split across both opponents. Final 70–63–61.

### 4.4 gmu1r10jq_lfeg8i (Sep 14–15; Human 69, F1 green 67, F1 blue 64): the near-loss that shows the overtime hole
- The human fishes the whole of turn 2 (5 pool deposits, then a wipe). t8 (m16–18): jewel → r4g2 +10 → pool bonus +2 = 12. He trails at the 25% and 50% marks (−8, −3).
- Mid-game solids: m69 +6, m76 +9, m98 +6; tri r4 placements m110 +4, m115 +4. Fill 81–63–50 (+18). **Hand empty at overtime.**
- F1 blue banks bicolor r3k3 at m109 (`purge-deck-to-hand`), a red attacker. m125 blue's final deck tile −4 red; m126 **the human must pass**; m128–129 blue chains +7 and then r3k3 −7 on red. Final 69–67–64. The human lost 12 net in overtime and won by 2.
- Lesson for both sides: the leader must enter overtime armed. The chasers' coordinated overtime aggression works, and F1 only reached it by accident here.

### 4.5 Earlier game from notes: gmtrdgi35_2al7bg (Sep 7; Human 70, F1 blue 60, G1 green 53; HANDOFF l.197–222)
- A structure scan says the game was "decided at deck 65": red usable aura 10 / outlets 13 against green 5/6 and blue 1/1. By deck 50 both opponents were capped. This matches §3.2: the human wins on aura and outlet dominance, not raw contact.
- G1 failures: held a "hostage" blue solid from about move 30 to the end, which filled its hand and forced a pass-wipe of a green-rich pool; fished late for colour quality instead of placeable tiles; its overtime hard-deadline fallback gifted the leader +2 when a pass was legal. The human's m131 overtime bank (tri k4r2) was worth 6 points of margin and was his "only insurance against a second black solid".

### 4.6 Grader positions from the unreadable games (all AI failures)
- **gmttai2kz m7 (F1):** pass-wiped a pool holding a four-blue tile at deck about 90 with its starter still in hand. Every graded brain would have placed the starter (regret 1); D4 and D5 judged "best" took the pool tile.
- **gmttai2kz m108 and m133 (G3):** placed a green/black eraser for 0 at deck about 30 and again at about 10, and entered overtime with no eraser. At m108 only G4 and F4 found the best move, banking the pool's gray3/black3 eraser; 11 of 21 brains place the eraser for 0. At m133, 20 of 21 brains are judged bad (G4 alone is "ok"). So this is an evaluator gap that almost every brain shares.
- **gmtvynpyc m135 and m138 (G4):** in overtime, 17 behind, holding gray4/green2 and gray3/black3 with 516 legal overwrites, it pass-wiped twice. F1 meanwhile erased 11 and 8 from red. Graded cold, all 5 brains find the erase, so this is a live-play or planner bug, not an evaluator gap.

### 4.7 AI wins over the human
None among the readable September games. June: 3 human losses in 30 games; the June audit attributes them to lower human hand chaining (1.7) and more quiet boards (32%), not to any AI strength. The only September data on how an AI *could* beat this player is gmu1r10jq: take the lead down in overtime with banked attackers against an unarmed leader.

## 5. Human edge: codeable heuristics, ranked

Evidence counts are over the 4 analysed September games unless stated. The ranking combines effect size, how consistently it shows up, and how cheap it is to build.

1. **Overtime ammunition contract** (the leader took 9–12 raid points in 4/4 games; the human was armed in 3/4; F1 banked 0 erasers in 8 seats; grader cases G3 ×2 and G4 ×2).
   - From about deck ≤ 20, keep 1–3 hand slots for (a) all-gray/black erasers and (b) own-colour-plus-black attackers. Value each by (largest opponent area it can erase, especially the leader's) + (own area it can join).
   - Never place an eraser for 0 in regulation (the G3 case).
   - In overtime: if holding an eraser and a legal overwrite reduces the leader, never pass-wipe (the G4 case).
   - In the final overtime turn, chain every hand tile.
   - Worth: about 8–15 points of swing per game (gmu0hxclj +15/−8 in one turn; gmu1r10jq −12 without ammunition).
2. **Leader-gift veto on pool deposits** (22 AI deposits with ≥4 leader-colour sections in 4 games; 56 points cashed by the leader; ≈14/game).
   - Price a deposit by the next two seats' best legal cash value for that tile, weighted up when the receiver is the score leader.
   - If the tile holds ≥4 sections of the leader's colour, bank it (hostage-denial is fine late) or place it harmlessly, unless you will wipe this same turn. Treat "deposit then self-wipe in the same turn" as safe.
3. **Aura/outlet-first placement tie-break** (decisionAudit on 56 human board decisions; 2.1× aura; June and HANDOFF structure scan agree).
   - Among placements within about 1 point of the best immediate score, prefer higher auraGain and auraClaims, higher projected own open aura after the move (+1), and outer rings.
   - Penalise pure contact-clumping: lower the weights on lineExtension, futureGrowth and scoringContacts. In the reconstruction lens those terms rank the human's winning move 1 time in 61.
   - Add a "capped opponent" structural read (usable aura and outlets per seat) and play to keep opponents capped.
4. **Jewel sandwich opening** (4/4 games; 12–15 points and 8–10 aura in the jewel turn against 0 for F1's turn-1 jewel).
   - With the starter in hand, do not place it until the hand also holds a tile with ≥4 own sections (or an own solid) that can link to it.
   - Plan jewel → banked tile → hand-empty pool bonus as one turn program, scoring the whole package.
   - Cap the delay at about 5 own turns; the human waited 2–5.
   - Uncertainty: tempo cost unmeasured beyond these 4 games. A/B it in the arena before adopting.
5. **Pool-to-hand banking of own-rich tiles** (human: 5 of 14 banks from the pool; F1: 3 of 23).
   - When the pool shows an own-rich tile that would not score well now, bank it. That also denies it to the next seat.
   - Plan its cash-in together with a hand-empty bonus: hand solid then pool bonus = 14 points at gmtpnzat6 m39–40.
6. **Cash banked tiles for value, not on deadlines** (cash-in 5.6 vs 3.9 points).
   - Hold a banked own solid until it scores at least 6 or links two groups. A timeout fallback must never place a banked tile for 0 when a pass or pool move is legal (gmu1nmgk0 m20, m102; the G1 overtime gift).
7. **No late-regulation tempo collapse** (F1 late-game boards per turn 0.54 vs 0.78, aura 0.02 vs 0.44).
   - In the last third, a board placement scoring ≥2 beats a `buffer` pool dump unless the dump is the last pool slot before a planned keep-card.
   - Stop banking additional own solids once the hand holds one; the rest of the hand should be erasers.
8. **Two-speed turn clock** (human: 22–28 s on the first decision, 2 s per continuation flip).
   - Spend the search budget on the turn plan: which tile class makes a keep-card, and which triggers a wipe. Then execute the flips against that plan cheaply.
   - This removes the deadline and failsafe fallbacks.

Not recommended from this data: copying the human's pool volume. His gift rate per deposit (1.58) is worse than F1's (0.99). Wiping his own pool (46% of deposits) is only safe because he fishes in bursts within one turn.

## 6. AI failure modes to fix (F1-v2 unless noted; counts over 4 games)

| # | failure | evidence | fix |
|---|---|---|---|
| F1 | Deposits leader-colour-rich tiles (including solids) into the pool | 22 deposits; the human cashed 11 for 56 pts and banked 1; red solids at gmtpnzat6 m31–32, gmu1nmgk0 m43/m81 | heuristic 2 |
| F2 | Banks zero erasers; enters overtime with own solids only | 0/8 seats; hands at overtime: sgggggg ×2, sbbbbbb ×2, etc. | heuristic 1 |
| F3 | G3 spends its only eraser for 0 in regulation; G4 pass-wipes in overtime while armed | grader Sep 10 and Sep 14 | heuristic 1 (hard rule) |
| F4 | Jewel on turn 1 for 0 (8/8) | table §3.1 | heuristic 4 (test) |
| F5 | Evaluator overweights contact/line/future-growth, underweights aura and outlets | top-1 match with human 1/61; median deltas in §3.2 | heuristic 3 |
| F6 | `buffer` late regulation: dumps, banks solids, low board tempo, no aura | 35 buffer dumps and 7 buffer banks in 3 games; late boards/turn 0.54 | heuristic 7 |
| F7 | Deadline and failsafe placements for 0 | gmu1nmgk0 m20 (`thinking-timeout-failsafe`), m102 (`responsive-search-hard-deadline`); G1 overtime gift (HANDOFF) | heuristic 6, 8 |
| F8 | Hostage banks, fishing with a full hand (G1, gmtrdgi35) | HANDOFF l.197–222; all strong brains fish at m132 | keep G2/G3 hostage rules |
| F9 | F1 wipes a pool holding a 4-own tile early (gmttai2kz m7) | grader Sep 10 | price a wipe as a lost turn plus the value destroyed |
| F10 | No overtime plan for a *leading* AI: the new brain will often be the leader and face the same focused raids | the human lost 41 pts to overtime raids in 4 games; the final-deck tile hit the leader 3/4 | when leading at deck ≤ 15, spread value so no single overwrite removes a big group, and keep an eraser to answer |

## 7. Open questions and data gaps
- Six films and the ndjson bundle could not be read. `gmu1ag53z`, `gmu0p4o7e` and `gmu2z8l11` (F1 at 6.8–7.2 MB) are the most valuable to recover: fetch them locally (for example with Drive for Desktop) and re-run `python3 analyze.py && python3 analyze2.py && python3 analyze3.py`. The scripts pick up any `raw/*-film.json`.
- G-series brains (G1/G3/G4) were only met in unreadable films. The per-brain comparison is F1-only.
- There is one human player, and he was always red. Seat order varied: the human moved first once, second once and third twice.
