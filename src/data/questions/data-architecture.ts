import { q, REF } from './helpers';

export const dataArchitecture = [
  q({
    id: 'DATA-001',
    type: 'single',
    domain: 'data-architecture',
    prompt: 'In Copilot Chat\'s documented processing flow, what happens during "input processing"?',
    options: [
      { id: 'a', text: 'The prompt is pre-processed and combined with context such as the repository, open files, or chat history, then sent to the model.', rationale: 'Correct. This is the first step of the documented flow.' },
      { id: 'b', text: 'The model is retrained on the prompt before answering.', rationale: 'Prompts are not used to retrain the model in real time.' },
      { id: 'c', text: 'The response gets syntax highlighting and indentation.', rationale: 'That is the later "output formatting" step.' },
      { id: 'd', text: 'Your code is compiled and executed in a sandbox to verify it.', rationale: 'Chat does not execute your code as part of answering.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'The flow is: input processing → language model analysis → response generation → output formatting.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'DATA-002',
    type: 'multiple',
    domain: 'data-architecture',
    prompt: 'Which TWO are sources of context Copilot can use when building a prompt in the IDE?',
    options: [
      { id: 'a', text: 'Files open in your editor.', rationale: 'Correct. Copilot uses open files to understand your request.' },
      { id: 'b', text: 'Code you have highlighted or attached to the chat.', rationale: 'Correct. Selected and attached items are added as context.' },
      { id: 'c', text: 'Your web browser history.', rationale: 'Copilot does not read browser history.' },
      { id: 'd', text: 'Private repositories of other GitHub customers.', rationale: 'Copilot does not use other customers\' private code as prompt context.' },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Prompts combine your input with context such as the current repository, open files, selected code, attachments, and chat history.',
    referenceUrl: REF.promptEngineering,
  }),
  q({
    id: 'DATA-003',
    type: 'single',
    domain: 'data-architecture',
    prompt: 'What does content filtering in GitHub Copilot do?',
    options: [
      { id: 'a', text: 'Scans prompts and responses to detect and block harmful content.', rationale: 'Correct. This is GitHub\'s definition of content filtering.' },
      { id: 'b', text: 'Guarantees that generated code has no bugs.', rationale: 'Filtering does not verify functional correctness.' },
      { id: 'c', text: 'Checks your dependencies for license compliance.', rationale: 'That is a dependency/licensing tool concern, not content filtering.' },
      { id: 'd', text: 'Prevents Copilot from reading files outside the current folder.', rationale: 'Access to files is governed by context and content exclusion, not content filtering.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'Content filtering is a safety system applied to prompts and responses before results are shown.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'DATA-004',
    type: 'single',
    domain: 'data-architecture',
    prompt:
      'Suggestions matching public code are allowed and code referencing is on. A suggestion matches public code. What happens?',
    options: [
      { id: 'a', text: 'The suggestion can be shown, and Copilot provides references to the matching public code, including license information where available.', rationale: 'Correct. Code referencing annotates matches so you can decide how to use them.' },
      { id: 'b', text: 'The suggestion is always blocked.', rationale: 'Blocking happens when the setting is Block, not Allow.' },
      { id: 'c', text: 'Copilot automatically adds the matching license to your repository.', rationale: 'Copilot does not modify your licensing.' },
      { id: 'd', text: 'The matching repository owner is notified.', rationale: 'No notification is sent to the owner of matching code.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Code referencing compares a suggestion and roughly 150 characters of surrounding code with a public-code index and shows references when matches are found.',
    referenceUrl: REF.codeReferencing,
  }),
  q({
    id: 'DATA-005',
    type: 'single',
    domain: 'data-architecture',
    prompt: 'Does GitHub use Copilot Business or Copilot Enterprise customer data to train AI models?',
    options: [
      { id: 'a', text: 'No. That data is protected under GitHub\'s Data Protection Agreement, which prohibits such use without authorization.', rationale: 'Correct. GitHub states this explicitly.' },
      { id: 'b', text: 'Yes, unless each user opts out in personal settings.', rationale: 'The opt-out setting applies to individual plans, not Business/Enterprise.' },
      { id: 'c', text: 'Only inline completion data is used for training.', rationale: 'No Business/Enterprise customer data is used for training.' },
      { id: 'd', text: 'Yes, whenever suggestions matching public code are allowed.', rationale: 'The public code setting is unrelated to model training.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Business and Enterprise data is not used for model training. Individual plans have a separate training setting.',
    referenceUrl: REF.personalPolicies,
  }),
  q({
    id: 'DATA-006',
    type: 'single',
    domain: 'data-architecture',
    prompt:
      'A developer on a Copilot Pro plan does not want their interactions used for AI model training. What should they do?',
    options: [
      { id: 'a', text: 'Set "Allow GitHub to use my data for AI model training" to Disabled in their Copilot settings.', rationale: 'Correct. Individual plan users control this setting.' },
      { id: 'b', text: 'Configure content exclusion for their personal repositories.', rationale: 'Content exclusion controls what Copilot can use as context; it is not a training opt-out.' },
      { id: 'c', text: 'Block suggestions matching public code.', rationale: 'This filters suggestions; it does not affect training use.' },
      { id: 'd', text: 'Nothing; individual users cannot control this.', rationale: 'Individual plans offer a setting for this.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'For Free, Pro, Pro+, and Max plans, GitHub may use interaction data for training unless the user disables the setting.',
    referenceUrl: REF.personalPolicies,
  }),
  q({
    id: 'DATA-007',
    type: 'single',
    domain: 'data-architecture',
    prompt: 'Which statement describes a documented limitation of Copilot-generated code?',
    options: [
      { id: 'a', text: 'It may appear valid but be semantically or syntactically incorrect, or not reflect the developer\'s intent.', rationale: 'Correct. GitHub lists "inaccurate code" as a limitation.' },
      { id: 'b', text: 'Copilot runs and tests every suggestion before showing it.', rationale: 'Suggestions are model predictions; they are not executed and verified first.' },
      { id: 'c', text: 'Suggestions are guaranteed to compile in strongly typed languages.', rationale: 'There is no such guarantee.' },
      { id: 'd', text: 'Copilot always has your entire codebase in context.', rationale: 'Copilot works with the context it is given, which is limited.' },
    ],
    correctOptionIds: ['a'],
    explanation: 'Because output can be inaccurate, carefully review and test generated code, especially for critical applications.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'DATA-008',
    type: 'single',
    domain: 'data-architecture',
    prompt: 'How does an IDE client learn which content exclusion rules apply to the repository you are working in?',
    options: [
      { id: 'a', text: 'It sends the current repository URL to GitHub, which returns the applicable policy; the URLs are not logged.', rationale: 'Correct. This is the documented data flow for content exclusion.' },
      { id: 'b', text: 'It reads the rules from the repository\'s .gitignore file.', rationale: '.gitignore controls Git tracking, not Copilot content exclusion.' },
      { id: 'c', text: 'It uploads the whole repository to GitHub for scanning.', rationale: 'Only the repository URL is sent to fetch the policy.' },
      { id: 'd', text: 'Each developer pastes the rules into their editor settings.', rationale: 'Rules are configured centrally on GitHub by administrators.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'After content exclusion is configured, the client sends the repository URL so the server can return the correct policy.',
    referenceUrl: REF.contentExclusion,
  }),
];
