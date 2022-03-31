import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from 'components';
import { ProvideAuth } from 'services';
import { RouterPage } from './RouterPage';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;

    * {
      box-sizing: border-box;
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
    <ThemeProvider theme={theme}>
      <ProvideAuth>
        <RouterPage />
      </ProvideAuth>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
);
