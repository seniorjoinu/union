import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from 'components';
import { Permission } from 'wallet-ts';
import { parseRole } from '../utils';
import { useRoles } from '../useRoles';
import { useAttach } from '../useAttach';

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
  const { attach } = useAttach();
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
      <Button
        type='submit'
        disabled={!isValid}
        onClick={() => attach([permission.id], getValues().roleIds)}
      >
        Добавить роли
      </Button>
    </Container>
  );
}
