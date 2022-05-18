import { useCallback } from 'react';
import { CreateAccessConfigRequest } from 'union-ts';
import { AccessConfigFormData, mapAllowees } from './types';

export interface UseCreateProps {
  getValues(): AccessConfigFormData;
}

export const useCreate = ({ getValues }: UseCreateProps) => {
  const getCreatePayload = useCallback((): CreateAccessConfigRequest => {
    const { permissions, ...values } = getValues();

    const result = {
      ...values,
      permissions: permissions.map((p) => p.id[0]!),
      allowees: mapAllowees(values.allowees),
    };

    return result;
  }, [getValues]);

  return {
    getCreatePayload,
  };
};
