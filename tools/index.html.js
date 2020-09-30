import { makeHtmlAttributes } from '@rollup/plugin-html';
import { generateCss, generateJs } from 'rollup-plugin-legacy-bundle';
import fs from 'fs';

const globalCSS = fs.readFileSync('./src/styles/global.css', 'utf8');

function includeGA(id) {
  if (!id) {
    return '';
  }

  return `
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-19088556-6"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
    </script>
  `.trim();
}

export default options => ({ attributes, files, publicPath, title }) => `
<!DOCTYPE html>
<html${makeHtmlAttributes(attributes.html)}>
<head>
  <!-- Start Single Page Apps for GitHub Pages -->
  <script>!function(i){if(i.search){var a={};i.search.slice(1).split("&").forEach(function(i){var l=i.split("=");a[l[0]]=l.slice(1).join("=").replace(/~and~/g,"&")}),void 0!==a.p&&window.history.replaceState(null,null,i.pathname.slice(0,-1)+(a.p||"")+(a.q?"?"+a.q:"")+i.hash)}}(window.location);</script>
  <!-- End Single Page Apps for GitHub Pages -->
  ${includeGA(options.analyticsId)}
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1">

  <link rel="apple-touch-icon" sizes="180x180" href="${publicPath}app-icons/apple-touch-icon.png">
  <link rel="icon" href="${publicPath}app-icons/favicon.ico">
  <link rel="icon" type="image/png" sizes="32x32" href="${publicPath}app-icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="${publicPath}app-icons/favicon-16x16.png">
  <link rel="manifest" href="${publicPath}manifest.json">
  <link rel="mask-icon" href="${publicPath}app-icons/safari-pinned-tab.svg" color="#5bbad5">
  <meta name="msapplication-TileColor" content="#ffffff">
  <meta name="theme-color" content="#ffffff">
  <meta name="author" content="Sergii Stotskyi"/>
  <meta name="twitter:site" content="@sergiy_stotskiy">
  <meta name="twitter:creator" content="@sergiy_stotskiy">
  <meta name="twitter:card" content="summary_large_image" />
  <meta property="og:type" content="website" />
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
  ${options.sharethis ? `<script async src="${options.sharethis}"></script>` : ''}
  <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</body>
</html>
`.trim();
