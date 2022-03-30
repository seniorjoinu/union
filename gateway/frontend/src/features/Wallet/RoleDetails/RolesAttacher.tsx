import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from 'components';
import { Role } from 'wallet-ts';
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
  role: Role;
  enumerated?: Role[];
}

export function RolesAttacher({ role, enumerated = [], ...p }: RolesAttacherProps) {
  const usedRoles = useRoles();
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

  const roles = usedRoles.roles.filter(
    (r) => r.id !== role.id && !enumerated.find((e) => e.id == r.id),
  );

  const parsedRole = parseRole(role.role_type);

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
      title: `Attach enumerated roles to role "${parsedRole.title}"`,
      description: `Attach roles "${roleNames}" to role "${parsedRole.title}"(id ${role.id})`,
      rnp,
      program: [
        {
          endpoint: {
            canister_id: principal,
            method_name: 'attach_role_to_permission',
          },
          cycles: '0',
          args_candid: walletSerializer.add_enumerated_roles({
            role_id: role.id,
            enumerated_roles_to_add: roleIds.map((rId) => Number(rId)),
          }),
        },
      ],
    };

    nav(`/wallet/${principal}/execute`, { state: payload });
  };

  if (!roles.length) {
    return null;
  }

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
