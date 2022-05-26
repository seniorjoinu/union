import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { UpdatePermissionRequest } from 'union-ts';
import { useUnion } from 'services';
import { Controller, useWatch } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { EditorSettings, useRender } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { CanisterMethods } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface UpdatePermissionFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const UpdatePermissionForm = styled(({ ...p }: UpdatePermissionFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();
  const { permissionId } = useParams();
  const { canister, fetching, data } = useUnion(principal);

  useEffect(() => {
    if (!permissionId) {
      return;
    }

    canister.get_permission({ id: BigInt(permissionId), query_delegation_proof_opt: [] });
  }, [permissionId]);

  const defaultValue: UpdatePermissionRequest | null = useMemo(() => {
    const permission = data.get_permission?.permission;

    if (!permissionId || !permission) {
      return null;
    }

    return {
      id: BigInt(permissionId),
      new_name: [permission.name],
      new_description: [permission.description],
      new_targets: [permission.targets],
    };
  }, [permissionId, data.get_permission?.permission]);

  const { Form } = useRender<UpdatePermissionRequest>({
    canisterId: principal,
    type: 'UpdatePermissionRequest',
  });

  const settings: EditorSettings<UpdatePermissionRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        id: { hide: true },
        new_name: { order: 1 },
        new_description: { order: 2 },
        new_targets: { order: 3 },
        'new_targets.-1.Endpoint.canister_id': {
          label: 'Canister Id',
        },
        'new_targets.0.-1.Endpoint.method_name': {
          label: 'Method name',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'new_targets.0.-1.Endpoint.method_name'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <CanisterMethods
                    label={name}
                    canisterId={useWatch({
                      name: path.replace(
                        'method_name',
                        'canister_id',
                      ) as 'new_targets.0.0.Endpoint.canister_id',
                      control: ctx.control,
                    })}
                    onChange={field.onChange}
                    value={field.value}
                    helperText={error?.message}
                  />
                )}
              />
            ),
          },
        },
      },
    }),
    [],
  );

  if (!permissionId) {
    return <span>PermissionId is empty</span>;
  }

  if (fetching.get_permission) {
    return <span>fetching</span>;
  }

  if (!data.get_permission?.permission || !defaultValue) {
    return <span>Permission does not found</span>;
  }

  return (
    <Container title='Update permission' withBack {...p}>
      <Form
        defaultValue={defaultValue}
        settings={settings}
        transformLabel={(v, tr) => tr(v?.replace('new_', ''))}
      >
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='update_permission'
            getPayload={() => [ctx.getValues() as UpdatePermissionRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Update permission
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
