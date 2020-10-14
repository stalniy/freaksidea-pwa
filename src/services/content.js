import ContentType from './ContentType';
import * as pagesDetails from '../content/pages.md';
import * as articlesDetails from '../content/articles.md';

const contentTypes = {
  page: new ContentType(pagesDetails),
  article: new ContentType(articlesDetails),
};

export default (type) => {
  const contentLoader = contentTypes[type];

  if (!contentLoader) {
    throw new TypeError(`Unknown content loader "${type}".`);
  }

  return contentLoader;
};
