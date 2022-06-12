import React from 'react';
import { EntitySelect, EntitySelectProps } from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { AccessConfig, AccessConfigFilter } from 'union-ts';
import { Principal } from '@dfinity/principal';

export interface AccessConfigListFieldProps
  extends Omit<Partial<EntitySelectProps<AccessConfig>>, 'value' | 'onChange'> {
  unionId: Principal;
  value: bigint | null | void;
  onChange(v: bigint): void;
  helperText?: string;
  filter?: AccessConfigFilter;
}

export const AccessConfigListField = styled(
  ({
    unionId,
    value,
    onChange,
    helperText,
    filter = { permission: [], group: [], profile: [] },
    ...p
  }: AccessConfigListFieldProps) => {
    const { canister } = useUnion(unionId);

    return (
      <EntitySelect
        onChange={(_, item: AccessConfig) => onChange(item.id[0]!)}
        placeholder='Select access config'
        multiselect={false}
        value={(groups) => groups.filter((g) => g.id[0]! == value).map((g) => g.name)}
        valueGetter={(item: AccessConfig) => item.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_access_configs({
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
