import { css } from 'lit-element';

export default css`
  .row {
    display: flex;
  }

  .col {
    flex-grow: 1;
    flex-basis: 0;
    max-width: 100%;
  }
`;
