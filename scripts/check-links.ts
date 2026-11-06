// Network check for reference/study URLs. Not part of CI so that external outages don't break builds.
import { DOMAINS } from '../src/data/domains';
import { QUESTIONS } from '../src/data/questions';

const urls = new Set<string>([
  ...QUESTIONS.map((q) => q.referenceUrl),
  ...DOMAINS.flatMap((d) => d.studyResources.map((r) => r.url)),
]);

let failed = 0;
for (const url of urls) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    console.log(`${res.ok ? 'OK ' : 'BAD'} ${res.status} ${url}`);
    if (!res.ok) failed++;
  } catch (e) {
    failed++;
    console.log(`ERR ${(e as Error).message} ${url}`);
  }
}
console.log(`\n${urls.size - failed}/${urls.size} URLs reachable.`);
process.exit(failed ? 1 : 0);
