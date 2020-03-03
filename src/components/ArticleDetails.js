import { LitElement, html, css } from 'lit-element';
import i18n from '../services/i18n';

export default class ArticleDetails extends LitElement {
  static cName = 'fi-article-details';
  static properties = {
    article: { type: Object, attribute: false },
    category: { type: String },
  };

  constructor(...args) {
    super(...args);
    this.article = null;
    this.category = '';
  }

  render() {
    const { article } = this;
    const category = this.category || article.categories[0];

    return html`
      <time datetime="${article.createdAt}" itemprop="datePublished">
        ${i18n.d(article.createdAt)}
      </time>
      <span>
        ${i18n.t('article.author')}
        <span itemprop="author">${i18n.t(`article.authors.${article.author}`)}</span>
      </span>
      <slot name="more">
        <fi-link to="${category}" hash="comments" .params="${article}">
          <i class="icon-comment"></i>${article.commentsCount || 0}
        </fi-link>
        <fi-link to="${category}" .params="${article}" class="more">${i18n.t('article.readMore')}</fi-link>
      </slot>
    `;
  }
}

ArticleDetails.styles = [
  css`
    :host {
      margin-top: 10px;
      color: var(--fi-article-details-color, #999);
      font-size: 11px;
    }

    :host > * {
      margin-right: 10px;
    }

    fi-link {
      color: var(--fi-link-active-color);
    }

    fi-link > [class^="icon-"] {
      margin-right: 5px;
    }
  `
]
