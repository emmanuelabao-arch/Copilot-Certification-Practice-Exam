# Sources, licensing, and GH-300 coverage

This file records the content research required by issue #1 (AC2). The same information is shown in the app at
`#/sources`.

## Skills outline

- Outline: **GH-300 "Skills measured as of August 7, 2026"**
- Source: <https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300>
  (page last updated 2026-07-09, retrieved 2026-11-06)

## Researched sources

| Source | Accessed | Availability | License / reuse | How it is used |
|---|---|---|---|---|
| [Official GH-300 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300) | 2026-11-06 | Free, no sign-in | Microsoft Learn Terms of Use; no redistribution license for exam content | Domain names and weight ranges used as a factual outline. No text or questions reproduced. |
| [Certification page + official practice assessment](https://learn.microsoft.com/en-us/credentials/certifications/github-copilot/) | 2026-11-06 | Free practice assessment linked from the page (sign-in may be required) | Microsoft copyright; no license found permitting redistribution of practice questions | **Not used.** No practice assessment questions are included or adapted. |
| [GitHub Copilot documentation](https://docs.github.com/en/copilot) | 2026-11-06 | Free, public | CC BY 4.0 ([github/docs LICENSE](https://github.com/github/docs/blob/main/LICENSE)) | Factual grounding for every original question; each question links to its source page. |
| [GitHub Skills: Getting Started with GitHub Copilot](https://github.com/skills/getting-started-with-github-copilot) | 2026-11-06 | Free, public | MIT | Reviewed as supplemental material; hands-on exercise, no question content reused. |
| [Microsoft Learn: What is Responsible AI?](https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai) | 2026-11-06 | Free, public | Microsoft Learn Terms of Use | Factual reference for the six Responsible AI principles (RAI-002). Original wording. |

**Conclusion:** no freely accessible source granted permission to redistribute ready-made practice questions, so
all 60 questions are **original**, written in the project's own words and grounded in the linked documentation
(`provenance.kind = "original"`). No leaked live-exam questions or exam dumps were used.

Facts were checked against the documentation pages on 2026-11-06 (for example, Copilot code review approvals,
the 59-minute cloud agent session limit, `--deny-tool` precedence in Copilot CLI, the 30-minute content
exclusion propagation, and the April 2026 training-data setting for individual plans).

## Domain coverage

| Domain | Official weight | Questions | Share | ID prefix |
|---|---|---|---|---|
| Use GitHub Copilot responsibly | 15–20% | 10 | 16.7% | `RAI-` |
| Use GitHub Copilot features | 25–30% | 17 | 28.3% | `FEAT-` |
| Understand GitHub Copilot data and architecture | 10–15% | 8 | 13.3% | `DATA-` |
| Apply prompt engineering and context crafting | 10–15% | 8 | 13.3% | `PE-` |
| Improve developer productivity with GitHub Copilot | 10–15% | 8 | 13.3% | `PROD-` |
| Configure privacy, content exclusions, and safeguards | 10–15% | 9 | 15.0% | `PRIV-` |
| **Total** | | **60** | | |

The official exam does not publish an exact per-question distribution; counts approximate the published ranges.
The study guide's "at a glance" list repeats "GitHub Copilot features (25–30%)"; this is treated as a single domain.

## Reviewing content when the GH-300 outline changes

1. Open the study guide and compare its "Skills measured as of …" date and change log with `OUTLINE_VERSION` in
   `src/data/domains.ts`.
2. Update domain names/weights in `src/data/domains.ts`.
3. For each changed objective, review the questions with that domain's ID prefix. Re-check each question's
   `referenceUrl` page for changed facts (`npm run check:links` verifies links are reachable).
4. Add, edit, or retire questions, then bump `BANK_VERSION` in `src/data/questions/index.ts`.
5. Run `npm run validate:questions` and update the coverage table above.
