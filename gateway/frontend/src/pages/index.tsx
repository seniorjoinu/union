import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { theme } from '@union/components';
import { ProvideAuth } from 'services';
import { RouterPage } from './RouterPage';

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    background: ${theme.colors.light};

    * {
      font-family: -apple-system, Stolzl, sans-serif;
      font-family: -apple-system, OpenSans, sans-serif;
      font-style: normal;
      font-weight: 400;
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

const root = createRoot(document.getElementById('root')!);

root.render(
  // FIXME React.StrictMode incorrectly renders component twice. Try return React.StrictMode and check Pager useEffect
  <>
    <GlobalStyle />
    <ThemeProvider theme={theme}>
      <ProvideAuth>
        <RouterPage />
      </ProvideAuth>
    </ThemeProvider>
  </>,
);
