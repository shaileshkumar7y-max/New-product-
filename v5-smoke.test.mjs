import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {PRODUCTS,WHEELS,CAMPAIGNS,COLLABORATIONS,HERO_STORIES,DATE_IDEAS} from '../data.js';
const root=new URL('../',import.meta.url);
const html=await readFile(new URL('index.html',root),'utf8');
const app=await readFile(new URL('app.js',root),'utf8');
const css=await readFile(new URL('styles.css',root),'utf8');

test('V5 hub exposes every requested creative world',()=>{
 for(const token of ['INNERWEAR','BLXCKED','HER AFTER DARK','ART ATELIER','ROYAL SANSKARI','NOOR EDIT','COUPLES STUDIO','BIG BOSS','PRIVATE FEEDBACK']) assert.ok(html.includes(token),`missing ${token}`);
 for(const id of ['home','brands','shop','after-dark','atelier','collections','campaigns','experiences','show','wellness']) assert.match(html,new RegExp(`id="${id}"`));
});

test('product data has 26 concepts and all local image files resolve',async()=>{
 assert.equal(PRODUCTS.length,26);
 for(const product of PRODUCTS){
  assert.ok(product.id && product.name && product.brand);
  for(const ref of [product.image,product.detail].filter(Boolean)){
   assert.ok(ref.startsWith('./assets/'),`${product.name}: non-local path ${ref}`);
   await access(new URL(ref,root));
  }
 }
});

test('old creative inventories are preserved',()=>{
 assert.equal(HERO_STORIES.length,3);
 assert.equal(Object.keys(WHEELS).length,4);
 assert.equal(CAMPAIGNS.length,10);
 assert.equal(COLLABORATIONS.length,12);
 assert.equal(DATE_IDEAS.length,8);
});

test('new shop, wishlist, cart, filters and modal interactions are wired',()=>{
 for(const token of ['renderProducts','productModal','addBag','toggleWish','renderBag','renderWishlist','brandFilters','sortProducts','productSearch']) assert.ok(app.includes(token),`missing ${token}`);
});

test('new wheel, date, gift and measurement helpers are wired',()=>{
 for(const token of ['spinWheel','addWheelOption','generateDate','generateGift','estimateSize','DATE_IDEAS','WHEELS']) assert.ok(app.includes(token),`missing ${token}`);
});

test('campaign archive, gallery lightbox and dialogs are wired',()=>{
 for(const token of ['CAMPAIGNS','COLLABORATIONS','openLightbox','data-close','campaignContent','artGallery']) assert.ok(app.includes(token),`missing ${token}`);
 for (const token of ['initShowUpgrade','submitNomination','claimImmunity','addUpgradePoints']) assert.ok(app.includes(token));
});

test('all referenced local HTML images exist and mobile CSS is present',async()=>{
 const refs=[...html.matchAll(/(?:src|data-image)="(\.\/assets\/[^"]+\.webp)"/g)].map(m=>m[1]);
 for(const ref of refs) await access(new URL(ref,root));
 assert.match(css,/@media\(max-width:680px\)/);
 assert.match(css,/grid-template-columns:repeat\(2/);
 assert.match(html,/href="\.\.\/private-feedback\.html"/);
 assert.match(html,/href="\.\.\/index\.html#home"/);
});

test('PWA manifest and offline service worker are present',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(manifest.scope,'./');
 assert.match(html,/rel="manifest" href="\.\/manifest\.webmanifest"/);
 const sw=await readFile(new URL('sw.js',root),'utf8');
 assert.match(sw,/addEventListener\('fetch'/);
 assert.match(app,/serviceWorker\.register/);
});
