# H3 brain (HUMAN-EDGE-F8-KERNEL-H3-v1)

Runtime-registered brain for the QUEXATLE Tester and simulators. No engine functions are edited.

- `h3-brain.js` (v2): registers H3, runs the F8 kernel, then the H3 correction layer: R1a/R1b end-pass rules, R2 no opponent-rich pool gifts, R3 opening dump cap, R4 no zero-point hand placement, R5 bank erasers late, R6 strike instead of passing in overtime, R7 keep erasers in regulation.
- `h3-brain-v1.js`: v1 (R1-R4 only), kept for comparison.
- `install-h3-tester.js`: from the workspace root, `node install-h3-tester.js` backs up and patches `hexxxagon-test-latest.html` (and `hex.html` if present). `--rollback` restores the last backup.

Headless check (Sep 25, 3 games H3/F8/F5, rotated seats): 3/3 complete, 0 page errors, 0 H3 errors.

## v5b (current `h3-brain.js`)
Fixes a bug in v1/v2: the wrapper renamed F8's decision gate (`f8-f1-bounded-trilens` -> `h3-...`), so the engine's
`aiFinalizeChosenMoveResponsive` ran its generic D4 "upgrade" finalizers on H3's moves. v1/v2 results are invalid.
With the gate preserved, a correction-free H3 reproduces F8 move-for-move (same seeded deal, identical 58 moves and scores).
v5b = F8 kernel + R1a/R1b, R3-R8 (R2 off) + removal of F1's scoring-contact bonus (anti-clumping). Strength not yet measured.
`h3-brain-v1.js` / `h3-brain-v2.js` are kept only for reference (buggy).
