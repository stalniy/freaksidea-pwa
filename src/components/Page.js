import { LitElement, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import i18n, { interpolate } from '../services/i18n';
import { setPageMeta } from '../services/articles';
import { pages } from '../content/pages.pages';
import iconCss from '../styles/icons';
import mdCss from '../styles/md';
import pageCss from '../styles/page';

export default class Page extends LitElement {
  static cName = 'fi-page';
  static properties = {
    name: { type: String },
    vars: { type: Object, attribute: false },
  }

  constructor() {
    super();

    this.name = null;
    this._page = null;
    this.vars = null;
  }

  async update(changed) {
    if (this._page === null || changed.has('name')) {
      const response = await fetch(pages[i18n.locale()][this.name]);
      this._page = await response.json();
      setPageMeta(this._page);
    }

    return super.update(changed);
  }

  render() {
    return html`
      <article itemscope itemtype="http://schema.org/Article">
        <h1><i class="icon-idea"></i>${interpolate(this._page.title)}</h1>
        <div class="description md">
          ${this.renderContent(this._page, this.vars)}
        </div>
      </article>
    `;
  }

  renderContent(page, vars) {
    return unsafeHTML(interpolate(page.content, vars));
  }
}

Page.styles = [
  iconCss,
  pageCss,
  mdCss,
];
