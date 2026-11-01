
import { PRODUCTS, CAMPAIGNS, COLLABORATIONS, WHEELS, DATE_IDEAS } from './data.js';

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const KEY='innerwear-new-edit-v5';
const safeLoad=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
const saved=safeLoad();
const state={
 filter:'ALL',query:'',sort:'featured',
 bag:Array.isArray(saved.bag)?saved.bag:[],
 wishlist:Array.isArray(saved.wishlist)?saved.wishlist:[],
 custom:{...(saved.custom||{})},
 wheelRotation:0, selectedSizes:{},
 campaignTab:'ads'
};
const artImages=[
 ['./mughal-royal-romance-poster.webp','Mughal royal romance poster'],
 ['./backlit-saree-atelier-sketch.webp','Backlit saree graphite study'],
 ['./bollywood-romance-poster-collection.webp','Romance poster collection'],
 ['./sepia-couples-moodboard.webp','Sepia couples moodboard']
];
function persist(){try{localStorage.setItem(KEY,JSON.stringify({bag:state.bag,wishlist:state.wishlist,custom:state.custom}))}catch{toast('Browser storage is full; this change is temporary.')}}
function toast(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function renderProducts(){
 let list=PRODUCTS.filter(p=>(state.filter==='ALL'||p.brand===state.filter)&&(`${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase().includes(state.query.toLowerCase())));
 if(state.sort==='az')list.sort((a,b)=>a.name.localeCompare(b.name));
 if(state.sort==='za')list.sort((a,b)=>b.name.localeCompare(a.name));
 $('#productGrid').innerHTML=list.map(p=>`
 <article class="product-card">
  <div class="product-image"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy" onerror="this.onerror=null;this.src='./image-placeholder.svg'">
   <span class="product-badge">${esc(p.badge||p.category)}</span>
   <button class="heart-btn ${state.wishlist.includes(p.id)?'active':''}" data-wish="${p.id}" aria-label="Toggle wishlist">♡</button>
  </div>
  <div class="product-info"><span class="product-brand">${esc(p.brand)}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p>
   <div class="product-bottom"><span>${esc((p.sizes||[]).join(' / '))}</span><button class="quick-view" data-view="${p.id}">QUICK VIEW ↗</button></div>
  </div>
 </article>`).join('')||'<p class="section-note">No matching concept products. Try another filter.</p>';
 $('#productCount').textContent=`${list.length} concept pieces`;
 updateCounts();
}
function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function updateCounts(){$('#bagCount').textContent=state.bag.length;$('#wishCount').textContent=state.wishlist.length}
function findProduct(id){return PRODUCTS.find(p=>p.id===id)}
function openDialog(id){const d=$(id);if(d?.showModal)d.showModal()}
function closeDialog(id){const d=$(id);if(d?.open)d.close()}
function productModal(id){
 const p=findProduct(id);if(!p)return;
 const size=p.sizes?.[0]||'ONE SIZE';state.selectedSizes[id]=state.selectedSizes[id]||size;
 $('#productModalBody').innerHTML=`<img src="${p.detail||p.image}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='./image-placeholder.svg'">
 <div><span class="product-brand">${esc(p.brand)} / ${esc(p.badge||'CONCEPT')}</span><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p><p><b>Concept preview</b> · Product details, material and live availability are not confirmed.</p>
 <div class="size-options">${(p.sizes||['ONE SIZE']).map(s=>`<button data-size="${esc(s)}" data-product="${id}" class="${state.selectedSizes[id]===s?'selected':''}">${esc(s)}</button>`).join('')}</div>
 <button class="btn btn-gold" id="addProduct" data-add="${id}">ADD TO DEMO BAG</button>
 <button class="btn btn-outline" id="modalWish" data-wish="${id}">♡ SAVE TO WISHLIST</button></div>`;
 openDialog('#productModal');
}
function addBag(id){const p=findProduct(id);if(!p)return;state.bag.push({id,size:state.selectedSizes[id]||p.sizes?.[0]||'ONE SIZE'});persist();renderBag();updateCounts();toast('Added to your demo bag.')}
function renderBag(){
 const box=$('#bagItems');if(!state.bag.length){box.innerHTML='<p class="section-note">Your demo bag is empty.</p>';return}
 box.innerHTML=state.bag.map((item,i)=>{const p=findProduct(item.id);return `<div class="bag-item"><img src="${p.image}" alt=""><div><b>${esc(p.name)}</b><br>${esc(p.brand)} · Size ${esc(item.size)}</div><button data-remove-bag="${i}">REMOVE</button></div>`}).join('');
}
function renderWishlist(){
 const box=$('#wishlistItems');if(!state.wishlist.length){box.innerHTML='<p class="section-note">No saved items yet.</p>';return}
 box.innerHTML=state.wishlist.map(id=>{const p=findProduct(id);return p?`<div class="bag-item"><img src="${p.image}" alt=""><div><b>${esc(p.name)}</b><br>${esc(p.brand)}</div><button data-remove-wish="${id}">REMOVE</button></div>`:''}).join('');
}
function toggleWish(id){state.wishlist=state.wishlist.includes(id)?state.wishlist.filter(x=>x!==id):[...state.wishlist,id];persist();renderProducts();renderWishlist();toast(state.wishlist.includes(id)?'Saved to wishlist.':'Removed from wishlist.')}
function renderCampaigns(){
 const box=$('#campaignContent');
 if(state.campaignTab==='ads')box.innerHTML=CAMPAIGNS.map((x,i)=>`<article class="campaign-item"><small>BLXCKED / AD CONCEPT ${String(i+1).padStart(2,'0')}</small><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></article>`).join('');
 if(state.campaignTab==='collabs')box.innerHTML=COLLABORATIONS.map((x,i)=>`<article class="campaign-item"><small>COLLABORATION / ${String(i+1).padStart(2,'0')}</small><h3>${esc(x)}</h3><p>Creative collaboration direction for INNERWEAR.</p></article>`).join('');
 if(state.campaignTab==='visuals')box.innerHTML=artImages.map((x,i)=>`<button class="gallery-tile" data-image="${x[0]}"><img src="${x[0]}" alt="${esc(x[1])}"><span>${esc(x[1])}</span></button>`).join('');
}
function generateDate(){
 const vibe=$('#dateMood').value,time=$('#dateTime').value,budget=$('#dateBudget').value;
 const matches=DATE_IDEAS.filter(x=>x.vibe===vibe&&(x.time===time||!x.time)&&(x.budget===budget||x.budget==='any'||budget==='any'));
 const item=(matches.length?matches:DATE_IDEAS.filter(x=>x.vibe===vibe))[Math.floor(Math.random()*(matches.length||1))]||DATE_IDEAS[0];
 $('#dateResult').innerHTML=`<b>${esc(item.title)}</b><br>${esc(item.detail)}`;
}
function generateGift(){
 const vibe=$('#giftVibe').value,budget=$('#giftBudget').value;
 const map={
 'Classic':['A clean everyday essentials set','A minimal travel organiser','A classic watch/bracelet styling edit'],
 'Playful':['A custom playlist + date kit','A graphic lounge set concept','A playful surprise box'],
 'Minimal':['A monochrome essentials set','A premium fabric care kit','A clean wardrobe organiser'],
 'Romantic':['A handwritten note + curated gift box','A matching style edit','A planned dinner and photo walk']
 };
 const items=map[vibe]||map.Classic;
 $('#giftResult').innerHTML=`<b>${esc(vibe)} gift directions</b><br>${items.map(esc).join(' · ')}<br><small>${esc(budget)} · Inspiration only; no checkout or live stock.</small>`;
}
function wheelItems(){const type=$('#wheelType').value;return [...(WHEELS[type]?.items||[]),...(state.custom[type]||[]) ]}
function spinWheel(){
 const items=wheelItems();const wheel=$('#wheel');const pick=items[Math.floor(Math.random()*items.length)];
 state.wheelRotation+=1440+Math.random()*720;
 wheel.style.transform=`rotate(${state.wheelRotation}deg)`;
 $('#wheelResult').textContent='SPINNING…';
 setTimeout(()=>{$('#wheelResult').textContent=pick.toUpperCase();toast(`Wheel result: ${pick}`)},2450);
}
function addWheelOption(){
 const type=$('#wheelType').value,val=$('#customWheelOption').value.trim();
 if(!val)return toast('Enter an option first.');
 state.custom[type]=[...(state.custom[type]||[]),val].slice(-12);$('#customWheelOption').value='';persist();toast('Custom wheel option saved locally.');
}
function estimateSize(){
 const under=Number($('#underbust').value),bust=Number($('#bust').value);
 if(!under||!bust||under<50||under>150||bust<50||bust>170||bust<=under){$('#sizeResult').textContent='Enter valid measurements. Bust should be higher than underbust.';return}
 const band=Math.round(under/5)*5;
 const diff=bust-under;
 const cup=diff<10?'AA/A':diff<12?'A':diff<14?'B':diff<16?'C':diff<18?'D':diff<20?'DD/E':'F+';
 $('#sizeResult').innerHTML=`<b>Rough starting point: ${band} / ${cup}</b><br>Compare with the brand-specific size chart and actual fit. This estimate is not a final size recommendation. Measurements are not saved.`;
}
function renderSearch(q){
 const val=q.toLowerCase();const found=PRODUCTS.filter(p=>`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(val)).slice(0,8);
 $('#searchResults').innerHTML=found.map(p=>`<a class="search-result" href="#shop" data-search-view="${p.id}">${esc(p.name)} <small>· ${esc(p.brand)}</small></a>`).join('')||'<p class="section-note">No matches found.</p>';
}
function bindEvents(){
 $('#brandFilters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;state.filter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));renderProducts()});
 $('#productSearch').addEventListener('input',e=>{state.query=e.target.value;renderProducts()});
 $('#sortProducts').addEventListener('change',e=>{state.sort=e.target.value;renderProducts()});
 $('#resetShop').addEventListener('click',()=>{state.filter='ALL';state.query='';state.sort='featured';$('#productSearch').value='';$('#sortProducts').value='featured';$$('.filter').forEach(x=>x.classList.toggle('active',x.dataset.filter==='ALL'));renderProducts()});
 $('#productGrid').addEventListener('click',e=>{const view=e.target.closest('[data-view]');const wish=e.target.closest('[data-wish]');if(view)productModal(view.dataset.view);if(wish)toggleWish(wish.dataset.wish)});
 $('#productModalBody').addEventListener('click',e=>{const s=e.target.closest('[data-size]');const a=e.target.closest('[data-add]');const w=e.target.closest('[data-wish]');if(s){state.selectedSizes[s.dataset.product]=s.dataset.size;$$('[data-size]','#productModalBody').forEach(x=>x.classList.toggle('selected',x===s))}if(a)addBag(a.dataset.add);if(w)toggleWish(w.dataset.wish)});
 $('#openBag').addEventListener('click',()=>{renderBag();openDialog('#bagModal')});
 $('#openWishlist').addEventListener('click',()=>{renderWishlist();openDialog('#wishlistModal')});
 $('#bagItems').addEventListener('click',e=>{const b=e.target.closest('[data-remove-bag]');if(!b)return;state.bag.splice(Number(b.dataset.removeBag),1);persist();renderBag();updateCounts()});
 $('#wishlistItems').addEventListener('click',e=>{const b=e.target.closest('[data-remove-wish]');if(!b)return;toggleWish(b.dataset.removeWish)});
 $('#clearBag').addEventListener('click',()=>{state.bag=[];persist();renderBag();updateCounts()});
 $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog('#'+b.dataset.close)));
 $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
 $('#campaignContent').addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b)openLightbox(b.dataset.image,b.querySelector('span')?.textContent||'Campaign visual')});
 $$('.campaign-tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.campaign-tabs button').forEach(x=>x.classList.toggle('active',x===b));state.campaignTab=b.dataset.campaignTab;renderCampaigns()}));
 $('#artGallery').addEventListener('click',e=>{const b=e.target.closest('[data-image]');if(b)openLightbox(b.dataset.image,b.querySelector('span')?.textContent||'Art Atelier')});
 $('#generateDate').addEventListener('click',generateDate);
 $('#generateGift').addEventListener('click',generateGift);
 $('#spinWheel').addEventListener('click',spinWheel);
 $('#addWheelOption').addEventListener('click',addWheelOption);
 $('#estimateSize').addEventListener('click',estimateSize);
 $('#wheelType').addEventListener('change',()=>{$('#wheelResult').textContent='READY TO SPIN';$('#wheel').style.transform='rotate(0deg)';state.wheelRotation=0});
 $('#menuToggle').addEventListener('click',()=>{$('#mobileNav').hidden=!$('#mobileNav').hidden});
 $('#openSearch').addEventListener('click',()=>openDialog('#searchModal'));
 $('#globalSearch').addEventListener('input',e=>renderSearch(e.target.value));
 $('#searchResults').addEventListener('click',e=>{const a=e.target.closest('[data-search-view]');if(!a)return;closeDialog('#searchModal');setTimeout(()=>productModal(a.dataset.searchView),100)});
 $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Escape')closeDialog('#searchModal')});

}
function openLightbox(src,caption){$('#lightboxImage').src=src;$('#lightboxCaption').textContent=caption;openDialog('#lightbox')}

function initShowUpgrade(){
 const KEY='innerwear-show-upgrade-v5';
 let data={};
 try{data=JSON.parse(localStorage.getItem(KEY)||'{}')}catch{data={}}
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}};
 const result=$('#nominationResult');
 const pts=$('#upgradePoints');
 const immunity=$('#immunityState');
 const render=()=>{
   pts.textContent=String(data.points||0);
   immunity.textContent=data.immunity?'Immunity card claimed for this demo round.':'One local immunity card is available for this demo round.';
   result.textContent=data.nomination?`Contestant #${data.nomination.person} nominated · ${data.nomination.reason}`:'No nominations recorded in this browser yet.';
 };
 $('#submitNomination')?.addEventListener('click',()=>{
   data.nomination={person:$('#nomineePick').value,reason:$('#nominationReason').value,time:Date.now()};
   save();render();toast('Nomination saved locally.');
 });
 $('#claimImmunity')?.addEventListener('click',()=>{
   if(data.immunity){toast('Immunity card has already been claimed.');return;}
   data.immunity=true;save();render();toast('Immunity card claimed.');
 });
 $('#addUpgradePoints')?.addEventListener('click',()=>{data.points=(data.points||0)+5;save();render();toast('+5 house points.')});
 render();
}

function init(){renderProducts();renderBag();renderWishlist();renderCampaigns();updateCounts();bindEvents();initShowUpgrade()}
init();

if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {})); }
