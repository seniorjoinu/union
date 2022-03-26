import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Text, Select, Option } from 'components';
import { RoleAndPermission } from 'wallet-ts';
import { useTrigger } from 'toolkit';
import { useCurrentWallet } from '../../Wallet/context';
import { parseRole } from '../../Wallet/utils';

const Container = styled.div`
  select {
    height: 20px;
  }
`;

export interface RoleSwitcherProps extends IClassName {
  label: string;
  onChange(e: { target: { value: RoleAndPermission | null } }): void;
  value: RoleAndPermission | null;
}

export const RoleSwitcher = React.forwardRef<HTMLDivElement, RoleSwitcherProps>(
  ({ onChange, value, label, ...p }, ref) => {
    const { rnp, roles, permissions } = useCurrentWallet();

    useTrigger(
      (rnp) => {
        if (!value) {
          onChange({ target: { value: rnp } });
        }
      },
      rnp,
      [],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>, key: keyof RoleAndPermission) => {
        if (!value) {
          return;
        }
        const newValue = { ...value, [key]: Number(e.target.value) };

        onChange({ target: { value: newValue } });
      },
      [onChange, value],
    );

    return (
      <Container {...p} ref={ref}>
        <Text variant='p3'>{label}</Text>
        <Select
          title='Role'
          onChange={(e) => handleChange(e, 'role_id')}
          value={value?.role_id.toString()}
        >
          {roles.map((r) => {
            const parsed = parseRole(r.role_type);

            return (
              <Option key={r.id} id={String(r.id)} value={String(r.id)}>
                {parsed.title}
              </Option>
            );
          })}
        </Select>
        <Text variant='p3'>Permission</Text>
        <Select
          title='Permission'
          onChange={(e) => handleChange(e, 'permission_id')}
          value={value?.permission_id.toString()}
        >
          {permissions.map(({ id, name }) => (
            <Option key={id} id={String(id)} value={String(id)}>
              {name}
            </Option>
          ))}
        </Select>
      </Container>
    );
  },
);
