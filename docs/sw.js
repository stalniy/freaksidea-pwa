if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let r=Promise.resolve();return s[e]||(r=new Promise(async r=>{if("document"in self){const s=document.createElement("script");s.src=e,document.head.appendChild(s),s.onload=r}else importScripts(e),r()})),r.then(()=>{if(!s[e])throw new Error(`Module ${e} didn’t register its module`);return s[e]})},r=(r,s)=>{Promise.all(r.map(e)).then(e=>s(1===e.length?e[0]:e))},s={require:Promise.resolve(r)};self.define=(r,i,n)=>{s[r]||(s[r]=Promise.resolve().then(()=>{let s={};const a={uri:location.origin+r.slice(1)};return Promise.all(i.map(r=>{switch(r){case"exports":return s;case"module":return a;default:return e(r)}})).then(e=>{const r=n(...e);return s.default||(s.default=r),s})}))}}define("./sw.js",["./workbox-921a9a14"],(function(e){"use strict";self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),e.precacheAndRoute([{url:"/assets/content_articles_summaries.ru.ec3ee6a2.json",revision:"b5b1cdbc0e5b8e487bf289491d31363d"},{url:"/img/header-1024w.jpg",revision:"a3afa8e3ee95282bfc0ef5d075b68d4f"},{url:"/img/header-375w.jpg",revision:"818f50303c71d682a4a35f0dfb245441"},{url:"/img/header-768w.jpg",revision:"c5d17daab6928f53989dcaa69293fa62"},{url:"/img/header.jpg",revision:"701dd04d3f46fbc16d04396010c4a22e"},{url:"/manifest.json",revision:"9c080c0b0db87bde8c0ae97dab2b0330"},{url:"/index.html",revision:"696ab5812110ce2557937568581bb764"},{url:"/bootstrap.43caac6b.js",revision:"a8d86347d7cc1493fe1f2f1613783eca"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("/index.html"))),e.registerRoute(/\/media\/assets\//,new e.StaleWhileRevalidate({cacheName:"images",plugins:[new e.ExpirationPlugin({maxEntries:150,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\/@webcomponents\//,new e.CacheFirst({cacheName:"polyfills",plugins:[]}),"GET")}));
//# sourceMappingURL=sw.js.map
