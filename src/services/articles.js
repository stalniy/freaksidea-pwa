import MiniSearch from 'minisearch';
import { summaries, pages } from '../content/articles.summary';
import { setTitle, setMeta } from './meta';

function memoize(fn) {
  const cache = {};
  return (...args) => {
    const key = JSON.stringify(args);

    if (!cache[key]) {
      cache[key] = fn(...args);
    }

    return cache[key];
  };
}

export function setPageMeta(page) {
  const meta = page.meta || {};

  setTitle(page.title);
  setMeta('keywords', meta.keywords || '');
  setMeta('description', meta.description || '');
}

export const getSummary = memoize(async (locale) => {
  const url = summaries[locale];
  const response = await fetch(url);
  return response.json();
});

export async function getArticlesByCategory(locale, category = null) {
  const summary = await getSummary(locale);

  if (category && category !== 'all') {
    const articlesInCategory = summary.byCategory[category] || [];
    return articlesInCategory.map(index => summary.items[index]);
  }

  return summary.items;
}

export const getPopularTags = memoize(async (locale) => {
  const summary = await getSummary(locale);
  const tags = Object.keys(summary.byTags).map((name) => {
    return {
      name,
      weight: summary.byTags[name].length / summary.items.length,
    };
  });

  return tags.sort((tag, anotherTag) => anotherTag.weight - tag.weight)
    .slice(0, 30);
});

export const getArticleByAlias = memoize(async (locale, alias) => {
  const url = pages[locale][alias];

  if (!url) {
    return null;
  }

  const response = await fetch(url);

  return response.json();
});

export async function getSimilarArticles(locale, article) {
  const summary = await getSummary(locale);

  if (!article.meta || !article.meta.keywords) {
    return [];
  }

  const articles = article.meta.keywords.reduce((all, tag) => {
    summary.byTags[tag].forEach((index) => {
      const similarArticle = summary.items[index];

      if (similarArticle.alias !== article.alias) {
        all.add(similarArticle);
      }
    });
    return all;
  }, new Set());

  return Array.from(articles);
}

const getSearchIndex = memoize(async (locale) => {
  const summary = await getSummary(locale);
  const tagsByIndex = Object.keys(summary.byTags).reduce((byIndex, tag) => {
    summary.byTags[tag].forEach((index) => {
      byIndex[index] = byIndex[index] || [];
      byIndex[index].push(tag);
    });
    return byIndex;
  }, {});
  const searchIndex = new MiniSearch({
    idField: 'i',
    fields: ['title', 'summary', 'tags'],
    extractField(object, fieldName) {
      switch (fieldName) {
      case 'summary':
        return object[fieldName].replace(/<[^>]+>/g, '');
      case 'tags':
        const tags = tagsByIndex[object.i];
        return tags ? tags.join(' ') : null;
      default:
        return object[fieldName];
      }
    },
    searchOptions: {
      boost: {
        title: 3,
        tags: 2
      },
    }
  });

  await searchIndex.addAllAsync(summary.items);

  return { searchIndex, summary };
});

export async function searchArticles(locale, query, options) {
  const { searchIndex, summary } = await getSearchIndex(locale);
  return searchIndex.search(query, options)
    .map(result => summary.items[result.id]);
}

export async function autoSuggestArticles(locale, query, options) {
  const { searchIndex } = await getSearchIndex(locale);
  const results = searchIndex.autoSuggest(query, options);

  results.length = Math.min(results.length, 15);

  return results;
}
