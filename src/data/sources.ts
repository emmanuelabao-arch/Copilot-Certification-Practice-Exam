export interface SourceRecord {
  name: string;
  url: string;
  accessed: string;
  availability: string;
  license: string;
  usage: string;
}

/** Research log for AC2. Keep in sync with docs/SOURCES.md. */
export const SOURCES: SourceRecord[] = [
  {
    name: 'Official GH-300 study guide (Microsoft Learn)',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300',
    accessed: '2026-11-06',
    availability: 'Free, no sign-in. Skills measured as of August 7, 2026 (page updated 2026-07-09).',
    license: 'Microsoft Learn Terms of Use; no redistribution license for exam content.',
    usage: 'Domain names and weight ranges used as a factual outline. No text or questions reproduced.',
  },
  {
    name: 'GitHub Copilot certification page and official practice assessment (Microsoft Learn)',
    url: 'https://learn.microsoft.com/en-us/credentials/certifications/github-copilot/',
    accessed: '2026-11-06',
    availability: 'Free practice assessment is linked from the page (Microsoft Learn sign-in may be required).',
    license: 'Microsoft copyright; no license found permitting redistribution of practice assessment questions.',
    usage: 'Not used. No practice assessment questions are included or adapted.',
  },
  {
    name: 'GitHub Copilot documentation (docs.github.com)',
    url: 'https://docs.github.com/en/copilot',
    accessed: '2026-11-06',
    availability: 'Free, public.',
    license: 'Documentation content licensed CC BY 4.0 (github/docs repository LICENSE).',
    usage:
      'Factual grounding for every original question. Each question links to the page it was written from (attribution).',
  },
  {
    name: 'GitHub Skills: Getting Started with GitHub Copilot',
    url: 'https://github.com/skills/getting-started-with-github-copilot',
    accessed: '2026-11-06',
    availability: 'Free, public.',
    license: 'MIT License (Copyright GitHub and others).',
    usage: 'Reviewed as supplemental learning material; it is a hands-on exercise, so no question content was reused.',
  },
  {
    name: 'Microsoft Learn: What is Responsible AI?',
    url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai',
    accessed: '2026-11-06',
    availability: 'Free, public.',
    license: 'Microsoft Learn Terms of Use.',
    usage: 'Factual reference for the six Responsible AI principles (RAI-002). Original wording.',
  },
];
