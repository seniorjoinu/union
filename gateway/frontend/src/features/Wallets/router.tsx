import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthorizeWallet } from './Authorize';
import { WalletsList } from './List';
import { CreateWallet } from './Create';

export const Wallets = () => (
  <Routes>
    <Route path='/authorize' element={<AuthorizeWallet />} />
    <Route path='/create' element={<CreateWallet />} />
    <Route path='/*' element={<WalletsList />} />
  </Routes>
);
