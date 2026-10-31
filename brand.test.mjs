import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { PRODUCTS, HERO_STORIES, WHEELS, CAMPAIGNS, COLLABORATIONS } from '../data.js';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const knownRootImages = new Set([
  'black-lace-collection.webp','blxcked-better-together.webp','blxcked-everyday-comfort.webp',
  'blxcked-luxury-night.webp','blxcked-runway.webp','bollywood-romance-poster-collection.webp',
  'her-after-dark-silk-morning-golden-reflection.webp','her-after-dark.webp','lace-collection-vanity.webp',
  'lingerie-fit-guide.webp','pink-lace-collection.webp','sepia-couples-moodboard.webp'
]);

test('brand page includes the required primary sections', () => {
  for (const id of ['home','worlds','blxcked','after-dark','atelier','collections','boyfriend','experiences','wellness','campaign-archive','size-notes','shop-care']) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing section #${id}`);
  }
});

test('brand assets and scripts use local relative paths', async () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(app, /from '\.\/data\.js'/);
  const localAssets = [...html.matchAll(/(?:src|href)=["'](\.\/assets\/[^"']+)["']/g)].map(x => x[1]);
  for (const path of localAssets) await access(new URL(path, root));
});

test('existing repository image dependencies are known root assets', () => {
  const refs = new Set([
    ...[...html.matchAll(/(?:src|href)=["']\.\.\/([^"']+\.webp)["']/g)].map(x => x[1]),
    ...[...app.matchAll(/(?:\.\.\/)([a-z0-9-]+\.webp)/gi)].map(x => x[1])
  ]);
  for (const path of refs) assert.ok(knownRootImages.has(path), `unknown root image ${path}`);
});

test('catalogue contains 12 usable product concepts with working image references', async () => {
  assert.equal(PRODUCTS.length, 12);
  for (const product of PRODUCTS) {
    assert.ok(product.id && product.name && product.sizes.length);
    if (product.image.startsWith('./assets/')) await access(new URL(product.image, root));
    else assert.ok(knownRootImages.has(product.image.replace('../','')));
    if (product.detail?.startsWith('./assets/')) await access(new URL(product.detail, root));
  }
});

test('campaign, collab and wheel inventories are complete', () => {
  assert.equal(HERO_STORIES.length, 3);
  assert.equal(CAMPAIGNS.length, 10);
  assert.equal(COLLABORATIONS.length, 12);
  assert.deepEqual(Object.keys(WHEELS), ['style','mood','date','surprise']);
  for (const wheel of Object.values(WHEELS)) assert.equal(wheel.items.length, 8);
});

test('all major interaction handlers are present', () => {
  for (const needle of ['renderProducts','openProduct','addBag','renderBag','spinWheel','generateDate','giftFinder','calculateSize','openLightbox']) {
    assert.ok(app.includes(needle), `missing interaction ${needle}`);
  }
});
