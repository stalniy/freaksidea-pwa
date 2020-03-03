import { css } from 'lit-element';

export default css`
  .form-group {
    margin-bottom: 10px;
    box-shadow: 0 0 20px #eaeeef;
  }

  .form-group.focused {
    box-shadow: #769fa9 0 6px 20px;
  }

  input, textarea {
    box-sizing: border-box;
    width: 100%;
    border: 0;
    padding: 5px 10px;
    font-size: 14px;
    line-height: 20px;
    color: #555555;
    border-radius: 3px;
  }

  .btn {
    background: #e9ebf1;
    cursor: pointer;
    vertical-align: middle;
    display: inline-block;
    padding: 5px 10px;
    border-radius: 4px;
    box-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    color: #666;
    font-size: 13px;
  }

  .form-actions {
    text-align: right;
  }
`;
