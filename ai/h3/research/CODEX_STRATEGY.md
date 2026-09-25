# QUEXATLE: Scott's strategy and AI-brain design, mined from the Codex logs (May 4 to Sep 6, 2026)

Weighting: **S** means Scott's own words, quoted verbatim with typos kept, and carries the most weight. **A** means an assistant analysis or design decision from the same session that Scott accepted or directed. **H** means a handoff or strategy notebook that Codex wrote from Scott's directives. H is used only where the raw session could not be downloaded.

## (a) Sources

### Coverage
Drive downloads failed for every file larger than about 5.8 MB (about 7.7 M base64 characters). Most of the long AI-design sessions are that large, so they could not be read directly. I recovered their content three ways:
- **Approval-reviewer sessions** embed verbatim user transcripts of the big sessions.
- **Forked subagent sessions** carry the parent's user messages and final analyses.
- **Codex-written handoffs and notebooks** on Drive record Scott's directives as they were given.

### Sessions read directly (user and assistant text)
| Date | Title / role | Why it matters |
|---|---|---|
| 05-05 | Help with HTML game | Rule genesis: aura, black edges, jewel-linked scoring, three-pass end |
| 05-10 | Fix game code | Scoring by section (6/3/2) |
| 05-16/17 | Continue hex game dev | First "human insights the AI doesn't use" list |
| 05-17 (untitled, reviewer) | Embeds 05-17/18 WHOPPER modular-AI session | AI-vs-human analysis requests |
| 05-19 (untitled, reviewer) | Embeds 05-19/20 AI architecture session | "situational strategy", kingmaking tolerance |
| 05-22 | OT simulation | Storing tiles for overtime |
| 05-27 (untitled, reviewer) | Embeds 05-27 "Continue Hexxxagon app dev" | Deck/pool flip rules, "find my win patterns" |
| 06-30 | **Find rule exploits** | Key session: pool wipe, hand bursts, aura freedom, pass-stall, deck gambling |
| 07-08 | untitled (D5/D6 framing) | Anti-blob, "lines into open space" |
| 08-03 | Fix 2-player game issues | UI only |
| 08-05 | Fill board with tiles | Think-time limits, "obvious moves take no time" |
| 08-10 (reviewer) | Tutorial maker | UI only |
| 08-11 | Fix startup screen (Phone Link watch) | "notice ai's lack of aura" |
| 08-13 | **View PhoneLink game** | Birth of F3: bank vs board in a shrinking world, zero-aura death spiral |
| 08-15 | Check brain updates | Admin only |
| 08-16 | Find max possible score | 126-point ceiling |
| 08-22 | Lorentz `/root/math_lens` and `/root/math_analysis` (forks of "Look at last few game logs with Scotty Gee") | **Key: three-lens method, overwrite phase, fragility, "profitable but terminal"** |
| 08-25 | Godel `/root/counter_regression` | UI only |
| 08-26 | Clarify next steps | Meme economy only |
| 09-03 | Review playtest steps | Admin only |
| 09-04/05/06 | About 15 small subagents plus Fix Quexatle chat prompts and Prepare official playtest | No strategy content |

Another 17 small sessions were checked and contained no strategy content.

### Codex-authored Drive documents used as proxies
- `WINNING_STRATEGY_INSIGHTS-as-of-2026-09-07.md`: the "Scott insight" ledger, last updated Aug 14.
- `HANDOFF_CURRENT-as-of-2026-09-07.md`: F3 to F8, G1 and G2 records, Aug 6 and Aug 15 terminal rules, the Sep 7 live-game fixtures.
- `ADVANCED-HUMAN-MODELED-v1-playbook.md` (Jun 9) and `hext-scott-strategy-cheat-sheet.txt` (Jun 18).

### Could not download (larger than about 5.8 MB)
These probably hold most of the remaining direct quotes:
- 05-12 Game dev help (6.9 MB)
- 05-18 Stabilize WHOPPER (12 MB)
- 05-24 (8.6 MB)
- 05-28 Continue Hexxxagon app dev (19 MB)
- 06-04 Fix human game upload retries (12 MB)
- 06-07 (10 MB)
- 06-08 Review handoff (27 MB)
- 06-16 Update quick rules (12 MB)
- **06-20 Tune win takeover jewel anchors (11 MB)**
- 06-24 Dash (28 MB)
- **07-07 Explain AI play limits (42 MB)**
- **07-17 Resume handoff (22 MB)**
- 07-29 Locate files (21 MB)
- **08-06 Assess luck versus skill (8.5 MB)**
- 08-13 Watch game via Phone Link (21 MB)
- 08-13 untitled (7.1 MB)
- 08-20 untitled (13 MB)
- **08-22 "Look at last few game logs with Scotty Gee" (7.7 MB; its forks were read)**
- 08-24 memes (15 MB)
- 08-24 Fix room creation loop (22 MB)
- 08-27 (7.9 MB)
- 08-28 Add to quick rules (19 MB)
- 09-01 Investigate crash (11 MB), Add clipper (11 MB), Launch update (6.4 MB)
- 09-02 Perfect game screen (19 MB)
- 09-03 Watch mirror (13 MB)
- **09-04 Calculate game turns (8.6 MB)**
- **09-04 Review game code (14 MB)**
- **09-04 Kant, Darwin and Euclid subagents (7.7 to 10 MB)**

The Aug 25 and 26 scientist-named subagents are children of the meme and room-loop work. I sampled them and they contain no strategy.

**Important gap:** none of the accessible Codex text uses the words "cut point", "articulation", "bridge" (in the graph sense) or "fragile connection". Scott's statement that overwrite targeting of cut points is "huge" is **not** in the readable Codex archive. It is probably in a later Claude session or in an unreadable Sep 4 session. The closest Codex material is covered under Topic 1.

---

## (b) Topics: Scott's words, then the distilled rule

### 1. Overwrite targeting, fragile structure and protecting groups
- **S 05-07:** "Rule change: the captured area linked to the players jewel cannot be overwritten by another player… when not part of the jewel connected area, other players can overwrite those tiles." This is a historical rule, later dropped. Jewels themselves stay un-overwritable.
- **A 08-22, three-lens review of Scott's wins, accepted by Scott and made the basis of F8 and G1:**
  - Game 2: Scott reached board fill at 101, then "overwrite moves stripped 14 points" and he won by 1. "Move 140 gained four points but spent Red's final aura and left no outlet. It was mathematically positive but geometrically terminal."
  - Game 3: "The final two Human overwrites… were targeted interventions in Blue's scoring structure… Move 143… zero points gained, six opponent points destroyed, aura preserved."
  - Game 3 overwrite on move 145 was worth "+7 Red, −2 Green, −4 Blue… an 11-point swing."
  - F1's lead after its move 148 "was structurally fragile: Scotty overwrote the same fresh hex (1,−1) immediately and removed six points."
- **A 08-23, game gmt52t09n:**
  - F1 "overwrote Scotty's move-106 tile, which had originally scored Red +9 and created 3 aura."
  - Scotty "overwrote F8's move-19 tile, F8's largest original scoring move (+10)."
  - F1 then chained two hand overwrites (+2, then +2/−2) to win.
  - "F1 won as the least-exposed player… retention 100%", against Scotty 86% and F8 81%.
- **A 08-22 formula Scott accepted:** value = "immediate gain − future overwrite exposure − lost mobility − last-aura penalty". Also: "When comfortably ahead, reject modest immediate gains that destroy future options or expose a large overwrite loss."
- **H 09-07 (G2 design from Scott's live game):**
  - "shield the largest group when armed"
  - "black/gray for erasing the largest opponent group"
  - "score fragility against opponents' known hand tiles"
  - G1 "led 93–67–60 at board fill and lost 19 points to overtime overwrites"
  - F1's final deck tile "black solid, overwritten onto a red solid for −11"

**Rule.** In overtime, target the tile whose removal destroys the most opponent linked value. That is usually an anchor that linked a big group, meaning the opponent's single largest scoring placement, and it amounts to a cut point in practice. Rank targets by margin swing against the leader or the next seat. Defend by measuring retention: the worst loss your structure suffers from any opponent's publicly possible overwrite sequence. That can be a chain of hand tiles, not just one overwrite, because F1 chained two. A freshly placed lead tile is the first thing opponents re-overwrite.

### 2. Overtime, overwrite, erasers, banking ammunition and when to pass
- **S 05-23:** "make sure ai now understands ot rules, incl possible strategy of storing tiles near end of regulation to use in ot".
- **S 06-30:** "we had to implemene the secondary overtime start condiition of 0 deck tiles but playable hand/pool tiles, to avoid the infinite loop". Overwrite applies only once the board is full.
- **A 06-30, Scott's reframing adopted:** "Overtime overwrite play: Intended advanced endgame. AI should understand overwrite timing, legal targets, aura exceptions, jewel protection, and score-swing/denial value."
- **A 08-22 (Game 3 story):** "Scotty stored the pieces he would need… then opened the vault." "The stored tiles allowed Scotty to attack distant overwrite targets without depending on the next deck draw."
- **A 08-22 terminal-objective switch:** once the board is full and hands are small, discount `futureGrowth` to about 18% or less and "optimize win probability or maximin final margin". At full-board move 145 the static evaluator ranked Scott's move 8th of 109 because future-growth weight 5 dominated.
- **H Aug 14 audit:** "Late-game storage needs a verified overwrite target and deadline." Red "banked a gray/red reserve on move 139 and used it on move 143 for a decisive opponent-score reduction."
- **H Sep 7 (G2 from Scott's game):**
  - "hand slots valued as overtime ammunition"
  - "an overtime reserve valuation (own solids for offence, black/gray for erasing the largest opponent group)"
  - "overtime arithmetic (a placement scoring for an opponent at least as much as for the actor is priced below a pass)"
  - A fixture Scott flagged: G1's deadline fallback "placed a banked red solid for red +2 even though a pass was legal"; that gifted the leader.
  - "G1 entering overtime with only tiles that could never score for it."
- **S 05-17 (defensive wipe):** "another thing i used a coouple of times in play that i dont believe ai ever did, was use the 6 tile pass as a defense against strong tiles for opponents".

**Rule.**
- Enter overtime armed with two kinds of reserve: own-colour solids or IT tiles (imbalanced 4/2 tricolours) for offence, and black, gray or black/gray tiles as erasers.
- Every banked reserve needs a named target and a deadline.
- In overtime, choose by margin swing against the leader, not by own points. A zero-own-point eraser that removes 6 from the leader is a top move.
- Pass instead of a placement that helps an opponent at least as much as it helps you, and especially instead of one that helps the leader.

### 3. Three-pass ending, clock control and passing
- **S 05-10:** "player 1, player 2 and player 3 pass on consecutive turns= game over altho game must end in a whole integer round #".
- **S 06-30:** "pass-stall timing… ai should be considering this possibility as part of its late game strtgey, not only as an active move, but as passive read of it being possible for an opponent".
- **H Aug 6:** Blue made a second pass with a legal streak-breaker available and handed the leader the win. The shared rule became: take the third pass when uniquely leading; never supply the second or third pass when behind if any placement resets the streak.
- **H Aug 14 (Scott audit, F4 move 106):** "Two pass strikes are a terminal game state, not a move preference… When trailing, survival from an otherwise immediate terminal loss dominates… A resource-first action… must inherit a 'must break pass streak' contract."
- **H Aug 15:** "a certain immediate loss must rank below every legal action that preserves the game". F6 passed third at 46-53-55 with 38 deck tiles left; a blind deck draw would have kept the game alive.
- **A 08-22 (Scott's own loss):** the three-pass end came "with 48 tiles still in the deck" after "66% of actions sent a tile to the pool". Pool cycling while behind loses the game by the clock.
- **H Sep 7:** Scott said his game was "decided at deck 65". G2 added a turn clock (late regulation at four turns remaining, last-turn flag) and a `won/capped/contested` structural read.

**Rule.**
- Do terminal projection before any tactics.
- Leader alone: take the winning third pass.
- Behind: every action, including draw, bank or fish, must keep the game alive.
- Track the opponents' pass threats passively.
- When "won" structurally, switch to caging: minimise variance and never wipe a lead.

### 4. Pool, gifts, wipes, hand-empty bonus chains and jewels
- **S 05-17:** "hand tiles being able to be placed in oppinent aura should create a whole strategy branch… the face hand empyting confers a pool bonus where since the pool tiles are known unlike totally random deck tile, and again the pool tiles could intentionally be stacked to aid this bonus".
- **S 05-17:** "i intuit that the winning strategy will selectively use hand tiles sometimes, not too often, not too little. a goldilocks zone".
- **S 06-30:** "pool wipe cycling comes at a cost, the player pool wiping halts their own scoring progress in a purely potentially defensive move (next deck tile could gift next player a great tile)".
- **S 06-30:** "hand chain burst turns: a gambit the ai usually fails to preplan to CHIEVE, SORELY LACKING IN advances or expert ai".
- **S 06-30:** "gamble more on getting a better deck tiles with next deck flip, instead of accepting a weak or in many cases a pointless 'sure thing' tile in pool or currently flipped tile. worst case scenario, pool-deck-wipe failsafe". Also: "emphasize preplanning and hand building."
- **S 05-20:** "It doesnt like to fill the pool with deck tiles."
- **H Aug 13 (Scott's counterfactual, keep-card branches):**
  - Put a useless tile in the last pool slot and keep fishing.
  - If the keep-card is an own-colour bicolour, IT or solid, link it to the jewel.
  - If it is a BT (balanced 2/2/2 tricolour), bank it.
  - If it has no own colour, pass-dump all six.
  - Gray or black: "probably" bank.
  - If the five pool tiles are loaded for an opponent, that "might" justify dumping even a good keep-card.
- **H Aug 14 (Scott correction):** "Relax the weak-tile threshold as resources become scarce, and manufacture the pool bonus". Bank a modest tile now, empty the hand next turn and claim the pool bonus, evaluated as one package. Scott also confirmed as a "huge Human Red blunder" a placement that scored Red 2 and Green 4 when Red 4 and Green 0 was legal.
- **S 08-13 and 08-14:** "look? handed me a solid… 10 points!" F3 and G1 target pool deposits to the next seat. G2's arena result was 527 points given against 297 taken.
- **S (jewel, via H):** "Do not place a jewel where it creates fewer than six aura hexes when a legal six-aura location exists." **S 05-09:** "seems their opening strategy of overlapping auras is not wise".

**Rule.**
- The pool is public: price every deposit for the next seat first.
- Pass-wipe on purpose, to deny an opponent-loaded pool, never as a habit.
- Plan hand-empty bonuses in advance: know the pool target, the deadline and the survival odds.
- Fish when the visible tile has no purpose; accept weaker tiles as scarcity rises.
- Place the jewel with a full six aura, away from edges and overlaps.

### 5. Aura, frontier, territory, black walls and link-breaking
- **S 06-30:** "aura bypassing is intended and is a whole area the ai fails CONTINUALLY-to exploit".
- **S 06-30:** "ai fails to use aura freedom to block other players from hand-to-opponent-aura scoring moves. never even consider sit, if it has even preserved late game aura".
- **S 05-17:** "ai did not see to pursue trying to push its aura edge against mine and take away aura in overlappign hexes as much as i was".
- **S 05-20:** "doesnt seem to value expanding its aura, when that should be a top priority early".
- **S 07-08:** "A big problem is the ai's love the blob bunch… they literally block themselves off. There is no bonus for tightly packing tiles! They should try building into open space way more, linking their color into lines".
- **S 08-13:** "still ai's clump their tile around jewel, suffocating aura, instead of directed away from jewel in combo scoring/aura moves".
- **S 08-13:** "as board gets filled in there is less real estate to claim.... solid to board would have scored and spread aura in a rapidly shrinking world". Also: "see now? they have no aura, and i have a dozen aura" and "all the ais can do now is bank".
- **S 08-12:** "notice ai's lack of aura".
- **H Aug 14 (Scott):** "Open space is the metaphorical fourth unseen player." "Press opponent aura instead of backfilling." "Bury unusable sections" by turning off-colour and black faces toward dead edges.
- **H Jul 18 (Scott):** track own versus each opponent's usable aura; with 12 or fewer open cells, never burn the last aura. Human wins held or grew aura on 85% of moves in that phase.
- **A 08-22:** "aura without roads" (Scott's loss) and "roads without reserves" (his one-point win).
- **S 05-07/08 (black):** "black can connect to any color, but only black can connect to black". Gray cannot touch an existing black edge. Tiles in your own aura ignore edge-matching.

**Rule.**
- Grow ordered, jewel-rooted lines outward, with outlets further from the jewel.
- Contest the opponent's aura border and neutralise it through ties.
- Use your own aura squares defensively to occupy an opponent's best hand-invasion cells.
- Keep your last aura alive late.
- Black and gray are utility pieces: walls, wall-breakers and erasers, not filler.

### 6. Opening, lead protection, kingmaking and three-player dynamics
- **S 05-19:**
  - "i use a situational strategy… board state dependent, pool tiles, score, opponent position etc"
  - "its also with foresight as to possible./probable opponent next moves, so fuzzily predictive"
  - "sometimes ive place a tile knowing i was giving an opponent some points, either because i was gaining more points and/or for some positional advntage… esp didnt mind scoring for an opponent if their score was significantly lower than mine"
  - "experimental moves should be more of the 'im taking a flier'…"
- **S 05-17:** "lucking out drawing early solids being well neigh unbeatable". Deck composition was tuned against this.
- **A 08-23:** F1 won as the least-exposed player while Scotty and F8 attacked each other. Tying the leader is not enough "without remaining-hand and turn-exhaustion modeling".
- **H Jul 27 (E1):** "Opponent reply risk must mean the player who actually moves next."
- **H Sep 7:** "never gift the next seat, never wipe a lead" when structurally won. Scott also said "human win patterns outrank AI-versus-AI films."

**Rule.**
- Gifts are measured against the leader and the next seat. Gifts to a trailing third seat are cheap.
- When ahead at board fill, minimise exposure, because retention wins.
- Be aware that the two trailing players tend to damage each other.

### 7. Named concepts, rules of thumb and numbers
**Scott's vocabulary:**
- **IT** means imbalanced 4/2 tricolour; **BT** means balanced 2/2/2 tricolour.
- keep-card; pass-dump / pool-deck-wipe; hand-chain burst; "taking a flier"; "open space = fourth player"; "decided at deck 65"; "hostage" banks.

**Assistant labels Scott accepted:**
- aura without roads; profitable but terminal; planned denial; mobility-collapse; cage/arm; won/capped/contested.

**Numbers:**
- Maximum score is 126.
- Tile values: solid 6, IT 4, bicolour 3, BT 2.
- AI think time: at most 90 s per turn; "simple obvious moves… like banking or boarding a solid of your color from the deck" should take no time.
- Human benchmarks: 3.65 points per board placement against 2.8 for the AI; about 2.26 hand chains per game at about 9.1 points each; aura at 66% of the game 7.2 against 1.1 for the AI.

**AI behaviour Scott called dumb:**
- Banked a solid late instead of placing it (08-13, "poor choice").
- Clumping and blobbing (07-08, 08-13).
- Overlapping opening auras (05-09).
- Not filling the pool from the deck (05-20).
- "green move 98 made no sense at any skill level!" (05-19).
- Second pass that handed the leader the win (Aug 6).
- Third pass into a loss (Aug 15).
- Fed Green's pool (Aug 14).
- Hostage blue solid held from move 30 (Sep 7).
- Fishing for colour quality instead of placeability late (Sep 7).
- Long thinks producing mediocre moves: "extra think time doesnt always lead to better moves" (08-05).

---

## (c) Ranked codeable heuristics for an F8-based brain

Implementation status comes from the handoffs and ledger. It is not verified against current code.

1. **Terminal gate first.** Take the third pass when uniquely leading. When not leading, never make the second or third pass if any action (placement, bank or draw) keeps the game alive. Resource actions inherit a must-break contract. *Implemented as the shared Aug 6 and Aug 15 layer. H3's "take winning end-pass" duplicates it, so reuse the layer rather than rebuilding it.*
2. **Actor-relative gift safety.** Score every move by own gain minus the gain of the leader and the next seat. Reject any placement whose net is dominated by a no-gift placement of the same tile. Price pool deposits for the next seat, with a heavy penalty for "sockets": the next player's solid, or a tile with 4 or more of their sides. *F5 and F6 implement actor-relative dominance; G1 v1.2 added socket and predeploy penalties; this is G2's top remaining weakness, at −230 over 15 games.*
3. **Overtime objective switch.** Once the board is full, or the deck is empty with small hands, value a move by margin swing against the leader or maximin final margin. Drop future-growth and shape weights to 20% or less. *F8 via its F7 donor is only partial; the Aug 22 finding that future-growth distorted the ranking is not recorded as fixed in F-series.*
4. **Overwrite target ranking.** For each legal overwrite, compute the opponent's linked value lost after rescoring. Prefer tiles whose removal splits a group, which is the cut-point effect. Prefer hitting the leader or the next seat. Zero-own-point erasers are valid when they remove 6 or more from the leader. *G2 has "erase largest opponent group"; explicit cut-point detection is not implemented anywhere.*
5. **Retention and fragility defence.** Before a regulation move near board fill, and before every overtime move, estimate your worst loss from each opponent's publicly possible overwrite sequence on their next turn. Inputs are their public hand slot, the unseen-tile distribution and chainable hand tiles. Penalise in proportion to lead and time: "profitable but terminal". *Planned for G1 phase two; G2 adds "score fragility vs known hand tiles". This is H3's worst single-overwrite loss, which should be extended to chains.*
6. **Overtime ammunition contracts.** From about four turns before board fill, keep at least one eraser and one own-colour attacker in hand. Each bank records its target group and deadline. Never bank a zero-own tile that is not an eraser (the hostage-bank ban). *Implemented in G2's late-regulation campaign; F-series has partial contract banking from F3.*
7. **Last-aura and zero-aura gates.** With runway left, never burn the last aura when a preserving alternative exists. At zero aura, restore before doing denial proxy moves. With 12 or fewer open cells, do not worsen the aura deficit unless the move is decisive. *Implemented as F6 invariants.*
8. **Directed lines, not blobs.** Placement must extend a jewel-rooted ordered path, turn by at most one hex side, and leave an outlet further out. Reject three-neighbour backfill without frontier gain. Carry a retreat penalty when leaving a contested aura border. *Implemented in D6-v2 and F3; F8 inherits it through F1-v2 only partially.*
9. **Complete-turn programs.** Evaluate hand, pool and deck sources, destination and continuation as one bundle: fish to the last pool slot, then the keep-card branch; bank now, empty the hand next turn, take the pool bonus; hand-chain bursts. *F5 has the prospective pool-bonus contract; G1 and G2 score complete visible-turn programs; F8 only via its donor.*
10. **Scarcity-adjusted acceptance.** Early, fish or dump weak tiles freely. As deck and open cells shrink, accept same-colour and black/gray converters. Late, an own solid goes to the board if it scores and adds aura; do not bank it. *Implemented in F5; F3 removed the unconditional own-solid fast-bank.*
11. **Pass-wipe discipline.** Wipe only when the full pool is opponent-loaded (a measured gift to the next seat), or to kill an opponent's burst. Never wipe while leading in a "won" structure. A wipe costs you a turn plus the opponents' tempo. *F5 has "purposeful purge"; G2 prices the lost turn.*
12. **Defensive aura occupancy.** Scan each opponent's hand and public slot for hand-into-your-aura scoring cells and occupy the best one with an aura-freedom placement. *Listed as a gap since Jun 30; I found no brain implementing it.*
13. **Jewel placement.** Place the jewel for a full six aura, away from edges, overlaps and opponent aura. *Implemented in the A-series opening and later brains.*
14. **Structural read and cage mode.** Compare own usable aura and outlets with each opponent's. When they are "capped", minimise variance, never gift the next seat and never wipe. *G2 only.*
15. **Kingmaking tolerance.** Gifts to a player well behind you are nearly free. Weight damage and gifts by the target's standing. *Implicit in actor-relative scoring; not explicit.*

---

## (d) Contradictions and nuances in the current H3 plan
H3 is the F8 kernel plus corrections.

- **"Take the winning end-pass / never pass into a non-win end."** This matches Scott and the Aug 6 and Aug 15 layer. Nuance: survival actions include a *blind deck draw* or a bank, not only placements (Aug 15 case). Tied positions need explicit tie and overtime evaluation.
- **"Opening dump cap."** This partly conflicts with Scott.
  - He *wants* early fishing: "gamble more on… next deck flip… worst case pool-deck-wipe", "fill the last pool slot to keep fishing", and "It doesnt like to fill the pool with deck tiles."
  - His own loss came from over-pooling: 66% pool actions.
  - A flat count cap will block legitimate filtering. Cap by *gift value to the next seat* (sockets) and by lack of progress, not by count.
- **"No zero-point hand placement."** This conflicts in three cases:
  - Scott's decisive overtime move 143 scored 0 for Red and −6 for Blue.
  - The Aug 14 "bank a modest tile → empty hand → pool bonus" plan deliberately uses a weak first hand tile.
  - Defensive aura-occupancy blocks score 0.
  - Restrict the ban to *zero net margin and zero aura and no bonus unlock and no denial*.
- **"Bank erasers late."** This agrees with G2 and Scott. The late banking must not displace a scoring-plus-aura own solid (the 08-13 "poor choice"), and must not become hostage banking that fills the hand and forces a wipe (Sep 7 fixture). Every bank needs a target and a deadline.
- **"Strike instead of pass in overtime."** This needs a guard. Scott flagged G1 placing a +2 that helped the leader when a pass was legal. G2's rule is that a placement scoring for an opponent at least as much as for you is priced below a pass. Strike only when the margin against the leader or next seat improves. Otherwise pass, provided a pass does not create a losing terminal streak.
- **"Keep erasers."** Agrees. But G2 banked six black and gray tiles plus an all-black solid, erased −16 and −8, and still lost 67–69 to an F1 pool take plus a raid. Erasers do not replace retention defence.
- **"Cut-point defence by worst single-overwrite loss."** This direction is right, since F1 won Aug 23 purely on 100% retention. It is too narrow:
  - F1 won that game with *two chained hand overwrites* in one turn, so model per-turn chains.
  - Weight by player order: the next seat and the leader first.
  - Use only public information: the public slot plus the unseen distribution, never hidden hands.
  - Combine it with lead size, because protection matters most when ahead at board fill.

**Open item:** the "cut points are huge" quote and any explicit articulation-point discussion were not found in readable Codex logs. Check the Claude-era sessions, or the unreadable Sep 4 sessions (Review game code, Calculate game turns, Kant/Darwin/Euclid) and 08-06 Assess luck versus skill, if exact wording is needed.
