import { html } from 'lit-element';

const articles = (category) => ({ match }) => ({
  body: match.params.alias && match.params.alias !== 'undefined'
    ? html`<fi-page-article alias="${match.params.alias}"></fi-page-article>`
    : html`<fi-page-articles category="${category}" set-meta></fi-page-articles>`
});

export const routes = [
  {
    name: 'home',
    path: '',
    respond: articles('all')
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
    name: 'search',
    path: 'search',
    respond: () => ({
      body: html`<fi-page-search></fi-page-search>`
    })
  },
  {
    name: 'notFound',
    path: '(.*)',
    respond: () => ({
      body: html`<fi-page name="notfound"></fi-page>`
    })
  }
];

export const miscMenu = ['friends', 'about'];

export const categories = ['home', 'frontend', 'backend', 'linux'];
