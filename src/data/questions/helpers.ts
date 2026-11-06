import type { Provenance, Question } from '../../lib/types';

export const REF = {
  rai: 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-responsible-ai',
  chatRespUse: 'https://docs.github.com/en/copilot/responsible-use/chat-in-your-ide',
  completionRespUse: 'https://docs.github.com/en/copilot/responsible-use/copilot-code-completion',
  bestPractices: 'https://docs.github.com/en/copilot/get-started/best-practices',
  ideSuggestions: 'https://docs.github.com/en/copilot/how-tos/get-code-suggestions/get-ide-code-suggestions',
  chatInIde: 'https://docs.github.com/en/copilot/how-tos/chat-with-copilot/chat-in-ide',
  mcp: 'https://docs.github.com/en/copilot/concepts/context/mcp',
  cheatSheet: 'https://docs.github.com/en/copilot/reference/cheat-sheet',
  repoInstructions:
    'https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions',
  responseCustomization: 'https://docs.github.com/en/copilot/concepts/prompting/response-customization',
  codeReview: 'https://docs.github.com/en/copilot/concepts/agents/code-review',
  cloudAgent: 'https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-coding-agent',
  cliInstall: 'https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli',
  cliAbout: 'https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli',
  orgPolicies: 'https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/manage-policies',
  auditLogs:
    'https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-for-organization/review-activity/review-audit-logs',
  restSeats: 'https://docs.github.com/en/rest/copilot/copilot-user-management',
  spaces: 'https://docs.github.com/en/copilot/concepts/context/spaces',
  codeReferencing: 'https://docs.github.com/en/copilot/concepts/completions/code-referencing',
  personalPolicies: 'https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies',
  promptEngineering: 'https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering',
  contentExclusion: 'https://docs.github.com/en/copilot/concepts/context/content-exclusion',
  excludeHowTo:
    'https://docs.github.com/en/copilot/how-tos/configure-content-exclusion/exclude-content-from-copilot',
  troubleshoot: 'https://docs.github.com/en/copilot/how-tos/troubleshoot-copilot/troubleshoot-common-issues',
  autofix:
    'https://docs.github.com/en/code-security/code-scanning/managing-code-scanning-alerts/responsible-use-autofix-code-scanning',
  cookbook: 'https://docs.github.com/en/copilot/tutorials/copilot-chat-cookbook',
  pushProtection: 'https://docs.github.com/en/code-security/secret-scanning/introduction/about-push-protection',
} as const;

const AUTHOR = 'Copilot-Certification-Practice-Exam contributors';

type Draft = Omit<Question, 'provenance'> & { provenance?: Provenance };

/** Original question; provenance defaults to the reference page it was written from. */
export function q(draft: Draft): Question {
  return {
    ...draft,
    provenance: draft.provenance ?? { kind: 'original', author: AUTHOR, groundedIn: [draft.referenceUrl] },
  };
}
