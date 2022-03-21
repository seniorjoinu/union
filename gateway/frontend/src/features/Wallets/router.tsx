import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { WalletsList } from './List';
import { CreateWallet } from './Create';

export const Wallets = () => (
  <Routes>
    <Route path='/create' element={<CreateWallet />} />
    <Route path='/*' element={<WalletsList />} />
  </Routes>
);
