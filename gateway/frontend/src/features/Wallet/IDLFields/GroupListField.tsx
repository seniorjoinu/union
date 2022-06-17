import { EntitySelect, EntitySelectProps } from '@union/components';
import React from 'react';
import { useUnion } from 'services';
import styled from 'styled-components';
import { GroupExt } from 'union-ts';
import { useCurrentUnion } from '../context';

export interface GroupListFieldProps
  extends Omit<Partial<EntitySelectProps<GroupExt>>, 'value' | 'onChange'> {
  value: bigint | null | void;
  onChange(v: bigint): void;
  helperText?: string;
}

export const GroupListField = styled(
  ({ value, onChange, helperText, ...p }: GroupListFieldProps) => {
    const { principal } = useCurrentUnion();
    const { canister } = useUnion(principal);

    return (
      <EntitySelect
        onChange={(_, group: GroupExt) => onChange(group.it.id[0]!)}
        placeholder='Select group'
        multiselect={false}
        value={(groups) => groups.filter((g) => g.it.id[0]! == value).map((g) => g.it.name)}
        valueGetter={(group: GroupExt) => group.it.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_groups({
            page_req: {
              page_index: index,
              page_size: size,
              sort: null,
              filter: null,
            },
            query_delegation_proof_opt: [],
          })
        }
        {...p}
      />
    );
  },
)``;
