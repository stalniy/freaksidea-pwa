import rollup from 'rollup';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

function importPolyfills(polyfills) {
  if (!polyfills) {
    return '';
  }

  return polyfills.map(id => `import '${id}'`).join(';') + ';';
}

function resolveFromBundle(bundle, options = {}) {
  return {
    name: 'resolve-bundle',
    resolveId(id) {
      if (bundle[id] || id === 'legacy-app.js') {
        return id;
      }
    },
    load(id) {
      const chunk = bundle[id];

      if (!chunk) {
        return;
      }

      let code = chunk.code;

      if (chunk.isEntry) {
        code = importPolyfills(options.polyfills) + code;
      }

      return {
        code,
        map: chunk.map
      };
    }
  };
}

export default (options = {}) => {
  return {
    name: 'legacy',
    async generateBundle(outputOptions, bundle) {
      const chunks = Object.values(bundle).reduce((all, chunk) => {
        if (chunk.isEntry || chunk.isDynamicEntry) {
          all.push(chunk.fileName);
        }
        return all;
      }, []);
      const legacyBundle = await rollup.rollup({
        input: chunks,
        plugins: [
          resolve(),
          commonjs(),
          resolveFromBundle(bundle, { polyfills: options.polyfills }),
          babel({
            rootMode: 'upward',
            exclude: [
              'node_modules/core-js/**/*.js',
              'node_modules/regenerator-runtime/runtime.js'
            ],
            caller: {
              output: 'es5'
            },
          }),
        ].concat(options.plugins || [])
      });

      await legacyBundle.write({
        format: options.format || 'iife',
        dir: `${outputOptions.dir}/${options.dir || 'legacy'}`,
      });
    }
  };
}
