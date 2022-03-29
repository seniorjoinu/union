import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Text, Select, Option } from 'components';
import { RoleAndPermission } from 'wallet-ts';
import { useTrigger } from 'toolkit';
import { useCurrentWallet } from '../../Wallet/context';
import { parseRole } from '../../Wallet/utils';

const Controls = styled.div`
  display: flex;
  flex-direction: row;

  select {
    margin-right: 16px;
    height: 24px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Controls} {
    margin-top: 8px;
  }
`;

export interface RoleSwitcherProps extends IClassName {
  label: string;
  disabled?: boolean;
  onChange(e: { target: { value: RoleAndPermission | null } }): void;
  value: RoleAndPermission | null;
}

export const RoleSwitcher = React.forwardRef<HTMLDivElement, RoleSwitcherProps>(
  ({ onChange, value, label, disabled, ...p }, ref) => {
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
        <Text variant='p1'>{label}</Text>
        <Controls>
          <Select
            title='Role'
            onChange={(e) => handleChange(e, 'role_id')}
            value={value?.role_id.toString()}
            disabled={disabled}
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
          <Select
            title='Permission'
            onChange={(e) => handleChange(e, 'permission_id')}
            value={value?.permission_id.toString()}
            disabled={disabled}
          >
            {permissions.map(({ id, name }) => (
              <Option key={id} id={String(id)} value={String(id)}>
                {name}
              </Option>
            ))}
          </Select>
        </Controls>
      </Container>
    );
  },
);
