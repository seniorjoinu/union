import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  PageWrapper,
  TextField as TF,
  EntitySelect,
  Column,
  Row,
  Button as B,
  AdvancedOption,
  AdvancedSelect,
  withBorder,
  Text,
} from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { Group, Permission, Profile, _SERVICE } from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { useUnion } from 'services';
import { UnionSubmitButton } from '../../../../components/UnionSubmit';
import { useCurrentUnion } from '../../context';
import { VotingConfigFormData } from './types';
import { useCreate } from './useCreate';
import { useEdit } from './useEdit';

const AlloweeTitle = styled(Text)``;
const TextField = styled(TF)``;
const RemoveButton = styled(B)``;

const AlloweesSlice = withBorder(
  styled(Column)`
    padding: 12px 16px;

    ${AlloweeTitle} {
      flex-grow: 1;
    }

    & > ${Row} {
      align-items: center;
    }
  `,
  { withQuad: false },
);

const Container = styled(PageWrapper)`
  & > *:not(:last-child) {
    margin-bottom: 24px;
  }
`;

export interface VotingConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
  create?: boolean;
}

export const VotingConfigForm = ({ create, ...p }: VotingConfigFormProps) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const nav = useNavigate();
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<VotingConfigFormData>({
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
    mode: 'onChange',
  });

  const { getCreatePayload } = useCreate({ getValues: getValues as () => VotingConfigFormData });
  const { getUpdatePayload, fallback } = useEdit({
    getValues: getValues as () => VotingConfigFormData,
    setValue,
  });

  if (!create && fallback) {
    return fallback;
  }

  return (
    <Container {...p} title={create ? 'Create new voting config' : 'Edit voting config'} withBack>
      <Controller
        name='name'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Name' />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{ required: 'Required field' }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} label='Description' />
        )}
      />
      <Controller
        name='permissions'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <EntitySelect
            label='Permissions'
            onChange={(_, perm: Permission) => {
              const withoutSelected = field.value.filter((p) => p.id[0]! !== perm.id[0]!);

              if (withoutSelected.length !== field.value.length) {
                field.onChange(withoutSelected);
              } else {
                field.onChange([...field.value, perm]);
              }
            }}
            placeholder='Optional: Select permissions'
            value={field.value.map((p) => p.name)}
            valueGetter={(perm: Permission) => perm.name}
            size={5}
            helperText={error?.message}
            fetch={({ index, size }) =>
              canister.list_permissions({
                page_req: {
                  page_index: index,
                  page_size: size,
                  sort: null,
                  filter: { target: [] },
                },
                query_delegation_proof_opt: [],
              })
            }
          />
        )}
      />
      {/* TODO */}
      {create ? (
        <UnionSubmitButton
          canisterId={principal}
          unionId={principal}
          methodName='create_voting_config'
          getPayload={() => [getCreatePayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Create voting config
        </UnionSubmitButton>
      ) : (
        <UnionSubmitButton
          unionId={principal}
          canisterId={principal}
          methodName='update_voting_config'
          getPayload={() => [getUpdatePayload()]}
          onExecuted={() => nav(-1)}
          disabled={!isValid}
        >
          Update voting config
        </UnionSubmitButton>
      )}
    </Container>
  );
};
