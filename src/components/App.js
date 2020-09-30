import { LitElement, html, css } from 'lit-element';
import { topMenu, menu } from '../config/menu.yml';
import router from '../services/router';
import gridCss from '../styles/grid';

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

export default class App extends LitElement {
  static cName = 'fi-app';
  static properties = {
    ready: { type: Boolean }
  };

  constructor() {
    super();
    this._route = null;
    this.ready = false;
  }

  connectedCallback() {
    super.connectedCallback();
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
      <div class="wrapper">
        <fi-header .items="${topMenu}"></fi-header>
        <fi-menu .items="${menu}" .activeItem="${this._route.name}"></fi-menu>
        <section class="row content" id="content">
          <main>${this._route.body.main}</main>
          <aside>
            <fi-search-block reset-after-search></fi-search-block>
            <fi-popular-articles></fi-popular-articles>
            <fi-popular-tags></fi-popular-tags>
            <fi-block name="sidebarAd" sticky></fi-block>
          </aside>
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
      margin-top: 50px;
    }

    .wrapper {
      padding: 0 40px;
    }

    .content {
      margin-top: 35px;
    }

    .content > main {
      flex-basis: 70%;
      max-width: 70%;
    }

    .content > aside {
      flex-basis: 30%;
      max-width: 30%;
      padding-left: 20px;
    }
  `
];
