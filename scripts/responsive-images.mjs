import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

for (const folder of ['MK Card', 'RC Card']) {
  const directory = `assets/optimized/site/${folder}`;
  for (const name of await readdir(directory)) {
    if (!name.endsWith('.webp')) continue;
    for (const size of [160, 640]) {
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-Z', String(size), `${directory}/${name}`, '--out', `${directory}/${name.replace('.webp', `-${size}.jpg`)}`]);
    }
  }
}
