import { LitElement, html, css } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import blockCss from '../styles/block';
import mdCss from '../styles/md';
import i18n from '../services/i18n';

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
        <h3 class="title">${i18n.t(`blocks.${this.name}.title`)}</h3>
        <div class="md">${unsafeHTML(i18n.t(`blocks.${this.name}.content`))}</div>
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
