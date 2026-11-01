const CACHE='innerwear-v5-shell-v2';
const CORE=[
  './','./index.html','./styles.css','./app.js','./data.js',
  './manifest.webmanifest','./icon.svg','./image-placeholder.svg',
  './show-house.html','./show-house.css','./show-house.js',
  './private-feedback.html','./feedback.css','./feedback.js',
  './blacked-luxury-campaign.webp','./her-after-dark.webp',
  './blxcked-boutique-editorial.webp','./private-chemistry-after-dark.webp',
  './backlit-saree-atelier-sketch.webp','./royal-palace-saree.webp',
  './partner-yoga-balance.webp','./show-poster-black-edition.webp',
  './show-poster-sydney-edition.webp','./lingerie-fit-guide.webp'
];
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(async cache=>{
    for(const url of CORE){
      try{const response=await fetch(url,{cache:'reload'});if(response.ok)await cache.put(url,response.clone());}
      catch(error){/* A single optional asset must not prevent the app shell installing. */}
    }
  }).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('innerwear-v5-shell-')&&key!==CACHE).map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    if(cached)return cached;
    try{
      const response=await fetch(request);
      if(response.ok){const cache=await caches.open(CACHE);cache.put(request,response.clone()).catch(()=>{});}
      return response;
    }catch(error){
      if(request.mode==='navigate')return (await caches.match('./index.html'))||Response.error();
      return Response.error();
    }
  })());
});
