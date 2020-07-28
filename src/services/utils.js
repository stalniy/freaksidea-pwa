const json = (...args) => JSON.stringify(args);

export function memoize(fn, generateKey = json) {
  const cache = new Map();
  const memoized = function (...args) {
    const key = generateKey(...args);

    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }

    return cache.get(key);
  };
  memoized.cache = cache;

  return memoized;
}

export function debounce(fn, timeout) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), timeout);
  };
}

export function interpolate(template, object) {
  let hasMissing = false;
  const result = template.replace(/:([\w_-]+)\??/g, (_, name) => {
    if (!object[name] || object[name] === 'undefined') {
      hasMissing = true;
    }
    return object[name];
  });

  return hasMissing ? null : result;
}
