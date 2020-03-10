import { makeHtmlAttributes } from '@rollup/plugin-html';
import { generateCss, generateJs } from 'rollup-plugin-legacy-bundle';

export default ({ attributes, files, publicPath, title }) => `
<!DOCTYPE html>
<html${makeHtmlAttributes(attributes.html)}>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      margin: 8px;
      --fi-link-active-color: #39c;
    }

    body,
    a,
    button,
    input  {
      font: normal 15px/21px Verdana, Arial, Helvetica, sans-serif;
    }
  </style>
  ${generateCss(files.css, { publicPath, attrs: attributes.link })}
</head>
<body>
  <fi-app></fi-app>

  <script nomodule src="${publicPath}legacy/webcomponentsjs/webcomponents-loader.js"></script>
  <script nomodule src="${publicPath}legacy/webcomponentsjs/custom-elements-es5-adapter.js"></script>
  ${generateJs(files.js, { publicPath, attrs: attributes.script })}
</body>
</html>
`.trim();
