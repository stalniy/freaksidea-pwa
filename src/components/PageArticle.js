import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import iconsCss from '../styles/icons';
import pageCss from '../styles/page';
import mdCss from '../styles/md';
import i18n from '../services/i18n';
import { getArticleByAlias } from '../services/articles';

export default class PageArticle extends LitElement {
  static cName = 'fi-page-article';
  static properties = {
    alias: { type: String }
  };

  constructor(...args) {
    super(...args);
    this.alias = '';
    this._article = null;
  }

  get hasTags() {
    return !!(this._article.meta && this._article.meta.keywords);
  }

  async update(changed) {
    if (this._article = null || changed.has('alias')) {
      this._article = await getArticleByAlias(i18n.locale(), this.alias);
    }

    return super.update(changed);
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
      return null;
    }

    const tags = this._article.meta.keywords.map(tag => html`
      <fi-link to="search" .query="${{ q: tag }}" active>${tag}</fi-link>
    `);

    return html`
      <span>${i18n.t('article.tagsTitle')}</span>
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
