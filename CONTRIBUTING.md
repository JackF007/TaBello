# Contributing to TaBello

Thanks for helping! TaBello is a small project, so every bug report, test recording and pull request
makes a difference. Please follow the [code of conduct](CODE_OF_CONDUCT.md); security problems are
reported privately, as [SECURITY.md](SECURITY.md) explains.

## Reporting a problem

- **Something broke** (crash, error message, a button that does nothing): open a
  [bug report](https://github.com/JackF007/taBello/issues/new?template=bug_report.md) with your
  operating system, the TaBello version (shown at the bottom of the window) and the steps to reproduce.
- **A transcription came out wrong**: open a
  [transcription report](https://github.com/JackF007/taBello/issues/new?template=transcription.md).
  The most useful thing you can attach is a **short clip** (5–30 seconds) where it goes wrong, plus the
  instrument, tuning, capo and sensitivity you used, and what the correct notes are. Only share audio
  you have the right to share.

## Development setup

You need [Node.js](https://nodejs.org/) 22.23.4+ or 24.22.1+ (with the October 2026 security fixes) and
Git; on Windows also the
[Microsoft Visual C++ Redistributable](https://learn.microsoft.com/cpp/windows/latest-supported-vc-redist).

```sh
git clone https://github.com/JackF007/taBello.git
cd taBello
npm install
npm run dev
```

If `npm install` fails on Windows with `Cannot find native binding`, install the Visual C++
Redistributable (`winget install Microsoft.VCRedist.2015+.x64`) and run `npx install-electron`. If
transcribing says FFmpeg is missing (its download failed, or an antivirus quarantined it), run
`npm rebuild ffmpeg-static`. `.npmrc` installs only package versions published at least a week ago,
as a guard against hijacked releases.

Before opening a pull request, run the same checks as CI:

```sh
npm run lint
npm run typecheck
npm test
npm run test:e2e   # on Linux without a display: xvfb-run -a npm run test:e2e
```

## Where things are

- `src/main/transcription/` — audio decoding (FFmpeg) and note detection (Basic Pitch) in a background process.
- `src/renderer/src/lib/music/` — the music engine: tempo, key, quantization, capo, fingering, alphaTex,
  MIDI and Guitar Pro export. It is plain TypeScript with unit tests, a good place to start.
- `src/shared/instruments.ts` — instruments and tunings. Adding a tuning is a one-line change.
- `src/renderer/src/pages/` — the three screens (Transcribe, Library, Project).

## Pull requests

- Keep each pull request focused on one change, and describe what it fixes or adds.
- Add or update tests for behavior changes. For transcription or fingering accuracy, show before/after
  numbers of `npm run benchmark` on GuitarSet (below), of the synthetic accuracy test
  (`src/main/transcription/pipeline.test.ts`), or of a recording you used.
- Follow the existing code style (TypeScript strict, ESLint, small pure functions in the music engine).
- TaBello runs fully offline: please do not add network calls, telemetry or online services.
- New dependencies must have a license compatible with GPL-3.0 and be listed in `THIRD_PARTY_NOTICES.md`
  if they end up in the app.

## Measuring accuracy

[GuitarSet](https://guitarset.weebly.com/) (360 annotated guitar recordings, CC BY 4.0) measures
TaBello's accuracy: download and unzip `annotation` and `audio_mono-mic` into one folder, then run
`GUITARSET_DIR=/path/to/GuitarSet npm run benchmark` (optional: `GUITARSET_LIMIT=20`,
`GUITARSET_FILTER=solo`). It reports note precision, recall and F1, and how often notes land on the
string the guitarist used; results go to `benchmark/results/`.

## Releases

Pushing a version tag builds the installers on GitHub Actions; the steps and the optional code signing
are in [docs/RELEASING.md](docs/RELEASING.md).

## License

By contributing, you agree that your contributions are licensed under the
[GNU General Public License v3.0 or later](LICENSE), like the rest of the project.
