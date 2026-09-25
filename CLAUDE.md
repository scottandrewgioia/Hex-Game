# Notes for Claude sessions

## Scott's standing requirement (always)
Scott always wants Claude to be able to **edit the real game builds and save them straight to Google Drive**
(the old workflow: update the game, put it on Drive). That needs a session running on his PC
(`C:\Hex\hex-fork-t`, Drive mounted at `G:\My Drive\hex`) controlled from his phone via **Remote Control**
(`claude remote-control` in that folder, or the Claude Desktop app).
- If a session is a **cloud** session (no access to his PC or G: drive), say so in the very first reply, in plain
  words, and tell him that game builds cannot be saved to Drive from it (files over ~10 MB), before starting work.
- Recommend Remote Control on the PC for any work that changes or publishes game builds.

## Ask at the start of every session (cloud/remote sessions)
- Ask Scott to confirm the environment's **Network access is set to Full** (or at least allows
  `drive.usercontent.google.com`). Game builds (Tester ~24 MB, Android/PC ~36 MB) live on Google Drive and are
  larger than the Drive connector's 10 MB limit, so they can only be fetched by direct download.
- Ask whether private Drive files (Tester, PC, Lab) may be temporarily link-shared for download, or whether he
  will provide them another way. A cloud session cannot upload files over ~10 MB back to Drive; deliver large
  builds through this repo (git) and say so up front.
- Explain things in plain language; Scott works mostly from his phone.

## Project pointers
- AI brain work: `ai/h3/` (H3 brain, Tester installer, README with test history).
- Keep each brain's decision gate intact when wrapping it (see `ai/h3/README.md`, v5b bug fix).
