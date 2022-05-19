import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useUnion } from 'services';
import { UpdateGroupRequest } from 'union-ts';
import { useCurrentUnion } from '../../context';
import { GroupFormData } from './types';

export interface UseEditProps {
  setValue(name: string, value: any): void; // FIXME
  getValues(): GroupFormData;
}

export const useEdit = ({ setValue, getValues }: UseEditProps) => {
  const { groupId } = useParams();
  const { principal } = useCurrentUnion();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    canister.get_group({ group_id: BigInt(groupId), query_delegation_proof_opt: [] });
  }, [setValue, groupId]);

  useTrigger(
    ({ group }) => {
      setValue('name', group.name);
      setValue('description', group.description);
    },
    data.get_group,
    [data.get_group, setValue, canister],
  );

  const group = data.get_group?.group;

  const getUpdatePayload = useCallback((): UpdateGroupRequest => {
    if (!groupId || !group) {
      return {
        group_id: BigInt(groupId || -1),
        new_name: [],
        new_description: [],
      };
    }
    const old = group;
    const values = getValues();

    return {
      group_id: BigInt(groupId),
      new_name: old.name !== values.name ? [values.name] : [],
      new_description: old.description !== values.description ? [values.description] : [],
    };
  }, [getValues, group]);

  let fallback: JSX.Element | null = null;

  if (!groupId) {
    fallback = <span>GroupId is empty</span>;
  }

  if (fetching.get_group) {
    fallback = <span>fetching</span>;
  }

  if (!groupId) {
    fallback = <span>Group does not found</span>;
  }

  return {
    fallback,
    getUpdatePayload,
  };
};
