import { html } from 'lit-element';
import { LOCALES, defaultLocale } from '../services/i18n';

const articles = (category) => ({ match }) => {
  if (match.params.alias && match.params.alias !== 'undefined') {
    return {
      body: html`<fi-page-article alias="${match.params.alias}"></fi-page-article>`
    };
  }

  return {
    body: html`<fi-page-articles category="${category}"></fi-page-articles>`,
    meta: {
      scope: 'categories'
    }
  };
};

export const routes = [
  {
    name: 'home',
    path: `:lang(${LOCALES.join('|')})`,
    respond: articles('all'),
    children: [
      {
        name: 'frontend',
        path: 'javascript/:alias?',
        respond: articles('frontend')
      },
      {
        name: 'backend',
        path: 'php_and_something/:alias?',
        respond: articles('backend')
      },
      {
        name: 'linux',
        path: 'linux/:alias?',
        respond: articles('linux')
      },
      {
        name: 'friends',
        path: 'friends',
        respond: () => ({
          body: html`<fi-page-friends></fi-page-friends>`
        })
      },
      {
        name: 'about',
        path: 'writeme',
        respond: () => ({
          body: html`<fi-page-about></fi-page-about>`
        })
      },
      {
        name: 'search',
        path: 'search',
        respond: () => ({
          body: html`<fi-page-search></fi-page-search>`,
          meta: {
            scope: 'search'
          }
        })
      },
    ]
  },
  {
    name: 'notFound',
    path: '(.*)',
    respond({ match }) {
      const pathname = match.location.pathname;
      const index = pathname.indexOf('/', 1);
      const lang = index === -1 ? pathname.slice(1) : pathname.slice(1, index);

      if (!LOCALES.includes(lang)) {
        const { search: query, hash } = window.location;
        return {
          redirect: {
            url: `/${defaultLocale}${pathname}${query}${hash}`,
          }
        };
      }

      return {
        body: html`<fi-page name="notfound"></fi-page>`
      };
    }
  }
];

export const miscMenu = ['friends', 'about'];

export const categories = ['home', 'frontend', 'backend', 'linux'];
