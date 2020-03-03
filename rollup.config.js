import fs from 'fs';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import globImport from 'rollup-plugin-glob-import';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { yaml } from 'xyaml-webpack-loader/src/rollup';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy';
import html from './tools/rollup-plugin-index-html';
import contentSummary from './tools/rollup-plugin-summary';
import { ArticleSummarizer, pageAlias } from './tools/summarizer/ArticleSummarizer';

function production(plugin, options) {
  return process.env.NODE_ENV === 'production' ? [plugin(options)] : [];
}

const indexHTML = html({
  dir: 'dist',
  template: fs.readFileSync('./public/index.html', 'utf8')
});

export default {
  input: 'src/app.js',
  output: [
    {
      format: 'es',
      dir: 'dist',
      entryFileNames: process.env.NODE_ENV === 'production'
        ? '[name].[hash].js'
        : '[name].js',
      plugins: [
        ...production(terser),
        indexHTML.addOutput()
      ]
    },
    {
      format: 'system',
      dir: 'dist/legacy',
      entryFileNames: process.env.NODE_ENV === 'production'
        ? '[name].[hash].js'
        : '[name].js',
      plugins: [
        ...production(terser),
        indexHTML.addOutput()
      ]
    }
  ],
  plugins: [
    ...production(minifyHTML),
    url(),
    globImport({
      include: 'src/**/*.js',
      format: 'default',
    }),
    resolve(),
    babel({
      rootMode: 'upward',
      caller: {
        output: 'es'
      },
    }),
    commonjs(),
    yaml({
      namedExports: false,
    }),
    copy({
      copyOnce: true,
      flatten: false,
      targets: [
        { src: ['public/**/*', '!public/index.html'], dest: 'dist/assets' }
      ]
    }),
    contentSummary({
      matches: /\.pages$/,
      langs: ['ru', 'en', 'uk']
    }),
    contentSummary({
      langs: ['ru', 'en', 'uk'],
      summarizer: new ArticleSummarizer(),
      pageId: pageAlias,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    indexHTML
  ]
};
