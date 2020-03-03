const CONFIG = {
  default: {
    plugins: [
      ['@babel/plugin-proposal-class-properties']
    ],
  },
  es5: {
    presets: [
      ['@babel/preset-env', {
        loose: true,
        targets: {
          browsers: ['last 3 versions', 'ie >= 11', 'safari >= 10']
        }
      }]
    ],
  },
  test: {
    presets: [
      ['@babel/preset-env', {
        loose: true,
        targets: {
          node: '10'
        }
      }]
    ],
  }
};

function config(name) {
  if (name === 'default' || !CONFIG[name]) {
    return CONFIG.default;
  }

  const { presets = [], plugins = [] } = CONFIG[name];

  return {
    presets: presets.concat(CONFIG.default.presets || []),
    plugins: plugins.concat(CONFIG.default.plugins || []),
  };
}

module.exports = (api) => {
  let format;
  api.caller(caller => format = caller.output || process.env.NODE_ENV);
  api.cache.using(() => format);

  return config(format);
};
