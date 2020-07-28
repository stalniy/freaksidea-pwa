import dotenv from 'dotenv-flow';
import babel from '@rollup/plugin-babel';
import url from '@rollup/plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import { content, summary } from 'rollup-plugin-content';
import { legacyBundle } from 'rollup-plugin-legacy-bundle';
import xyaml from 'xyaml-webpack-loader/rollup';
import { generateSW } from 'rollup-plugin-workbox';
import { dirname, basename } from 'path';
import indexHTML from './tools/index.html';
import { parsexYaml, parseFrontMatter, markdownOptions } from './tools/contentParser';
import { SearchIndex } from './tools/SearchIndex';
import getAppEnvVars from './tools/appEnvVars';
import createWorkboxConfig from './tools/workbox.config';

dotenv.config({
  path: __dirname,
  node_env: process.env.NODE_ENV || 'development',
});

const env = (name, plugins) => process.env.NODE_ENV === name ? plugins() : [];
const SUPPORTED_LANGS = (process.env.LIT_APP_SUPPORTED_LANGS || 'en').split(',');
const minify = terser({
  output: {
    comments: false,
  },
  mangle: {
    properties: {
      reserved: [
        '_classProperties',
        '__isAppExecuted__',
        '_tree',
        '_prefix',
      ],
      regex: /^_/
    }
  }
});

const DEST = process.env.LIT_APP_DIST_FOLDER;
const PUBLIC_PATH = process.env.LIT_APP_PUBLIC_PATH.replace(/\/$/, '');

export default {
  input: 'src/bootstrap.js',
  treeshake: process.env.NODE_ENV === 'production',
  output: {
    format: 'es',
    dir: DEST,
    sourcemap: true,
    assetFileNames: process.env.NODE_ENV === 'production'
      ? 'assets/[name].[hash].[ext]'
      : 'assets/[name].[ext]',
    entryFileNames: process.env.NODE_ENV === 'production'
      ? '[name].[hash].js'
      : '[name].js',
    plugins: [
      ...env('production', () => [
        minify,
      ]),
    ]
  },
  plugins: [
    ...env('production', () => [
      minifyHTML(),
      legacyBundle({
        format: 'iife',
        polyfills: [
          'core-js/modules/es.array.find',
          'core-js/modules/es.array.find-index',
          'core-js/modules/es.array.from',
          'core-js/modules/es.array.includes',
          'core-js/modules/es.object.assign',
          'core-js/modules/es.object.entries',
          'core-js/modules/es.string.includes',
          'core-js/modules/es.string.starts-with',
          'core-js/modules/es.string.ends-with',
          'core-js/modules/es.reflect.construct',
          'regenerator-runtime/runtime',
        ],
        plugins: [
          resolve(),
          commonjs(),
          babel({
            rootMode: 'upward',
            babelHelpers: 'bundled',
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
        ]
      }),
    ]),
    url({ publicPath: `${PUBLIC_PATH}/` }),
    resolve({
      mainFields: ['es2015', 'module', 'main']
    }),
    babel({
      rootMode: 'upward',
      babelHelpers: 'bundled',
      include: [
        'src/**/*.js',
        'node_modules/lit-element/**/*.js'
      ],
      caller: {
        output: 'es'
      },
    }),
    commonjs(),
    xyaml({
      markdown: markdownOptions,
      esm: true,
      namedExports: false,
    }),
    copy({
      copyOnce: true,
      flatten: false,
      targets: [
        { src: 'public/**/*', dest: DEST },
        {
          src: [
            'node_modules/@webcomponents/webcomponentsjs/**/*.js',
            '!node_modules/@webcomponents/webcomponentsjs/src'
          ],
          dest: DEST
        }
      ]
    }),
    copy({
      targets: [
        { src: 'src/content/**/*.{png,jpeg,svg,zip,tar,bz2,sh,php,js}', dest: `${DEST}/media/assets` },
      ]
    }),
    content({
      entry: /\.i18n$/,
      langs: SUPPORTED_LANGS,
      summarizer: false,
      pageSchema: false,
      parse: parsexYaml,
    }),
    content({
      entry: /\.pages$/,
      files: '**/*.md',
      langs: SUPPORTED_LANGS,
      pageSchema: false,
      parse: parseFrontMatter,
      pageId: (_, { relativePath }) => basename(dirname(relativePath)),
      plugins: [
        summary({
          fields: [
            'id',
            'title',
            'alias',
            'headings',
            'summary',
            'categories',
            'tags',
            'author',
            'createdAt'
          ],
          sortBy: ['-createdAt'],
          indexBy: ['alias', 'tags'],
          resolve: {
            tags: item => item.meta ? item.meta.keywords : null
          }
        }),
        summary(SearchIndex.factory()),
      ]
    }),
    replace({
      ...getAppEnvVars(process.env),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.SUPPORTED_LANGS': JSON.stringify(SUPPORTED_LANGS),
      'process.env.BASE_URL': JSON.stringify(PUBLIC_PATH),
    }),
    html({
      title: process.env.LIT_APP_TITLE,
      publicPath: `${PUBLIC_PATH}/`,
      template: indexHTML({
        analyticsId: process.env.LIT_APP_GA_ID,
        sharethis: process.env.SHARETHIS_SRC,
      }),
      attributes: {
        html: null,
        link: null,
        script: null,
      },
    }),
    generateSW(createWorkboxConfig(DEST, PUBLIC_PATH))
  ]
};
