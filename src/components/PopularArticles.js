import { LitElement, html, css } from 'lit-element';
import blockCss from '../styles/block';
import iconsCss from '../styles/icons';
import { getArticlesByCategory } from '../services/articles';
import i18n from '../services/i18n';

export default class PopularArticles extends LitElement {
  static cName = 'fi-popular-articles';

  constructor() {
    super();
    this._articles = null;
  }

  async update(...args) {
    if (this._articles === null) {
      this._articles = await getArticlesByCategory(i18n.locale(), 'important');
    }

    return super.update(...args);
  }

  render() {
    const content = this._articles
      ? this._articles.map(this._renderArticle, this)
      : i18n.t('article.emptyPopular');

    return html`
      <section class="block">
        <h3 class="title">${i18n.t('article.popular')}</h3>
        ${content}
      </section>
    `;
  }

  _renderArticle(article) {
    return html`
      <h4 itemscope>
        <fi-link to="${article.categories[0]}" .params="${article}">
          <i class="icon-idea icon-sm"></i>${article.title}
        </fi-link>
      </h4>
    `;
  }
}

PopularArticles.styles = [
  blockCss,
  iconsCss,
  css`
    :host {
      display: block;
    }

    h4 {
      font-weight: normal;
      margin: 0;
      margin-bottom: 10px;
    }
  `
];
