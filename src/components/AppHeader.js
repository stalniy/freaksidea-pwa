import { LitElement, html, css, unsafeCSS } from 'lit-element';
import logoUrl from '../assets/logo.jpg';
import sloganUrl from '../assets/slogan.jpg';
import { t } from '../directives/i18n';

export default class Header extends LitElement {
  static cName = 'fi-header';
  static properties = {
    items: { type: Array }
  };

  constructor() {
    super();
    this.items = [];
  }

  render() {
    return html`
      <nav>
        ${this.items.map(this._renderLink, this)}
      </nav>
      <header>
        <fi-link to="home" class="logo"></fi-link>
        <fi-link to="home" class="slogan">
          <img src="${sloganUrl}" />
        </fi-link>
      </header>
      <fi-lang-picker></fi-lang-picker>
    `;
  }

  _renderLink(name) {
    return html`
      <fi-link to="${name}">${t(`topMenu.${name}`)}</fi-link>
    `;
  }
}

Header.styles = css`
  :host {
    display: block;
    --fi-header-menu-text: #ccc;
    --fi-header-menu-size: 11px;
  }

  nav {
    height: 20px;
    text-align: right;
  }

  nav fi-link {
    font-size: var(--fi-header-menu-size);
    color: var(--fi-header-menu-text);
    font-style: italic;
    margin-left: 5px;
  }

  header {
    display: flex;
    align-items: flex-end;
    height: 292px;
  }

  stencil-route-link {
    display: inline-block;
    margin-left: 5px;
  }

  .logo {
    flex: 0 0 204px;
    background: url(${unsafeCSS(logoUrl)}) no-repeat 0 0;
    height: 100%;
  }

  .slogan {
    flex: 1;
    height: 220px;
  }

  .slogan img {
    width: 100%;
    max-width: 752px;
  }
`;
