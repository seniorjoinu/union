import React from 'react';
import { BrowserRouter, Routes, Navigate, Route } from 'react-router-dom';
import { Progress } from 'components';
import { useAuth, AuthReadyState } from 'services';
import { Wallets } from '../features/Wallets';
import { Wallet } from '../features/Wallet';
import { App } from './App';
import { EmbedPage } from './EmbedPage';
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
        <Route path='/embed' element={<EmbedPage />} />
        {!isAuthentificated && <Route path='/*' element={<Navigate to='/auth' replace />} />}
        <Route path='/' element={<Navigate to='/walets' replace />} />
        <Route
          path='/*'
          element={
            <App>
              <Routes>
                <Route path='/wallets/*' element={<Wallets />} />
                <Route path='/wallet/:id/*' element={<Wallet />} />
              </Routes>
            </App>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
