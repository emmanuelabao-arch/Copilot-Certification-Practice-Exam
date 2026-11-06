import { q, REF } from './helpers';

export const responsibleAi = [
  q({
    id: 'RAI-001',
    type: 'single',
    domain: 'responsible-ai',
    prompt:
      'A developer accepts a Copilot Chat suggestion that compiles and looks correct. According to GitHub\'s responsible use guidance, what should the developer do before relying on it?',
    options: [
      { id: 'a', text: 'Review and test it as they would any other code before using it.', rationale: 'Correct. GitHub states users are responsible for reviewing and validating Copilot responses; output can look valid yet be wrong.' },
      { id: 'b', text: 'Merge it, because code that compiles has been validated by GitHub.', rationale: 'GitHub does not validate suggestions; compiling only shows syntax is acceptable, not that behavior is correct.' },
      { id: 'c', text: 'Assume it is correct if no content filter warning appeared.', rationale: 'Content filtering targets harmful content, not functional correctness or security.' },
      { id: 'd', text: 'Ask Copilot whether the code is correct and accept it if Copilot says yes.', rationale: 'A self-assessment is also AI output and can be inaccurate; it does not replace human review and tests.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Copilot can produce code that appears valid but is incorrect or insecure. Treat suggestions like a colleague\'s code: review, test, and confirm before relying on them.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'RAI-002',
    type: 'multiple',
    domain: 'responsible-ai',
    prompt: 'Which TWO of the following are among Microsoft\'s six Responsible AI principles?',
    options: [
      { id: 'a', text: 'Transparency', rationale: 'Correct. Transparency is one of the six principles.' },
      { id: 'b', text: 'Accountability', rationale: 'Correct. Accountability is one of the six principles.' },
      { id: 'c', text: 'Profitability', rationale: 'Not a Responsible AI principle; the principles concern how AI affects people, not commercial outcomes.' },
      { id: 'd', text: 'Autonomy', rationale: 'Not one of the six; the principles emphasize human accountability rather than system autonomy.' },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'The six principles are fairness, reliability and safety, privacy and security, inclusiveness, transparency, and accountability.',
    referenceUrl: REF.rai,
  }),
  q({
    id: 'RAI-003',
    type: 'single',
    domain: 'responsible-ai',
    prompt: 'In the context of GitHub Copilot, what does "hallucination" mean?',
    options: [
      { id: 'a', text: 'Output that sounds plausible but is incorrect, unsupported by context, or fabricated.', rationale: 'Correct. This is how GitHub defines hallucination and why human review is needed.' },
      { id: 'b', text: 'Copilot repeating the same suggestion several times.', rationale: 'Repetition is not what the term describes.' },
      { id: 'c', text: 'Copilot refusing to answer because of a content filter.', rationale: 'A refusal is a filtering outcome, not fabricated content.' },
      { id: 'd', text: 'A spike in response latency from the model.', rationale: 'Latency is a performance issue, unrelated to factual accuracy.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Hallucination is a known risk of large language models: confident-sounding output that is factually wrong or invented.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'RAI-004',
    type: 'single',
    domain: 'responsible-ai',
    prompt:
      'Copilot suggests importing a third-party package you have never heard of. What is the most responsible next step?',
    options: [
      { id: 'a', text: 'Confirm the package exists in the official registry and is trustworthy and maintained before installing it.', rationale: 'Correct. Suggested names can be fabricated or resemble malicious look-alike packages, so verify before installing.' },
      { id: 'b', text: 'Install it immediately; Copilot only suggests packages it has verified.', rationale: 'Copilot does not verify packages; installing unverified dependencies is a supply-chain risk.' },
      { id: 'c', text: 'Ask Copilot to write the missing package from scratch and publish it.', rationale: 'Publishing an unreviewed package to match a guessed name adds risk and does not validate the original suggestion.' },
      { id: 'd', text: 'Disable Copilot for the whole repository.', rationale: 'An overreaction; the right control is validating the suggestion, not removing the tool.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Generated code can reference APIs or packages that do not exist or are unsafe. Validate dependencies like any other AI output.',
    referenceUrl: REF.completionRespUse,
  }),
  q({
    id: 'RAI-005',
    type: 'single',
    domain: 'responsible-ai',
    prompt: 'Why might Copilot give lower-quality help for an obscure programming language?',
    options: [
      { id: 'a', text: 'Suggestion quality depends on the volume and diversity of training data for that language.', rationale: 'Correct. GitHub lists this "limited scope" limitation in its responsible use documentation.' },
      { id: 'b', text: 'GitHub deliberately blocks suggestions for uncommon languages.', rationale: 'There is no such block; quality simply varies with training coverage.' },
      { id: 'c', text: 'Copilot supports only six languages and returns random text for others.', rationale: 'Copilot supports numerous languages; it works especially well for some but is not limited to them.' },
      { id: 'd', text: 'Content exclusion is automatically applied to uncommon file types.', rationale: 'Content exclusion is configured by administrators and is unrelated to language popularity.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'For each language, the quality of suggestions depends on how much and how varied the training data is.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'RAI-006',
    type: 'single',
    domain: 'responsible-ai',
    prompt:
      'Training data from existing repositories can contain biases and errors that Copilot may reproduce. Which action best mitigates this risk?',
    options: [
      { id: 'a', text: 'Critically review output against team standards and test it with diverse inputs.', rationale: 'Correct. Human review and testing catch biased or erroneous patterns before they ship.' },
      { id: 'b', text: 'Ask Copilot to remove bias from its underlying model.', rationale: 'Users cannot retrain the model through a prompt.' },
      { id: 'c', text: 'Turn on the public code filter, which removes biased code.', rationale: 'The public code filter checks for matches with public code; it does not detect bias.' },
      { id: 'd', text: 'Only use Copilot for languages with the most training data.', rationale: 'Popular languages have biases too; avoiding languages does not replace review.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'GitHub notes that Copilot may perpetuate biases and errors from training data and may favor certain styles. Review and testing are the mitigation.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'RAI-007',
    type: 'multiple',
    domain: 'responsible-ai',
    prompt: 'Which TWO practices help a team operate GitHub Copilot responsibly?',
    options: [
      { id: 'a', text: 'Keep normal code review requirements for AI-assisted changes.', rationale: 'Correct. Human review is a key safeguard for AI-generated code.' },
      { id: 'b', text: 'Run automated tests and security scanning on AI-assisted changes.', rationale: 'Correct. Automated checks help validate correctness and catch vulnerabilities.' },
      { id: 'c', text: 'Relax branch protection for Copilot-authored pull requests to ship faster.', rationale: 'Weakening safeguards for AI output increases risk rather than managing it.' },
      { id: 'd', text: 'Avoid telling reviewers which code was AI-assisted.', rationale: 'This undermines transparency and makes appropriate scrutiny harder.' },
    ],
    correctOptionIds: ['a', 'b'],
    explanation:
      'Validate AI output the same way you would review a colleague\'s work: review, test, and apply secure coding practices.',
    referenceUrl: REF.bestPractices,
  }),
  q({
    id: 'RAI-008',
    type: 'single',
    domain: 'responsible-ai',
    prompt: 'Who is responsible for reviewing and validating code that a developer accepts from Copilot and commits?',
    options: [
      { id: 'a', text: 'The developer and team who accept and ship the code.', rationale: 'Correct. GitHub states users are responsible for reviewing and validating generated output.' },
      { id: 'b', text: 'GitHub, because it operates the service.', rationale: 'GitHub provides the tool but does not take on validation of your accepted code.' },
      { id: 'c', text: 'The provider of the underlying language model.', rationale: 'Model providers do not review your application code.' },
      { id: 'd', text: 'The authors of the public code the model was trained on.', rationale: 'Training data authors have no role in validating your use of a suggestion.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Copilot is a tool, not a replacement for the developer. Accountability for shipped code stays with the people who accept it.',
    referenceUrl: REF.completionRespUse,
  }),
  q({
    id: 'RAI-009',
    type: 'single',
    domain: 'responsible-ai',
    prompt:
      'Copilot generates a database query by concatenating user input directly into a SQL string. What is the main risk, and how should it be addressed?',
    options: [
      { id: 'a', text: 'SQL injection; use parameterized queries and review security-sensitive code.', rationale: 'Correct. GitHub specifically advises secure coding practices such as avoiding SQL injection.' },
      { id: 'b', text: 'Slow queries; add a database index.', rationale: 'An index does not address untrusted input being executed as SQL.' },
      { id: 'c', text: 'No risk, because Copilot filters out insecure code.', rationale: 'Copilot can generate insecure code; output must be reviewed.' },
      { id: 'd', text: 'License risk; enable the public code filter.', rationale: 'The issue is a vulnerability, not code provenance.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Generated code can contain vulnerabilities. Follow secure coding practices (no hard-coded secrets, no SQL injection) and review all generated code.',
    referenceUrl: REF.chatRespUse,
  }),
  q({
    id: 'RAI-010',
    type: 'single',
    domain: 'responsible-ai',
    prompt:
      'A team wants Copilot Chat to rank job applicants\' coding submissions automatically with no human involvement. What does GitHub\'s responsible use guidance recommend?',
    options: [
      { id: 'a', text: 'Ensure a human reviews the output before it is used to make decisions that affect people.', rationale: 'Correct. GitHub calls out human review for decisions that affect people.' },
      { id: 'b', text: 'It is acceptable if the prompt tells Copilot to be fair.', rationale: 'A prompt instruction cannot guarantee fairness or remove the need for oversight.' },
      { id: 'c', text: 'It is acceptable if the public code filter is enabled.', rationale: 'The public code filter is unrelated to fairness in decisions about people.' },
      { id: 'd', text: 'It is acceptable on a Business plan because data is not used for training.', rationale: 'Data handling terms address privacy, not fairness or accountability for decisions.' },
    ],
    correctOptionIds: ['a'],
    explanation:
      'Human oversight is an important safeguard, especially when AI output informs decisions about people.',
    referenceUrl: REF.chatRespUse,
  }),
];
