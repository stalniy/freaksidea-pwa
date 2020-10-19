import { LitElement, html, css } from 'lit-element';
import { codeCss } from '../styles';
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
      <header>
        <app-link to="home">
          <img
            src="/img/header.jpg"
            srcset="
              /img/header-375w.jpg 375w,
              /img/header-768w.jpg 768w,
              /img/header-1024w.jpg 1024w,
              /img/header.jpg 1280w
            "
            sizes="
              (max-width: 375px) 375px,
              (max-width: 768px) 768px,
              (max-width: 1024px) 1024px,
              1280px
            "
          />
        </app-link>
      </header>
      <!-- <fi-lang-picker></fi-lang-picker> -->
    `;
  }

  _renderLink(route) {
    return html`
      <app-link to="${route.name}">${t(`topMenu.${route.name}`)}</app-link>
    `;
  }
}

Header.styles = [
  codeCss,
  css`
    :host {
      display: block;
      --fi-header-menu-text: #ccc;
      --fi-header-menu-size: 11px;
    }

    header {
      display: flex;
      align-items: flex-end;
    }

    header img {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
    }

    app-link[to="home"] {
      text-decoration: none;
    }
  `
];
