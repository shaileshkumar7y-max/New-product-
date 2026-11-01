import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {PRODUCTS,HERO_STORIES,WHEELS,CAMPAIGNS,COLLABORATIONS} from './data.js';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>readFile(path.join(root,name),'utf8');
const exists=name=>existsSync(path.join(root,name));
const html=await read('index.html');
const app=await read('app.js');
const data=await read('data.js');
const show=await read('show-house.html');
const feedback=await read('private-feedback.html');
const showJs=await read('show-house.js');
const showCss=await read('show-house.css');
const css=await read('styles.css');

test('V5 image paths match the flattened repository root',async()=>{
  assert.doesNotMatch(html,/\.\/assets\//);
  assert.doesNotMatch(data,/\.\/assets\//);
  assert.doesNotMatch(data,/\.\.\//);
  assert.doesNotMatch(app,/\.\/assets\//);
  const refs=new Set([...html.matchAll(/(?:src|data-image)="(\.\/[^"#?]+\.(?:webp|svg))"/g)].map(m=>m[1]));
  for(const ref of refs) await access(path.join(root,ref.slice(2)));
  assert.ok(refs.size>=12,`expected page image references, found ${refs.size}`);
  const dynamicRefs=new Set([...data.matchAll(/["'](\.\/[^"']+\.webp)["']/g)].map(m=>m[1]));
  for(const ref of dynamicRefs) await access(path.join(root,ref.slice(2)));
  const appRefs=new Set([...app.matchAll(/[\"'](\.\/[^\"']+\.(?:webp|svg))[\"']/g)].map(m=>m[1]));
  for(const ref of appRefs) await access(path.join(root,ref.slice(2)));
  assert.ok(dynamicRefs.size>=40,`expected catalogue/story image references, found ${dynamicRefs.size}`);
});

test('all 26 product image and detail files exist at repository root',async()=>{
  assert.equal(PRODUCTS.length,26);
  for(const product of PRODUCTS){
    assert.ok(product.name&&product.brand&&product.id);
    for(const ref of [product.image,product.detail].filter(Boolean)){
      assert.match(ref,/^\.\/[A-Za-z0-9._-]+\.(webp|svg)$/);
      await access(path.join(root,ref.slice(2)));
    }
  }
});

test('legacy creative data remains intact',()=>{
  assert.equal(HERO_STORIES.length,3);
  assert.equal(Object.keys(WHEELS).length,4);
  assert.equal(CAMPAIGNS.length,10);
  assert.equal(COLLABORATIONS.length,12);
});

test('main app direct DOM selectors exist and are unique',()=>{
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'duplicate IDs found in main HTML');
  const idSet=new Set(ids);
  const selectors=new Set([...app.matchAll(/\$\(['"]#([A-Za-z0-9_-]+)['"]\)/g)].map(m=>m[1]));
  const missing=[...selectors].filter(id=>!idSet.has(id));
  assert.deepEqual(missing,[]);
});

test('show and feedback links resolve; show source is restored',async()=>{
  assert.ok(exists('private-feedback.html'));
  assert.ok(exists('feedback.css'));
  assert.ok(exists('feedback.js'));
  assert.match(feedback,/href="\.\/show-house\.html"/);
  assert.doesNotMatch(feedback,/private-rate-lab\//);
  assert.ok(exists('show-house.html'));
  assert.ok(exists('show-house.css'));
  assert.ok(exists('show-house.js'));
  assert.match(html,/href="\.\/show-house\.html"/);
  assert.match(html,/href="\.\/private-feedback\.html"/);
  assert.doesNotMatch(html,/href="\.\.\//);
  assert.doesNotMatch(show,/\.\/assets\//);
  assert.doesNotMatch(show,/\.\.\//);
  assert.match(show,/BIG BOSS[\s\S]*?KE RANDIYA/);
  assert.match(show,/id="games"/);
  assert.match(showJs,/function drawPrompt/);
  const showScriptImgs=new Set([...showJs.matchAll(/[\"'](\.\/[^\"']+\.(?:webp|svg))[\"']/g)].map(m=>m[1]));
  for(const ref of showScriptImgs) await access(path.join(root,ref.slice(2)));
  assert.ok(showCss.length>10000);
  const showImgs=new Set([...show.matchAll(/src="(\.\/[^"#?]+\.(?:webp|svg))"/g)].map(m=>m[1]));
  for(const ref of showImgs) await access(path.join(root,ref.slice(2)));
});

test('show direct selectors match HTML IDs',()=>{
  const ids=new Set([...show.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
  const selectors=new Set([...showJs.matchAll(/\$\(['"]#([A-Za-z0-9_-]+)['"]\)/g)].map(m=>m[1]));
  assert.deepEqual([...selectors].filter(id=>!ids.has(id)),[]);
});

test('PWA cache version and core routes updated',async()=>{
  const sw=await read('sw.js');
  assert.match(sw,/innerwear-v5-shell-v2/);
  for(const file of ['show-house.html','show-house.css','show-house.js','private-feedback.html','feedback.css','feedback.js']) assert.ok(sw.includes(file));
  assert.match(css,/@media\s*\(max-width:\s*680px\)/);
});
