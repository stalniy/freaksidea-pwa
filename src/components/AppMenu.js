import { LitElement, html, css } from 'lit-element';
import { t } from '../directives/i18n'

export default class Menu extends LitElement {
  static cName = 'fi-menu';
  static properties = {
    items: { type: Array },
    activeItem: { type: String },
  };

  constructor() {
    super();

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

  _renderLink({ name, exact }) {
    return html`
      <app-link to="${name}" nav="${exact ? 'exact' : ''}">${t(`categories.${name}.title`)}</app-link>
    `;
  }
}

Menu.styles = css`
:host {
  display: block;
  --fi-menu-text-color: #323232;
  --fi-menu-text-size: 21px;
}

app-link {
  display: inline-block;
  font-size: var(--fi-menu-text-size);
}

app-link.active {
  color: #81a2be;
}

app-link + app-link {
  margin-left: 10px;
}

@media(min-width: 768px) {
  app-link + app-link {
    margin-left: 35px;
  }
}
`;
