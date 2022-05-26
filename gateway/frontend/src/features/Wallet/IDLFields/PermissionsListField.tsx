import { EntitySelect, EntitySelectProps } from '@union/components';
import React from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Permission, PermissionFilter } from 'union-ts';
import { useCurrentUnion } from '../context';

export interface PermissionsListFieldProps
  extends Omit<Partial<EntitySelectProps<Permission>>, 'value' | 'onChange'> {
  value: bigint[];
  onChange(v: bigint[]): void;
  helperText?: string;
  filter?: PermissionFilter;
}

export const PermissionsListField = styled(
  ({ value, onChange, filter = { target: [] }, ...p }: PermissionsListFieldProps) => {
    const { principal } = useCurrentUnion();
    const { canister } = useUnion(principal);

    return (
      <EntitySelect
        label='Permissions'
        onChange={(_, perm: Permission) => {
          const withoutSelected = value.filter((p) => p !== perm.id[0]!);

          if (withoutSelected.length !== value.length) {
            onChange(withoutSelected);
          } else {
            onChange([...value, perm.id[0]!]);
          }
        }}
        placeholder='Optional: Select permissions'
        value={(permissions) =>
          permissions.filter((p) => value.includes(p.id[0]!)).map((p) => p.name)
        }
        valueGetter={(perm: Permission) => perm.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_permissions({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter,
            },
            query_delegation_proof_opt: [],
          })
        }
        {...p}
      />
    );
  },
)``;
