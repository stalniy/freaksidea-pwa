import { html, css } from 'lit-element';
import blockCss from '../styles/block';
import { getPopularTags } from '../services/articles';
import { locale } from '../services/i18n';
import { t } from '../directives/i18n';
import I18nElement from './I18nElement';

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
    this._tags = await getPopularTags(locale());
  }

  render() {
    if (!this._tags) {
      return html``;
    }

    return html`
      <section class="block">
        <h3 class="title">${t('article.popularTags')}</h3>
        ${this._tags.map(this._renderTag, this)}
      </section>
    `;
  }

  _renderTag(tag) {
    const style = `font-size: ${tag.weight * 200}%`;
    return html`
      <fi-link
        active
        to="search"
        .query="${{ q: tag.name }}"
        style="${style}"
      >
        ${tag.name}
      </fi-link>
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

    fi-link {
      vertical-align: baseline;
    }

    fi-link + fi-link {
      margin-left: 10px;
    }
  `
];
