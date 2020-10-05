const { normalize: normalizePath, dirname, extname, basename } = require('path');
const fs = require('fs');

function isExternalUrl(url) {
  return url.startsWith('https://') || url.startsWith('http://');
}

function isLocalUrl(url) {
  return url.startsWith('/') || url.startsWith('../') || url.startsWith('./');
}

function isAsset(url) {
  return extname(url) !== '';
}

function getRoute(env, defaultValue) {
  if (env.file.path.includes('/articles/')) {
    return env.relativePath.slice(0, env.relativePath.indexOf('/'));
  }

  return defaultValue;
}

function buildInAppLinkAttrs(token, ctx, env) {
  const attrs = token.attrs.slice(0);

  attrs[ctx.hrefIndex][0] = 'to';
  attrs[ctx.hrefIndex][1] = getRoute(env, 'page');
  attrs.push(['params', JSON.stringify({ id: ctx.page })]);

  if (ctx.hash) {
    attrs.push(['hash', ctx.hash]);
  }

  return attrs;
}

const identity = x => x;

function toCustomLink(token, hrefIndex, options, env) {
  let page = token.attrs[hrefIndex][1];
  const hashIndex = page.indexOf('#');
  let hash = null;

  if (hashIndex !== -1) {
    hash = page.slice(hashIndex + 1);
    page = page.slice(0, hashIndex);
  }

  if (page.startsWith('/')) {
    page = page.slice(1);
  } else {
    const filePath = `${dirname(env.file.path)}/${page}`;

    if (!fs.existsSync(filePath)) {
      console.warn(`Unable to locate file by path ${page} in ${env.relativePath}`);
    }

    page = normalizePath(`${dirname(env.relativePath)}/${page}`);
  }

  const buildAttrs = options.attrs || buildInAppLinkAttrs;
  const normalizeId = options.normalizeId || identity;
  const attrs = buildAttrs(token, {
    hrefIndex,
    hash,
    page: normalizeId(page),
  }, env);

  return Object.create(token, {
    attrs: { value: attrs },
    tag: { value: options.tagName }
  });
}

module.exports = (md, config = {}) => {
  let isInAppLink = false;
  const isInAppUrl = config.isInAppUrl || isLocalUrl;

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex('href');

    if (hrefIndex >= 0) {
      const hrefToken = token.attrs[hrefIndex];

      if (isExternalUrl(hrefToken[1])) {
        Object.keys(config.external).forEach((key) => {
          token.attrSet(key, config.external[key]);
        });
      } else if (isAsset(hrefToken[1])) {
        const name = basename(hrefToken[1]);
        token.attrSet('download', name);
        hrefToken[1] = config.asset.srcRoot + '/' + name;
      } else if (isInAppUrl(hrefToken[1]) && config.local) {
        tokens[idx] = toCustomLink(token, hrefIndex, config.local, env);
        isInAppLink = true;
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (isInAppLink) {
      token.tag = config.local.tagName;
      isInAppLink = false;
    }
    return self.renderToken(tokens, idx, options);
  };
};
