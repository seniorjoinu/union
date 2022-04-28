import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import { ProvideAuth } from '../auth';
import { Router } from './Router';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;

    * {
      box-sizing: border-box;
      font-family: -apple-system, Arial, sans-serif;
    }
  }

  body {
    overflow: auto;
  }
  #root {
    margin: 0;
    padding: 0;
  }
`;

ReactDOM.render(
  <React.StrictMode>
    <GlobalStyle />
    <ProvideAuth>
      <Router />
    </ProvideAuth>
  </React.StrictMode>,
  document.getElementById('root'),
);
