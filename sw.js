const CACHE = "diario-cefaleia-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./dashboard.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function injectDashboard(response){
  const type=response.headers.get("content-type")||"";
  if(!type.includes("text/html")) return response;
  let html=await response.text();
  if(!html.includes("dashboard.js")){
    html=html.replace("</body>", '<script src="./dashboard.js" defer></script>\n</body>');
  }
  const headers=new Headers(response.headers);
  headers.set("content-type","text/html; charset=utf-8");
  return new Response(html,{status:response.status,statusText:response.statusText,headers});
}

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;

  if(e.request.mode === "navigate"){
    e.respondWith((async()=>{
      try{
        const fresh=await fetch(e.request);
        if(fresh.ok){
          const cache=await caches.open(CACHE);
          cache.put("./index.html", fresh.clone()).catch(()=>{});
          return injectDashboard(fresh);
        }
      }catch(_){}
      const cached=await caches.match("./index.html");
      return cached ? injectDashboard(cached) : Response.error();
    })());
    return;
  }

  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy=res.clone();
      caches.open(CACHE).then(c => c.put(e.request,copy)).catch(()=>{});
      return res;
    }))
  );
});
