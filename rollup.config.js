import babel from '@rollup/plugin-babel';
import url from '@rollup/plugin-url';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import html from '@rollup/plugin-html';
import xyaml from 'xyaml-webpack-loader/rollup';
import { terser } from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';
import copy from 'rollup-plugin-copy';
import { content, summary } from 'rollup-plugin-content';
import { legacyBundle } from 'rollup-plugin-legacy-bundle';
import { generateSW } from 'rollup-plugin-workbox';
import { dirname, basename } from 'path';
import indexHTML from './tools/index.html';
import { SearchIndex } from './tools/SearchIndex';
import { appEnvVars, parseEnvVars, collectMetas } from './tools/envVars';
import createWorkboxConfig from './tools/workbox.config';
import runMarkdownPostParsingTasks from './tools/rollup/markdownPostParsingTasks';
import createContentParser from './tools/contentParser';
import * as schemas from './tools/contentSchemas';

const env = parseEnvVars(__dirname, process.env);
const { parsexYaml, parseFrontMatter, parser: markdown } = createContentParser(__dirname, env);
const ifEnv = (name, plugins) => env.NODE_ENV === name ? plugins() : [];
const minify = terser({
  output: {
    comments: false,
  },
  mangle: {
    properties: {
      reserved: [
        '_classProperties',
        '__isAppExecuted__',
      ],
      regex: /^_/
    }
  }
});

export default {
  input: 'src/bootstrap.js',
  treeshake: env.NODE_ENV === 'production',
  output: {
    format: 'es',
    dir: env.LIT_APP_DIST_FOLDER,
    sourcemap: true,
    assetFileNames: env.NODE_ENV === 'production'
      ? 'assets/[name].[hash].[ext]'
      : 'assets/[name].[ext]',
    entryFileNames: env.NODE_ENV === 'production'
      ? '[name].[hash].js'
      : '[name].js',
    plugins: [
      ...ifEnv('production', () => [
        minify,
      ]),
    ]
  },
  plugins: [
    ...ifEnv('production', () => [
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
    url({ publicPath: `${env.LIT_APP_PUBLIC_PATH}/` }),
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
    copy({
      copyOnce: true,
      flatten: false,
      targets: [
        { src: 'public/**/*', dest: env.LIT_APP_DIST_FOLDER },
        {
          src: [
            'node_modules/@webcomponents/webcomponentsjs/**/*.js',
            '!node_modules/@webcomponents/webcomponentsjs/src'
          ],
          dest: env.LIT_APP_DIST_FOLDER
        }
      ]
    }),
    copy({
      overwrite: true,
      targets: [
        { src: 'src/content/**/*.{png,jpeg,jpg,svg,gif,zip,tar,bz2,sh,php,js}', dest: `${env.LIT_APP_DIST_FOLDER}/media/assets` },
      ]
    }),
    xyaml({
      markdown: { parser: markdown },
      esm: true,
      namedExports: false,
    }),
    content({
      entry: /\.i18n$/,
      langs: env.LIT_APP_SUPPORTED_LANGS,
      summarizer: false,
      pageSchema: false,
      parse: parsexYaml,
    }),
    content({
      entry: /\/pages\.md$/,
      files: '**/*.md',
      langs: env.LIT_APP_SUPPORTED_LANGS,
      pageSchema: false, // schemas.page,
      parse: parseFrontMatter,
      plugins: [
        summary({
          fields: [
            'id',
            'path'
          ],
          resolve: {
            path: (_1, _2, ctx) => ctx.file.path.slice(__dirname.length)
          }
        }),
      ]
    }),
    content({
      entry: /\/articles\.md$/,
      files: '**/*.md',
      langs: env.LIT_APP_SUPPORTED_LANGS,
      pageSchema: false, // schemas.article,
      parse: parseFrontMatter,
      main: {
        resolve: {
          id(_1, _2, { relativePath }) {
            return basename(dirname(relativePath)).slice(11);
          },
        }
      },
      plugins: [
        summary({
          fields: [
            'id',
            'title',
            'headings',
            'summary',
            'categories',
            'tags',
            'author',
            'createdAt',
            'path'
          ],
          sortBy: ['-createdAt'],
          indexBy: ['id', 'tags'],
          resolve: {
            tags: item => item.meta ? item.meta.keywords : null,
            path: (_1, _2, ctx) => ctx.file.path.slice(__dirname.length)
          }
        }),
        summary(SearchIndex.factory()),
      ]
    }),
    replace(appEnvVars(env)),
    html({
      title: env.LIT_APP_TITLE,
      publicPath: `${env.LIT_APP_PUBLIC_PATH}/`,
      template: indexHTML({
        analyticsId: env.LIT_APP_GA_ID,
        websiteUrl: env.LIT_APP_WEBSITE_URL,
        sharethis: env.SHARETHIS_URL,
      }),
      meta: collectMetas(env),
      attributes: {
        html: null,
        link: null,
        script: null,
      },
    }),
    generateSW(createWorkboxConfig(env)),
    runMarkdownPostParsingTasks(markdown),
  ]
};
