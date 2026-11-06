import type { Domain } from '../lib/types';

/** GH-300 "Skills measured as of August 7, 2026", retrieved 2026-11-06. */
export const OUTLINE_VERSION = 'GH-300 skills measured as of 2026-08-07 (retrieved 2026-11-06)';
export const STUDY_GUIDE_URL =
  'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/gh-300';

export const DOMAINS: Domain[] = [
  {
    id: 'responsible-ai',
    name: 'Use GitHub Copilot responsibly',
    officialWeight: '15–20%',
    studyResources: [
      {
        title: 'Responsible use of GitHub Copilot code completion',
        url: 'https://docs.github.com/en/copilot/responsible-use/copilot-code-completion',
      },
      {
        title: 'Microsoft Learn: What is Responsible AI?',
        url: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai',
      },
    ],
  },
  {
    id: 'copilot-features',
    name: 'Use GitHub Copilot features',
    officialWeight: '25–30%',
    studyResources: [
      { title: 'GitHub Copilot Chat cheat sheet', url: 'https://docs.github.com/en/copilot/reference/cheat-sheet' },
      {
        title: 'About GitHub Copilot coding agent',
        url: 'https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent',
      },
      { title: 'About GitHub Copilot CLI', url: 'https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli' },
    ],
  },
  {
    id: 'data-architecture',
    name: 'Understand GitHub Copilot data and architecture',
    officialWeight: '10–15%',
    studyResources: [
      { title: 'GitHub Copilot Trust Center', url: 'https://resources.github.com/copilot-trust-center/' },
      {
        title: 'About code suggestions',
        url: 'https://docs.github.com/en/copilot/concepts/completions/code-suggestions',
      },
    ],
  },
  {
    id: 'prompt-engineering',
    name: 'Apply prompt engineering and context crafting',
    officialWeight: '10–15%',
    studyResources: [
      {
        title: 'Prompt engineering for GitHub Copilot Chat',
        url: 'https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering',
      },
      { title: 'Best practices for using GitHub Copilot', url: 'https://docs.github.com/en/copilot/get-started/best-practices' },
    ],
  },
  {
    id: 'developer-productivity',
    name: 'Improve developer productivity with GitHub Copilot',
    officialWeight: '10–15%',
    studyResources: [
      { title: 'Copilot Chat Cookbook', url: 'https://docs.github.com/en/copilot/tutorials/copilot-chat-cookbook' },
      {
        title: 'Responsible use of Copilot Autofix for code scanning',
        url: 'https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/responsible-use-autofix-code-scanning',
      },
    ],
  },
  {
    id: 'privacy-safeguards',
    name: 'Configure privacy, content exclusions, and safeguards',
    officialWeight: '10–15%',
    studyResources: [
      {
        title: 'Content exclusion for GitHub Copilot',
        url: 'https://docs.github.com/en/copilot/concepts/context/content-exclusion',
      },
      {
        title: 'GitHub Copilot code referencing',
        url: 'https://docs.github.com/en/copilot/concepts/completions/code-referencing',
      },
    ],
  },
];
