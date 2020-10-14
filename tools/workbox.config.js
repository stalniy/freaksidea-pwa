const prependBaseUrl = baseUrl => async manifest => ({
  warnings: [],
  manifest: manifest.map((entry) => {
    entry.url = `${baseUrl}/${entry.url}`;
    return entry;
  })
});
const route = (url, handler, options) => ({
  urlPattern: new RegExp(url.replace(/\//g, '\\/')),
  handler,
  options
});

export default (env) => ({
  swDest: `${env.LIT_APP_DIST_FOLDER}/sw.js`,
  cleanupOutdatedCaches: true,
  inlineWorkboxRuntime: false,
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  globDirectory: env.LIT_APP_DIST_FOLDER,
  globPatterns: [
    'assets/content_articles_summaries.*.json',
    'img/*',
    'fonts/*',
    'manifest.json',
    'index.html',
    '*.js',
  ],
  navigateFallback: `${env.LIT_APP_PUBLIC_PATH}/index.html`,
  runtimeCaching: [
    route(`${env.LIT_APP_PUBLIC_PATH}/media/assets/`, 'StaleWhileRevalidate', {
      cacheName: 'images',
      expiration: {
        maxEntries: 150
      }
    }),
    route(`${env.LIT_APP_PUBLIC_PATH}/@webcomponents/`, 'CacheFirst', {
      cacheName: 'polyfills'
    })
  ],
  manifestTransforms: [
    prependBaseUrl(env.LIT_APP_PUBLIC_PATH)
  ]
});
