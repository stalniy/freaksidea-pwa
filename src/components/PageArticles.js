import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import articleCss from '../styles/article';
import iconsCss from '../styles/icons';
import mdCss from '../styles/md';
import i18n from '../services/i18n';
import { getArticlesByCategory } from '../services/articles';
import { setTitle, setMeta } from '../services/meta';
import router from '../services/router';

export default class PageArticles extends LitElement {
  static cName = 'fi-page-articles';

  static properties = {
    category: { type: String },
    perPage: { type: Number },
    load: { type: Function },
    setMeta: { type: Boolean }
  }

  constructor() {
    super();

    this.category = null;
    this.perPage = process.env.ARTICLES_PER_PAGE;
    this.load = getArticlesByCategory;
    this.setMeta = false;
    this._articles = null;
    this._page = 1;
    this._pagesAmount = 1;
    this._unsubscribe = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribe = router.observe((route) => {
      this._page = route.response.location.query.page || 1;
      this._articles = null;
      this.requestUpdate();
    });
  }

  disconnectedCallback() {
    this._unsubscribe();
    super.disconnectedCallback();
  }

  async update(changed) {
    if (this._articles === null || changed.has('category')) {
      this._setMeta();
      await this._loadArticles();
    }

    return super.update(changed);
  }

  _setMeta() {
    const prefix = `categories.${this.category === 'all' ? 'home' : this.category}`;
    setTitle(i18n.t(`${prefix}.title`));
    setMeta('keywords', i18n.t(`${prefix}.keywords`));
    setMeta('description', i18n.t(`${prefix}.description`));
  }

  async _loadArticles() {
    const articles = await this.load(i18n.locale(), this.category);
    this._pagesAmount = Math.ceil(articles.length / this.perPage);

    const startIndex = (this._page - 1) * this.perPage;
    this._articles = articles.slice(startIndex, startIndex + this.perPage);
  }

  render() {
    const content = this._articles.length
      ? this._articles.map(this._renderArticle, this)
      : html`<slot name="empty">${i18n.t('article.emptyCategory')}</slot>`;

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
