import { q, REF } from './helpers';

export const privacySafeguards = [
  q({
    id: 'PRIV-001',
    type: 'multiple',
    domain: 'privacy-safeguards',
    prompt: 'Which TWO roles can configure content exclusion for Copilot?',
    options: [
      { id: 'a', text: 'Repository administrators, for their own repositories.', rationale: 'Correct. This affects all Copilot users in the enterprise working in those repositories.' },
      { id: 'b', text: 'Organization owners, for users with a seat from their organization.', rationale: 'Correct. Organization owners can exclude content for their seat holders.' },
      { id: 'c', text: 'Any collaborator with write access.', rationale: 'Write access alone does not grant content exclusion settings.' },
      { id: 'd', text: 'Any developer, through a local editor setting.', rationale: 'Content exclusion is configured on GitHub, not in personal editor settings.' },
    ],
    correctOptionIds: ['a', 'b'],
    explanation: 'Repository administrators, organization owners, and enterprise owners can configure content exclusion.',
    referenceUrl: REF.contentExclusion,
  }),
  q({
    id: 'PRIV-002',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt:
      'An administrator just added a content exclusion, but a developer\'s already-open IDE still uses the excluded file. What is the likely explanation?',
    options: [
      { id: 'a', text: 'Changes can take up to 30 minutes to reach IDEs that already loaded settings; the developer can reload them manually.', rationale: 'Correct. This is the documented propagation behavior.' },
      { id: 'b', text: 'Content exclusion only applies to new repositories.', rationale: 'Exclusions apply to existing repositories once propagated.' },
      { id: 'c', text: 'The developer must reinstall the IDE.', rationale: 'Reloading settings is enough; reinstalling is unnecessary.' },
      { id: 'd', text: 'Exclusions only take effect after the next Copilot model update.', rationale: 'Exclusions are policy settings unrelated to model releases.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'Allow up to 30 minutes for exclusions to apply, or force a reload of content exclusion settings.',
    referenceUrl: REF.excludeHowTo,
  }),
  q({
    id: 'PRIV-003',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt: 'Which is a documented limitation of content exclusion in IDEs?',
    options: [
      { id: 'a', text: 'Copilot may still use semantic information from an excluded file provided indirectly by the IDE, such as type information or hover definitions.', rationale: 'Correct. GitHub documents this limitation.' },
      { id: 'b', text: 'Excluded files are deleted from the repository.', rationale: 'Exclusion never deletes files.' },
      { id: 'c', text: 'Content exclusion encrypts excluded files on disk.', rationale: 'It is not an encryption feature.' },
      { id: 'd', text: 'Exclusion disables Copilot across the whole organization.', rationale: 'It applies only to the configured paths or repositories.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Content exclusion is a guardrail, not a filesystem security boundary; indirect IDE-provided information may still be used.',
    referenceUrl: REF.contentExclusion,
  }),
  q({
    id: 'PRIV-004',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt: 'When suggestions matching public code are set to Block, how does Copilot decide what to block?',
    options: [
      { id: 'a', text: 'It checks the suggestion plus about 150 characters of surrounding code against public code on GitHub and withholds matches or near matches.', rationale: 'Correct. This is the documented duplicate-detection behavior.' },
      { id: 'b', text: 'It blocks any suggestion longer than 150 lines.', rationale: 'Length alone does not trigger blocking.' },
      { id: 'c', text: 'It blocks suggestions that use open-source libraries.', rationale: 'Using libraries is unrelated to matching public code.' },
      { id: 'd', text: 'It blocks suggestions in public repositories only.', rationale: 'The filter compares suggestions to public code wherever you work.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'The filter compares suggestions with public code and suppresses matches when set to Block.',
    referenceUrl: REF.personalPolicies,
  }),
  q({
    id: 'PRIV-005',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt: 'What is the best way to keep API keys out of code that you write with Copilot?',
    options: [
      { id: 'a', text: 'Load secrets from environment variables or a secret manager, and enable secret scanning push protection.', rationale: 'Correct. Avoid hard-coding and block accidental pushes of secrets.' },
      { id: 'b', text: 'Hard-code keys but mark the file as private.', rationale: 'Hard-coded secrets leak through history, forks, and clones.' },
      { id: 'c', text: 'Ask Copilot to remember the key for later.', rationale: 'Never share secrets with AI tools as a storage mechanism.' },
      { id: 'd', text: 'Put keys in code comments so Copilot ignores them.', rationale: 'Comments are still committed and visible.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Avoid hard-coded passwords and keys. Push protection blocks supported secrets before they reach the repository.',
    referenceUrl: REF.pushProtection,
  }),
  q({
    id: 'PRIV-006',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt:
      'A Copilot Business user gets no inline suggestions in one file but does in others. The Copilot status bar icon has a diagonal line through it. What is the likely cause?',
    options: [
      { id: 'a', text: 'The file is excluded by content exclusion; hovering the icon shows which setting applied it.', rationale: 'Correct. This is the documented troubleshooting indicator.' },
      { id: 'b', text: 'The user has hit a rate limit.', rationale: 'A rate limit would affect requests generally, not one file, and shows an error.' },
      { id: 'c', text: 'The file is too short for suggestions.', rationale: 'File length does not change the status icon this way.' },
      { id: 'd', text: 'The user\'s license has expired.', rationale: 'An expired license would stop suggestions in all files.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'Excluded files show a struck-through Copilot icon; the tooltip explains the applied restriction.',
    referenceUrl: REF.troubleshoot,
  }),
  q({
    id: 'PRIV-007',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt:
      'An individual Copilot Pro user (not managed by an organization) wants to stop seeing suggestions that match public code. Where do they configure this?',
    options: [
      { id: 'a', text: 'In their personal Copilot settings on GitHub, by blocking suggestions matching public code.', rationale: 'Correct. Individuals manage this policy in their own settings.' },
      { id: 'b', text: 'In the repository\'s .gitattributes file.', rationale: '.gitattributes controls Git behavior, not Copilot policies.' },
      { id: 'c', text: 'By creating a content exclusion rule.', rationale: 'Content exclusion limits context; it does not filter public-code matches.' },
      { id: 'd', text: 'It cannot be configured by individuals.', rationale: 'Individual users can configure it.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Individuals set this in their Copilot settings; for organization members the organization policy controls it.',
    referenceUrl: REF.personalPolicies,
  }),
  q({
    id: 'PRIV-008',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt: 'What is the main security implication of running Copilot CLI with --allow-all-tools?',
    options: [
      { id: 'a', text: 'Copilot can run any shell command you could run and access your files, without asking for approval first.', rationale: 'Correct. GitHub warns about this and advises caution.' },
      { id: 'b', text: 'Copilot can only read files, never modify them.', rationale: 'The option allows modification and execution too.' },
      { id: 'c', text: 'It sends your files to public repositories.', rationale: 'It changes approval behavior, not where files are stored.' },
      { id: 'd', text: 'There is no security implication.', rationale: 'Removing approvals removes a key human check.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Automatic approval gives Copilot the same access you have. Prefer specific --allow-tool rules or a restricted environment.',
    referenceUrl: REF.cliAbout,
  }),
  q({
    id: 'PRIV-009',
    type: 'single',
    domain: 'privacy-safeguards',
    prompt: 'Is content exclusion guaranteed to be respected by third-party MCP servers or clients?',
    options: [
      { id: 'a', text: 'No. It is a guardrail for tools GitHub controls, not a filesystem security boundary.', rationale: 'Correct. GitHub states it is not guaranteed for third-party MCP servers or clients.' },
      { id: 'b', text: 'Yes. Exclusion is enforced at the operating-system level.', rationale: 'Exclusion does not change OS file permissions.' },
      { id: 'c', text: 'Yes, as long as the MCP server is open source.', rationale: 'Licensing does not affect enforcement.' },
      { id: 'd', text: 'Only when the public code filter is set to Block.', rationale: 'The public code setting is unrelated.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Treat content exclusion as a guardrail; protect truly sensitive data with access controls rather than relying on exclusion alone.',
    referenceUrl: REF.contentExclusion,
  }),
];
