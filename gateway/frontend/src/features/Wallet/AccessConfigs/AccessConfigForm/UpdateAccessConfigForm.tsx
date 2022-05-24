import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdateAccessConfigRequest } from 'union-ts';
import { useUnion } from 'services';
import { Controller } from 'react-hook-form';
import { Principal } from '@dfinity/principal';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { FieldSettings, RenderContext, useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { PermissionsListField, GroupListField, ProfileListField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface UpdateAccessConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdateAccessConfigForm = styled(({ ...p }: UpdateAccessConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { accessConfigId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!accessConfigId) {
      return;
    }

    canister.get_access_config({ id: BigInt(accessConfigId), query_delegation_proof_opt: [] });
  }, [accessConfigId]);

  const defaultValue: UpdateAccessConfigRequest | null = useMemo(() => {
    const accessConfig = data.get_access_config?.access_config;

    if (!accessConfigId || !accessConfig) {
      return null;
    }

    return {
      id: BigInt(accessConfigId),
      new_name: [accessConfig.name],
      new_description: [accessConfig.description],
      new_allowees: [accessConfig.allowees],
      new_permissions: [accessConfig.permissions],
    };
  }, [accessConfigId, data.get_access_config?.access_config]);

  const { Form } = useRender<UpdateAccessConfigRequest>({
    canisterId: principal,
    type: 'UpdateAccessConfigRequest',
  });

  const settings: FieldSettings<UpdateAccessConfigRequest> = useMemo(
    () => ({
      id: { hide: true },
      new_name: { order: 1 },
      new_description: { order: 2 },
      new_permissions: {
        order: 3,
        adornment: {
          kind: 'replace',
          render: (ctx: RenderContext<UpdateAccessConfigRequest>, path, name) => (
            <Controller
              name='new_permissions.0'
              control={ctx.control}
              render={({ field, fieldState: { error } }) => (
                <PermissionsListField
                  label={name}
                  onChange={field.onChange}
                  value={field.value}
                  helperText={error?.message}
                />
              )}
            />
          ),
        },
      },
      new_allowees: { order: 4 },
      'new_allowees.0.-1.Group.id': {
        adornment: {
          kind: 'replace',
          render: (ctx: RenderContext<UpdateAccessConfigRequest>, path, name) => (
            <Controller
              name={path as 'new_allowees.0.-1.Group.id'}
              control={ctx.control}
              render={({ field, fieldState: { error } }) => (
                <GroupListField
                  label={name}
                  onChange={field.onChange}
                  value={field.value}
                  helperText={error?.message}
                />
              )}
            />
          ),
        },
      },
      'new_allowees.0.-1.Profile': {
        adornment: {
          kind: 'replace',
          render: (ctx: RenderContext<UpdateAccessConfigRequest>, path, name) => (
            <Controller
              name={path as 'new_allowees.0.-1.Profile'}
              control={ctx.control}
              render={({ field, fieldState: { error } }) => (
                <ProfileListField
                  label={name}
                  onChange={field.onChange}
                  value={field.value as Principal | null | void}
                  helperText={error?.message}
                />
              )}
            />
          ),
        },
      },
    }),
    [],
  );

  if (!accessConfigId) {
    return <span>accessConfigId is empty</span>;
  }

  if (fetching.get_access_config) {
    return <span>fetching</span>;
  }

  if (!data.get_access_config?.access_config || !defaultValue) {
    return <span>Access config does not found</span>;
  }

  return (
    <Container title='Update access config' withBack {...p}>
      <Form
        defaultValue={defaultValue}
        settings={settings}
        transformLabel={(v, tr) => tr(v?.replace('new_', ''))}
      >
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_access_config'
            getPayload={() => [ctx.getValues() as UpdateAccessConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Update access config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
