import { LitElement, html, css } from 'lit-element';
import iconCss from '../styles/icons';
import pageCss from '../styles/page';
import { searchArticles } from '../services/articles';
import i18n from '../services/i18n';
import router from '../services/router';

export default class PageSearch extends LitElement {
  static cName = 'fi-page-search';

  constructor() {
    super();
    this._search = this._search.bind(this);
    this._searchQuery = '';
    this._unsubscribeFromRouter = null;
  }

  _setQuery(value) {
    this._searchQuery = value || '';
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this._unsubscribeFromRouter = router.observe((route) => {
      this._setQuery(decodeURIComponent(route.response.location.query.q));
    }, { initial: true });
  }

  firstUpdated() {
    this.shadowRoot.querySelector('fi-search-block').focus();
  }

  _updateQuery(event) {
    this._setQuery(event.detail);
  }

  _search(locale) {
    return searchArticles(locale, this._searchQuery);
  }

  render() {
    const title = this._searchQuery
      ? i18n.t('search.title', { query: this._searchQuery })
      : i18n.t('search.placeholder');
    return html`
      <h1><i class="icon-idea"></i>${title}</h1>
      <fi-search-block
        value="${this._searchQuery}"
        @update="${this._updateQuery}"
      ></fi-search-block>
      <fi-page-articles
        category="all"
        .load="${this._search}"
      ></fi-page-articles>
    `;
  }
}

PageSearch.styles = [
  iconCss,
  pageCss,
  css`
    :host {
      display: block;
    }

    fi-search-block {
      margin: 0 10px 20px 10px;
    }
  `
];
