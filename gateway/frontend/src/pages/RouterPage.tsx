import React from 'react';
import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { Progress } from 'components';
import { useAuth, AuthReadyState } from 'services';
import { Wallets } from '../features/Wallets';
import { Wallet } from '../features/Wallet';
import { AppPage } from './AppPage';
import { AuthPage } from './AuthPage';

export function RouterPage() {
  const { isAuthReady, isAuthentificated } = useAuth();

  if (isAuthReady < AuthReadyState.READY) {
    return <Progress absolute size={48} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/auth' element={<AuthPage to='/wallets' />} />
        {!isAuthentificated && <Route path='/*' element={<Navigate to='/auth' replace />} />}
        <Route path='/' element={<Navigate to='/walets' replace />} />
        <Route
          path='/*'
          element={
            <AppPage>
              <Routes>
                <Route path='/wallets/*' element={<Wallets />} />
                <Route path='/wallet/:id/*' element={<Wallet />} />
              </Routes>
            </AppPage>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
