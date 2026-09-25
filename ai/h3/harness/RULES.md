# QUEXATLE / Hexxxagon rules as implemented (sim.html, build "deck100-h2-option-economy-ai-69", 2026-09-15)

Source of truth: the main inline script of `sim.html` (extracted as `../main.js`; line numbers below refer to that file).
Function names are global function declarations in that script. The June 2026 rules docs
(`rules_full_june.md`, decoded copy of RULES_FULL_EDIT_2026-06-14) agree with the engine except where noted
under "Differences from the June rules text".

## 1. Players, board, pieces

| Item | Implementation |
|---|---|
| Players | `PLAYERS=["red","green","blue"]`; turn order red→green→blue→red (`advanceTurn`, `state.turnIndex`). Starting seat is random: `randomStartingTurnIndex()` (crypto RNG) in `createState()`. |
| Board | Axial hex grid, `BOARD_RADIUS=4` → 61 cells (`isBoardCoordinate`: max(|q|,|r|,|q+r|) ≤ 4). |
| Center | `"0,0"` holds a neutral grey solid (`createState`: `board:{"0,0":{tile:makeSolid("gray")}}`). `isCenterVoid(0,0)` is never playable, never overwritable, is ignored for edge matching (`isBoardPlacementLegal` skips it) and for scoring (`colorSectionComponentsForPlayer` skips key "0,0"). **60 playable cells.** |
| Center ring | The 6 cells at distance 1 (`isCenterRingProtectedSpace`) are normal cells for tiles, but no jewel aura may include them (see §5). |
| Sides | Side index 0..5 = E, SE, SW, W, NW, NE (`SIDE_NEIGHBOR_DELTAS`, `sharedSideIndex`, `neighborForSide`). Rotation shifts `sides` (`rotateTileClone`; solids are rotation-invariant; `aiTileRotations` dedups identical rotations). |
| Pool | 5 slots, `state.pool=[null×5]` (shared, public). |
| Hands | 3 slots per player, `state.hands[p]=[jewel,null,null]`. Slot 0 is the *public* hand slot (`PUBLIC_HAND_SLOT_INDEX=0`, `publicHandTileForPlayer`); slots 1-2 are private to the owner in the AI information model (`AI_INFORMATION_MODEL_VERSION="public-information-v1"`). |
| Jewels | Each hand starts with its seeded starter jewel: a solid of the player's colour with `starter:true, owner:p` (`createState`). Not part of the deck. Can never be put into the pool (`addAIHandPoolMoves` skips `isSeededStarterForPlayer`). Only one may ever be on the board per player (`placeBoardTileWithOverwrite` / `isBoardPlacementLegal` check `playerStarterOnBoard`). Never overwritable (`isNonOverwritableJewelAt`). |

## 2. Deck (`buildDeck`)

100 tiles, 45 types, colours `["red","green","blue","gray","black"]`, shuffled with `shuffleDeck` (Fisher-Yates on `crypto.getRandomValues`):

| Group | Types | Copies | Tiles | Side pattern |
|---|---|---|---|---|
| Solids (`makeSolid`) | 5 (one per colour) | 4 | 20 | `[c,c,c,c,c,c]` |
| Bicolors (`makeBicolor`) | 10 (all pairs) | 3 | 30 | `[a,a,a,b,b,b]` |
| Imbalanced tricolors (`makeTricolor(x,x,y)`) | 20 (ordered pairs x≠y) | 2 | 40 | `[x,x,x,x,y,y]` (4+2) |
| Balanced tricolors (`makeTricolor(a,b,c)`) | 10 (all triples) | 1 | 10 | `[a,a,b,b,c,c]` |

Grey and black appear as ordinary colours inside these (e.g. solid black, red/grey bicolor, grey-grey-grey-grey-black-black).

## 3. Edge compatibility (`compatible(newColor, existingColor)`, `isBoardPlacementLegal`)

- Existing **black** edge: only a new black edge may touch it (`existingColor==="black" → newColor==="black"`).
- New **black** edge: may touch anything (black is wild *when placed*, one way).
- **Grey** (either side) is wild both ways, except it cannot touch an already-placed black edge.
- Otherwise colours must be equal.
- A placement is legal on an open, non-center cell if every edge touching an existing tile is compatible. A cell with **no** neighbours is legal too (no adjacency requirement; `requireChainAdjacency` is always passed `false` by the AI generators and no caller passes `true`).
- The center tile is ignored for matching.
- Placement **inside your own aura ignores edge matching entirely** (§5).

## 4. What a turn consists of

A turn is a sequence of engine actions ending in `finishTurnAdvance()` → `advanceTurn()`. Counters:
`state.placementsThisTurn`, `state.firstPlacedSource`, `state.handBoardPlacementsThisTurn`, `state.bonusPoolPlacementsThisTurn`
(`markResolvedPlacement`). Legal actions are enumerated by `aiPossibleFirstMoves(player)` (sync) /
`aiPossibleFirstMovesResponsive` (async; identical set); blind deck draws are separate (`aiCanCommitBlindDeck`, `aiBlindDeckCommitMove`, executed with `tryDrawDeck`).

Regulation (non-overtime) turn start options (`aiPossibleFirstMoves`, normal branch):

1. **Hand → board** (any hand tile incl. the jewel, any rotation). Starts a *hand chain* (below).
2. **Hand → pool** ("deposit"): any non-jewel hand tile into any open pool slot. Ends the turn. Counts as a placement (resets the pass streak). The slot is locked for the rest of the turn (`markPoolSlotLockedThisTurn`).
3. **Pool → board**: ends the turn.
4. **Pool → hand** ("bank"): into the first open hand slot; ends the turn.
5. **Flip the deck** (hidden until committed; `tryDrawDeck`). The revealed tile must be resolved before anything else (`selectedDeckTileLocksOtherSelections`):
   - → board (ends turn) or → hand (ends turn);
   - → pool, only while no placement has been made this turn and a pool slot is open (`canDumpSelectedDeckTileToPool`). After a dump the player **must flip again** (hand/pool sources are locked: `deckDumpContinuationRequiresDeck`); dumped tiles are locked in the pool for this turn;
   - once the pool is full, the next flipped tile must go to board/hand, or **PASS-wipe** (below);
   - if a flipped tile can't be kept at all (no hand slot, can't dump, pool not full, no legal board cell) it is put on the deck bottom and the next tile is flipped (`tryDrawDeck` loop).
6. **Pass** — only allowed when (a) the player has no action at all (`canPassNoAction` / `currentPlayerHasAnyAction`), (b) it completes a three-pass end (`canCompletePassEndStreak`: the last two turns were passes by the two other players — this pass is always offered, even if moves exist), or (c) the pool-wipe below.

**PASS-wipe** (`discardFullPoolAndSelectedDeckForPass`, AI path `move.kind==="pass"` with `passReason:"discard-full-pool-plus-flipped-deck"`): with a full pool and a flipped deck tile, discard all 5 pool tiles and the deck tile; the turn ends and counts as a no-placement pass for the 3-pass rule.

**Hand chain** (`handPlacementRunCanContinue`, AI loop in `runAI` using `aiBestHandBoardMoveResponsive`): if the first placement of the turn was hand→board, the player may keep placing hand tiles on the board, up to 3 placements total (`handPlacementLimit` = hand size 3), each independently legal. When one hand tile remains the player may instead deposit it into the pool (`addAIHandPoolMoves(...,{handEmptyBonusSetup:true})`). PASS stops the chain early ("finish-hand-play"); that opt-out **does not** count toward the 3-pass end (`handOptOutPassSuppressesEndStrike`, `hadPlacement`).

**Hand-empty pool bonus** (`canUseBonusPoolPlacement`, `hasAvailableBonusPoolTile`, `aiBestPoolBoardMoveResponsive`): if a hand-first turn with 1-3 hand→board placements leaves the hand empty, the player may place **one** pool tile (not one locked this turn) directly on the board. It is treated as a hand tile for legality (`legalSource:"hand"` → may enter an opponent aura). It cannot be banked. Declining is a PASS ("skip-empty-hand-pool-bonus") that does not count as a strike.

Opening turn (`isOpeningTurn`: `state.openingPlaced[p]===false`): same options (hand→board chain incl. jewel, hand→pool, pool→board, pool→hand, deck). The jewel is not forced out on turn 1.

## 5. Auras

- **Initial (jewel) aura** (`jewelAuraOwners`, `auraControlAt`): each empty cell adjacent to a player's jewel gets 1 claim for that player.
- **Jewel placement restriction** (`wouldJewelAuraOverlap`, `isJewelAuraPlacementLegal`): a jewel may not be placed where any of its 6 neighbours is a center-ring cell or is adjacent to another player's jewel. Consequence: jewels sit at distance 3-4 from the center.
- **Extended aura** (`extendProjectedAuraFromPlacement`, `tileForBoardPlacement`, `auraTouchMap`): a tile placed on a cell the player controls gets `tile.auraPlacedBy=player`. Every side of that tile that is exactly the player's colour projects 1 claim onto the adjacent *empty* cell. Grey/black/opponent edges project nothing.
- **Control** (`auraControlAt`): per empty cell, count claims (projected edges + direct jewel adjacency) per player; the cell is controlled only by a **unique** maximum. Ties → neutral. Occupied cells never have an aura owner.
- **Own aura** (`isOwnAuraPlacementSpace`): placement from any source (deck, pool, hand, bonus) is legal regardless of edge matching (black walls included).
- **Opponent aura** (`isOpponentJewelAuraSpace`, `canHandTileEnterOpponentAura`): forbidden, **except from hand** (source `"hand"`, including the hand-empty pool bonus and overtime choices which use `legalSource:"hand"`), and then normal edge matching applies.
- Aura does not affect scoring (`canPlayerWinHex` returns true).

## 6. Scoring (`totalScoreForPlayer` → `capturedAreaScoreForPlayer` → `linkedScoringComponentsForPlayer`)

Recomputed from the whole board after every placement.
- Graph nodes = each side-wedge of each board tile (except center) whose colour is exactly the player's (`colorSectionComponentsForPlayer`).
- Edges: adjacent same-colour wedges inside a tile; and across two touching tiles when both touching edges belong to the player (`scoringLink`/`scoringEdgeHasPlayer`; grey and black never link).
- A connected component scores only if it contains at least one cross-tile link (`componentHasCrossHexScoringLink`). Isolated tiles score 0.
- A scoring component is worth the sum of its distinct colour **sections** (`sectionGroupForScoring`): solid (and jewel) = 6; bicolor half = 3; tricolor 2-edge section = 2 (so the 4-edge colour of an imbalanced tricolor = 4). I.e. one point per sixth of tile area of the player's colour that is linked.
- Grey/black score nothing. No other bonuses (`solidPlacementScoreForPlayer`/`vertexBonusScoreForPlayer` return 0).

## 7. End of regulation, overtime (overwrite endgame), end of game

Ruleset: `state.ruleset` ∈ {`"classic"`, `"overwrite-endgame"`}. The build forces `"overwrite-endgame"` as preferred and the simulator always uses it (`inGameSimulationRulesetForGame`).

**Overtime unlock** (`endgameOverwriteConditionActive`, `unlockEndgameOverwriteIfReady`): latched (`state.endgameOverwriteUnlocked`) when unplaced tiles remain and either the board is full (`overwriteUnlockReason:"board-full"`) or the deck is empty (`"deck-empty-cleanup"`, `deckEmptyOverwriteCleanupReady`; also triggered by flipping the final deck tile, `flipFinalDeckTileForPlacement`).

**Overtime turns** (`aiPossibleFirstMoves` overtime branch, `prepareOvertimeTurnStart`, `revealOvertimePoolOffer`, `discardOvertimeChoices`):
- Candidate cells = open cells + occupied non-jewel cells (`boardPlacementCandidateCells`). Placing on an occupied cell **overwrites** it; the old tile is discarded (`placeBoardTileWithOverwrite`). Overwrites are judged as hand plays and must match all touching edges.
- Option A: play hand tiles as a chain (up to 3 placements, `overtimeHandChainActive`), PASS to stop ("finish-full-board-hand-chain"); hand-empty pool bonus applies (`canUseBonusPoolPlacement`).
- Option B (`canRevealOvertimeDeckOffer`, only with no placement yet and an open pool slot and deck tiles): flip deck tiles into every open pool slot (keeping the last deck tile back), then choose **one** pool tile → board (hand legality) or → open hand slot; that ends the turn and the rest of the pool is discarded. PASS discards the whole pool ("discard-overtime-pool-choices"). If the pool is already full (or the deck empty) at turn start, the pool itself is the offer (`canUseFullPoolAsOvertimeOffer`).
- If the board fills during a hand chain, the rest of that turn is still a regulation hand turn (`state.overtimePrepareBlockedForTurn`): remaining hand tiles may overwrite, no overtime deck flip that turn.
- The final deck tile: must be placed in pool/hand/board; PASS allowed only as pool-wipe when the pool is full (`selectedDeckTileCanPassDiscardPool`, `finalDeckTilePending`).
- "overtime-pass" when no legal overtime choice exists.

**Game end** (`maybeEndGame` → `endConditionReason` → `finalizeGame`):
- `"board"`: board full under the classic ruleset.
- `"tiles"`: no unplaced tiles remain anywhere (deck, pool, all hands, selected, `overtimeDeckTile`) (`noUnplacedTilesRemain`).
- `"no-moves"`: three consecutive pass turns (`PASS_END_STREAK_TARGET=3`, `notePassEndStreak`, `passEndStreakReached`). Any placement (incl. hand→pool, pool→hand, deck→hand) resets the streak (`markResolvedPlacement` → `resetPassEndStreak`); deck→pool dumps alone do not end a turn. Passes that end a hand chain / decline a bonus do not count. Every explicit overtime PASS counts.
- Scores: `finalizeGame` computes all three; `winners` = every player with the max; `state.winner` = that player or `"tie"` (ties are not broken). The simulator records `winners` array and per-seat `outcome:"win"|"tie"|"loss"` (`aiBrainResultsForFinishedGame`).

## 8. AI-only constraints worth knowing

- AIs see only public information (`AI_INFORMATION_MODEL_VERSION`): board, pool, hand slot 0 of opponents, own hand, deck count/unseen-tile statistics; the deck tile is revealed only after a blind commit (`aiBlindDeckCommitMove`, `hiddenInformationAudit`).
- Shared safety layers run on every brain's chosen move before execution: `aiApplyFundamentalMoveSafety`, `aiApplyUniversalFinishMemory` (finish/win/avoid-loss first), `aiApplyTerminalSelfPreservation` (no losing third pass when real progress exists).

## Differences from the June rules text (engine is authoritative)

- June text: "three no-placement/pool-clearing passes". Engine: any player may *voluntarily* make the third consecutive pass (`canCompletePassEndStreak`) even with legal moves available, ending the game.
- June text implies passing is a free choice; engine only offers PASS in the listed situations (§4.6).
- Hand→pool after a hand→board chain is allowed when exactly one hand tile remains (sets up the empty-hand bonus).
- A flipped deck tile that cannot be kept anywhere is recycled to the deck bottom (not in the June text).
- Scoring edge "boundary correction" in `scoringEdgeHasPlayer` exists but cross-tile links are only built between wedges that are exactly the player's colour; in practice links need both touching edges = player colour.
