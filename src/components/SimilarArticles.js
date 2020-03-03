import { LitElement, html, css, unsafeCSS } from 'lit-element';
import i18n from '../services/i18n';
import { getSimilarArticles } from '../services/articles';
import arrowImage from '../assets/arrow-right.jpg';

export default class SimilarArticles extends LitElement {
  static cName = 'fi-similar-articles';
  static properties = {
    to: { type: Object },
  };

  constructor(...args) {
    super(...args);
    this.to = null;
    this._articles = null;
  }

  async update(changed) {
    if (this._articles === null || changed.has('to')) {
      this._articles = await getSimilarArticles(i18n.locale(), this.to);
    }

    return super.update(changed);
  }

  render() {
    return html`
      <h3>${i18n.t('article.readSimilar')}</h3>
      <ul>${this._renderSimilarArticles()}</ul>
    `;
  }

  _renderSimilarArticles() {
    return this._articles.map(article => html`
      <li>
        <fi-link to="${article.categories[0]}" .params="${article}" active>
          ${article.title}
        </fi-link>
        <time>${`[${i18n.d(article.createdAt)}]`}</time>
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
`;
