import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button } from 'components';
import { Principal } from '@dfinity/principal';
import { Permission } from 'wallet-ts';
import { parseRole } from '../utils';
import { useRoles } from '../Participants';
import { useWallet, walletSerializer } from '../../../services';
import { useCurrentWallet } from '../context';

const Container = styled.div`
  select {
    height: 20px;
  }
`;

export interface AttacherProps extends IClassName {
  permission: Permission;
  onSuccess?(): void;
}

export function Attacher({ permission, onSuccess = () => undefined, ...p }: AttacherProps) {
  const { roles } = useRoles();
  const { rnp, principal } = useCurrentWallet();
  const { canister } = useWallet(principal);
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

    canister
      .execute({
        title: 'Attach roles to permission',
        description: `Attach roles "${roleNames}" to permission "${permission.name}"(id ${permission.id})`,
        rnp,
        authorization_delay_nano: BigInt(100),
        program: {
          RemoteCallSequence: roleIds.map((roleId) => ({
            endpoint: {
              canister_id: Principal.fromText(principal),
              method_name: 'attach_role_to_permission',
            },
            cycles: BigInt(0),
            args_candid: walletSerializer.attach_role_to_permission({
              role_id: Number(roleId),
              permission_id: permission.id,
            }),
          })),
        },
      })
      .then((response) => {
        console.log(response);
        onSuccess();
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Container {...p}>
      <Controller
        name='roleIds'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field }) => (
          <ListSelect
            {...field}
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
