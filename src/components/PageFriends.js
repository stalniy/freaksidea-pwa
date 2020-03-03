import { html } from 'lit-element';
import Page from './Page';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import articleCss from '../styles/article';

export default class PageFriends extends Page {
  static cName = 'fi-page-friends';

  constructor() {
    super();

    this.name = 'friends';
  }

  renderContent(page) {
    return page.items.map(friend => html`
      <div class="article">
        <h4 class="title">
          <a target="_blank" href="${friend.url}" rel="nofollow">${friend.title}</a>
        </h4>
        <div class="summary md">${unsafeHTML(friend.summary)}</div>
      </div>
    `);
  }
}

PageFriends.styles = [
  ...Page.styles,
  articleCss,
];
