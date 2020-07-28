import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { iconsCss, mdCss, pageCss, codeCss } from '../styles';
import I18nElement from './I18nElement';
import { interpolate, locale } from '../services/i18n';
import content from '../services/content';
import { setPageMeta } from '../services/meta';
import { tryToNavigateElement, scrollToSectionIn } from '../hooks/scrollToSection';

function renderContent(page, vars) {
  return unsafeHTML(interpolate(page.content, vars));
}

export default class Page extends I18nElement {
  static cName = 'app-page';
  static properties = {
    type: { type: String },
    name: { type: String },
    vars: { type: Object, attribute: false },
    content: { type: Function, attribute: false },
    nav: { type: Array },
    _page: { type: Object },
  };

  constructor() {
    super();

    this._page = null;
    this.nav = [];
    this.name = null;
    this.vars = {};
    this.type = 'page';
    this.content = renderContent;
  }

  connectedCallback() {
    super.connectedCallback();
    this.shadowRoot.addEventListener('click', (event) => {
      tryToNavigateElement(this.shadowRoot, event.target);
    }, false);
  }

  async updated(changed) {
    if (this._page === null || changed.has('name') || changed.has('type')) {
      await this.reload();
    }
  }

  async reload() {
    this._page = await content(this.type).load(locale(), this.name);
    setPageMeta(this._page);
    await this.updateComplete;
    scrollToSectionIn(this.shadowRoot);
  }

  render() {
    if (!this._page) {
      return html``;
    }

    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h1><i class="icon-idea"></i>${interpolate(this._page.title)}</h1>
        <div class="description md">${this.content(this._page, this.vars)}</div>
      </article>
    `;
  }

  _renderContent(page, vars) {
    return unsafeHTML(interpolate(page.content, vars));
  }
}

Page.styles = [
  iconsCss,
  pageCss,
  mdCss,
  codeCss,
];
