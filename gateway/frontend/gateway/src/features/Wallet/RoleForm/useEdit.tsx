import React, { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrigger } from 'toolkit';
import { useWallet, walletSerializer } from 'services';
import { RoleType } from 'wallet-ts';
import { ExternalExecutorFormData } from '../../Executor';
import { parseRole } from '../utils';
import { useCurrentWallet } from '../context';
import { UseSubmitProps } from './types';
import { ProfileEditor } from './ProfileEditor';

export interface UseEditProps {
  create?: boolean;
  setValue: UseSubmitProps['setValue'];
  getValues: UseSubmitProps['getValues'];
}

export const useEdit = ({ create, setValue, getValues }: UseEditProps) => {
  const { roleId } = useParams();
  const { principal } = useCurrentWallet();
  const { canister, fetching, data } = useWallet(principal);

  useEffect(() => {
    if (create || !roleId) {
      return;
    }

    canister.get_roles({ ids: [Number(roleId)] });
  }, [setValue, roleId]);

  useTrigger(
    ({ roles }) => {
      if (!roles.length) {
        return;
      }

      const roleType = parseRole(roles[0].role_type);

      setValue('name', roleType.title);
      setValue('description', roleType.description);
      setValue('threshold', roleType.threshold);
      setValue(
        'owners',
        roleType.enumerated.map((e) => String(e)),
      );
      if (roleType.type) {
        setValue('type', roleType.type);
      }
    },
    data.get_roles,
    [data.get_roles, setValue],
  );

  const onEdit = useCallback(async (): Promise<ExternalExecutorFormData | null> => {
    if (!roleId) {
      return Promise.reject();
    }

    const values = getValues();
    let roleType: RoleType = { Everyone: null };

    if (values.type == 'FractionOf') {
      roleType = {
        FractionOf: {
          name: values.name,
          description: values.description,
          fraction: values.threshold,
          enumerated: values.owners.map((e) => Number(e)),
        },
      };
    } else {
      roleType = {
        QuantityOf: {
          name: values.name,
          description: values.description,
          // @ts-expect-error
          quantity: BigInt(values.threshold),
          enumerated: values.owners.map((e) => Number(e)),
        },
      };
    }

    const payload: ExternalExecutorFormData = {
      title: 'Update role',
      description: 'Update role through interface',
      program: {
        RemoteCallSequence: [
          {
            endpoint: {
              canister_id: principal,
              method_name: 'update_role',
            },
            cycles: BigInt(0),
            args: {
              CandidString: walletSerializer.update_role({
                role_id: Number(roleId),
                new_role_type: roleType,
              }),
            },
          },
        ],
      },
    };

    return payload;
  }, [getValues, roleId]);

  let fallback: JSX.Element | null = null;

  if (create) {
    return { fallback, onEdit };
  }

  if (!roleId) {
    fallback = <span>RoleId is empty</span>;
  }

  if (fetching.get_roles) {
    fallback = <span>fetching</span>;
  }

  if (!data.get_roles?.roles.length) {
    fallback = <span>Role does not found</span>;
  }

  const role = data.get_roles?.roles[0];
  const roleType = role?.role_type;

  if (!roleType) {
    fallback = <span>Role does not filled properly</span>;

    return {
      fallback,
      onEdit,
    };
  }

  const validRole = 'QuantityOf' in roleType || 'FractionOf' in roleType;

  if (role && 'Profile' in roleType) {
    const profile = roleType.Profile;

    fallback = (
      <ProfileEditor
        roleId={role.id}
        data={{ name: profile.name, description: profile.description }}
      />
    );

    return {
      fallback,
      onEdit,
    };
  }

  if (!validRole) {
    fallback = <span>Role does not support</span>;
  }

  return {
    fallback,
    onEdit,
  };
};
