import { prepareRoutes, createRouter } from "@curi/router";
import { browser } from "@hickory/browser";
import { routes } from '../config/routes';
import { locale } from './i18n';

function parse(querystring) {
  return querystring
    ? JSON.parse(`{"${querystring.replace(/&/g, '","').replace(/=/g, '":"')}"}`)
    : {};
}

function stringify(querystring) {
  if (!querystring) {
    return '';
  }

  return Object.keys(querystring)
    .reduce((qs, key) => {
      qs.push(`${key}=${querystring[key]}`);
      return qs
    }, [])
    .join('&');
}

// TODO: unable to redirect to unknown route: https://github.com/pshrmn/curi/issues/234
const matcher = prepareRoutes(routes);
const router = createRouter(browser, matcher, {
  external: { matcher },
  history: {
    query: { parse, stringify }
  }
});

const originalUrl = router.url;
router.url = (options) => {
  const params = { lang: locale(), ...options.params };
  return originalUrl({ ...options, params });
};

export default router;
