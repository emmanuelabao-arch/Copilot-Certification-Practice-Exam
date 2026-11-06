import { DOMAINS } from '../src/data/domains';
import { QUESTIONS } from '../src/data/questions';
import { QUESTIONS_PER_EXAM } from '../src/lib/config';
import { validateQuestionBank } from '../src/lib/validate';

const errors = validateQuestionBank(QUESTIONS, DOMAINS, QUESTIONS_PER_EXAM);

if (errors.length) {
  console.error(`Question bank validation failed with ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Question bank OK: ${QUESTIONS.length} questions.`);
for (const d of DOMAINS) {
  const n = QUESTIONS.filter((q) => q.domain === d.id).length;
  const pct = ((n / QUESTIONS.length) * 100).toFixed(1);
  console.log(`  ${d.name.padEnd(55)} ${String(n).padStart(3)}  (${pct}%, official ${d.officialWeight})`);
}
