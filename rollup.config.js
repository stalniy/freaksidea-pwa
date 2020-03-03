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

const envify = (fn) => {
  fn.env = (env, ...args) => {
    return process.env.NODE_ENV === env ? [fn(...args)] : [];
  };
  return fn;
}

const indexHTML = html({
  dir: 'dist',
  template: fs.readFileSync('./public/index.html', 'utf8')
});
const output = envify(({ format, dir }) => ({
  format,
  dir,
  sourcemap: true,
  entryFileNames: process.env.NODE_ENV === 'production'
    ? '[name].[hash].js'
    : '[name].js',
  plugins: [
    ...envify(terser).env('production', {
      mangle: {
        properties: {
          reserved: [
            '_classProperties'
          ],
          regex: /^_/
        }
      }
    }),
    indexHTML.addOutput()
  ]
}));

export default {
  input: 'src/app.js',
  output: [
    output({ format: 'es', dir: 'dist' }),
    ...output.env('production', { format: 'iife', dir: 'dist/legacy' }),
  ],
  plugins: [
    ...envify(minifyHTML).env('production'),
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
      copyOnce: process.env.NODE_ENV !== 'production',
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
      Summarizer: ArticleSummarizer,
      pageId: pageAlias,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.ARTICLES_PER_PAGE': 10,
    }),
    indexHTML
  ]
};
