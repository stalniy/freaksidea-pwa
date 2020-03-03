import { prepareRoutes, createRouter, announce } from "@curi/router";
import { browser } from "@hickory/browser";
import { routes } from '../config/routes';

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

export default createRouter(browser, prepareRoutes(routes), {
  history: {
    query: { parse, stringify }
  }
});
