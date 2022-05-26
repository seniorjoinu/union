import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreatePermissionRequest } from 'union-ts';
import { Controller, useWatch } from 'react-hook-form';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, EditorSettings, RenderEditorContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { CanisterMethods } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface CreatePermissionFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreatePermissionForm = styled(({ ...p }: CreatePermissionFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreatePermissionRequest>({
    canisterId: principal,
    type: 'CreatePermissionRequest',
  });

  const useFormEffect = useCallback((ctx: RenderEditorContext<CreatePermissionRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  const settings: EditorSettings<CreatePermissionRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        name: { order: 1 },
        description: { order: 2 },
        targets: { order: 3 },
        'targets.-1.Endpoint.canister_id': {
          label: 'Canister Id',
        },
        'targets.-1.Endpoint.method_name': {
          label: 'Method name',
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'targets.-1.Endpoint.method_name'}
                control={ctx.control}
                render={({ field, fieldState: { error } }) => (
                  <CanisterMethods
                    label={name}
                    canisterId={useWatch({
                      name: path.replace(
                        'method_name',
                        'canister_id',
                      ) as 'targets.0.Endpoint.canister_id',
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

  return (
    <Container title='Create new permission' withBack {...p}>
      <Form useFormEffect={useFormEffect} settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_permission'
            getPayload={() => [ctx.getValues() as CreatePermissionRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Create permission
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
