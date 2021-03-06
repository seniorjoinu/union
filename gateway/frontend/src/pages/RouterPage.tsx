import React from 'react';
import { unstable_HistoryRouter as HistoryRouter, Routes, Navigate, Route } from 'react-router-dom';
import { Progress } from '@union/components';
import { useAuth, AuthReadyState } from 'services';
import { createBrowserHistory } from 'toolkit';
import { Versions } from '../features/Versions';
import { Notifications } from '../features/Notifications';
import { Explore } from '../features/Explore';
import { Wallets } from '../features/Wallets';
import { Wallet } from '../features/Wallet';
import { AppPage } from './AppPage';
import { AuthPage } from './AuthPage';

export const history = createBrowserHistory({
  preservedQueryParams: [],
});

export function RouterPage() {
  const { isAuthReady, isAuthentificated } = useAuth();

  if (isAuthReady < AuthReadyState.READY) {
    return <Progress absolute size={48} />;
  }

  return (
    <HistoryRouter history={history}>
      <Routes>
        <Route path='/auth' element={<AuthPage to='/wallets' />} />
        {!isAuthentificated && <Route path='/*' element={<Navigate to='/auth' replace />} />}
        <Route path='/' element={<Navigate to='/wallets' replace />} />
        <Route
          path='/*'
          element={
            <AppPage>
              <Routes>
                <Route path='/explore' element={<Explore />} />
                <Route path='/versions' element={<Versions />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/wallets/*' element={<Wallets />} />
                <Route path='/wallet/:id/*' element={<Wallet />} />
              </Routes>
            </AppPage>
          }
        />
      </Routes>
    </HistoryRouter>
  );
}
