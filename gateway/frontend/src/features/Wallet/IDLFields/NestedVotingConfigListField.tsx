import React from 'react';
import { EntitySelect, EntitySelectProps } from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { NestedVotingConfig, NestedVotingConfigFilter } from 'union-ts';
import { Principal } from '@dfinity/principal';

export interface NestedVotingConfigListFieldProps
  extends Omit<Partial<EntitySelectProps<NestedVotingConfig>>, 'value' | 'onChange'> {
  unionId: Principal;
  value: bigint | null | void;
  onChange(v: bigint): void;
  helperText?: string;
  filter?: NestedVotingConfigFilter;
}

export const NestedVotingConfigListField = styled(
  ({
    unionId,
    value,
    onChange,
    helperText,
    filter = { remote_nested_voting_config: [], remote_voting_config: [] },
    ...p
  }: NestedVotingConfigListFieldProps) => {
    const { canister } = useUnion(unionId);

    return (
      <EntitySelect
        onChange={(_, item: NestedVotingConfig) => onChange(item.id[0]!)}
        placeholder='Select nested voting config'
        multiselect={false}
        value={(groups) => groups.filter((g) => g.id[0]! == value).map((g) => g.name)}
        valueGetter={(item: NestedVotingConfig) => item.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_nested_voting_configs({
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
