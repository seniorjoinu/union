import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@union/components';
import styled from 'styled-components';
import { CreateAccessConfigRequest } from 'union-ts';
import { Controller } from 'react-hook-form';
import { Principal } from '@dfinity/principal';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useRender, EditorSettings, RenderEditorContext } from '../../../IDLRenderer';
import { useCurrentUnion } from '../../context';
import { PermissionsListField, GroupListField, ProfileListField } from '../../IDLFields';

const Container = styled(PageWrapper)``;

export interface CreateAccessConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const CreateAccessConfigForm = styled(({ ...p }: CreateAccessConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const nav = useNavigate();

  const { Form } = useRender<CreateAccessConfigRequest>({
    canisterId: principal,
    type: 'CreateAccessConfigRequest',
  });

  const useFormEffect = useCallback((ctx: RenderEditorContext<CreateAccessConfigRequest>) => {
    ctx.control.register('name', { required: 'Field is required' });
    ctx.control.register('description', { required: 'Field is required' });
  }, []);

  const settings: EditorSettings<CreateAccessConfigRequest> = useMemo(
    () => ({
      rules: {},
      fields: {
        name: { order: 1 },
        description: { order: 2 },
        permissions: {
          order: 3,
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name='permissions'
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
        allowees: { order: 4 },
        'allowees.-1.Group.id': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'allowees.-1.Group.id'}
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
        'allowees.-1.Profile': {
          adornment: {
            kind: 'replace',
            render: (ctx, path, name) => (
              <Controller
                name={path as 'allowees.-1.Profile'}
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
      },
    }),
    [],
  );

  return (
    <Container title='Create new access config' withBack {...p}>
      <Form useFormEffect={useFormEffect} settings={settings}>
        {(ctx) => (
          <UnionSubmitButton
            unionId={principal}
            canisterId={principal}
            methodName='create_access_config'
            getPayload={() => [ctx.getValues() as CreateAccessConfigRequest]}
            onExecuted={() => nav(-1)}
            disabled={!ctx.isValid}
          >
            Create access config
          </UnionSubmitButton>
        )}
      </Form>
    </Container>
  );
})``;
