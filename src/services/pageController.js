import { html } from 'lit-element';
import content from './content';

function respondWithError(error) {
  if (error.code === 'NOT_FOUND') {
    return {
      body: {
        main: html`<app-page name="notfound"></app-page>`
      }
    };
  }

  throw error;
}

const identity = x => x;
export const loadPages = (type, transformParams = identity) => async (match) => {
  const vars = await transformParams(match);
  const loader = content(type);

  if (typeof vars.id === 'string' && vars.id.endsWith('/')) {
    vars.redirectTo = vars.id.slice(0, -1);
  } else if (vars.id) {
    vars.page = await loader.load(vars.lang, vars.id);
  }

  return vars;
};

export const respondWithPage = render => ({ match, error, resolved }) => {
  if (error) {
    return respondWithError(error);
  } if (resolved.redirectTo) {
    return {
      redirect: {
        name: 'page',
        params: {
          id: resolved.redirectTo,
          lang: match.params.lang,
        }
      }
    };
  }

  return { body: render(resolved, match.params) };
};

export const renderArticles = respondWithPage((vars) => {
  if (vars.page) {
    return {
      main: html`<fi-page-article .page="${vars.page}"></fi-page-article>`
    };
  }

  return {
    main: html`<fi-page-articles .categories="${vars.categories}"></fi-page-articles>`,
  };
});

export const renderPage = respondWithPage(vars => ({
  main: html`<app-page name="${vars.id}"></app-page>`,
}));
