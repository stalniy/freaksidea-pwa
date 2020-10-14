const yaml = require('js-yaml');
const childProcess = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const dotenv = require('dotenv-flow');

dotenv.config({
  path: `${__dirname}/..`,
  node_env: process.env.NODE_ENV || 'development',
});

const exec = promisify(childProcess.exec);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const WEBSITE = process.env.LIT_APP_WEBSITE_URL + (process.env.LIT_APP_PUBLIC_PATH || '/');
const CONTENT_PATH = `${__dirname}/../src/content`;
const DIST_PATH = `${__dirname}/../dist`;

async function findFile(dir, callback) {
  const files = await readdir(dir);
  const file = files.find(callback);

  if (!file) {
    throw new Error(`Unable to find file by prefix "${callback}" in "${dir}"`);
  }

  return `${dir}/${file}`;
}

const jsonCache = new Map();
async function parseJSON(directory, prefix) {
  const pathToFile = `${directory}/${prefix}`;

  if (!jsonCache.has(pathToFile)) {
    const realPath = await findFile(directory, f => f.startsWith(prefix));
    const rawContent = await readFile(realPath, 'utf8');
    jsonCache.set(pathToFile, JSON.parse(rawContent));
  }

  return jsonCache.get(pathToFile);
}

const contentProvider = (filePrefix) => async ({ route, parentItem }) => {
  const content = await parseJSON(`${DIST_PATH}/assets`, `${filePrefix}.${parentItem.lang}`);
  const categories = route.meta ? route.meta.categories : null;
  let items = content.items;

  if (Array.isArray(categories)) {
    const hasCategory = categories.includes.bind(categories);
    items = items.filter(item => item.categories.some(hasCategory));
  }

  const shouldIgnoreIdPrefix = route.meta && route.meta.ignoreIdPrefix;

  return items.map((item) => {
    let doc = item;

    if (shouldIgnoreIdPrefix) {
      doc = { ...item, id: doc.id.slice(doc.id.indexOf('/') + 1) };
    }

    return {
      doc,
      lastmodFrom: item.path.slice('src/content/'.length)
    };
  });
};

const sitemapEntriesProviders = {
  pages: contentProvider('content_pages_summaries'),
  articles: contentProvider('content_articles_summaries'),
  route({ route, parentItem }) {
    return [{
      doc: { id: route.path },
      lastmodFrom: `pages/${route.path}/${parentItem.lang}.md`
    }];
  },
  langs() {
    return ['ru'].map((lang) => ({
      doc: { lang },
      lastmodFrom: `app/${lang}.yml`
    }));
  }
};

function getSitemapEntriesProviderFor(route) {
  const hasPlaceholders = route.path.includes(':');
  const entriesProvider = route.sitemap ? route.sitemap.provider : null;

  if (hasPlaceholders && !entriesProvider) {
    throw new Error(`Cannot generate sitemap.xml. Please specify placeholder "sitemap.provider" property for ${route.path}.`)
  }

  if (hasPlaceholders && !sitemapEntriesProviders[entriesProvider]) {
    throw new Error(`Unknown sitemap.provider "${route.provider}"`);
  }

  return sitemapEntriesProviders[entriesProvider];
}

const urlEntry = (value) => `
  <url>
    <loc>${WEBSITE}${value.path}</loc>
    <lastmod>${value.lastmod}</lastmod>
    <changefreq>${value.changefreq}</changefreq>
    <priority>${value.priority}</priority>
  </url>
`.trimEnd();

async function getLastModified(path) {
  const { stdout, stderr } = await exec(`git log -1  --format="%aI" ${CONTENT_PATH}/${path}`);

  if (stderr) {
    throw new Error(stderr);
  }

  const rawDate = stdout.trim();
  const date = rawDate ? new Date(rawDate) : new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, 0),
    String(date.getDate()).padStart(2, 0)
  ].join('-');
}

async function urlEntriesFrom(route, context, entries) {
  const basePath = context.basePath || '';
  const details = {
    path: basePath + (Array.isArray(route.path) ? route.path[0] : route.path),
    changefreq: route.sitemap.changefreq,
    priority: route.sitemap.priority,
  };
  const getItems = getSitemapEntriesProviderFor(route);
  let items;

  if (getItems && details.path.includes(':')) {
    items = await getItems({ contentPath: CONTENT_PATH, route, ...context });
  } else {
    items = [{ doc: {}, lastmodFrom: route.sitemap.lastmodFrom }];
  }

  const regexp = /:([\w_-]+)\??/g
  const parseItems = items.map(async ({ doc, lastmodFrom }) => {
    const path = details.path.replace(regexp, (_, prop) => doc[prop]);

    if (entries.has(path)) {
      return '';
    }

    entries.add(path);

    if (!lastmodFrom) {
      console.log(route)
    }

    const itemEntry = urlEntry({
      ...details,
      path,
      lastmod: await getLastModified(lastmodFrom)
    });

    if (!route.children) {
      return itemEntry;
    }

    const childContext = { basePath: `${path}/`, parentItem: doc };
    const parseChildren = route.children
      .map(childRoute => urlEntriesFrom(childRoute, childContext, entries));
    const childrenUrls = await Promise.all(parseChildren);

    return childrenUrls.concat(itemEntry);
  });
  const urls = await Promise.all(parseItems.concat(
    entriesFromOptionalVars(route, context, entries)
  ));

  return urls.flat(2);
}

async function entriesFromOptionalVars(route, context, entries) {
  if (!route.path.includes('?')) {
    return [];
  }

  const path = route.path.replace(/\/:([\w_-]+)\?/g, '');
  return urlEntriesFrom({ ...route, path }, context, entries);
}

async function generate() {
  const { routes } = yaml.load(fs.readFileSync(`${__dirname}/../src/config/routes.yml`));
  const entries = new Set();
  const requests = routes.map(route => urlEntriesFrom(route, {}, entries));
  const urls = await Promise.all(requests);
  const content = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${urls.flat(2).join('\n')}
    </urlset>
  `.trim();

  await writeFile(`${__dirname}/../dist/sitemap.xml`, content);
}

generate()
  .then(() => console.log(`sitemap.xml has been successfully generated for ${WEBSITE}`)) // eslint-disable-line no-console
  .catch((error) => {
    console.error(error); // eslint-disable-line no-console
    process.exit(1);
  });
