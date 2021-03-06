import { html, css, unsafeCSS } from 'lit-element';
import { t, d } from '../directives/i18n';
import { locale } from '../services/i18n';
import content from '../services/content';
import arrowImage from '../assets/arrow-right.jpg';
import I18nElement from './I18nElement';

export default class SimilarArticles extends I18nElement {
  static cName = 'fi-similar-articles';
  static properties = {
    to: { type: Object },
  };

  constructor() {
    super();
    this.to = null;
    this._articles = null;
  }

  async update(changed) {
    if (this._articles === null || changed.has('to')) {
      await this.reload();
    }

    return super.update(changed);
  }

  async reload() {
    this._articles = await content('article').findSimilar(locale(), this.to);
  }

  render() {
    if (!this._articles.length) {
      return html``;
    }

    return html`
      <h3>${t('article.readSimilar')}</h3>
      <ul>${this._renderSimilarArticles()}</ul>
    `;
  }

  _renderSimilarArticles() {
    return this._articles.map(article => html`
      <li>
        <app-link to="${article.categories[0]}" .params="${article}" active>
          ${article.title}
        </app-link>
        <time>[${d(article.createdAt)}]</time>
      </li>
    `);
  }
}

SimilarArticles.styles = css`
  :host {
    font-size: 15px;
  }

  h3 {
    font-weight: normal;
    color: #8f8f8f;
    margin-bottom: 10px;
    font-size: inherit;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    display: flex;
    padding-left: 15px;
    background-image: url(${unsafeCSS(arrowImage)});
    background-position: 0 center;
    background-repeat: no-repeat
  }

  time {
    color: #999;
    font-size: 12px;
  }

  time:before {
    content: "\\2022";
    margin: 0 5px;
  }

  app-link {
    color: #39c;
    text-decoration: underline;
  }

  app-link:hover {
    color: #39c;
    text-decoration: none;
  }
`;
