try{self["workbox:core:5.1.3"]&&_()}catch(e){}const e=(e,...s)=>{let t=e;return s.length>0&&(t+=" :: "+JSON.stringify(s)),t};class s extends Error{constructor(s,t){super(e(s,t)),this.name=s,this.details=t}}try{self["workbox:routing:5.1.3"]&&_()}catch(e){}const t=e=>e&&"object"==typeof e?e:{handle:e};class a{constructor(e,s,a="GET"){this.handler=t(s),this.match=e,this.method=a}}class n extends a{constructor(e,s,t){super(({url:s})=>{const t=e.exec(s.href);if(t&&(s.origin===location.origin||0===t.index))return t.slice(1)},s,t)}}const i=e=>new URL(String(e),location.href).href.replace(new RegExp("^"+location.origin),"");class c{constructor(){this.s=new Map}get routes(){return this.s}addFetchListener(){self.addEventListener("fetch",e=>{const{request:s}=e,t=this.handleRequest({request:s,event:e});t&&e.respondWith(t)})}addCacheListener(){self.addEventListener("message",e=>{if(e.data&&"CACHE_URLS"===e.data.type){const{payload:s}=e.data,t=Promise.all(s.urlsToCache.map(e=>{"string"==typeof e&&(e=[e]);const s=new Request(...e);return this.handleRequest({request:s})}));e.waitUntil(t),e.ports&&e.ports[0]&&t.then(()=>e.ports[0].postMessage(!0))}})}handleRequest({request:e,event:s}){const t=new URL(e.url,location.href);if(!t.protocol.startsWith("http"))return;const{params:a,route:n}=this.findMatchingRoute({url:t,request:e,event:s});let i,c=n&&n.handler;if(!c&&this.t&&(c=this.t),c){try{i=c.handle({url:t,request:e,event:s,params:a})}catch(e){i=Promise.reject(e)}return i instanceof Promise&&this.i&&(i=i.catch(a=>this.i.handle({url:t,request:e,event:s}))),i}}findMatchingRoute({url:e,request:s,event:t}){const a=this.s.get(s.method)||[];for(const n of a){let a;const i=n.match({url:e,request:s,event:t});if(i)return a=i,(Array.isArray(i)&&0===i.length||i.constructor===Object&&0===Object.keys(i).length||"boolean"==typeof i)&&(a=void 0),{route:n,params:a}}return{}}setDefaultHandler(e){this.t=t(e)}setCatchHandler(e){this.i=t(e)}registerRoute(e){this.s.has(e.method)||this.s.set(e.method,[]),this.s.get(e.method).push(e)}unregisterRoute(e){if(!this.s.has(e.method))throw new s("unregister-route-but-not-found-with-method",{method:e.method});const t=this.s.get(e.method).indexOf(e);if(!(t>-1))throw new s("unregister-route-route-not-registered");this.s.get(e.method).splice(t,1)}}let r;const o=()=>(r||(r=new c,r.addFetchListener(),r.addCacheListener()),r);function f(e,t,i){let c;if("string"==typeof e){const s=new URL(e,location.href);c=new a(({url:e})=>e.href===s.href,t,i)}else if(e instanceof RegExp)c=new n(e,t,i);else if("function"==typeof e)c=new a(e,t,i);else{if(!(e instanceof a))throw new s("unsupported-route-type",{moduleName:"workbox-routing",funcName:"registerRoute",paramName:"capture"});c=e}return o().registerRoute(c),c}const u={googleAnalytics:"googleAnalytics",precache:"precache-v2",prefix:"workbox",runtime:"runtime",suffix:"undefined"!=typeof registration?registration.scope:""},d=e=>[u.prefix,e,u.suffix].filter(e=>e&&e.length>0).join("-"),l=e=>e||d(u.precache),h=e=>e||d(u.runtime);function b(e){e.then(()=>{})}const w=new Set;class v{constructor(e,s,{onupgradeneeded:t,onversionchange:a}={}){this.o=null,this.u=e,this.l=s,this.h=t,this.v=a||(()=>this.close())}get db(){return this.o}async open(){if(!this.o)return this.o=await new Promise((e,s)=>{let t=!1;setTimeout(()=>{t=!0,s(new Error("The open request was blocked and timed out"))},this.OPEN_TIMEOUT);const a=indexedDB.open(this.u,this.l);a.onerror=()=>s(a.error),a.onupgradeneeded=e=>{t?(a.transaction.abort(),a.result.close()):"function"==typeof this.h&&this.h(e)},a.onsuccess=()=>{const s=a.result;t?s.close():(s.onversionchange=this.v.bind(this),e(s))}}),this}async getKey(e,s){return(await this.getAllKeys(e,s,1))[0]}async getAll(e,s,t){return await this.getAllMatching(e,{query:s,count:t})}async getAllKeys(e,s,t){return(await this.getAllMatching(e,{query:s,count:t,includeKeys:!0})).map(e=>e.key)}async getAllMatching(e,{index:s,query:t=null,direction:a="next",count:n,includeKeys:i=!1}={}){return await this.transaction([e],"readonly",(c,r)=>{const o=c.objectStore(e),f=s?o.index(s):o,u=[],d=f.openCursor(t,a);d.onsuccess=()=>{const e=d.result;e?(u.push(i?e:e.value),n&&u.length>=n?r(u):e.continue()):r(u)}})}async transaction(e,s,t){return await this.open(),await new Promise((a,n)=>{const i=this.o.transaction(e,s);i.onabort=()=>n(i.error),i.oncomplete=()=>a(),t(i,e=>a(e))})}async p(e,s,t,...a){return await this.transaction([s],t,(t,n)=>{const i=t.objectStore(s),c=i[e].apply(i,a);c.onsuccess=()=>n(c.result)})}close(){this.o&&(this.o.close(),this.o=null)}}v.prototype.OPEN_TIMEOUT=2e3;const p={readonly:["get","count","getKey","getAll","getAllKeys"],readwrite:["add","put","clear","delete"]};for(const[e,s]of Object.entries(p))for(const t of s)t in IDBObjectStore.prototype&&(v.prototype[t]=async function(s,...a){return await this.p(t,s,e,...a)});try{self["workbox:expiration:5.1.3"]&&_()}catch(e){}const y=e=>{const s=new URL(e,location.href);return s.hash="",s.href};class j{constructor(e){this.j=e,this.o=new v("workbox-expiration",1,{onupgradeneeded:e=>this.g(e)})}g(e){const s=e.target.result.createObjectStore("cache-entries",{keyPath:"id"});s.createIndex("cacheName","cacheName",{unique:!1}),s.createIndex("timestamp","timestamp",{unique:!1}),(async e=>{await new Promise((s,t)=>{const a=indexedDB.deleteDatabase(e);a.onerror=()=>{t(a.error)},a.onblocked=()=>{t(new Error("Delete blocked"))},a.onsuccess=()=>{s()}})})(this.j)}async setTimestamp(e,s){const t={url:e=y(e),timestamp:s,cacheName:this.j,id:this.m(e)};await this.o.put("cache-entries",t)}async getTimestamp(e){return(await this.o.get("cache-entries",this.m(e))).timestamp}async expireEntries(e,s){const t=await this.o.transaction("cache-entries","readwrite",(t,a)=>{const n=t.objectStore("cache-entries").index("timestamp").openCursor(null,"prev"),i=[];let c=0;n.onsuccess=()=>{const t=n.result;if(t){const a=t.value;a.cacheName===this.j&&(e&&a.timestamp<e||s&&c>=s?i.push(t.value):c++),t.continue()}else a(i)}}),a=[];for(const e of t)await this.o.delete("cache-entries",e.id),a.push(e.url);return a}m(e){return this.j+"|"+y(e)}}class g{constructor(e,s={}){this.q=!1,this.R=!1,this.U=s.maxEntries,this._=s.maxAgeSeconds,this.j=e,this.L=new j(e)}async expireEntries(){if(this.q)return void(this.R=!0);this.q=!0;const e=this._?Date.now()-1e3*this._:0,s=await this.L.expireEntries(e,this.U),t=await self.caches.open(this.j);for(const e of s)await t.delete(e);this.q=!1,this.R&&(this.R=!1,b(this.expireEntries()))}async updateTimestamp(e){await this.L.setTimestamp(e,Date.now())}async isURLExpired(e){if(this._){return await this.L.getTimestamp(e)<Date.now()-1e3*this._}return!1}async delete(){this.R=!1,await this.L.expireEntries(1/0)}}const m=(e,s)=>e.filter(e=>s in e),q=async({request:e,mode:s,plugins:t=[]})=>{const a=m(t,"cacheKeyWillBeUsed");let n=e;for(const e of a)n=await e.cacheKeyWillBeUsed.call(e,{mode:s,request:n}),"string"==typeof n&&(n=new Request(n));return n},R=async({cacheName:e,request:s,event:t,matchOptions:a,plugins:n=[]})=>{const i=await self.caches.open(e),c=await q({plugins:n,request:s,mode:"read"});let r=await i.match(c,a);for(const s of n)if("cachedResponseWillBeUsed"in s){const n=s.cachedResponseWillBeUsed;r=await n.call(s,{cacheName:e,event:t,matchOptions:a,cachedResponse:r,request:c})}return r},U=async({cacheName:e,request:t,response:a,event:n,plugins:c=[],matchOptions:r})=>{const o=await q({plugins:c,request:t,mode:"write"});if(!a)throw new s("cache-put-with-no-response",{url:i(o.url)});const f=await(async({request:e,response:s,event:t,plugins:a=[]})=>{let n=s,i=!1;for(const s of a)if("cacheWillUpdate"in s){i=!0;const a=s.cacheWillUpdate;if(n=await a.call(s,{request:e,response:n,event:t}),!n)break}return i||(n=n&&200===n.status?n:void 0),n||null})({event:n,plugins:c,response:a,request:o});if(!f)return;const u=await self.caches.open(e),d=m(c,"cacheDidUpdate"),l=d.length>0?await R({cacheName:e,matchOptions:r,request:o}):null;try{await u.put(o,f)}catch(e){throw"QuotaExceededError"===e.name&&await async function(){for(const e of w)await e()}(),e}for(const s of d)await s.cacheDidUpdate.call(s,{cacheName:e,event:n,oldResponse:l,newResponse:f,request:o})},x=R,L=async({request:e,fetchOptions:t,event:a,plugins:n=[]})=>{if("string"==typeof e&&(e=new Request(e)),a instanceof FetchEvent&&a.preloadResponse){const e=await a.preloadResponse;if(e)return e}const i=m(n,"fetchDidFail"),c=i.length>0?e.clone():null;try{for(const s of n)if("requestWillFetch"in s){const t=s.requestWillFetch,n=e.clone();e=await t.call(s,{request:n,event:a})}}catch(e){throw new s("plugin-error-request-will-fetch",{thrownError:e})}const r=e.clone();try{let s;s="navigate"===e.mode?await fetch(e):await fetch(e,t);for(const e of n)"fetchDidSucceed"in e&&(s=await e.fetchDidSucceed.call(e,{event:a,request:r,response:s}));return s}catch(e){for(const s of i)await s.fetchDidFail.call(s,{error:e,event:a,originalRequest:c.clone(),request:r.clone()});throw e}};try{self["workbox:strategies:5.1.3"]&&_()}catch(e){}const N={cacheWillUpdate:async({response:e})=>200===e.status||0===e.status?e:null};let E;async function K(e,s){const t=e.clone(),a={headers:new Headers(t.headers),status:t.status,statusText:t.statusText},n=s?s(a):a,i=function(){if(void 0===E){const e=new Response("");if("body"in e)try{new Response(e.body),E=!0}catch(e){E=!1}E=!1}return E}()?t.body:await t.blob();return new Response(i,n)}try{self["workbox:precaching:5.1.3"]&&_()}catch(e){}function O(e){if(!e)throw new s("add-to-cache-list-unexpected-type",{entry:e});if("string"==typeof e){const s=new URL(e,location.href);return{cacheKey:s.href,url:s.href}}const{revision:t,url:a}=e;if(!a)throw new s("add-to-cache-list-unexpected-type",{entry:e});if(!t){const e=new URL(a,location.href);return{cacheKey:e.href,url:e.href}}const n=new URL(a,location.href),i=new URL(a,location.href);return n.searchParams.set("__WB_REVISION__",t),{cacheKey:n.href,url:i.href}}class M{constructor(e){this.j=l(e),this.N=new Map,this.K=new Map,this.O=new Map}addToCacheList(e){const t=[];for(const a of e){"string"==typeof a?t.push(a):a&&void 0===a.revision&&t.push(a.url);const{cacheKey:e,url:n}=O(a),i="string"!=typeof a&&a.revision?"reload":"default";if(this.N.has(n)&&this.N.get(n)!==e)throw new s("add-to-cache-list-conflicting-entries",{firstEntry:this.N.get(n),secondEntry:e});if("string"!=typeof a&&a.integrity){if(this.O.has(e)&&this.O.get(e)!==a.integrity)throw new s("add-to-cache-list-conflicting-integrities",{url:n});this.O.set(e,a.integrity)}if(this.N.set(n,e),this.K.set(n,i),t.length>0){const e=`Workbox is precaching URLs without revision info: ${t.join(", ")}\nThis is generally NOT safe. Learn more at https://bit.ly/wb-precache`;console.warn(e)}}}async install({event:e,plugins:s}={}){const t=[],a=[],n=await self.caches.open(this.j),i=await n.keys(),c=new Set(i.map(e=>e.url));for(const[e,s]of this.N)c.has(s)?a.push(e):t.push({cacheKey:s,url:e});const r=t.map(({cacheKey:t,url:a})=>{const n=this.O.get(t),i=this.K.get(a);return this.M({cacheKey:t,cacheMode:i,event:e,integrity:n,plugins:s,url:a})});await Promise.all(r);return{updatedURLs:t.map(e=>e.url),notUpdatedURLs:a}}async activate(){const e=await self.caches.open(this.j),s=await e.keys(),t=new Set(this.N.values()),a=[];for(const n of s)t.has(n.url)||(await e.delete(n),a.push(n.url));return{deletedURLs:a}}async M({cacheKey:e,url:t,cacheMode:a,event:n,plugins:i,integrity:c}){const r=new Request(t,{integrity:c,cache:a,credentials:"same-origin"});let o,f=await L({event:n,plugins:i,request:r});for(const e of i||[])"cacheWillUpdate"in e&&(o=e);if(!(o?await o.cacheWillUpdate({event:n,request:r,response:f}):f.status<400))throw new s("bad-precaching-response",{url:t,status:f.status});f.redirected&&(f=await K(f)),await U({event:n,plugins:i,response:f,request:e===t?r:new Request(e),cacheName:this.j,matchOptions:{ignoreSearch:!0}})}getURLsToCacheKeys(){return this.N}getCachedURLs(){return[...this.N.keys()]}getCacheKeyForURL(e){const s=new URL(e,location.href);return this.N.get(s.href)}async matchPrecache(e){const s=e instanceof Request?e.url:e,t=this.getCacheKeyForURL(s);if(t){return(await self.caches.open(this.j)).match(t)}}createHandler(e=!0){return async({request:t})=>{try{const e=await this.matchPrecache(t);if(e)return e;throw new s("missing-precache-entry",{cacheName:this.j,url:t instanceof Request?t.url:t})}catch(s){if(e)return fetch(t);throw s}}}createHandlerBoundToURL(e,t=!0){if(!this.getCacheKeyForURL(e))throw new s("non-precached-url",{url:e});const a=this.createHandler(t),n=new Request(e);return()=>a({request:n})}}let T;const D=()=>(T||(T=new M),T);const P=(e,s)=>{const t=D().getURLsToCacheKeys();for(const a of function*(e,{ignoreURLParametersMatching:s,directoryIndex:t,cleanURLs:a,urlManipulation:n}={}){const i=new URL(e,location.href);i.hash="",yield i.href;const c=function(e,s=[]){for(const t of[...e.searchParams.keys()])s.some(e=>e.test(t))&&e.searchParams.delete(t);return e}(i,s);if(yield c.href,t&&c.pathname.endsWith("/")){const e=new URL(c.href);e.pathname+=t,yield e.href}if(a){const e=new URL(c.href);e.pathname+=".html",yield e.href}if(n){const e=n({url:i});for(const s of e)yield s.href}}(e,s)){const e=t.get(a);if(e)return e}};let I=!1;function k(e){I||((({ignoreURLParametersMatching:e=[/^utm_/],directoryIndex:s="index.html",cleanURLs:t=!0,urlManipulation:a}={})=>{const n=l();self.addEventListener("fetch",i=>{const c=P(i.request.url,{cleanURLs:t,directoryIndex:s,ignoreURLParametersMatching:e,urlManipulation:a});if(!c)return;let r=self.caches.open(n).then(e=>e.match(c)).then(e=>e||fetch(c));i.respondWith(r)})})(e),I=!0)}const A=[],C={get:()=>A,add(e){A.push(...e)}},S=e=>{const s=D(),t=C.get();e.waitUntil(s.install({event:e,plugins:t}).catch(e=>{throw e}))},W=e=>{const s=D();e.waitUntil(s.activate())};var F,B;self.addEventListener("message",e=>{e.data&&"SKIP_WAITING"===e.data.type&&self.skipWaiting()}),F={},function(e){D().addToCacheList(e),e.length>0&&(self.addEventListener("install",S),self.addEventListener("activate",W))}([{url:"/assets/a.005e75c3.json",revision:"c808906e306af846bc2f0074e61694d0"},{url:"/assets/a.00defcdf.json",revision:"80af61a8e15e8591c12f9997bf71a7f5"},{url:"/assets/a.04150196.json",revision:"81ce50c526d67bd079aa0c5eee4539f8"},{url:"/assets/a.06648030.json",revision:"c012229726ec6beaa3fb533254811f12"},{url:"/assets/a.0ad8a2bd.json",revision:"ede190f57f1a2b01597d8e28a0d3d6e7"},{url:"/assets/a.0d2e9c61.json",revision:"5143b986f843ac302b78d974893a7edd"},{url:"/assets/a.0f4579f2.json",revision:"865aeda124415c3ad26b61525df0ca87"},{url:"/assets/a.17846533.json",revision:"4c796d7b9a85e9a1c6941c82e5ee281f"},{url:"/assets/a.1796c4a3.json",revision:"9ab784acc9da82465b90642fa79b311d"},{url:"/assets/a.1d86439e.json",revision:"00621209ef411dde2653453fc8b1141a"},{url:"/assets/a.24aafe16.json",revision:"c7ae9fc55a7995c255deec4e6d874f78"},{url:"/assets/a.290eca19.json",revision:"c3570816ca6324d5be32f54abd1bfc9a"},{url:"/assets/a.2b6190b5.json",revision:"99146353cf4224b936257af62713e016"},{url:"/assets/a.2d079df5.json",revision:"644474548df0950f369a5796aedd306c"},{url:"/assets/a.2dc5df57.json",revision:"0a35e68d993a51855ae47cd8820dfa65"},{url:"/assets/a.2fbe7521.json",revision:"cb8d765b7199ddbec557ef6737c09da4"},{url:"/assets/a.3a15174d.json",revision:"38254fd5ff91822fc09e5e2c3abcf051"},{url:"/assets/a.3b0c4b57.json",revision:"f596f12878920c8852c6dac36c98f165"},{url:"/assets/a.3d665ce8.json",revision:"e200e415bd4c7f6b4ae64fa1115e64ac"},{url:"/assets/a.3f261a18.json",revision:"2438a237bee897fe0354f074b664447c"},{url:"/assets/a.40237c28.json",revision:"7a41371690fd167a5e44d6aff83b3b62"},{url:"/assets/a.43018428.json",revision:"cac4a735ef43b4997267350cc02afc1f"},{url:"/assets/a.44239297.json",revision:"02bb3191282f445a106102a29dc12be1"},{url:"/assets/a.45cfadb1.json",revision:"417c9a81b9af82d78787f2111a2bfd3f"},{url:"/assets/a.4a1f6665.json",revision:"2fcdd9ed5b72ecab889a34e4d87cc9e5"},{url:"/assets/a.4f8a2259.json",revision:"4434d99fc4fbfafa28dfb111d5cb856a"},{url:"/assets/a.541f1004.json",revision:"d6a1822219fc41c657351e253b8ddf3b"},{url:"/assets/a.54ec41eb.json",revision:"59f63e16a1fd7b05fdd3e0ad4fd1a63a"},{url:"/assets/a.57690356.json",revision:"dc08be0e25b14906064d3ad000befc95"},{url:"/assets/a.5a85f869.json",revision:"8da46029eaa620a938ef0ffe6d229fc5"},{url:"/assets/a.5c88c0de.json",revision:"211e8847f6cb136739ecf6b3841e89b3"},{url:"/assets/a.5cae1237.json",revision:"01f1e1626e03cd69e41152bf00d4e913"},{url:"/assets/a.5e90cbcb.json",revision:"a616d3a14e4fad6d63ad209f69c375a6"},{url:"/assets/a.5ee4e78f.json",revision:"d9d95bb77f866492e70c29eb92426e5e"},{url:"/assets/a.5f9af09f.json",revision:"431ee3f897dc38c5dd9faf4cd015f4d6"},{url:"/assets/a.647acbfc.json",revision:"3167d1ed6f76f0e788a4affb2c77e344"},{url:"/assets/a.6486d045.json",revision:"13e479805934d3034482dbd7b313e9b2"},{url:"/assets/a.6595756e.json",revision:"50556399fbfa21d310e26c868b278593"},{url:"/assets/a.65ca446f.json",revision:"35b7d1c932173905bc715eeec0847c2a"},{url:"/assets/a.66ae6fb9.json",revision:"e799f994a0fed976046cfa43b272e56a"},{url:"/assets/a.675be9b7.json",revision:"cd2a08a279f615a2fb92272feacc80d4"},{url:"/assets/a.6ca42622.json",revision:"3e2fcbf2281088eb0dded4e242445862"},{url:"/assets/a.6e6d982b.json",revision:"ad946a19101ab99ee214cc025f7d1114"},{url:"/assets/a.76638a2f.json",revision:"c3dcba168cf6a6853d3dcc34f0384ab6"},{url:"/assets/a.7877c7ec.json",revision:"24f0ce75198622375e534cecd3ba6262"},{url:"/assets/a.7a4e290b.json",revision:"f4b318ebc9d79f848f55cff26fa4c56f"},{url:"/assets/a.7ea1ca2d.json",revision:"8d1e97a281b648ef5ee894bb7ce7506f"},{url:"/assets/a.7f3d8d5c.json",revision:"181447fafa2f79910422267687b70cdf"},{url:"/assets/a.82a0e2a4.json",revision:"63ca2f13bcf3e0693a6b6c1827e70ddb"},{url:"/assets/a.8414ee94.json",revision:"9384a0fe90057b788b4a45e781f70b28"},{url:"/assets/a.85bcacda.json",revision:"a47be165b81c8c5f08db9a935c45c592"},{url:"/assets/a.89d9d021.json",revision:"240d0c83de12029f7eab0adab81f0b5f"},{url:"/assets/a.8ac2ad53.json",revision:"436b099494251031353c8182bf5f8817"},{url:"/assets/a.8e2dc85e.json",revision:"e866f94675691c89b91ca1720ec43f0b"},{url:"/assets/a.8fc49340.json",revision:"4c01dc2276bfbc436972d3fd7220260f"},{url:"/assets/a.91c1f503.json",revision:"c6aa9eec05052c846b09f92c4d0ce3f3"},{url:"/assets/a.922a29e7.json",revision:"d52167c9567aed78e590278aeeebef4d"},{url:"/assets/a.925cccd2.json",revision:"c3efb0e718ba1682d337c7e9d3f2bc7c"},{url:"/assets/a.92e0d50f.json",revision:"9a11cd771670d4c4b5b170ab63e68d92"},{url:"/assets/a.95159685.json",revision:"fdb477ba47d6501699e1a66e2cfb4db2"},{url:"/assets/a.97da7f13.json",revision:"681cb23d0e73db4309a7c550ceefe6f4"},{url:"/assets/a.9a8a66d4.json",revision:"c377d2bc98457494245f2cf3841a43a3"},{url:"/assets/a.9ea91265.json",revision:"4b826213ab445736efafedc6a4ce6137"},{url:"/assets/a.a8ab8840.json",revision:"8371a9e0f799006592ae92f188174fdc"},{url:"/assets/a.ad7c885a.json",revision:"fe3c71403740152d52b1a759babad05f"},{url:"/assets/a.adefe28e.json",revision:"2bf89e534e4e593c291e80bd2003c35b"},{url:"/assets/a.af055534.json",revision:"d4a5b04be56ec6f65c49bc5ba0b28f08"},{url:"/assets/a.b0eeae47.json",revision:"ca0b4f83e16c33c56ab6669cadbadde6"},{url:"/assets/a.b1615cc0.json",revision:"b42b5a44b259e64000c60b5a2c599cbc"},{url:"/assets/a.b41f14ba.json",revision:"3bb1835075ac8433d4ac31397deab946"},{url:"/assets/a.b7d13d9c.json",revision:"664eac78efd222ceaaea894933c3854b"},{url:"/assets/a.bbcf7ea4.json",revision:"170ad6e6c0eb83c158103f0c72b560e2"},{url:"/assets/a.c07df2a7.json",revision:"d850bd3fd1975ccb935fc090fba282d4"},{url:"/assets/a.c1be9c6c.json",revision:"89936924b8f94ff3ba20106980416f3c"},{url:"/assets/a.c4e6c91d.json",revision:"02a1bd03c34858708670e389d878a3c4"},{url:"/assets/a.c64f3ec5.json",revision:"f3fddd16b6d79c380b503238288a85d8"},{url:"/assets/a.c8b14b3a.json",revision:"d6d6312c259ffdc379fbff093dc9e5cf"},{url:"/assets/a.c8d07a35.json",revision:"323459509603d3d9ca879037dd87ff06"},{url:"/assets/a.caabb8e0.json",revision:"026f38671e240680e14a913001dcd08f"},{url:"/assets/a.cc70cd06.json",revision:"55d94a7102bc689f4780307a5c46bbc5"},{url:"/assets/a.cf7d0274.json",revision:"3ce5ac32256f37d9f30325b23950dc1e"},{url:"/assets/a.d558e4f0.json",revision:"3b24f4d5f239602032f1a49848703423"},{url:"/assets/a.d9f4eec5.json",revision:"4dc1ed91c49014f57a272192eeb65f30"},{url:"/assets/a.e158cf83.json",revision:"17ad78568bb33a114e21554139ba846f"},{url:"/assets/a.e1e69658.json",revision:"2988bb1854880851c95ade2432eef4ef"},{url:"/assets/a.e5054cbd.json",revision:"b1ef483725d80fe3d62344a908c4fb15"},{url:"/assets/a.edc6cf8d.json",revision:"bed0dace7711d4c8ff19582fdbdedf85"},{url:"/assets/a.f41f8393.json",revision:"d6891b26e91e4be7035791fa86e6d1b7"},{url:"/assets/a.f9470c83.json",revision:"5b4fc45b4e125a39f2602a2fb05d4fc8"},{url:"/assets/a.fcc80774.json",revision:"37d758be0ef0ca03004322204bc56980"},{url:"/assets/a.fec35471.json",revision:"e4ee947575411ae56c84802139d33be9"},{url:"/assets/a.fefa8cb9.json",revision:"6f8f36f803f9867b445db6dead53767d"},{url:"/assets/content_articles_searchIndexes.ru.fe443381.json",revision:"5e8ed9b702c898a135ac23ab87eea027"},{url:"/assets/content_articles_summaries.ru.74d46981.json",revision:"ee8419b05e08a711ab10c4db055baf5d"},{url:"/assets/content_pages_searchIndexes.ru.df5dbfcf.json",revision:"c0ccc67d48f68c93e079c2573065dfb7"},{url:"/assets/content_pages_searchIndexes.uk.77a01d60.json",revision:"c8b42f8f9bd61dc616b3abfd9ff9390e"},{url:"/assets/content_pages_summaries.ru.82572e45.json",revision:"683d57478de69439da560feb26cb87eb"},{url:"/assets/content_pages_summaries.uk.3774ed6e.json",revision:"9ceb488228134f16fabd649159389580"},{url:"/manifest.json",revision:"b3631fd7c3e6caf325402e3ef81d766b"},{url:"/index.html",revision:"5078e90100f1c039157cc2a1ad0d7d62"},{url:"/bootstrap.6be5d6ab.js",revision:"a7fc0a2d56821419248ccaa6e32cb63d"},{url:"/index.js",revision:"ecb38c13623ef4aa26bebaf8127953e4"}]),k(F),self.addEventListener("activate",e=>{const s=l();e.waitUntil((async(e,s="-precache-")=>{const t=(await self.caches.keys()).filter(t=>t.includes(s)&&t.includes(self.registration.scope)&&t!==e);return await Promise.all(t.map(e=>self.caches.delete(e))),t})(s).then(e=>{}))}),f(new class extends a{constructor(e,{allowlist:s=[/./],denylist:t=[]}={}){super(e=>this.T(e),e),this.D=s,this.P=t}T({url:e,request:s}){if(s&&"navigate"!==s.mode)return!1;const t=e.pathname+e.search;for(const e of this.P)if(e.test(t))return!1;return!!this.D.some(e=>e.test(t))}}((B="/index.html",D().createHandlerBoundToURL(B)))),f(/\/images\//,new class{constructor(e={}){if(this.j=h(e.cacheName),this.I=e.plugins||[],e.plugins){const s=e.plugins.some(e=>!!e.cacheWillUpdate);this.I=s?e.plugins:[N,...e.plugins]}else this.I=[N];this.k=e.fetchOptions,this.A=e.matchOptions}async handle({event:e,request:t}){"string"==typeof t&&(t=new Request(t));const a=this.C({request:t,event:e});let n,i=await x({cacheName:this.j,request:t,event:e,matchOptions:this.A,plugins:this.I});if(i){if(e)try{e.waitUntil(a)}catch(n){}}else try{i=await a}catch(e){n=e}if(!i)throw new s("no-response",{url:t.url,error:n});return i}async C({request:e,event:s}){const t=await L({request:e,event:s,fetchOptions:this.k,plugins:this.I}),a=U({cacheName:this.j,request:e,response:t.clone(),event:s,plugins:this.I});if(s)try{s.waitUntil(a)}catch(e){}return t}}({cacheName:"images",plugins:[new class{constructor(e={}){var s;this.cachedResponseWillBeUsed=async({event:e,request:s,cacheName:t,cachedResponse:a})=>{if(!a)return null;const n=this.S(a),i=this.W(t);b(i.expireEntries());const c=i.updateTimestamp(s.url);if(e)try{e.waitUntil(c)}catch(e){}return n?a:null},this.cacheDidUpdate=async({cacheName:e,request:s})=>{const t=this.W(e);await t.updateTimestamp(s.url),await t.expireEntries()},this.F=e,this._=e.maxAgeSeconds,this.B=new Map,e.purgeOnQuotaError&&(s=()=>this.deleteCacheAndMetadata(),w.add(s))}W(e){if(e===h())throw new s("expire-custom-caches-only");let t=this.B.get(e);return t||(t=new g(e,this.F),this.B.set(e,t)),t}S(e){if(!this._)return!0;const s=this.H(e);if(null===s)return!0;return s>=Date.now()-1e3*this._}H(e){if(!e.headers.has("date"))return null;const s=e.headers.get("date"),t=new Date(s).getTime();return isNaN(t)?null:t}async deleteCacheAndMetadata(){for(const[e,s]of this.B)await self.caches.delete(e),await s.delete();this.B=new Map}}({maxEntries:100,purgeOnQuotaError:!0})]}),"GET"),f(/\/@webcomponents\//,new class{constructor(e={}){this.j=h(e.cacheName),this.I=e.plugins||[],this.k=e.fetchOptions,this.A=e.matchOptions}async handle({event:e,request:t}){"string"==typeof t&&(t=new Request(t));let a,n=await x({cacheName:this.j,request:t,event:e,matchOptions:this.A,plugins:this.I});if(!n)try{n=await this.C(t,e)}catch(e){a=e}if(!n)throw new s("no-response",{url:t.url,error:a});return n}async C(e,s){const t=await L({request:e,event:s,fetchOptions:this.k,plugins:this.I}),a=t.clone(),n=U({cacheName:this.j,request:e,response:a,event:s,plugins:this.I});if(s)try{s.waitUntil(n)}catch(e){}return t}}({cacheName:"polyfills",plugins:[]}),"GET");
//# sourceMappingURL=sw.js.map
