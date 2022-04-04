import React, { useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Control, Controller } from 'react-hook-form';
import { Text, Select, Option } from 'components';
import { useTrigger } from 'toolkit';
import { useWallet } from 'services';
import { useCurrentWallet } from '../../Wallet/context';
import { parseRole } from '../../Wallet/utils';
import { ExecutorFormData } from '../types';

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
  control: Control<ExecutorFormData, any>;
  mode?: 'edit' | 'view';
  getValues(): ExecutorFormData;
}

export const RoleSwitcher = ({
  control,
  label,
  disabled,
  getValues,
  mode = 'edit',
  ...p
}: RoleSwitcherProps) => {
  const {
    rnp,
    roles: myRoles,
    permissions: myPermissions,
    fetchMyData,
    principal,
  } = useCurrentWallet();
  const { canister, data } = useWallet(principal);

  const rnpField = control.register('rnp', {
    required: 'Обязательное поле',
  });
  const pid = control.register('rnp.permission_id', {
    required: 'Обязательное поле',
  });
  const rid = control.register('rnp.role_id', {
    required: 'Обязательное поле',
  });

  useEffect(() => {
    if (mode == 'edit') {
      fetchMyData();
    } else {
      const { permission_id, role_id } = getValues().rnp || {};

      canister.get_roles({ ids: [role_id] });
      canister.get_permissions({ ids: [permission_id] });
    }
  }, []);

  useTrigger(
    (rnp) => {
      if (mode !== 'edit') {
        return;
      }

      const { permission_id, role_id } = getValues().rnp || {};

      if (typeof permission_id == 'undefined' || permission_id == null) {
        pid.onChange({ target: { name: 'rnp.permission_id', value: rnp.permission_id } });
      }
      if (typeof role_id == 'undefined' || role_id == null) {
        rid.onChange({ target: { name: 'rnp.role_id', value: rnp.role_id } });
      }
      rnpField.onChange({ target: { name: 'rnp', value: rnp } });
    },
    rnp,
    [getValues, mode],
  );

  const roles = useMemo(() => (mode == 'edit' ? myRoles : data.get_roles?.roles || []), [
    mode,
    myRoles,
    data.get_roles,
  ]);

  const permissions = useMemo(
    () => (mode == 'edit' ? myPermissions : data.get_permissions?.permissions || []),
    [mode, myPermissions, data.get_permissions],
  );

  return (
    <Container {...p}>
      <Text variant='p1'>{label}</Text>
      <Controls>
        <Controller
          name='rnp.role_id'
          control={control}
          rules={{
            required: 'Обязательное поле',
          }}
          render={({ field }) => (
            <Select
              title='Role'
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
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
          )}
        />
        <Controller
          name='rnp.permission_id'
          control={control}
          rules={{
            required: 'Обязательное поле',
          }}
          render={({ field }) => (
            <Select
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
              title='Permission'
              disabled={disabled}
            >
              {permissions.map(({ id, name }) => (
                <Option key={id} id={String(id)} value={String(id)}>
                  {name}
                </Option>
              ))}
            </Select>
          )}
        />
      </Controls>
    </Container>
  );
};
