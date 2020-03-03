import { LitElement, html, css } from 'lit-element';
import i18n from '../services/i18n'

export default class Menu extends LitElement {
  static cName = 'fi-menu';
  static properties = {
    items: { type: Array },
    activeItem: { type: String },
  };

  constructor(...args) {
    super(...args);

    this.items = [];
    this.activeItem = null;
  }

  render() {
    return html`
      <nav
        role="navigation"
        itemscope
        itemtype="http://schema.org/SiteNavigationElement"
      >
        ${this.items.map(this._renderLink, this)}
      </nav>
    `;
  }

  _renderLink(name) {
    return html`
      <fi-link to="${name}" .active="${this.activeItem === name}">
        ${i18n.t(`categories.${name}.title`)}
      </fi-link>
    `;
  }
}

Menu.styles = css`
:host {
  display: block;
  --fi-menu-text-color: #323232;
  --fi-menu-text-size: 21px;
}

fi-link {
  display: inline-block;
  font-size: var(--fi-menu-text-size);
  color: var(--fi-menu-text-color);
  margin-right: 35px;
}
`;
