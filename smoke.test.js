import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(path, import.meta.url), 'utf8');

test('project contains all experimental navigation modules', async () => {
  const app = await read('../app.js');
  const routes = ['control','consent','time','preview','room','safety','boundary','translator','shield','blind','insights','replay','weather','whatif','shadow','escape','composer','simulator','museum','challenge','settings'];
  for (const route of routes) assert.ok(app.includes(`${route}: page`), `missing route: ${route}`);
});

test('no backend SDK or remote API integration is bundled', async () => {
  const app = await read('../app.js');
  const html = await read('../index.html');
  assert.doesNotMatch(app, /supabase|firebase|axios\.post|fetch\(['"]https?:/i);
  assert.doesNotMatch(html, /<script[^>]+src=['"]https?:/i);
});

test('PWA manifest and service worker exist', async () => {
  const manifest = JSON.parse(await read('../manifest.webmanifest'));
  const worker = await read('../sw.js');
  assert.equal(manifest.display, 'standalone');
  assert.match(worker, /addAll\(APP_FILES\)/);
  assert.match(manifest.icons[0].src, /icon\.svg$/);
  assert.ok((await read('../icon.svg')).includes('<svg'));
  for (const path of ['./index.html', './manifest.webmanifest', './styles.css', './app.js', './store.js', './security.js', './icon.svg']) {
    assert.ok(await read('../' + path.replace('./','')), `missing precache asset: ${path}`);
  }
});

test('encrypted backup uses authenticated encryption and password derivation', async () => {
  const security = await read('../security.js');
  assert.match(security, /AES-GCM/);
  assert.match(security, /PBKDF2/);
  assert.match(security, /310000/);
});


test('HTML links resolve to the root-level files in this GitHub Pages layout', async () => {
  const html = await read('../index.html');
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/app\.js"/);
  assert.match(html, /href="\.\/icon\.svg"/);
  assert.ok((await read('../styles.css')).includes(':root'));
  assert.ok((await read('../app.js')).includes('renderPage();'));
});
