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

export default (DEST, PUBLIC_PATH) => ({
  swDest: `${DEST}/sw.js`,
  cleanupOutdatedCaches: true,
  inlineWorkboxRuntime: process.env.NODE_ENV === 'production',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  globDirectory: DEST,
  globPatterns: [
    'assets/*.json',
    'app-icons/*',
    'img/*',
    'fonts/*',
    'manifest.json',
    'index.html',
    '*.js',
    '*.{png,jpeg,jpg,gif}'
  ],
  navigateFallback: `${PUBLIC_PATH}/index.html`,
  runtimeCaching: [
    route(`${PUBLIC_PATH}/media/assets/`, 'StaleWhileRevalidate', {
      cacheName: 'images',
      expiration: {
        maxEntries: 150
      }
    }),
    route(`${PUBLIC_PATH}/@webcomponents/`, 'CacheFirst', {
      cacheName: 'polyfills'
    })
  ],
  manifestTransforms: [
    prependBaseUrl(PUBLIC_PATH)
  ]
});
