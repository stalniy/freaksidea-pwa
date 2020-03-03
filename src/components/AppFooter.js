import { LitElement, html, css, unsafeCSS } from 'lit-element';
import footerUrl from '../assets/footer.jpg';
import i18n from '../services/i18n';

export default class Footer extends LitElement {
  static cName = 'fi-footer';

  year = new Date().getFullYear();

  render() {
    return html`
      <span class="copyright">${i18n.t('copyright', { year: this.year })}</span>
      <div class="counters"></div>
    `;
  }
}

Footer.styles = css`
:host {
  --fi-footer-background: #838385;
  --fi-footer-text-color: #fff;
  --fi-footer-text-size: 13px;
  --fi-footer-height: 100px;

  display: block;
  margin-top: 30px;
  height: var(--fi-footer-height);
  padding-top: 70px;
  background: var(--fi-footer-background) url(${unsafeCSS(footerUrl)}) no-repeat center 0;
  font-size: var(--fi-footer-text-size);
  text-align: center;
  color: var(--fi-footer-text-color);
}

.copyright {
  text-shadow: #000 0 5px 3px;
}
`;
