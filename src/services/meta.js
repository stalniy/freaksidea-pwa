import { t, translationExists } from './i18n';

export function setTitle(title) {
  document.title = title;
  setMeta('og:title', title);
  setMeta('twitter:title', title);
}

function getMetaTag(name) {
  let meta = document.head.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }

  return meta;
}

export function setMeta(name, content, defaultValue = '') {
  if (typeof name === 'object') {
    Object.keys(name).forEach(key => setMeta(key, name[key]));
    return;
  }

  const value = Array.isArray(content)
    ? content.concat(defaultValue).join(', ')
    : content || defaultValue;

  getMetaTag(name).setAttribute('content', value.replace(/[\n\r]+/g, ' '));
}

const currentUrl = () => {
  const { search, href } = location;
  return search ? href.slice(0, -search.length) : href;
};

function setDescription(value) {
  const defaultValue = t('meta.description');
  setMeta('description', value, defaultValue);
  setMeta('twitter:description', value, defaultValue);
}

export function setRouteMeta({ response }) {
  const html = document.documentElement;

  if (html.lang !== response.params.lang) {
    html.lang = response.params.lang;
  }

  const prefix = `meta.${response.name}`;

  if (translationExists(prefix)) {
    setTitle(t(`${prefix}.title`));
    setMeta('keywords', t(`${prefix}.keywords`), t('meta.keywords'));
    setDescription(t(`${prefix}.description`));
  } else {
    setTitle(t('title'));
    setMeta('keywords', t('meta.keywords'));
    setDescription('');
  }

  setCanonicalUrl(currentUrl());
}

let canonicalLink;
function setCanonicalUrl(value) {
  setMeta('og:url', value);
  canonicalLink = canonicalLink || document.head.querySelector('link[rel="canonical"]');
  canonicalLink.setAttribute('href', value);
}

export function setPageMeta(page) {
  const meta = page.meta || {};

  setTitle(page.title);
  setMeta('keywords', meta.keywords || '', t('meta.keywords'));
  setDescription(meta.description || page.summary);
  setCanonicalUrl(currentUrl());
}
