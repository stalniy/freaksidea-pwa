import { LitElement, html, css } from 'lit-element';

const BORN_AT = new Date(1989, 7, 31);

function calcYears() {
  const now = new Date();
  const years = now.getFullYear() - BORN_AT.getFullYear();

  now.setFullYear(BORN_AT.getFullYear());

  return now.getTime() - BORN_AT.getTime() > 0 ? years : years - 1;
}

export default class PageAbout extends LitElement {
  static cName = 'fi-page-about';

  constructor() {
    super();

    this.vars = {
      years: calcYears(),
    };
  }

  render() {
    return html`
      <fi-page name="about" .vars="${this.vars}"></fi-page>
      <fi-contact-form></fi-contact-form>
    `;
  }
}

PageAbout.styles = css`
  :host {
    display: block;
    padding-bottom: 100px;
  }

  fi-contact-form {
    display: block;
    margin-top: 10px;
    max-width: 440px;
  }
`;
