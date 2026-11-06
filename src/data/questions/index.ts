import type { Question } from '../../lib/types';
import { copilotFeatures } from './copilot-features';
import { dataArchitecture } from './data-architecture';
import { developerProductivity } from './developer-productivity';
import { privacySafeguards } from './privacy-safeguards';
import { promptEngineering } from './prompt-engineering';
import { responsibleAi } from './responsible-ai';

/** Bump when questions change so saved attempts record which bank they came from. */
export const BANK_VERSION = '2026.11.06-1';

export const QUESTIONS: Question[] = [
  ...responsibleAi,
  ...copilotFeatures,
  ...dataArchitecture,
  ...promptEngineering,
  ...developerProductivity,
  ...privacySafeguards,
];
