# GH-300 Copilot Practice Exam (Unofficial)

A free, responsive practice exam for the GitHub Copilot certification (GH-300). Take a timed 60-question exam or
an untimed study session, review detailed explanations, see weak domains, and retry with a new random order.

> **Unofficial.** This is an independent learning tool. It is not affiliated with or endorsed by GitHub or
> Microsoft, does not simulate the official exam, and does not guarantee certification success.

## Features

- 60 original, reviewed questions aligned to the GH-300 skills outline (August 7, 2026), with an explanation for
  every option and a link to the official documentation it is based on.
- **Timed mode**: 100:00 countdown (app default, not a claim about the official exam), no pause, accessible
  warnings at 10 and 1 minutes, auto-submit at zero.
- **Study mode**: untimed, with "Check answer" for immediate feedback.
- Single- and multiple-answer questions; flags; question navigator; progress counts.
- Results: score, percentage, pass/not-yet against an **80% practice benchmark (48/60)**, per-domain breakdown,
  weak domains with free study links, and a filterable answer review.
- Local history; resume after reload; multi-tab protection; no account, backend, or tracking.

## Stack and requirements

| | |
|---|---|
| Runtime | Node.js 20 or later (CI uses Node 22) |
| App | React 19 + TypeScript, built with Vite (static single-page app) |
| Tests | Vitest + Testing Library (unit/component), Playwright (end-to-end) |
| Hosting | GitHub Pages via GitHub Actions (free); any static host works |

## Getting started

```bash
npm ci                  # install dependencies
npm run dev             # start the dev server at http://localhost:5173
npm run build           # production build into dist/
npm run preview         # serve the production build
```

### Quality checks

```bash
npm run lint                 # ESLint
npm run typecheck            # TypeScript
npm run validate:questions   # question bank validation + domain coverage
npm test                     # unit and component tests
npx playwright install       # once, to download browsers
npm run test:e2e             # end-to-end tests (builds and serves the app)
npm run ci                   # lint + typecheck + validation + tests + build
npm run check:links          # optional: verify reference URLs are reachable (needs network)
```

## How scoring and timing work

- Each attempt has exactly 60 distinct questions in a random order chosen when it starts. The order and option
  order are saved with the attempt and stay the same after reloads.
- Each question is worth one point. Multiple-answer questions score only when the selection exactly matches the
  correct set; partial, incorrect, and unanswered responses score zero.
- Passing benchmark: 80% (48/60). It is an app benchmark, not the official scaled score.
- Timed mode stores an absolute deadline. Remaining time is always computed from that deadline, so background
  tabs, sleep, or reloads never add time. An attempt that expired while closed is submitted (as "time expired")
  the next time the app opens. Submission happens once; submitted attempts are immutable.

## Data and privacy

- Everything is stored in the browser's `localStorage` under `gh300-practice:state` (attempts and history) and
  `gh300-practice:lock` (multi-tab lease). Nothing is sent to a server, and no personal data is requested.
- Data is specific to this browser and device and is removed if you clear site data.
- If saved data is corrupt or from an incompatible version, the app shows a recovery screen where you can
  download the raw data or reset it. It never fabricates results from damaged data.
- If storage is full or blocked, a warning is shown and the session continues in memory.
- When the app is open in several tabs, only one tab can make changes; the others become read-only and offer
  "Use this tab instead".
- The question bank is bundled with the app, so exams do not depend on external sites.

## Question bank

Questions live in `src/data/questions/*.ts` (one file per domain). Schema (`src/lib/types.ts`):

| Field | Description |
|---|---|
| `id` | Stable unique ID, e.g. `FEAT-012` |
| `type` | `single` or `multiple` |
| `domain` | One of the domain IDs in `src/data/domains.ts` |
| `prompt` | Question text |
| `options[]` | `{ id, text, rationale }`; `rationale` explains why the option is right or wrong |
| `correctOptionIds` | IDs of correct options (exactly 1 for `single`; 2+ with at least one distractor for `multiple`) |
| `explanation` | Overall explanation |
| `referenceUrl` | HTTPS link to the official documentation the question is grounded in |
| `provenance` | `original` (author + grounding URLs) or `adapted` (source, URL, license, attribution) |
| `shuffleOptions` | Optional; set `false` if option order matters |

`npm run validate:questions` (also run in CI) rejects duplicate IDs or prompts, missing fields, invalid answer
references, duplicate option IDs, wrong answer counts for the type, unknown domains, and banks smaller than 60.
The app runs the same validation and refuses to start an exam if the bank is invalid.

### Contributing questions

1. Write the question in your own words from official documentation. Do not copy official practice assessment
   items, exam dumps, or content without a license that allows redistribution.
2. Add a rationale for every option and a `referenceUrl`.
3. For adapted material, record source, URL, license, and attribution in `provenance`.
4. Bump `BANK_VERSION` in `src/data/questions/index.ts`, then run `npm run validate:questions` and `npm test`.

Source research, license findings, the domain coverage table, and the process for updating content when the
GH-300 outline changes are in [docs/SOURCES.md](docs/SOURCES.md).

## Deployment

The app is a static site. `.github/workflows/deploy.yml` builds and publishes it to GitHub Pages on every push
to `main`:

1. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Merge to `main` (or run the workflow manually). The site is published at
   `https://<owner>.github.io/<repository>/`.

The workflow sets `BASE_PATH=/<repository>/` so asset URLs resolve under the Pages sub-path. To host elsewhere,
run `npm run build` (with `BASE_PATH` set if serving from a sub-path) and upload `dist/`. Routing uses URL
hashes, so no server rewrite rules are needed.

## Browser support

Current stable Chrome, Edge, Firefox, and Safari. CI runs the end-to-end suite in Chromium, Firefox, WebKit,
and a mobile Chromium viewport.

## License and attribution

Question content is original and grounded in GitHub documentation (© GitHub, CC BY 4.0). Microsoft, GitHub, and
GitHub Copilot are trademarks of their respective owners.
