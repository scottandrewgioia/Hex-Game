# H3 brain (HUMAN-EDGE-F8-KERNEL-H3-v1)

Runtime-registered brain for the QUEXATLE Tester and simulators. No engine functions are edited.

- `h3-brain.js`: registers H3, runs the F8 kernel, then applies the H3 correction layer (R1a/R1b end-pass rules, R2 no opponent-rich pool gifts, R3 opening dump cap, R4 no zero-point hand placement).
- `install-h3-tester.js`: from the workspace root, `node install-h3-tester.js` backs up and patches `hexxxagon-test-latest.html` (and `hex.html` if present). `--rollback` restores the last backup.

Headless check (Sep 25, 3 games H3/F8/F5, rotated seats): 3/3 complete, 0 page errors, 0 H3 errors.
