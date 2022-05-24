import React from 'react';
import { EntitySelect, EntitySelectProps } from '@union/components';
import { useUnion } from 'services';
import styled from 'styled-components';
import { Profile } from 'union-ts';
import { Principal } from '@dfinity/principal';
import { useCurrentUnion } from '../context';

export interface ProfileListFieldProps
  extends Omit<Partial<EntitySelectProps<Profile>>, 'value' | 'onChange'> {
  value: Principal | null | void;
  onChange(v: Principal): void;
  helperText?: string;
}

export const ProfileListField = styled(
  ({ value, onChange, helperText, ...p }: ProfileListFieldProps) => {
    const { principal } = useCurrentUnion();
    const { canister } = useUnion(principal);

    // FIXME react-hook-form copy principal bug
    const valuePrincipal = value
      ? // @ts-expect-error
        Principal.fromUint8Array(new Uint8Array(Object.values(value._arr)))
      : null;
    const valueStr = valuePrincipal?.toString();

    return (
      <EntitySelect
        onChange={(_, profile: Profile) => onChange(profile.id)}
        placeholder='Select profile'
        multiselect={false}
        value={(profiles) =>
          (valuePrincipal
            ? profiles.filter((p) => p.id.toString() == valueStr).map((p) => p.name)
            : [])
        }
        valueGetter={(profile: Profile) => profile.name}
        size={5}
        fetch={({ index, size }) =>
          canister.list_profiles({
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
