import * as React from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { UnionWalletClient } from '..';

export default {
  title: 'Playground',
  argTypes: {
    gateway: {
      type: 'string',
      defaultValue: 'rkp4c-7iaaa-aaaaa-aaaca-cai',
    },
    wallet: {
      type: 'string',
      defaultValue: 'renrk-eyaaa-aaaaa-aaada-cai',
    },
  },
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const Playground = ({
  gateway: gatewayStr,
  wallet: walletStr,
}: {
  gateway: string;
  wallet: string;
}) => {
  const [client, setClient] = React.useState<UnionWalletClient | null>(null);

  const wallet = React.useMemo(() => checkPrincipal(walletStr), [walletStr]);
  const gateway = React.useMemo(() => checkPrincipal(gatewayStr), [gatewayStr]);

  React.useEffect(() => {
    if (!wallet || !gateway) {
      setClient(null);
      return;
    }

    const client = new UnionWalletClient({
      gateway,
      wallet,
      providerUrl: 'http://localhost:3000',
    });

    setClient(client);
  }, [wallet, gateway, setClient]);

  return (
    <Container>
      <button
        onClick={() =>
          client &&
          client.execute(
            {
              title: 'Sample empty program',
              description: 'Make sample empty program from storybook',
              authorization_delay_nano: BigInt(100),
              program: { Empty: null },
            },
            { after: 'close' },
          )
        }
      >
        Make SelfEmptyProgram with after close
      </button>
      <button
        onClick={() =>
          client &&
          client.execute({
            title: 'Sample empty program',
            description: 'Make sample empty program from storybook',
            authorization_delay_nano: BigInt(100),
            program: { Empty: null },
          })
        }
      >
        Make SelfEmptyProgram without after close
      </button>
    </Container>
  );
};

const checkPrincipal = (canisterId: string): Principal | null => {
  let principal: Principal;

  try {
    principal = Principal.fromText(canisterId);
  } catch (e) {
    return null;
  }

  if (!principal._isPrincipal || principal.isAnonymous()) {
    return null;
  }

  return principal;
};
