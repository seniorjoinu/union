import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { ProvideAuth } from '../auth';
import { UnionProvider } from '../union';
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

const root = createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <GlobalStyle />
    <ProvideAuth>
      <UnionProvider>
        <Router />
      </UnionProvider>
    </ProvideAuth>
  </React.StrictMode>,
);
