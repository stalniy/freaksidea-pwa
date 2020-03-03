import { LitElement, html, css } from 'lit-element';
import i18n from '../services/i18n';
import formCss from '../styles/form';
import gridCss from '../styles/grid';

export default class ContactForm extends LitElement {
  static cName = 'fi-contact-form';

  render() {
    return html`
      <form>
        <div class="row">
          <div class="col form-group">
            <input name="name" placeholder="${i18n.t('contacts.name')}">
          </div>
          <div class="col form-group">
            <input type="email" name="email" placeholder="${i18n.t('contacts.email')}">
          </div>
        </div>
        <div class="form-group">
          <textarea
            rows="5"
            name="message"
            placeholder="${i18n.t('contacts.message')}"
          ></textarea>
        </div>
        <div class="form-actions">
          <button class="btn" type="submit">${i18n.t('contacts.submit')}</button>
        </div>
    </form>
    `;
  }
}

ContactForm.styles = [
  formCss,
  gridCss,
  css`
    .row .form-group + .form-group {
      margin-left: 10px;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }
  `
];
