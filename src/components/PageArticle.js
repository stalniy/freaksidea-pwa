import { html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { iconsCss, pageCss, mdCss } from '../styles';
import { locale } from '../services/i18n';
import { t } from '../directives/i18n';
import { getArticleByAlias, setPageMeta } from '../services/articles';
import I18nElement from './I18nElement';

export default class PageArticle extends I18nElement {
  static cName = 'fi-page-article';
  static properties = {
    alias: { type: String }
  };

  constructor() {
    super();
    this.alias = '';
    this._article = null;
  }

  get hasTags() {
    return !!(this._article.meta && this._article.meta.keywords);
  }

  async update(changed) {
    if (this._article = null || changed.has('alias')) {
      await this.reload();
    }

    return super.update(changed);
  }

  async reload() {
    const alias = this.alias.startsWith('show-')
      ? this.alias.replace(/^show-\d+-/, '')
      : this.alias;

    this._article = await getArticleByAlias(locale(), alias);
    setPageMeta(this._article);
  }

  render() {
    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h1><i class="icon-idea"></i>${this._article.title}</h1>
        <div class="description md">${unsafeHTML(this._article.content)}</div>
        <fi-article-details .article="${this._article}">
          <div class="tags" slot="more">${this._renderTags()}</div>
        </fi-article-details>
      </article>
      ${this.hasTags
        ? html`<fi-similar-articles .to="${this._article}"></fi-similar-articles>`
        : ''
      }

    `
  }

  _renderTags() {
    if (!this.hasTags) {
      return '';
    }

    const tags = this._article.meta.keywords.map(tag => html`
      <fi-link to="search" .query="${{ q: tag }}" active>${tag}</fi-link>
    `);

    return html`
      <span>${t('article.tagsTitle')}</span>
      ${tags}
    `;
  }
}

PageArticle.styles = [
  iconsCss,
  pageCss,
  mdCss,
  css`
    :host {
      display: block;
    }

    .tags,
    .tags span {
      display: inline-block;
    }

    .tags span {
      vertical-align: middle;
    }

    fi-link {
      margin-right: 5px;
    }
  `
]
