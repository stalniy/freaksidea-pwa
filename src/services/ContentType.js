import MiniSearch from 'minisearch';
import { fetch } from './http';
import { notFoundError } from './error';
import { memoize } from './utils';
import searchOptions from '../config/search';

function markHints(result) {
  const hints = {};

  result.terms.forEach((term) => {
    const regexp = new RegExp(`(${term})`, 'gi');

    result.match[term].forEach((field) => {
      const value = result.doc[field];

      if (typeof value === 'string') {
        hints[field] = value.replace(regexp, '<mark>$1</mark>');
      } else if (field === 'headings') {
        const markedValue = value.reduce((items, h) => {
          if (h.title.toLowerCase().includes(term)) {
            items.push({
              id: h.id,
              title: h.title.replace(regexp, '<mark>$1</mark>'),
            });
          }
          return items;
        }, []);
        hints[field] = markedValue.length ? markedValue : null;
      }
    });
  });

  return hints;
}

function timeOf(date) {
  return new Date(date).getTime();
}

export default class Content {
  constructor({ pages, summaries, searchIndexes }) {
    this._pages = pages;
    this._summaries = summaries;
    this._searchIndexes = searchIndexes;
    this._loadSearchIndex = memoize(this._loadSearchIndex);
    this._getSummary = memoize(this._getSummary);
    this._getItems = memoize(this._getItems);
    this.byCategories = memoize(this.byCategories);
    this.getPopularTags = memoize(this.getPopularTags);
    this.load = memoize(this.load);
  }

  async load(locale, name) {
    const url = this._pages[locale][name];

    if (!url) {
      throw notFoundError(`Page with ${name} is not found`);
    }

    const response = await fetch(url);
    return response.body;
  }

  async _getSummary(locale) {
    const response = await fetch(this._summaries[locale]);
    return response.body;
  }

  async _getItems(locale, categories = null) {
    const groups = await this.byCategories(locale, categories);
    return Object.keys(groups)
      .reduce((all, category) => all.concat(groups[category]), []);
  }

  async getNearestFor(locale, pageId, categories = null) {
    const items = await this._getItems(locale, categories);
    const index = items.findIndex(item => item.id === pageId);

    if (index === -1) {
      return [];
    }

    const prevIndex = index - 1;
    const nextIndex = index + 1;

    return [
      prevIndex < 0 ? undefined : items[prevIndex],
      nextIndex >= items.length ? undefined : items[nextIndex]
    ];
  }

  async byCategories(locale, categories = null) {
    const { items } = await this._getSummary(locale);
    const groups = {};

    items.forEach((item) => {
      item.categories.forEach((category) => {
        groups[category] = groups[category] || [];
        groups[category].push(item);
      });
    });

    if (!Array.isArray(categories)) {
      return groups;
    }

    return categories.reduce((filtered, category) => {
      if (groups[category]) {
        filtered[category] = groups[category];
      }
      return filtered;
    }, {});
  }

  async paginate(locale, categories, pagination) {
    const items = await this._getItems(locale, categories);
    const pagesAmount = Math.ceil(items.length / pagination.pageSize);
    const startIndex = (pagination.page - 1) * pagination.pageSize;

    return {
      pagesAmount,
      items: items.slice(startIndex, startIndex + pagination.pageSize),
    };
  }

  async findSimilar(locale, item) {
    const summary = await this._getSummary(locale);

    if (!item.meta || !item.meta.keywords) {
      return [];
    }

    const similarItems = item.meta.keywords.reduce((all, tag) => {
      const itemsByTag = summary.byTags[tag];
      const expectedSize = all.size + 1;

      for (let i = 0; expectedSize !== all.size && i < itemsByTag.length; i++) {
        const similarItem = summary.items[itemsByTag[i]];

        if (similarItem.alias !== item.alias) {
          all.add(similarItem);
        }
      }
      return all;
    }, new Set());

    return Array.from(similarItems)
      .sort((item, anotherItem) => timeOf(anotherItem.createdAt) - timeOf(item.createdAt));
  }

  async find(indexName, locale, value) {
    const summary = await this._getSummary(locale);
    const indexes = summary[indexName][value];

    if (!indexes || !indexes.length) {
      throw notFoundError(`Cannot find content by "${value}" using "${indexName}"`);
    }

    return summary.items[indexes[0]];
  }

  _analyzeTags(tags, tagNames) {
    let minCount = 0;
    let maxCount = 0;

    for (let i = 0; i < tagNames.length; i++) {
      const count = tags[tagNames[i]].length;

      if (count < minCount) {
        minCount = count;
      }

      if (count > maxCount) {
        maxCount = count;
      }
    }

    return { maxCount, minCount };
  }

  async getPopularTags(locale) {
    const summary = await this._getSummary(locale);
    const tags = Object.keys(summary.byTags);
    const { maxCount, minCount } = this._analyzeTags(summary.byTags, tags);
    const diff = maxCount - minCount;

    return tags
      .map((name) => ({
        name,
        weight: 1 - (maxCount - summary.byTags[name].length) / diff,
        count: summary.byTags[name].length
      }))
      .filter(tag => tag.weight >= 0.1)
      .slice(0, 30);
  }

  async at(locale, index) {
    const { items } = await this._getSummary(locale);
    return items[index];
  }

  async _loadSearchIndex(locale) {
    const indexUrl = this._searchIndexes[locale];
    const response = await fetch(indexUrl);
    return MiniSearch.loadJS(response.body, searchOptions);
  }

  async search(locale, query, options) {
    const [searchIndex, summary] = await Promise.all([
      this._loadSearchIndex(locale),
      this._getSummary(locale)
    ]);
    return searchIndex.search(query, options)
      .slice(0, 15)
      .map((result) => {
        const [index] = summary.byId[result.id];
        result.doc = summary.items[index];
        result.hints = markHints(result);
        return result;
      });
  }
}
