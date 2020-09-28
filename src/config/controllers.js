import { html } from 'lit-element';
import { loadPages, renderPage, renderArticles } from '../services/pageController';
import { interpolate } from '../services/utils';
import { LOCALES, defaultLocale } from '../services/i18n';
import routes from './routes.yml';

export default {
  About: () => ({
    respond: () => ({
      body: {
        main: html`<fi-page-about></fi-page-about>`
      }
    })
  }),
  Article(route) {
    const categories = route.meta ? route.meta.categories : [];
    const normalize = (rawId) => {
      if (!rawId) {
        return;
      }

      if (!rawId.startsWith('show-')) {
        return rawId;
      }

      return rawId.replace(/^show-\d+-+/, '')
        .replace(/-{2,}/g, '-')
        .replace(/-$/, '');
    };

    return {
      resolve: loadPages('article', async ({ params }) => ({
        ...params,
        categories,
        id: normalize(params.id)
      })),
      respond: renderArticles,
    };
  },
  Page(route) {
    const categories = route.meta ? route.meta.categories : [];

    return {
      resolve: loadPages('page', ({ params }) => ({
        ...params,
        categories,
        id: interpolate(route.path, params),
      })),
      respond: renderPage,
    };
  },
  NotFound: () => ({
    respond: ({ match }) => {
      const { pathname } = match.location;
      const index = pathname.indexOf('/', 1);
      const lang = index === -1 ? pathname.slice(1) : pathname.slice(1, index);
      const { search: query, hash } = window.location;

      if (routes.redirects[lang]) {
        const prefix = index === - 1 ? '' : pathname.slice(index);
        const url = routes.redirects[lang] + prefix + query + hash;
        return {
          redirect: { url }
        };
      }

      if (!LOCALES.includes(lang)) {
        return {
          redirect: { url: `/${defaultLocale}${pathname}${query}${hash}` }
        };
      }

      return {
        body: html`<app-page name="notfound"></app-page>`
      };
    }
  })
};
