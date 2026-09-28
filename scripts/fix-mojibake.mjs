import { copyFile, readFile, writeFile } from 'node:fs/promises';

const CONTAMINATION = /[\u00C0-\u00FF\u2018-\u2122\u00A6\u00B7\u0152-\u017E\u2020-\u2030]/;

const untouched = new Set([0x009D, 0x0178, 0x017D, 0x0152, 0x0153, 0x0160, 0x0161, 0x017E, 0x201A, 0x0192, 0x02C6, 0x02DC, 0x2020, 0x2021, 0x2026, 0x2030, 0x2039, 0x203A, 0x20AC, 0x2122, 0x0152]);

function repairsAt(text, i) {
  const results = [];
  const lead = [];
  for (let n = 0; n < 4 && i + n < text.length; n++) {
    const code = text.charCodeAt(i + n);
    if (n > 0 && (code < 0x80 || code > 0xff)) break;
    lead.push(code);
    const chunk = Buffer.from(lead).toString('utf8');
    if (!chunk.includes('\ufffd')) results.push({ length: lead.length, text: chunk });
  }
  return results;
}

function repair(text) {
  const out = [];
  let i = 0;
  while (i < text.length) {
    const code = text.charCodeAt(i);
    if (code < 0x80 || code > 0xff || untouched.has(code)) {
      out.push(text[i]);
      i += 1;
      continue;
    }
    const options = repairsAt(text, i);
    if (options.length === 0) {
      out.push(text[i]);
      i += 1;
      continue;
    }
    const best = options[options.length - 1];
    out.push(best.text);
    i += best.length;
  }
  return out.join('');
}

if (process.env.MOJIBAKE_SELFTEST === '1') {
  const samples = [
    ['em dash', '\u2014'], ['bullet', '\u2022'], ['rsquo', '\u2019'], ['ldquo', '\u201c'],
    ['rupee', '\u20b9'], ['check', '\u2713'], ['minus', '\u2212'], ['star', '\u2605'],
    ['party', '\u{1f389}'], ['truck', '\u{1f69a}'], ['bolt', '\u26a1'], ['ellipsis', '\u2026'],
  ];
  let failures = 0;
  for (const [label, sample] of samples) {
    const mangled = Buffer.from(sample, 'utf8').toString('latin1');
    const fixed = repair(mangled);
    if (fixed !== sample) { failures += 1; console.error(`selftest FAIL ${label}: ${JSON.stringify(fixed)} != ${JSON.stringify(sample)}`); }
  }
  const doubled = repair(repair(Buffer.from('\u2019\u2022', 'utf8').toString('latin1')));
  if (doubled !== '\u2019\u2022') { failures += 1; console.error(`selftest FAIL idempotence: ${JSON.stringify(doubled)}`); }
  console.log(`selftest ${failures === 0 ? 'passed' : `failed (${failures})`} - ${samples.length + 1} cases`);
  process.exit(failures === 0 ? 0 : 1);
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Usage: node scripts/fix-mojibake.mjs <file> [file...]');
  process.exit(1);
}

let failed = false;
for (const file of targets) {
  const before = await readFile(file, 'utf8');
  const after = repair(before);
  const remaining = (after.match(new RegExp(CONTAMINATION, 'g')) || []).length;
  const beforeCount = (before.match(new RegExp(CONTAMINATION, 'g')) || []).length;
  if (after === before) {
    console.log(`${file}: unchanged (${remaining} suspect glyphs)`);
    continue;
  }
  if (remaining >= beforeCount) {
    console.log(`${file}: skipped - repair did not reduce contamination (${beforeCount} -> ${remaining})`);
    failed = true;
    continue;
  }
  await copyFile(file, `${file}.mojibake-backup`);
  await writeFile(file, after, 'utf8');
  console.log(`${file}: repaired ${beforeCount} -> ${remaining} suspect glyphs (backup at ${file}.mojibake-backup)`);
}

process.exit(failed ? 1 : 0);
