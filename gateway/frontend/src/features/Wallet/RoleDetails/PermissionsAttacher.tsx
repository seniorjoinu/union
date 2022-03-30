import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from 'components';
import { Role } from 'wallet-ts';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { usePermissions } from '../usePermissions';
import { ExternalExecutorFormData } from '../../Executor';
import { useCurrentWallet } from '../context';

const Button = styled(B)``;
const Container = styled.div`
  select {
    height: 32px;
  }

  ${Button} {
    margin-top: 16px;
  }
`;

export interface PermissionsAttacherProps extends IClassName {
  role: Role;
}

export function PermissionsAttacher({ role, ...p }: PermissionsAttacherProps) {
  const { permissions } = usePermissions();
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<{ permissionIds: string[] }>({
    defaultValues: {
      permissionIds: [],
    },
    mode: 'onTouched',
  });

  const submit = () => {
    if (!rnp) {
      return;
    }
    setSubmitting(true);
    const { permissionIds } = getValues();

    const names = permissionIds
      .map((id) => {
        const permission = permissions.find((r) => r.id == Number(id));

        return permission?.name || 'Unknown';
      })
      .join();

    const payload: ExternalExecutorFormData = {
      title: 'Attach permissions to role',
      description: `Attach permissions "${names}" to role (id ${role.id})`,
      rnp,
      program: permissionIds.map((permissionId) => ({
        endpoint: {
          canister_id: principal,
          method_name: 'attach_role_to_permission',
        },
        cycles: '0',
        args_candid: walletSerializer.attach_role_to_permission({
          role_id: role.id,
          permission_id: Number(permissionId),
        }),
      })),
    };

    nav(`/wallet/${principal}/execute`, { state: payload });
  };

  return (
    <Container {...p}>
      <Controller
        name='permissionIds'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field, fieldState: { error } }) => (
          <ListSelect
            {...field}
            label='Добавление пермиссий'
            helperText={error?.message}
            from={permissions.map(({ id, name }) => ({
              id: id.toString(),
              content: `${id} ${name}`.trim(),
            }))}
          />
        )}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
        Добавить пермиссии
      </Button>
    </Container>
  );
}
