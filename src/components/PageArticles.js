import { html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { articleCss, iconsCss, mdCss } from '../styles';
import { t } from '../directives/i18n';
import { locale } from '../services/i18n';
import content from '../services/content';
import router from '../services/router';
import I18nElement from './I18nElement';
import { scrollToElement } from '../hooks/scrollToSection';

export default class PageArticles extends I18nElement {
  static cName = 'fi-page-articles';

  static properties = {
    categories: { type: Array },
    pageSize: { type: Number },
  }

  constructor() {
    super();

    this.category = null;
    this.pageSize = Number(process.env.ARTICLES_PAGE_SIZE);
    this._articles = null;
    this._page = 1;
    this._pagesAmount = 1;
    this._unwatchPage = null;
  }

  connectedCallback() {
    super.connectedCallback();
    this._unwatchPage = router.observe((route) => {
      const page = route.response.location.query.page;
      this._page = page || 1;
      this._articles = null;
      this.requestUpdate();

      if (page) {
        scrollToElement(this.parentNode.parentNode);
      }
    });
  }

  disconnectedCallback() {
    this._unwatchPage();
    super.disconnectedCallback();
  }

  async update(changed) {
    if (this._articles === null || changed.has('categories')) {
      await this.reload();
    }

    return super.update(changed);
  }

  async reload() {
    const { pagesAmount, items } = await content('article').paginate(locale(), this.categories, {
      page: this._page,
      pageSize: this.pageSize
    });
    this._pagesAmount = pagesAmount;
    this._articles = items;
  }

  _categoryOf(article) {
    return this.categories.length === 1 ? this.categories[0] : article.categories[0];
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

  _renderArticle(article) {
    const category = this._categoryOf(article);

    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h2 itemprop="headline" class="title">
          <app-link to="${category}" .params=${article}>
            <i class="icon-idea"></i>${article.title}
          </app-link>
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

    .summary {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    @media(min-width: 768px) {
      .summary {
        line-clamp: none;
        -webkit-line-clamp: none;
      }
    }
  `
]
