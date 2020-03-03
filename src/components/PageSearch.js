import { LitElement, html, css } from 'lit-element';
import iconCss from '../styles/icons';
import pageCss from '../styles/page';
import { searchArticles } from '../services/articles';
import i18n from '../services/i18n';
import router from '../services/router';
import { setTitle, setMeta } from '../services/meta';

export default class PageSearch extends LitElement {
  static cName = 'fi-page-search';

  constructor() {
    super();
    this._search = this._search.bind(this);
    this._searchQuery = '';
    this._unsubscribeFromRouter = null;
    this._title = '';
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
    setTitle(i18n.t('search.placeholder'));
    this.shadowRoot.querySelector('fi-search-block').focus();
  }

  update(...args) {
    this._title = this._searchQuery
      ? i18n.t('search.title', { query: this._searchQuery })
      : i18n.t('search.placeholder');

    setMeta('keywords', this._searchQuery ? this._searchQuery.split(/\s+/) : '');
    setMeta('description', '');

    return super.update(...args);
  }

  _updateQuery(event) {
    this._setQuery(event.detail);
  }

  _search(locale) {
    return searchArticles(locale, this._searchQuery);
  }

  render() {
    return html`
      <h1><i class="icon-idea"></i>${this._title}</h1>
      <fi-search-block
        value="${this._searchQuery}"
        @update="${this._updateQuery}"
      ></fi-search-block>
      <fi-page-articles category="all" .load="${this._search}">
        <div slot="empty">${i18n.t('search.empty')}</div>
      </fi-page-articles>
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
