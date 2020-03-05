import { LitElement, html, css } from 'lit-element';
import { iconsCss, pageCss } from '../styles';
import { searchArticles } from '../services/articles';
import { t } from '../directives/i18n';
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

  _renderTitle() {
    return this._searchQuery
      ? t('search.title', { query: this._searchQuery })
      : t('search.placeholder');
  }

  render() {
    return html`
      <h1><i class="icon-idea"></i>${this._renderTitle()}</h1>
      <fi-search-block
        value="${this._searchQuery}"
        @update="${this._updateQuery}"
      ></fi-search-block>
      <fi-page-articles category="all" .load="${this._search}">
        <div slot="empty">${t('search.empty')}</div>
      </fi-page-articles>
    `;
  }
}

PageSearch.styles = [
  iconsCss,
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
