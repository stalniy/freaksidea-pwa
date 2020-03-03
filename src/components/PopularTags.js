import { LitElement, html, css } from 'lit-element';
import blockCss from '../styles/block';
import { getPopularTags } from '../services/articles';
import i18n from '../services/i18n';

export default class PopularTags extends LitElement {
  static cName = 'fi-popular-tags';

  constructor() {
    super();
    this._tags = null;
  }

  async updated() {
    if (this._tags === null) {
      this._tags = await getPopularTags(i18n.locale());
      this.requestUpdate();
    }
  }

  render() {
    if (!this._tags) {
      return html``;
    }

    return html`
      <section class="block">
        <h3 class="title">${i18n.t('article.popularTags')}</h3>
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
