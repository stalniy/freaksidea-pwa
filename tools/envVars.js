import fs from 'fs';
import dotenv from 'dotenv-flow';

export function appEnvVars(env, prefix = 'LIT_APP_') {
  return Object.keys(env).reduce((appEnvs, key) => {
    if (key.startsWith(prefix)) {
      appEnvs[`process.env.${key}`] = JSON.stringify(env[key]);
    }
    return appEnvs;
  }, {
    'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
  });
}

export function parseEnvVars(directory, overrides) {
  const env = dotenv.parse([
    `${directory}/.env`,
    `${directory}/.env.${process.env.NODE_ENV || 'development'}`
  ].filter(path => fs.existsSync(path)));

  env.LIT_APP_PUBLIC_PATH = env.LIT_APP_PUBLIC_PATH
    ? env.LIT_APP_PUBLIC_PATH.replace(/\/$/, '')
    : '';
  env.LIT_APP_SUPPORTED_LANGS = env.LIT_APP_SUPPORTED_LANGS || 'en';
  env.NODE_ENV = env.NODE_ENV || 'development';

  Object.keys(env).forEach((key) => {
    if (overrides.hasOwnProperty(key)) {
      env[key] = overrides[key];
    }
  });

  return env;
}

export function collectMetas(env) {
  return Object.keys(env).reduce((meta, key) => {
    if (key.startsWith('META_')) {
      meta.push({
        name: key.replace(/__/g, ':').slice(5),
        content: env[key]
      });
    }

    return meta;
  }, []);
}
