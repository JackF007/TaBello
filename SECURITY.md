# Security

## Reporting a vulnerability

Please do not open a public issue for a security problem. Report it privately instead, from the
repository's *Security* tab → **Report a vulnerability** (GitHub's private vulnerability reporting).
Describe what an attacker could do and how to reproduce it; you will get an answer as soon as possible,
and credit in the release notes if you wish.

## What TaBello does to stay safe

- Everything runs on your computer: recordings are never uploaded. TaBello goes online only to check
  GitHub for a newer release (it can be turned off) and to download its separation model once, whose
  size and SHA-256 are checked before use.
- The window runs with context isolation, the sandbox and no Node.js access; a strict Content Security
  Policy allows no outside scripts or connections; the app's window cannot navigate away from TaBello,
  and the only links it opens in your browser are TaBello's own pages on GitHub.
- The main process accepts requests only from TaBello's own page, and checks every one of them.
- Release builds come from the public GitHub Actions workflow in this repository, with its actions
  pinned to exact commits.

## Supported versions

Only the newest release (or beta) receives fixes.
