import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const files = (await readdir('assets/Hero section')).filter(f => f.endsWith('.png')).sort();
for (const [index, file] of files.entries()) {
  for (const size of [960, 1920]) execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', String(size), `assets/Hero section/${file}`, '--out', `assets/optimized/hero-${index}-${size}.jpg`]);
}
