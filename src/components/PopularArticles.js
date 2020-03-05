import { LitElement, html, css } from 'lit-element';
import { blockCss, iconsCss } from '../styles';
import { getArticlesByCategory } from '../services/articles';
import { locale } from '../services/i18n';
import { t } from '../directives/i18n';
import I18nElement from './I18nElement';

export default class PopularArticles extends I18nElement {
  static cName = 'fi-popular-articles';

  constructor() {
    super();
    this._articles = null;
  }

  async update(...args) {
    if (this._articles === null) {
      this._articles = await this.reload();
    }

    return super.update(...args);
  }

  reload() {
    return getArticlesByCategory(locale(), 'important');
  }

  render() {
    const content = this._articles
      ? this._articles.map(this._renderArticle, this)
      : t('article.emptyPopular');

    return html`
      <section class="block">
        <h3 class="title">${t('article.popular')}</h3>
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
