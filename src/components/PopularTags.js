import { html, css } from 'lit-element';
import blockCss from '../styles/block';
import content from '../services/content';
import { locale } from '../services/i18n';
import { t } from '../directives/i18n';
import I18nElement from './I18nElement';

function renderTag(tag) {
  return html`
    <app-link
      active
      to="search"
      .query="${{ q: tag.name }}"
      style="${`font-size: ${fontSize(tag.weight)}px`}"
    >
      ${tag.name}
    </app-link>
  `;
}

function fontSize(weight) {
  const minSize = 10;
  const maxSize = 30;
  return weight * (maxSize - minSize) + minSize;
}

export default class PopularTags extends I18nElement {
  static cName = 'fi-popular-tags';

  constructor() {
    super();
    this._tags = null;
  }

  async update(...args) {
    if (this._tags === null) {
      await this.reload();
    }

    return super.update(...args);
  }

  async reload() {
    this._tags = await content('article').getPopularTags(locale());
  }

  render() {
    if (!this._tags) {
      return html``;
    }

    return html`
      <section class="block">
        <h3 class="title">${t('article.popularTags')}</h3>
        ${this._tags.map(renderTag)}
      </section>
    `;
  }
}

PopularTags.styles = [
  blockCss,
  css`
    :host {
      display: block;
    }

    h4 {
      font-weight: normal;
    }

    app-link {
      vertical-align: baseline;
    }

    app-link + app-link {
      margin-left: 10px;
    }
  `
];
