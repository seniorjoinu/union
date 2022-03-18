import React from 'react';
import { Router, Switch, Redirect, Route } from 'react-router-dom';
import { Progress } from 'components';
import { useAuth, AuthReadyState, history } from '../services';
import { Wallets } from '../features/Wallets';
import { App } from './App';
import { EmbedPage } from './EmbedPage';
import { AuthPage } from './AuthPage';

export function RouterPage() {
  const { isAuthReady, isAuthentificated } = useAuth();

  if (isAuthReady < AuthReadyState.READY) {
    return <Progress absolute size={48} />;
  }

  const { mode } = queryParams;

  return (
    <Router history={history}>
      <Switch>
        <Route path='/auth' render={() => <AuthPage to='/wallets' />} />
        <Route path={['/embed']} render={() => <EmbedPage />} />
        {mode == 'embed' && <Redirect to='/embed' />}
        {!isAuthentificated && <Redirect to='/auth' />}
        <Route
          path=''
          render={() =>
            <App>
              <Switch>
                <Route path='/wallets' component={Wallets} />
              </Switch>
            </App>
          }
        />
      </Switch>
    </Router>
  );
}
