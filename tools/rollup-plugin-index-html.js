import { extname } from 'path';
import fs from 'fs';

function generateHTMLForAssets(assets, options) {
  const html = { scripts: '', styles: '' };

  html.scripts += assets.js
    .map(path => `
      <script type="module" src="/${path}"></script>
      ${options.includeLegacy ? `<script nomodule src="/legacy/${path}"></script>` : ''}
    `.trim())
    .join('\n');

  if (assets.css) {
    html.styles += assets.css
      .map(path => `<link rel="stylesheet" type="text/css" href="/${path}"></link>`)
      .join('\n');
  }

  return html;
}

function generateAssets(assets) {
  return assets.map((asset) => {
    switch (extname(asset.src)) {
    case '.js':
      return `<script ${asset.attrs || ''} src="${asset.src}"></script>`;
    case '.css':
      return `<link rel="stylesheet" type="text/css" ${asset.attrs || ''} href="/${asset.src}" /></link>`
    default:
      console.warn(`Unexpected asset extension in ${asset.src}`);
      return '';
    }
  }).join('');
}

function generate(template, options, assets) {
  const { scripts, styles } = generateHTMLForAssets(assets, options);

  Object.keys(options.assets).forEach((placement) => {
    template = template.replace(
      `</${placement}>`,
      generateAssets(options.assets[placement]) + `</${placement}>`
    );
  });

  return template
    .replace(/(<\/body>)/, `${scripts}\n$1`)
    .replace(/(<\/head>)/, `${styles}\n$1`);
}

function getFiles(bundle) {
  const files = Object.values(bundle)
    .filter(file => file.isEntry || file.type === 'asset' || file.isAsset);

  return files.reduce((result, file) => {
    const ext = extname(file.fileName).slice(1);
    result[ext] = (result[ext] || []).concat(file.fileName);
    return result;
  }, {});
};

export default (options = {}) => {
  const template = fs.readFileSync(options.template, 'utf8');
  return {
    name: 'index-html',
    buildStart() {
      this.addWatchFile(options.template);
    },
    generateBundle(_, bundle) {
      this.emitFile({
        type: 'asset',
        source: generate(template, options, getFiles(bundle)),
        name: 'Rollup HTML Asset',
        fileName: 'index.html'
      });
    },
  }
}
