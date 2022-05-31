import React from 'react';
import { EntitySelect, EntitySelectProps } from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { VotingConfig, VotingConfigFilter } from 'union-ts';
import { Principal } from '@dfinity/principal';

export interface VotingConfigListFieldProps
  extends Omit<Partial<EntitySelectProps<VotingConfig>>, 'value' | 'onChange'> {
  unionId: Principal;
  value: bigint | null | void;
  onChange(v: bigint): void;
  helperText?: string;
  filter?: VotingConfigFilter;
}

export const VotingConfigListField = styled(
  ({
    unionId,
    value,
    onChange,
    helperText,
    filter = { permission: [], group: [] },
    ...p
  }: VotingConfigListFieldProps) => {
    const { canister } = useUnion(unionId);

    return (
      <EntitySelect
        onChange={(_, item: VotingConfig) => onChange(item.id[0]!)}
        placeholder='Select voting config'
        multiselect={false}
        value={(groups) => groups.filter((g) => g.id[0]! == value).map((g) => g.name)}
        valueGetter={(item: VotingConfig) => item.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_voting_configs({
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
