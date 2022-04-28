import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth, AuthReadyState } from '../auth';
import { App } from './App';

export function Router() {
  const { isAuthReady } = useAuth();

  if (isAuthReady !== AuthReadyState.READY) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/*' element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
