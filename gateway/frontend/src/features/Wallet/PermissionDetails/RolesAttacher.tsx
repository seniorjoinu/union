import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from 'components';
import { Permission } from 'wallet-ts';
import { useNavigate } from 'react-router-dom';
import { walletSerializer } from 'services';
import { parseRole } from '../utils';
import { useRoles } from '../useRoles';
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

export interface RolesAttacherProps extends IClassName {
  permission: Permission;
}

export function RolesAttacher({ permission, ...p }: RolesAttacherProps) {
  const { roles } = useRoles();
  const nav = useNavigate();
  const { rnp, principal } = useCurrentWallet();
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<{ roleIds: string[] }>({
    defaultValues: {
      roleIds: [],
    },
    mode: 'onTouched',
  });

  const submit = () => {
    if (!rnp) {
      return;
    }
    setSubmitting(true);
    const { roleIds } = getValues();

    const roleNames = roleIds
      .map((id) => {
        const role = roles.find((r) => r.id == Number(id));
        const name = role ? parseRole(role.role_type).title : 'Unknown';

        return name;
      })
      .join();

    const payload: ExternalExecutorFormData = {
      title: 'Attach roles to permission',
      description: `Attach roles "${roleNames}" to permission "${permission.name}"(id ${permission.id})`,
      rnp,
      program: roleIds.map((roleId) => ({
        endpoint: {
          canister_id: principal,
          method_name: 'attach_role_to_permission',
        },
        cycles: '0',
        args_candid: walletSerializer.attach_role_to_permission({
          role_id: Number(roleId),
          permission_id: permission.id,
        }),
      })),
    };

    nav(`/wallet/${principal}/execute`, { state: payload });
  };

  return (
    <Container {...p}>
      <Controller
        name='roleIds'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field, fieldState: { error } }) => (
          <ListSelect
            {...field}
            helperText={error?.message}
            label='Добавление ролей'
            from={roles.map((r) => {
              const parsed = parseRole(r.role_type);

              return {
                id: r.id.toString(),
                content: `${r.id} ${parsed.title} ${parsed.principal}`.trim(),
              };
            })}
          />
        )}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
        Добавить роли
      </Button>
    </Container>
  );
}
