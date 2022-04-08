import React from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { ListSelect, Button as B } from 'components';
import { Role } from 'wallet-ts';
import { parseRole } from '../utils';
import { useRoles } from '../useRoles';
import { useEnumeratedRoles } from '../useEnumeratedRoles';

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
  const { addEnumeratedRoles } = useEnumeratedRoles();
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

  if (!roles.length) {
    return null;
  }

  return (
    <Container {...p}>
      <Controller
        name='roleIds'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <ListSelect
            {...field}
            helperText={error?.message}
            label='Roles addition'
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
        onClick={() => addEnumeratedRoles(role, getValues().roleIds)}
      >
        Add roles
      </Button>
    </Container>
  );
}
