import { LitElement, html, css } from 'lit-element';
import { t, d } from '../directives/i18n';

export default class ArticleDetails extends LitElement {
  static cName = 'fi-article-details';
  static properties = {
    article: { type: Object, attribute: false },
    category: { type: String },
  };

  constructor() {
    super();
    this.article = null;
    this.category = '';
  }

  render() {
    const { article } = this;
    const category = this.category || article.categories[0];

    return html`
      <time datetime="${article.createdAt}" itemprop="datePublished">
        ${d(article.createdAt)}
      </time>
      <span>
        ${t('article.author')}
        <span itemprop="author">${t(`article.authors.${article.author}`)}</span>
      </span>
      <slot name="more">
        <fi-link to="${category}" hash="comments" .params="${article}">
          <i class="icon-comment"></i>${article.commentsCount || 0}
        </fi-link>
        <fi-link to="${category}" .params="${article}" class="more">${t('article.readMore')}</fi-link>
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
      margin-right: 10px;
      color: var(--fi-link-active-color);
    }

    fi-link > [class^="icon-"] {
      margin-right: 5px;
    }
  `
]
