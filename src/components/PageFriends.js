import { LitElement, html } from 'lit-element';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { articleCss } from '../styles';

export default class PageFriends extends LitElement {
  static cName = 'fi-page-friends';

  render() {
    return html`
      <fi-page name="friends" .content="${this._renderFriends}"></fi-page>
    `;
  }

  _renderFriends(page) {
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
  articleCss,
];
