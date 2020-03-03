import Ajv from 'ajv';
import slugify from '@sindresorhus/slugify';
import articleSchema from '../schema/article';

function getSummary(path, content) {
  const index = content.indexOf('<cut/>');

  if (index === -1) {
    throw new Error(`Unable to find <cut/> for summary detection in ${path}`)
  }

  return content.slice(0, index).trim();
}

function updateIndex(summary, indexName, values) {
  const articleIndex = summary.items.length - 1;

  summary[indexName] = summary[indexName] || {};
  values.forEach((value) => {
    summary[indexName][value] = summary[indexName][value] || [];
    summary[indexName][value].push(articleIndex);
  });
}

export const pageAlias = page => page.alias || slugify(page.title);

export class ArticleSummarizer {
  constructor() {
    this.ajv = new Ajv();
    this.validateArticle = this.ajv.compile(articleSchema);
    this.imageSize = [710, 200];
    this.summary = {};
  }

  add(article, lang, options = {}) {
    if (!this.validateArticle(article)) {
      console.error(`Invalid article content in ${options.relativePath}`);
      console.error(this.ajv.errorsText(this.validateArticle.errors));
      throw new Ajv.ValidationError(this.validateArticle.errors);
    }

    if (article.draft) {
      return;
    }

    this.summary[lang] = this.summary[lang] || { items: [] };
    this.summary[lang].items.push({
      i: this.summary[lang].items.length,
      title: article.title,
      author: article.author,
      createdAt: article.createdAt,
      alias: pageAlias(article),
      categories: article.categories,
      summary: (article.summary || getSummary(options.relativePath, article.content))
        .replace(
          /<img([^>]+)>/g,
          `<img$1 width="${this.imageSize[0]}" height="${this.imageSize[1]}">`
        ),
    });
    updateIndex(this.summary[lang], 'byCategory', article.categories);

    if (article.meta && article.meta.keywords) {
      updateIndex(this.summary[lang], 'byTags', article.meta.keywords);
    }
  }

  toJSON() {
    Object.values(this.summary).forEach((summary) => {
      summary.items = summary.items
        .sort((item, anotherItem) => anotherItem.createdAt - item.createdAt);
    })

    return this.summary;
  }
}
