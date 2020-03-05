import { html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { iconsCss, mdCss, pageCss } from '../styles';
import I18nElement from './I18nElement';
import { interpolate, locale } from '../services/i18n';
import { fetch } from '../services/http';
import { setPageMeta } from '../services/articles';
import { pages } from '../content/pages.pages';

export default class Page extends I18nElement {
  static cName = 'fi-page';
  static properties = {
    name: { type: String },
    vars: { type: Object, attribute: false },
    content: { type: Function, attribute: false },
  }

  constructor() {
    super();

    this._page = null;
    this.name = null;
    this.vars = null;
    this.content = this._renderContent;
    this._unwatchLang = null;
  }

  async update(changed) {
    if (this._page === null || changed.has('name')) {
      await this.reload();
    }

    return super.update(changed);
  }

  async reload() {
    this._page = await fetch(pages[locale()][this.name]);
    setPageMeta(this._page);
  }

  render() {
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
];
