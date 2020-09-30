import { LitElement, html, css } from 'lit-element';
import blockCss from '../styles/block';
import mdCss from '../styles/md';
import { t, ut } from '../directives/i18n';

export default class Block extends LitElement {
  static cName = 'fi-block';
  static properties = {
    name: { type: String },
    sticky: { type: Boolean },
  };

  constructor() {
    super();
    this.name = '';
    this.sticky = false;
  }

  render() {
    return html`
      <section class="block">
        <h3 class="title">${t(`blocks.${this.name}.title`)}</h3>
        <slot>
          <div class="md">${ut(`blocks.${this.name}.content`)}</div>
        </slot>
      </section>
    `;
  }
}

Block.styles = [
  blockCss,
  mdCss,
  css`
    :host {
      display: block;
    }

    :host([sticky]) {
      position: sticky;
      top: 10px;
    }
  `
]
