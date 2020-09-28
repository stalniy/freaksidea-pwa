const { normalize: normalizePath, dirname } = require('path');
const fs = require('fs');
const { parseMeta } = require('./contentParser');

function isExternalUrl(url) {
  return url.startsWith('https://') || url.startsWith('http://');
}

function isLocalUrl(url) {
  return url.startsWith('/') || url.startsWith('../') || url.startsWith('./');
}

function getCategory(path, defaultValue) {
  const content = parseMeta(fs.readFileSync(path, 'utf-8')).data;

  if (path.includes('vklyuchaem-http'))
    console.log(path, content.categories[0])

  return content.categories ? content.categories[0] : defaultValue;
}

function buildInAppLinkAttrs(token, ctx, env) {
  const attrs = token.attrs.slice(0);

  attrs[ctx.hrefIndex][0] = 'to';
  attrs[ctx.hrefIndex][1] = getCategory(env.file.path, 'page');
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
    page: normalizeId(page),
    hash,
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
