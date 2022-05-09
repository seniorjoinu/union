import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from '@union/components';
import { Role } from 'union-ts';
import { usePermissions } from '../usePermissions';
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

export interface PermissionsAttacherProps extends IClassName {
  role: Role;
}

export function PermissionsAttacher({ role, ...p }: PermissionsAttacherProps) {
  const { permissions } = usePermissions();
  const { attach } = useAttach();
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

  return (
    <Container {...p}>
      <Controller
        name='permissionIds'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <ListSelect
            {...field}
            label='Permissions addition'
            helperText={error?.message}
            from={permissions.map(({ id, name }) => ({
              id: id.toString(),
              content: `${id} ${name}`.trim(),
            }))}
          />
        )}
      />
      <Button
        type='submit'
        disabled={!isValid}
        onClick={() => attach(getValues().permissionIds, [role.id])}
      >
        Add permissions
      </Button>
    </Container>
  );
}
