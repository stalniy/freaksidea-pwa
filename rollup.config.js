import fs from 'fs';
import babel from 'rollup-plugin-babel';
import url from '@rollup/plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy';
import html from './tools/rollup-plugin-index-html';
import contentSummary from './tools/rollup-plugin-summary';
import legacy from './tools/rollup-plugin-legacy';
import { ArticleSummarizer, pageAlias } from './tools/summarizer/ArticleSummarizer';

const env = (name, plugins) => {
  return process.env.NODE_ENV === name ? plugins : [];
};
const minify = terser({
  mangle: {
    properties: {
      reserved: [
        '_classProperties'
      ],
      regex: /^_/
    }
  }
});
const SUPPORTED_LANGS = ['ru', 'en', 'uk'];

export default {
  input: 'src/app.js',
  output: {
    format: 'es',
    dir: 'dist',
    sourcemap: true,
    entryFileNames: process.env.NODE_ENV === 'production'
      ? '[name].[hash].js'
      : '[name].js',
    plugins: [
      ...env('production', [
        legacy({
          polyfills: [
            'core-js/modules/es.array.find',
            'core-js/modules/es.array.from',
            'core-js/modules/es.array.includes',
            'core-js/modules/es.object.assign',
            'core-js/modules/es.object.entries',
            'core-js/modules/es.promise',
            'core-js/modules/es.string.includes',
            'core-js/modules/es.string.starts-with',
            'core-js/modules/es.string.ends-with',
            'core-js/modules/es.weak-set',
            'core-js/modules/es.reflect.construct',
            'ie11-custom-properties',
            'regenerator-runtime/runtime',
          ],
          plugins: [
            minify,
            copy({
              targets: [
                { src: 'node_modules/@webcomponents/webcomponentsjs', dest: 'dist/legacy/' }
              ]
            }),
          ]
        }),
        minify,
      ]),
    ]
  },
  plugins: [
    ...env('production', [minifyHTML()]),
    url(),
    resolve(),
    babel({
      rootMode: 'upward',
      include: [
        'src/**/*.js',
        'node_modules/lit-element/**/*.js'
      ],
      caller: {
        output: 'es'
      },
    }),
    commonjs(),
    copy({
      copyOnce: process.env.NODE_ENV !== 'production',
      flatten: false,
      targets: [
        { src: ['public/**/*', '!public/index.html'], dest: 'dist/assets' }
      ]
    }),
    contentSummary({
      matches: /\.pages$/,
      langs: SUPPORTED_LANGS
    }),
    contentSummary({
      langs: SUPPORTED_LANGS,
      Summarizer: ArticleSummarizer,
      pageId: pageAlias,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.ARTICLES_PER_PAGE': 10,
      'process.env.APP_LANGS': JSON.stringify(SUPPORTED_LANGS),
    }),
    html({
      includeLegacy: process.env.NODE_ENV === 'production',
      template: './public/index.html',
      assets: {
        head: process.env.NODE_ENV === 'production'
          ? [
              { src: '/legacy/webcomponentsjs/webcomponents-loader.js', attrs: 'nomodule' },
              { src: '/legacy/webcomponentsjs/custom-elements-es5-adapter.js', attrs: 'nomodule' }
            ]
          : []
      }
    }),
  ]
};
