import { LitElement, html, css } from 'lit-element';
import { topMenu, menu } from '../config/menu.yml';
import router from '../services/router';
import gridCss from '../styles/grid';
import watchMedia from '../hooks/watchMedia';

function createNotificationsRoot() {
  const root = document.createElement('div');

  Object.assign(root.style, {
    position: 'fixed',
    right: '10px',
    bottom: '10px',
    zIndex: 50,
    width: '320px'
  });
  document.body.appendChild(root);
  return root;
}

function renderSidebar() {
  return html`
    <aside>
      <fi-search-block reset-after-search></fi-search-block>
      <fi-popular-articles></fi-popular-articles>
      <fi-popular-tags></fi-popular-tags>
      <fi-block name="sidebarAd" sticky>
        <slot name="sidebar.ad"></slot>
      </fi-block>
    </aside>
  `;
}

export default class App extends LitElement {
  static cName = 'fi-app';
  static properties = {
    ready: { type: Boolean },
    _isDesktop: { type: Boolean }
  };

  constructor() {
    super();
    this._route = null;
    this.ready = false;
  }

  connectedCallback() {
    super.connectedCallback();
    watchMedia('(min-width: 1024px)', v => this._isDesktop = v);
    router.observe((route) => {
      this._route = route.response;
      this.requestUpdate();
    }, { initial: true });
  }

  notify(message, options = {}) {
    const notification = document.createElement('app-notification');

    notification.message = message;

    if (typeof options.onClick === 'function') {
      notification.addEventListener('click', options.onClick, false);
    }

    this._notificationsRoot = this._notificationsRoot || createNotificationsRoot();
    this._notificationsRoot.appendChild(notification);
  }

  render() {
    if (!this._route || !this.ready) {
      return html``;
    }

    return html`
      <fi-header .items="${topMenu}"></fi-header>
      <div class="wrapper">
        <fi-menu .items="${menu}" .activeItem="${this._route.name}"></fi-menu>
        <section class="content ${this._isDesktop ? 'row' : ''}" id="content">
          <main>${this._route.body.main}</main>
          ${this._isDesktop ? renderSidebar() : null}
        </section>
      </div>
      <fi-footer></fi-footer>
    `;
  }
}

App.styles = [
  gridCss,
  css`
    :host {
      display: block;
    }

    fi-menu {
      margin-top: 20px;
    }

    .content {
      margin-top: 35px;
    }

    .row.content > main {
      flex-basis: 70%;
      max-width: 70%;
    }

    .row.content > aside {
      flex-basis: 30%;
      max-width: 30%;
      padding-left: 20px;
    }

    .wrapper {
      padding: 0 20px;
    }

    @media(min-width: 768px) {
      .wrapper,
      fi-header {
        padding: 0 40px;
      }

      fi-menu {
        margin-top: 50px;
      }
    }
  `
];
