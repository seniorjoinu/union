import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Text, SimpleListItem } from 'components';
import { initWalletController, useGateway } from 'services';
import { parseRole } from '../Wallet/utils';
import { WalletInfo } from './WalletInfo';

const RoleName = styled(Text)`
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
  const [roleName, setRoleName] = useState<string>('');

  useEffect(() => {
    const canisterId = wallet.toString();
    const controller = initWalletController(canisterId);

    controller.canister.get_my_roles().then(({ roles }) => {
      const profile = roles.find((r) => 'Profile' in r.role_type);
      const everyone = roles.find((r) => 'Everyone' in r.role_type);

      const roleType = profile?.role_type || everyone?.role_type;
      const parsed = roleType ? parseRole(roleType) : null;

      setRoleName(parsed?.title || '');
    });
  }, [wallet, setRoleName]);

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
        roleName: !!roleName && <RoleName variant='p1'>{roleName}</RoleName>,
        children,
      }}
      order={[
        { key: 'principal', basis: '50%' },
        { key: 'isRoot', basis: '10%' },
        { key: 'roleName', basis: '20%', align: children ? 'center' : 'end' },
        ...(children ? [{ key: 'children' as const, basis: '20%', align: 'end' as const }] : []),
      ]}
      onClick={() => onClick(wallet)}
      {...p}
    />
  );
};
