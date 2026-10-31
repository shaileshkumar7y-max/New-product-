import { PRODUCTS, HERO_STORIES, WHEELS, CAMPAIGNS, COLLABORATIONS, DATE_IDEAS } from './data.js';

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const STORE_KEY = 'the-new-edit-v3-local';
const safeLoad = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; } };
const saved = safeLoad();
const state = { wishlist:Array.isArray(saved.wishlist)?saved.wishlist:[], bag:Array.isArray(saved.bag)?saved.bag:[], filter:'all', search:'', sort:'featured', wheel:'style', rotation:0, history:Array.isArray(saved.history)?saved.history:[] };
const moneyless = 'Concept preview — final pricing and availability not supplied.';

function persist(){ try{localStorage.setItem(STORE_KEY,JSON.stringify({wishlist:state.wishlist,bag:state.bag,history:state.history.slice(-8)}));}catch{toast('Browser storage is full. Your current session still works until this tab closes.');} }
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2300);}
function escapeHTML(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function updateCounts(){$('#bagCount').textContent=state.bag.length;$('#wishCount').textContent=state.wishlist.length;}

function renderProducts(){
  let list=PRODUCTS.filter(p=>(state.filter==='all'||p.type===state.filter||p.brand.toLowerCase().includes(state.filter)) && (!state.search || `${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(state.search)));
  if(state.sort==='name')list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
  $('#productGrid').innerHTML=list.length?list.map(p=>`<article class="product-card">
    <div class="product-photo"><img src="${p.image}" alt="${escapeHTML(p.name)} concept image" loading="lazy"><span class="product-badge">${escapeHTML(p.badge)}</span><button class="wish-btn ${state.wishlist.includes(p.id)?'active':''}" data-wish="${p.id}" aria-label="${state.wishlist.includes(p.id)?'Remove from':'Add to'} wishlist">${state.wishlist.includes(p.id)?'♥':'♡'}</button></div>
    <div class="product-info"><div class="product-brand">${escapeHTML(p.brand)}</div><h3 class="product-name">${escapeHTML(p.name)}</h3><div class="product-description">${escapeHTML(p.description)}</div><div class="product-bottom"><span class="product-type">${escapeHTML(p.category)}</span><button class="product-open" data-open-product="${p.id}">VIEW DETAILS ↗</button></div></div>
  </article>`).join(''):'<div class="empty-results">No concepts match this search. Try another keyword or filter.</div>';
  bindImageFallbacks($('#productGrid'));
}
function bindImageFallbacks(root=document){$$('img',root).forEach(img=>{if(!img.dataset.fallbackBound){img.dataset.fallbackBound='1';img.addEventListener('error',()=>{img.style.opacity='.2';img.alt='Image unavailable — campaign preview';});}});}
function renderArchive(){
 $('#campaignGrid').innerHTML=CAMPAIGNS.map((c,i)=>`<article class="archive-card"><span>CONCEPT ${String(i+1).padStart(2,'0')}</span><h4>${escapeHTML(c[0])}</h4><p>${escapeHTML(c[1])}</p></article>`).join('');
 $('#collabTags').innerHTML=COLLABORATIONS.map(c=>`<span>${escapeHTML(c)}</span>`).join('');
}
function openProduct(id){
 const p=PRODUCTS.find(x=>x.id===id);if(!p)return;
 $('#dialogProduct').innerHTML=`<img src="${p.detail||p.image}" alt="${escapeHTML(p.name)} detail image"><div class="dialog-copy"><span class="product-brand">${escapeHTML(p.brand)} / ${escapeHTML(p.category)}</span><h2>${escapeHTML(p.name)}</h2><p>${escapeHTML(p.description)}</p><p>${moneyless}</p><label for="dialogSize">SELECT A SIZE (PREVIEW)</label><select id="dialogSize">${p.sizes.map(s=>`<option>${s}</option>`).join('')}</select><button class="button button-gold" id="addBagConfirm" data-add-bag="${p.id}">ADD TO DEMO BAG ↗</button><p class="dialog-note">This is a local front-end bag only. No order is placed and no payment is collected.</p></div>`;
 bindImageFallbacks($('#dialogProduct'));$('#productDialog').showModal();
}
function addBag(id,size){const p=PRODUCTS.find(x=>x.id===id);if(!p)return;state.bag.push({id,size:size||p.sizes[0]});persist();updateCounts();toast(`${p.name} added to your demo bag.`);}
function renderBag(){
 if(!state.bag.length){$('#bagItems').innerHTML='<div class="bag-empty">Your bag is empty.<br><br>Explore the concept catalogue to save a product direction.</div>';return;}
 $('#bagItems').innerHTML=state.bag.map((item,i)=>{const p=PRODUCTS.find(x=>x.id===item.id);if(!p)return '';return `<div class="bag-row"><img src="${p.image}" alt=""><div><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(p.brand)} · Size ${escapeHTML(item.size)}</small><small>Concept item · No price supplied</small></div><button data-remove-bag="${i}">REMOVE</button></div>`;}).join('');
 bindImageFallbacks($('#bagItems'));
}
function updateHero(index){const s=HERO_STORIES[index%HERO_STORIES.length];$('#heroImage').style.backgroundImage=`url("${s.image}")`;
 $('#heroEyebrow').textContent=s.eyebrow;$('#heroTitle').innerHTML=s.title;$('#heroDescription').textContent=s.description;$('#heroCta').textContent=s.cta+' ↗';$('#heroCta').href=s.target;$('#heroIndex').textContent=String(index+1).padStart(2,'0');state.heroIndex=index;}
function renderWheel(){const w=WHEELS[state.wheel];$('#wheelDescription').textContent=w.description;$('#wheelResult').textContent='READY WHEN YOU ARE';$('#wheel').style.transform=`rotate(${state.rotation}deg)`;$$('[data-wheel]').forEach(b=>b.classList.toggle('active',b.dataset.wheel===state.wheel));$('#wheelHistory').textContent=state.history.length?`RECENT PICKS · ${state.history.slice(-4).reverse().join('  /  ')}`:'YOUR RECENT PICKS WILL APPEAR HERE';}
function spinWheel(){const items=WHEELS[state.wheel].items;const index=Math.floor(Math.random()*items.length);const selected=items[index];const base=state.rotation%360;const target=360*6+(360-index*(360/items.length))+(360/items.length/2);state.rotation+=target+(360-base);$('#wheel').style.transform=`rotate(${state.rotation}deg)`;$('#spinWheel').disabled=true;$('#wheelResult').textContent='THE WHEEL IS SPINNING…';setTimeout(()=>{$('#wheelResult').textContent=`YOUR PICK · ${selected.toUpperCase()}`;state.history.push(selected);state.history=state.history.slice(-8);persist();$('#wheelHistory').textContent=`RECENT PICKS · ${state.history.slice(-4).reverse().join('  /  ')}`;$('#spinWheel').disabled=false;},4350);}
function generateDate(){const vibe=$('#dateVibe').value,time=$('#dateTime').value,budget=$('#dateBudget').value;let choices=DATE_IDEAS.filter(x=>x.vibe===vibe&&(x.time===time||time==='long'&&x.time==='short'||time==='short'&&x.time==='short')&&(x.budget===budget||budget==='any'||x.budget==='low'&&budget==='low'||x.budget==='mid'&&budget==='mid'));if(!choices.length)choices=DATE_IDEAS.filter(x=>x.vibe===vibe);const idea=choices[Math.floor(Math.random()*choices.length)];$('#dateResult').innerHTML=`<strong>${escapeHTML(idea.title)}</strong><br>${escapeHTML(idea.detail)}`;}
function giftFinder(){const who=$('#giftWho').value,occasion=$('#giftOccasion').value,style=$('#giftStyle').value;const map={comfort:'Everyday Comfort Set',signature:'Master Series — Signature Design',romantic:'HER AFTER DARK · Silk Morning Story',creative:'Art Atelier · Poster & Moodboard Gift'};$('#giftResult').innerHTML=`<strong>${escapeHTML(map[style])}</strong><br>For: ${escapeHTML(who)} · Occasion: ${escapeHTML(occasion)}.<br><span style="color:#9d9387">Suggested direction only. Check product details and real-world availability before purchase.</span>`;}
function calculateSize(){const under=Number($('#underbust').value),bust=Number($('#bust').value);if(!under||!bust||under<55||under>150||bust<under||bust>170){$('#sizeResult').textContent='Enter a valid underbust and bust measurement in centimetres.';return;}const inches=under/2.54;let band=Math.round(inches/2)*2;const diff=(bust-under)/2.54;const cups=['AA','A','B','C','D','DD','E','F','FF','G'];const cup=cups[Math.max(0,Math.min(cups.length-1,Math.round(diff)-1))];$('#sizeResult').innerHTML=`<strong>Approximate starting point: ${band}${cup}</strong><br>Use this as a fitting conversation starter only. Sizing varies by brand, cut and fabric; compare a brand-specific chart and adjust by comfort.`;}
function openLightbox(img,caption){$('#lightboxImage').src=img;$('#lightboxCaption').textContent=caption||'THE NEW EDIT / VISUAL STORY';$('#lightboxDialog').showModal();}

// Navigation and search
$('#heroNext').addEventListener('click',()=>updateHero(((state.heroIndex||0)+1)%HERO_STORIES.length));
$('#searchToggle').addEventListener('click',()=>{$('#searchStrip').hidden=!$('#searchStrip').hidden;if(!$('#searchStrip').hidden)$('#siteSearch').focus();});
$('#searchClose').addEventListener('click',()=>{$('#searchStrip').hidden=true;$('#siteSearch').value='';state.search='';renderProducts();});
$('#siteSearch').addEventListener('input',e=>{state.search=e.target.value.trim().toLowerCase();renderProducts();});
$('#menuOpen').addEventListener('click',()=>{$('#mobileMenuPanel').hidden=!$('#mobileMenuPanel').hidden;});
$$('#mobileMenuPanel a').forEach(a=>a.addEventListener('click',()=>$('#mobileMenuPanel').hidden=true));
$('#productFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;state.filter=b.dataset.filter;$$('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderProducts();});
$('#productSort').addEventListener('change',e=>{state.sort=e.target.value;renderProducts();});
$('#wishlistTop').addEventListener('click',()=>{state.filter='all';state.search='';$('#siteSearch').value='';$$('[data-filter]').forEach(x=>x.classList.toggle('active',x.dataset.filter==='all'));$('#productGrid').innerHTML=PRODUCTS.filter(p=>state.wishlist.includes(p.id)).map(p=>`<article class="product-card"><div class="product-photo"><img src="${p.image}" alt="${escapeHTML(p.name)}"><button class="wish-btn active" data-wish="${p.id}">♥</button></div><div class="product-info"><div class="product-brand">${p.brand}</div><h3 class="product-name">${p.name}</h3><button class="product-open" data-open-product="${p.id}">VIEW DETAILS ↗</button></div></article>`).join('')||'<div class="empty-results">Your wishlist is empty. Tap a heart on any product to save it.</div>';document.getElementById('blxcked').scrollIntoView({behavior:'smooth'});});

// Product actions
$('#productGrid').addEventListener('click',e=>{const wish=e.target.closest('[data-wish]');if(wish){const id=wish.dataset.wish;state.wishlist=state.wishlist.includes(id)?state.wishlist.filter(x=>x!==id):[...state.wishlist,id];persist();updateCounts();renderProducts();return;}const open=e.target.closest('[data-open-product]');if(open)openProduct(open.dataset.openProduct);});
$('#productDialog').addEventListener('click',e=>{const add=e.target.closest('[data-add-bag]');if(add){addBag(add.dataset.addBag,$('#dialogSize')?.value);$('#productDialog').close();}});
$('#productClose').addEventListener('click',()=>$('#productDialog').close());
$('#bagOpen').addEventListener('click',()=>{renderBag();$('#bagDialog').showModal();});
$('#bagClose').addEventListener('click',()=>$('#bagDialog').close());$('#bagCloseBottom').addEventListener('click',()=>$('#bagDialog').close());
$('#bagItems').addEventListener('click',e=>{const b=e.target.closest('[data-remove-bag]');if(!b)return;state.bag.splice(Number(b.dataset.removeBag),1);persist();updateCounts();renderBag();});
$('#lightboxClose').addEventListener('click',()=>$('#lightboxDialog').close());

// Wheels and date experience
$('#wheelTabs').addEventListener('click',e=>{const b=e.target.closest('[data-wheel]');if(!b)return;state.wheel=b.dataset.wheel;renderWheel();});
$('#spinWheel').addEventListener('click',spinWheel);$('#wheelAgain').addEventListener('click',()=>{state.rotation=0;$('#wheel').style.transform='rotate(0deg)';$('#wheelResult').textContent='READY WHEN YOU ARE';});
$('#dateGenerate').addEventListener('click',generateDate);$('#giftFind').addEventListener('click',giftFinder);$('#sizeCalculate').addEventListener('click',calculateSize);

// Lightbox for visual assets
$$('.story-photo img,.campaign-mini-grid img,.atelier-grid img,.collection-card img,.fit-visual img,.gift-visual img').forEach(img=>img.addEventListener('click',()=>openLightbox(img.currentSrc||img.src,img.alt)));

// Initialise
renderProducts();renderArchive();updateCounts();updateHero(0);renderWheel();bindImageFallbacks();
