import React from 'react';
import styled from 'styled-components';
import { useParams, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from './context';
import { WalletInfo } from './WalletInfo';
import { CreateRole } from './CreateRole';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Wallet = () => {
  const params = useParams();
  const principal = params['*'];

  if (!principal) {
    return <Navigate to='/wallets' replace />;
  }

  return (
    <Provider principal={principal}>
      <Container>
        <Routes>
          <Route path='/*' element={<WalletInfo principal={principal} />} />
          <Route path='/create-role' element={<CreateRole principal={principal} />} />
        </Routes>
      </Container>
    </Provider>
  );
};
