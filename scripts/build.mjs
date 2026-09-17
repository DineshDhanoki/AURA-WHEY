import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'shopify.js', 'app.js', 'product-viewer.js', 'styles.css', 'assets', 'stitch_aura_whey_storefront_design']) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log('Static storefront built in dist/');
