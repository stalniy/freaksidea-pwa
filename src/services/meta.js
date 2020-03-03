import i18n from './i18n';

export function setTitle(title) {
  const prefix = title ? `${title} - ` : '';
  document.title = prefix + i18n.t('name');
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

export function setMeta(name, content) {
  if (typeof name === 'object') {
    Object.keys(name).forEach(key => setMeta(key, name[key]));
    return;
  }

  const defaultValue = i18n.t(`meta.${name}`);
  const value = Array.isArray(content)
    ? content.concat(defaultValue).join(', ')
    : content || defaultValue;

  getMetaTag(name).setAttribute('content', value);
}
