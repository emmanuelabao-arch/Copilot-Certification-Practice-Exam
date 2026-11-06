# Requirements — Issue #1

Source: https://github.com/emmanuelabao-arch/Copilot-Certification-Practice-Exam/issues/1
Title: Build GitHub Copilot practice exam app with 60+ questions, timed exams, and answer review
Ingested: 2026-11-06

## Goal

A responsive, free, client-only web app for GH-300 (GitHub Copilot) practice. Unofficial learning tool;
no guarantee of matching the real exam.

## Defaults

| Setting | Value |
|---|---|
| Questions per attempt | 60 distinct |
| Question bank | ≥ 60 unique, reviewed, original or licensed |
| Timed mode | 100:00 countdown, no pause, warnings at 10:00 and 1:00 |
| Study mode | Untimed, "Check answer" reveals explanation |
| Question types | single-answer, multiple-answer (exact-set scoring) |
| Practice pass mark | 80% (48/60) — app benchmark, not the official scaled score (700) |
| Persistence | `localStorage` only; no backend, accounts, or external transmission |

## Functional requirements (mapped to acceptance criteria)

- **AC1 Foundation** — documented install/run/build; landing page explains length, duration, benchmark, study mode,
  unofficial status; no auth/payment; stack, runtime and deployment documented.
- **AC2 Content** — research sources (URLs, access dates, availability, license); only reuse licensed content
  with attribution; otherwise write original questions grounded in official docs; ≥ 60 unique questions aligned to
  the current GH-300 outline with a coverage table; each question has stable ID, prompt, options with stable IDs,
  correct option IDs, type, domain, explanation (why correct + why each distractor wrong), reference URL,
  provenance; automated validation of the bank.
- **AC3 Start** — choose mode; exactly 60 distinct questions; per-attempt randomized order preserved across reloads;
  option shuffling via stable IDs; instructions; actionable error for invalid/undersized bank.
- **AC4 Timer** — persisted deadline; no extra time from background/sleep/reload; auto-submit exactly once at zero
  (incl. reopened expired attempts); timeout vs manual reason; never negative.
- **AC5 Answering** — single/multi selection with required count; back/forward; flag; navigator with
  non-color indicators; progress counts; answers hidden in timed mode; study-mode check answer.
- **AC6 Scoring** — confirm dialog with counts; 1 point per question, exact match only; results with score,
  percent, correct/incorrect/unanswered, pass/not-yet, elapsed time, reason; per-domain results with
  "Not assessed"; submitted attempts immutable; retry creates new attempt.
- **AC7 Review** — per-question review with selections, correct answers, explanation, domain, source;
  filters all/correct/incorrect/unanswered/flagged; weak domains with free study links; attribution page.
- **AC8 Persistence** — save everything locally; resume or discard (confirmed); question snapshot stored with
  attempt; local history with reopen + clear; clear recovery messages on storage errors/corrupt/incompatible data;
  multi-tab conflict → second tab read-only; explain local data limitations.
- **AC9 A11y/privacy** — mobile + desktop without horizontal overflow; labels, focus, contrast, keyboard;
  polite timer announcements only at thresholds; no PII; bank bundled with app.
- **AC10 Delivery** — unit tests (bank, uniqueness, ordering, scoring, pass boundary 47 fail / 48 pass), timer tests,
  persistence tests, E2E flow; CI running lint, typecheck, tests, validation, build; README; free-tier deploy.

## Out of scope

Accounts, sync, payments, leaderboards, admin UI, live AI-generated questions, exam dumps.

## Technical decisions

- Vite + React + TypeScript (static SPA), Node.js ≥ 20.
- Vitest for unit tests, Playwright for E2E.
- GitHub Pages via GitHub Actions (free hosting).
- Multi-tab lock via `localStorage` heartbeat lease + `storage` events.
