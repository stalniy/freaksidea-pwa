import fs from 'fs';
import { promisify } from 'util';
import { parse } from 'xyaml-webpack-loader/rollup';
import { extname, dirname, resolve as resolvePath } from 'path';
import ls from './ls';

const readFile = promisify(fs.readFile);
const generateAssetUrl = id => `import.meta.ROLLUP_ASSET_URL_${id}`;

function serializeRefs(refs, generate = generateAssetUrl) {
  const content = Object.keys(refs)
    .map(key => `"${key}": ${generate(refs[key], key)}`)
    .join(',\n');

  return `{${content}}`;
}

function serializeSummary(rollup, name, summaries) {
  return serializeRefs(summaries, (summary, lang) => {
    return generateAssetUrl(rollup.emitFile({
      type: 'asset',
      name: `${name}.${lang}.json`,
      source: JSON.stringify(summary)
    }));
  });
}

function fileNameId(page, lang, { relativePath, ext }) {
  const index = lang.length + ext.length + 1;
  const id = relativePath.slice(0, -index);

  return id || 'default';
}

let pluginId = 1;

export default (options = {}) => {
  const regex = options.matches || /\.summary$/;
  const KEY = `SUMMARY_${pluginId++}:`;
  const availableLangs = options.langs || ['en'];
  const generatePageId = options.pageId || fileNameId;
  const Summarizer = options.Summarizer;

  return {
    name: 'content-summary',
    resolveId(id, importee) {
      if (regex.test(id)) {
        const ext = extname(id);
        return KEY + resolvePath(dirname(importee), id.slice(0, -ext.length));
      }
    },
    resolveFileUrl({ fileName }) {
      return `'/${fileName}'`;
    },
    async load(id) {
      if (!id.startsWith(KEY)) {
        return;
      }

      const path = id.slice(KEY.length);
      const urls = {};
      const summarizer = Summarizer ? new Summarizer() : null;

      await ls(path, async (file) => {
        const relativePath = file.path.slice(path.length + 1);
        const ext = extname(file.name);
        const langIndex = file.name.slice(0, -ext.length).lastIndexOf('.') + 1;
        const lang = file.name.slice(langIndex, -ext.length);

        if (!availableLangs.includes(lang)) {
          throw new Error(`Invalid lang suffix "${lang}" in ${relativePath}. Possible value: ${availableLangs.join(', ')}`);
        }

        const source = await readFile(file.path, { encoding: 'utf8' });
        const page = parse(source);
        const id = generatePageId(page, lang, { relativePath, file, ext });

        this.addWatchFile(file.path);
        urls[lang] = urls[lang] || {};
        urls[lang][id] = this.emitFile({
          type: 'asset',
          name: 'a.json',
          source: JSON.stringify(page),
        });

        if (summarizer) {
          summarizer.add(page, lang, { relativePath });
        }
      });

      let content = `export const pages = ${serializeRefs(urls, url => serializeRefs(url))};\n`;

      if (summarizer) {
        const name = path.slice(path.indexOf('/src/') + 5).replace(/\W+/g, '_');
        content += `export const summaries = ${serializeSummary(this, name, summarizer.toJSON())};`;
      }

      return content;
    }
  };
};
