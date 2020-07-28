import { html } from 'lit-element';
import { loadPages, renderPage, renderArticles } from '../services/pageController';
import content from '../services/content';
import { interpolate } from '../services/utils';
import { LOCALES, defaultLocale } from '../services/i18n';

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
    const findIdByAlias = async (lang, rawAlias) => {
      if (!rawAlias || rawAlias === 'undefined') {
        return;
      }

      const alias = rawAlias && rawAlias.startsWith('show-')
        ? rawAlias.replace(/^show-\d+-/, '')
        : rawAlias;
      const article = await content('article').find('byAlias', lang, alias);
      return article.id;
    };

    return {
      resolve: loadPages('article', async ({ params }) => ({
        ...params,
        categories,
        id: await findIdByAlias(params.lang, params.alias)
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
