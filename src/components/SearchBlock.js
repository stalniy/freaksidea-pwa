import { LitElement, html, css } from 'lit-element';
import formCss from '../styles/form';
import i18n from '../services/i18n';
import { autoSuggestArticles } from '../services/articles';
import router from '../services/router';

function debounce(fn, timeout) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    setTimeout(() => fn.apply(this, args), timeout);
  };
}

export default class SearchBlock extends LitElement {
  static cName = 'fi-search-block';
  static properties = {
    value: { type: String },
    resetAfterSearch: { type: Boolean },
  };

  constructor() {
    super();

    this.value = '';
    this.resetAfterSearch = false;
    this._suggestions = [];
    this._clickOutside = this._clickOutside.bind(this);
    this._search = debounce(this._search, 500);
  }

  _setValue(value) {
    this.value = value.trim();
    this.dispatchEvent(new CustomEvent('update', {
      detail: this.value
    }));
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._clickOutside, false);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._clickOutside, false);
    super.disconnectedCallback();
  }

  _clickOutside(event) {
    if (!this.shadowRoot.contains(event.target)) {
      this._suggestions = [];
      this.requestUpdate();
    }
  }

  async _search() {
    if (this.value) {
      this._suggestions = await autoSuggestArticles(i18n.locale(), this.value);
    } else {
      this._suggestions = [];
    }

    this.requestUpdate();
  }

  _updateValue(event) {
    this._setValue(event.target.value);
    this._search();
  }

  _submit(event) {
    if (event) {
      event.preventDefault();
    }

    const q = this.value;

    if (!q) {
      return;
    }

    if (this.resetAfterSearch) {
      this._setValue('');
    }

    this._suggestions = [];
    this.requestUpdate();
    router.navigate({
      url: router.url({
        name: 'search',
        query: { q }
      })
    });
  }

  render() {
    const styles = this._suggestions.length
      ? `height: ${this.clientHeight}px; position: relative;`
      : '';
    return html`
      <form style="${styles}" @submit="${this._submit}">
        <div class="form-group ${this._suggestions.length ? 'focused' : ''}">
          <input
            placeholder="${i18n.t('search.placeholder')}"
            .value="${this.value}"
            @input="${this._updateValue}"
          >
          ${this._renderSuggestions()}
        </div>
      </form>
    `;
  }

  _renderSuggestions() {
    if (!this._suggestions.length) {
      return '';
    }

    return html`
      <ul class="suggestions" @click="${this._pickSuggestion}">
        ${this._suggestions.map(item => html`<li>${item.suggestion}</li>`)}
      </ul>
    `;
  }

  _pickSuggestion(event) {
    this._suggestions = [];
    this._setValue(event.target.textContent);
    this._submit();
  }

  focus() {
    this.updateComplete
      .then(() => this.shadowRoot.querySelector('input').focus());
  }
}

SearchBlock.styles = [
  formCss,
  css`
    :host {
      display: block;
    }

    .suggestions {
      background: #fff;
      list-style: none;
      margin: 0;
      padding: 0;
      border-radius: 0 0 4px 4px;
    }

    .suggestions:before {
      display: block;
      content: '';
      width: 98%;
      margin: 0 auto;
      border-top: 1px solid #e8eaed;
    }

    li {
      cursor: pointer;
      padding: 5px 10px;
    }

    li:hover {
      background: #eee;
    }

    input:focus {
      outline: transparent;
    }

    .form-group {
      border-radius: 5px;
    }

    .form-group.focused {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
  `
];
