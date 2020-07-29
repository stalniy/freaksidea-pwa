import { prepareRoutes, createRouter } from '@curi/router';
import { browser, createBase } from '@hickory/browser';
import routesConfig from '../config/routes.yml';
import controllers from '../config/controllers';
import config from '../config/app';
import { locale } from './i18n';
import * as queryString from './querystring';

function buildPath(rawRoute) {
  if (!rawRoute.restrictions) {
    return rawRoute.path;
  }

  return rawRoute.path.replace(/:([\w_-]+)(\?)?/g, (_, name, questionMark = '') => {
    const restriction = rawRoute.restrictions[name];
    return restriction ? `:${name}(${restriction})${questionMark}` : name + questionMark;
  });
}

function buildRoutes(rawRoutes, controllers) {
  return rawRoutes.map((rawRoute) => {
    if (rawRoute.redirect) {
      return {
        name: rawRoute.name,
        path: buildPath(rawRoute),
        respond: () => ({ redirect: rawRoute.redirect })
      };
    }

    const buildController = controllers[rawRoute.controller];

    if (!buildController) {
      throw new Error(`Did you forget to specify controller for route "${rawRoute.name}"?`);
    }

    const route = {
      name: rawRoute.name,
      path: buildPath(rawRoute),
      ...buildController(rawRoute),
    };

    if (rawRoute.meta && rawRoute.meta.encode === false) {
      route.pathOptions = {
        compile: { encode: x => x }
      };
    }

    if (rawRoute.children) {
      route.children = buildRoutes(rawRoute.children, controllers);
    }

    return route;
  });
}

const routes = buildRoutes(routesConfig.routes, controllers).concat({
  name: 'notFound',
  path: '(.*)',
  respond: controllers.NotFound().respond
});
const router = createRouter(browser, prepareRoutes(routes), {
  history: {
    base: config.baseUrl ? createBase(config.baseUrl) : undefined,
    query: queryString
  }
});

const originalUrl = router.url;
router.url = (options) => {
  const params = { lang: locale(), ...options.params };
  return originalUrl({ ...options, params });
};

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default router;
