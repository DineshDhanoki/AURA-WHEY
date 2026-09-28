import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'shopify.js', 'batch-reports.js', 'app.js', 'product-viewer.js', 'styles.css', 'assets', 'stitch_aura_whey_storefront_design']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
await mkdir('dist/static', { recursive: true });
let html = await readFile('index.html', 'utf8');
for (const file of ['shopify.js', 'batch-reports.js', 'app.js', 'product-viewer.js', 'styles.css']) {
  const contents = await readFile(file);
  const hash = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  const name = file.replace(/\.(js|css)$/, `.${hash}.$1`);
  await writeFile(`dist/static/${name}`, contents);
  html = html.replace(new RegExp(`(src|href)="${file.replace('.', '\\.')}[^\"]*"`, 'g'), `$1="static/${name}"`);
}
await writeFile('dist/index.html', html);
console.log('Static storefront built in dist/ with versioned scripts and styles.');
