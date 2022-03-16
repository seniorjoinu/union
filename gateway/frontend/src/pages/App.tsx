import React from 'react';
import {Switch, Route} from 'react-router-dom';
import styled from 'styled-components';
import { Header } from '../features/Header';

const Container = styled.main`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export function App() {
  return (
    <Container>
      <Header />
      <Switch>
        <Route
          path='/profile'
          render={({match: {params}}) => <span>profile workspace</span>}
        />
      </Switch>
    </Container>
  )
}
