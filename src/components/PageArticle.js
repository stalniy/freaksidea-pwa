import { html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { iconsCss, pageCss, mdCss, codeCss } from '../styles';
import { t } from '../directives/i18n';
import { setPageMeta } from '../services/meta';
import I18nElement from './I18nElement';
import { tryToNavigateElement, scrollToSectionIn } from '../hooks/scrollToSection';

export default class PageArticle extends I18nElement {
  static cName = 'fi-page-article';
  static properties = {
    page: { type: Object }
  };

  constructor() {
    super();
    this.page = null;
  }

  _hasTags() {
    return !!(this.page.meta && this.page.meta.keywords);
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener('click', (event) => {
      tryToNavigateElement(this.shadowRoot, event.target);
    }, false);
  }

  async updated(changed) {
    if (this.page === null || changed.has('page')) {
      setPageMeta(this.page);
      await this.updateComplete;
      scrollToSectionIn(this.shadowRoot);
    }
  }

  render() {
    const similarArticles = this._hasTags()
      ? html`<fi-similar-articles .to="${this.page}"></fi-similar-articles>`
      : '';
    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h1><i class="icon-idea"></i>${this.page.title}</h1>
        <div class="description md">${unsafeHTML(this.page.content)}</div>
        <fi-article-details .article="${this.page}">
          <div class="tags" slot="more">${this._renderTags()}</div>
        </fi-article-details>
      </article>
      ${similarArticles}
    `;
  }

  _renderTags() {
    if (!this._hasTags()) {
      return '';
    }

    const tags = this.page.meta.keywords.map(tag => html`
      <app-link to="search" .query="${{ q: tag }}">${tag}</app-link>
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
  codeCss,
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

    app-link {
      margin-right: 5px;
      color: #39c;
    }
  `
]
