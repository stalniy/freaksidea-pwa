import { extname } from 'path';

function generateHTMLForAssets(manifest) {
  const html = { scripts: '', styles: '' };

  Object.keys(manifest).forEach((format) => {
    const attrs = format === 'es' ? ' type="module"' : ' nomodule';
    const group = manifest[format];

    html.scripts += group.js
      .map(path => `<script${attrs} src="${group.root}/${path}"></script>`)
      .join('\n');

    if (group.css) {
      html.styles += group.css
        .map(path => `<link rel="stylesheet" type="text/css" href="${group.root}/${path}"></script>`)
        .join('\n');
    }
  });

  return html;
}

function generate(template, manifest) {
  const { scripts, styles } = generateHTMLForAssets(manifest);

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

export default function collectAssets(options = {}) {
  let assets = { ...options.assets };

  return {
    name: 'index-html',
    generateBundle(outputOptions) {
      if (options.dir !== outputOptions.dir) {
        return;
      }

      const source = generate(options.template, assets);
      assets = { ...options.assets };

      this.emitFile({
        type: 'asset',
        source,
        name: 'Rollup HTML Asset',
        fileName: 'index.html'
      });
    },
    addOutput() {
      return {
        name: 'html-assets-collector',
        generateBundle(_, bundle) {
          const files = getFiles(bundle);
          const format = options.group || _.format;

          assets[format] = assets[format] || {
            root: _.dir.replace(/^dist/, '')
          };
          const bundleAssets = assets[format];
          Object.keys(files).forEach((key) => {
            bundleAssets[key] = bundleAssets[key] || [];
            bundleAssets[key].push(...files[key]);
          });
        }
      }
    }
  }
}
