import { makeHtmlAttributes } from '@rollup/plugin-html';
import { generateCss, generateJs } from 'rollup-plugin-legacy-bundle';
import fs from 'fs';

const globalCSS = fs.readFileSync('./src/styles/global.css', 'utf8');

function includeGA(id) {
  if (!id) {
    return '';
  }

  return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
    </script>
  `.trim();
}

function preload(url, as = 'fetch') {
  return `<link rel="preload" as="${as}" href="${url}" crossorigin="anonymous">`;
}

function includeMeta(meta) {
  return meta.map(attrs => `<meta${makeHtmlAttributes(attrs)}>`)
    .join('\n');
}

function resolve(bundle, prefix) {
  const originalKey = Object.keys(bundle).find(key => key.startsWith(prefix));

  if (!originalKey) {
    console.warn(`Unable to find asset in bundle with prefix "${prefix}"`);
    return '';
  }

  return bundle[originalKey].fileName;
}

export default options => ({ meta, attributes, files, publicPath, title, bundle }) => `
<!DOCTYPE html>
<html${makeHtmlAttributes(attributes.html)}>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">

  ${preload(publicPath + resolve(bundle, 'assets/content_articles_summaries.ru.'))}

  <link rel="icon" href="${publicPath}app-icons/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="${publicPath}app-icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${publicPath}app-icons/favicon-16x16.png">
  <link rel="manifest" href="${publicPath}manifest.json">
  ${includeMeta(meta)}
  <meta property="og:site_name" content="${title}" />
  <link rel="canonical" href="${options.websiteUrl}" />
  <style>${
  globalCSS
    .replace(/~@\//g, publicPath)
    .replace(/[\n\r]+ */g, '')
    .replace(/([:;,]) +/, '$1')
}</style>
  ${generateCss(files.css, { publicPath, attrs: attributes.link })}
</head>
<body>
  <fi-app>
    <ins slot="sidebar.ad"
      class="adsbygoogle"
      style="display:inline-block;width:300px;height:250px"
      data-ad-client="ca-pub-5129274777209544"
      data-ad-slot="8551486343"
    ></ins>
  </fi-app>

  <script src="${publicPath}@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
  <script src="${publicPath}@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js"></script>
  ${generateJs(files.js, { publicPath, attrs: attributes.script, includeSafariFix: true })}
  ${includeGA(options.analyticsId)}
  ${options.sharethis ? `<script async src="${options.sharethis}"></script>` : ''}
  <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</body>
</html>
`.trim();
