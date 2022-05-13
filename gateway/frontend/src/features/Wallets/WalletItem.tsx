import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Text, SimpleListItem } from '@union/components';
import { initWalletController, useGateway } from 'services';
import { WalletInfo } from './WalletInfo';

const Name = styled(Text)`
  padding: 0 8px;
  border-radius: 4px;
  background-color: #dfdfdf;
`;

export interface WalletItemProps {
  className?: string;
  style?: React.CSSProperties;
  rootWallet?: Principal;
  wallet: Principal;
  children?: any;
  onClick?(wallet: Principal): void;
}

export const WalletItem = ({
  rootWallet,
  wallet,
  children,
  onClick = () => {},
  ...p
}: WalletItemProps) => {
  const [name, setName] = useState<string>('');

  useEffect(() => {
    const canisterId = wallet.toString();
    const controller = initWalletController(canisterId);

    controller.canister.get_my_profile().then(({ profile }) => {
      setName(profile.name);
    });
  }, [wallet, setName]);

  return (
    <SimpleListItem
      key={wallet.toString()}
      item={{
        id: wallet.toString(),
        principal: <WalletInfo canisterId={wallet} />,
        isRoot: rootWallet?.toString() == wallet.toString() && (
          <Text variant='p1' color='grey'>
            Root
          </Text>
        ),
        name: !!name && <Name variant='p1'>{name}</Name>,
        children,
      }}
      order={[
        { key: 'principal', basis: '50%' },
        { key: 'isRoot', basis: '10%' },
        { key: 'name', basis: '20%', align: children ? 'center' : 'end' },
        ...(children ? [{ key: 'children' as const, basis: '20%', align: 'end' as const }] : []),
      ]}
      onClick={() => onClick(wallet)}
      {...p}
    />
  );
};
