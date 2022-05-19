import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useUnion } from 'services';
import { UpdateAccessConfigRequest } from 'union-ts';
import { useCurrentUnion } from '../../context';
import { AccessConfigFormData, AlloweeConstraintForm, mapAllowees } from './types';

export interface UseEditProps {
  setValue(name: string, value: any): void; // FIXME
  getValues(): AccessConfigFormData;
}

export const useEdit = ({ setValue, getValues }: UseEditProps) => {
  const { accessConfigId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!accessConfigId) {
      return;
    }

    canister.get_access_config({ id: BigInt(accessConfigId), query_delegation_proof_opt: [] });
  }, [setValue, accessConfigId]);

  useTrigger(
    ({ access_config }) => {
      setValue('name', access_config.name);
      setValue('description', access_config.description);

      Promise.all(
        access_config.permissions.map((id) =>
          canister.get_permission({ id, query_delegation_proof_opt: [] }),
        ),
      ).then((permissions) =>
        setValue(
          'permissions',
          permissions.map((p) => p.permission),
        ),
      );

      Promise.all(
        access_config.allowees.map<Promise<AlloweeConstraintForm>>((a) => {
          if ('Everyone' in a) {
            return Promise.resolve({ type: 'Everyone' });
          }
          if ('Profile' in a) {
            return canister
              .get_profile({ id: a.Profile, query_delegation_proof_opt: [] })
              .then(({ profile }) => ({ type: 'Profile', profile }));
          }
          return canister
            .get_group({ group_id: a.Group.id, query_delegation_proof_opt: [] })
            .then(({ group }) => ({ type: 'Group', group, minShares: a.Group.min_shares }));
        }),
      ).then((allowees) => setValue('allowees', allowees));
    },
    data.get_access_config,
    [data.get_access_config, setValue, canister],
  );

  const accessConfig = data.get_access_config?.access_config;

  const getUpdatePayload = useCallback((): UpdateAccessConfigRequest => {
    if (!accessConfigId || !accessConfig) {
      return {
        id: BigInt(accessConfigId || -1),
        new_name: [],
        new_description: [],
        new_allowees: [],
        new_permissions: [],
      };
    }
    const old = accessConfig;
    const values = getValues();

    const permissionsChanged =
      values.permissions.length !== old.permissions.length ||
      values.permissions.find((p) => !old.permissions.includes(p.id[0]!));

    return {
      id: BigInt(accessConfigId),
      new_name: old.name !== values.name ? [values.name] : [],
      new_description: old.description !== values.description ? [values.description] : [],
      new_permissions: permissionsChanged ? [values.permissions.map((p) => p.id[0]!)] : [],
      new_allowees: [mapAllowees(values.allowees)], // TODO make check of change
    };
  }, [getValues, accessConfig]);

  let fallback: JSX.Element | null = null;

  if (!accessConfigId) {
    fallback = <span>AccessConfigId is empty</span>;
  }

  if (fetching.get_access_config) {
    fallback = <span>fetching</span>;
  }

  if (!accessConfig) {
    fallback = <span>AccessConfig does not found</span>;
  }

  return {
    fallback,
    getUpdatePayload,
  };
};
