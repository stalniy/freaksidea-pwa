import { css } from 'lit-element';

export default css`
  article, .article {
    margin-bottom: 30px;
  }

  article .summary,
  .article .summary {
    color: var(--fi-article-summary-color, #333);
    padding-left: 5px;
  }

  article .summary img,
  .article .summary img {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
  }

  article .title,
  .article .title {
    font-size: 22px;
    color: var(--fi-article-title-color, #323232);
    text-decoration: none;
    font-weight: normal;
    margin: 0;
    margin-bottom: 10px;
  }

  article .title app-link,
  .article .title app-link {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  article .title a,
  .article .title a {
    font-size: inherit;
    color: inherit;
  }
`;
