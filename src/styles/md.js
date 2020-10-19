import { css } from 'lit-element';

export default css`
  .md pre {
    overflow: auto;
  }

  .md a {
    color: var(--app-link-active-color);
  }

  .md hr {
    display: block;
    margin: 15px 0;
    font-size: 24px;
    line-height: 1.4;
    text-align: center;
    box-sizing: content-box;
    border: 0;
  }

  .md hr:before {
    display: inline-block;
    content: '...';
    font-weight: 400;
    font-style: italic;
    font-size: 30px;
    letter-spacing: .6em;
    margin-left: .6em;
    color: rgba(0,0,0,.68);
  }

  .md blockquote {
    padding: 0.8rem 1rem;
    margin: 0;
    border-left: 4px solid #81a2be;
    background-color: #f8f8f8;
    position: relative;
    border-bottom-right-radius: 2px;
    border-top-right-radius: 2px;
  }

  .md blockquote:before {
    position: absolute;
    top: 0.8rem;
    left: -12px;
    color: #fff;
    background: #81a2be;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    text-align: center;
    line-height: 20px;
    font-weight: bold;
    font-size: 14px;
    content: 'i';
  }

  .md blockquote > p:first-child {
    margin-top: 0;
  }

  .md blockquote > p:last-child {
    margin-bottom: 0;
  }

  .md blockquote + blockquote {
    margin-top: 20px;
  }

  .md table {
    border-collapse: collapse;
    width: 100%;
  }

  .md .responsive {
    width: 100%;
    overflow-x: auto;
  }

  .md th,
  .md td {
    border: 1px solid #c6cbd1;
    padding: 6px 13px;
  }

  .md tr {
    border-top: 1px solid #c6cbd1;
  }

  .md .editor {
    width: 100%;
    height: 500px;
    border: 0;
    border-radius: 4px;
    overflow: hidden;
  }

  .md h3::before {
    margin-left: -15px;
    margin-right: 5px;
    content: '#';
    color: #81a2be;
  }
`;
