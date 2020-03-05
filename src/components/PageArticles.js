import { html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { articleCss, iconsCss, mdCss } from '../styles';
import { t } from '../directives/i18n';
import { locale } from '../services/i18n';
import { getArticlesByCategory } from '../services/articles';
import router from '../services/router';
import I18nElement from './I18nElement';

export default class PageArticles extends I18nElement {
  static cName = 'fi-page-articles';

  static properties = {
    category: { type: String },
    perPage: { type: Number },
    load: { type: Function },
  }

  constructor() {
    super();

    this.category = null;
    this.perPage = Number(process.env.ARTICLES_PER_PAGE);
    this.load = getArticlesByCategory;
    this._articles = null;
    this._page = 1;
    this._pagesAmount = 1;
    this._unwatchPage = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unwatchPage = router.observe((route) => {
      this._page = route.response.location.query.page || 1;
      this._articles = null;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    this._unwatchPage();
    super.disconnectedCallback();
  }

  async update(changed) {
    if (this._articles === null || changed.has('category')) {
      await this.reload();
    }

    return super.update(changed);
  }

  async reload() {
    const articles = await this.load(locale(), this.category);
    this._pagesAmount = Math.ceil(articles.length / this.perPage);

    const startIndex = (this._page - 1) * this.perPage;
    this._articles = articles.slice(startIndex, startIndex + this.perPage);
  }

  render() {
    const content = this._articles.length
      ? this._articles.map(this._renderArticle, this)
      : html`<slot name="empty">${t('article.emptyCategory')}</slot>`;

    return html`<section>
      ${content}
      <fi-pager pages="${this._pagesAmount}" page="${this._page}"></fi-pager>
    </section>`;
  }

  _categoryOf(article) {
    return this.category === 'all' ? article.categories[0] : this.category;
  }

  _renderArticle(article) {
    const category = this._categoryOf(article);

    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h2 itemprop="headline" class="title">
          <fi-link to="${category}" .params=${article}>
            <i class="icon-idea"></i>${article.title}
          </fi-link>
        </h2>
        <div itemprop="description" class="summary md">${unsafeHTML(article.summary)}</div>
        <fi-article-details .article="${article}" category="${category}"></fi-article-details>
      </article>
    `;
  }
}

PageArticles.styles = [
  articleCss,
  iconsCss,
  mdCss,
  css`
    fi-article-details {
      padding-left: 5px;
    }
  `
]
