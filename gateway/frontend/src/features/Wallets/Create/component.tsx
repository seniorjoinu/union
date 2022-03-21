import React, { useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Payed } from './Payed';
import { NotPayed } from './NotPayed';

const Center = styled.div`
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Center} {
    align-self: center;
    max-width: 700px;
  }
`;

export const CreateWallet = () => {
  const [createdWallet, setCreatedWallet] = useState<Principal | null>(null);

  return (
    <Container>
      <Center>
        {createdWallet ? (
          <Payed wallet={createdWallet} />
        ) : (
          <NotPayed onApproved={setCreatedWallet} />
        )}
      </Center>
    </Container>
  );
};
