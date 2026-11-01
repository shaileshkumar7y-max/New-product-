import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../app.js', import.meta.url), 'utf8');

const requiredSections = ['home','house','contestants','tasks','games','rules','innerwear'];
const knownRepoRootImages = new Set([
  'blxcked-luxury-night.webp','her-after-dark.webp','blxcked-runway.webp',
  'blxcked-better-together.webp','her-after-dark-silk-morning-golden-reflection.webp',
  'lace-collection-vanity.webp','bollywood-romance-poster-collection.webp',
  'pink-lace-collection.webp','black-lace-collection.webp','confidence-together-campaign.webp','private-feedback.html'
]);

test('show identity and all main sections exist', () => {
  assert.match(html, /BIG BOSS[\s\S]*?KE RANDIYA/);
  assert.match(html, /BLXCKED INNERWEAR/);
  assert.match(html, /SYDNEY INNERWEAR/);
  for (const id of requiredSections) assert.match(html, new RegExp(`id=["']${id}["']`));
});

test('every direct JS id selector exists in HTML', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  const refs = new Set([...js.matchAll(/\$\(['"]#([A-Za-z0-9_-]+)['"]\)/g)].map(m => m[1]));
  const missing = [...refs].filter(id => !ids.has(id));
  assert.deepEqual(missing, []);
});

test('local CSS, JavaScript and supplied poster assets exist', async () => {
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  await access(new URL('./assets/show-poster-black-edition.webp', root));
  await access(new URL('./assets/show-poster-sydney-edition.webp', root));
  assert.ok(existsSync(new URL('./assets/show-poster-black-edition.webp', root)));
});

test('all references to repository-root images and feedback page are known', () => {
  const refs = new Set([...html.matchAll(/(?:src|href)=["']\.\.\/([^"']+)["']/g)].map(m => m[1]));
  for (const file of refs) assert.ok(knownRepoRootImages.has(file), `unexpected parent reference ${file}`);
  assert.ok(refs.has('private-feedback.html'));
});

test('all interactive game systems are present', () => {
  for (const token of [
    'data-vote="05"','data-vote="08"','data-mode="truth"','data-mode="dare"','data-mode="chemistry"',
    'id="drawSecret"','id="buildAlliance"','id="reactionStart"','id="saveConfession"',
    'id="saveRules"','id="passPrompt"','id="completePrompt"','id="skipTask"',
    'data-runway="BLXCKED BLACK LACE"','data-runway="SYDNEY INNERWEAR"','data-runway="PINK LACE EDIT"'
  ]) assert.ok(html.includes(token), `missing ${token}`);
  for (const token of ['function drawPrompt','function drawSecret','function buildAlliance','function startReaction','function saveRules']) assert.ok(js.includes(token));
});

test('frontend remains local-only and uses no network APIs', () => {
  assert.match(js, /localStorage/);
  assert.doesNotMatch(js, /\bfetch\s*\(|XMLHttpRequest|WebSocket|navigator\.mediaDevices/);
  assert.doesNotMatch(html, /<video\b|<iframe\b/);
  assert.doesNotMatch(css, /@import\s+url\(/);
});
