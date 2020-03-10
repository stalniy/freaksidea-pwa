import babel from 'rollup-plugin-babel';
import url from '@rollup/plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from 'rollup-plugin-replace';
import copy from 'rollup-plugin-copy';
import { content, pageAlias } from 'rollup-plugin-content';
import { legacyBundle } from 'rollup-plugin-legacy-bundle';
import { parse } from 'xyaml-webpack-loader/parser';
import indexHTML from './tools/index.html';
import * as schema from './tools/contentSchemas';

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
        minify,
      ]),
    ]
  },
  plugins: [
    ...env('production', [
      minifyHTML(),
      legacyBundle({
        format: 'iife',
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
          resolve(),
          commonjs(),
          babel({
            rootMode: 'upward',
            inputSourceMap: true,
            exclude: [
              'node_modules/core-js/**/*.js',
              'node_modules/regenerator-runtime/runtime.js'
            ],
            caller: {
              output: 'es5'
            },
          }),
          minify,
          copy({
            targets: [
              { src: 'node_modules/@webcomponents/webcomponentsjs', dest: 'dist/legacy/' }
            ]
          }),
        ]
      }),
    ]),
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
      copyOnce: true,
      flatten: false,
      targets: [
        { src: 'public/**/*', dest: 'dist' }
      ]
    }),
    content({
      matches: /\.pages$/,
      langs: SUPPORTED_LANGS,
      summarizer: false,
      pageSchema: false,
      parse
    }),
    content({
      langs: SUPPORTED_LANGS,
      pageId: pageAlias,
      pageSchema: schema.article,
      parse,
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.ARTICLES_PER_PAGE': '10',
      'process.env.APP_LANGS': JSON.stringify(SUPPORTED_LANGS),
    }),
    html({
      title: 'Freaksidea.com',
      publicPath: '/',
      template: indexHTML,
      attributes: {
        html: null,
        link: null,
        script: null,
      },
    }),
  ]
};
