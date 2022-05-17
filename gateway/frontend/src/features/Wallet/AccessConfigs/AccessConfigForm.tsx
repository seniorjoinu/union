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
import {
  AlloweeConstraint,
  CreateAccessConfigRequest,
  Group,
  Permission,
  Profile,
  _SERVICE,
} from 'union-ts';
import { useNavigate } from 'react-router-dom';
import { useUnion } from 'services';
import { Principal } from '@dfinity/principal';
import { UnionSubmitButton } from '../../../components/UnionSubmit';
import { useCurrentUnion } from '../context';

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

interface AlloweeConstraintForm {
  type: 'Group' | 'Profile' | 'Everyone';
  group?: Group;
  profile?: Profile;
  minShares?: bigint;
}
export interface AccessConfigFormFormData {
  name: string;
  description: string;
  permissions: Permission[];
  allowees: AlloweeConstraintForm[];
}

export interface AccessConfigFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const AccessConfigForm = ({ ...p }: AccessConfigFormProps) => {
  const data: AccessConfigFormFormData = useMemo(
    () => ({
      name: '',
      description: '',
      permissions: [],
      allowees: [],
    }),
    [],
  );

  return <AccessConfigFormComponent {...p} data={data} />;
};

export const AccessConfigFormComponent = ({
  data,
  ...p
}: AccessConfigFormProps & {
  data: AccessConfigFormFormData;
}) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const nav = useNavigate();
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<AccessConfigFormFormData>({
    defaultValues: { ...data },
    mode: 'onChange',
  });

  const getPayload = useCallback((): CreateAccessConfigRequest => {
    const { permissions, ...values } = getValues();

    const result = {
      ...values,
      permissions: permissions.map((p) => p.id[0]!),
      allowees: values.allowees
        .map((a) => {
          switch (a.type) {
            case 'Everyone': {
              return { Everyone: null };
            }
            case 'Group': {
              if (!a.group) {
                return null;
              }
              return { Group: { id: a.group.id[0]!, min_shares: a.minShares || BigInt(0) } };
            }
            case 'Profile': {
              if (!a.profile) {
                return null;
              }
              return { Profile: Principal.from(a.profile.id) };
            }
          }
        })
        .filter((a): a is AlloweeConstraint => !!a),
    };

    return result;
  }, [getValues]);

  return (
    <Container {...p} title='Create access config' withBack>
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
              })
            }
          />
        )}
      />
      <Controller
        name='allowees'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <AdvancedSelect
              label='Allowees'
              onChange={(value: AlloweeConstraintForm['type']) =>
                field.onChange([...field.value, { type: value, minShares: BigInt(0) }])
              }
              placeholder='Select allowee type to add'
              value={[]}
              helperText={error?.message}
              multiselect={false}
            >
              <AdvancedOption value='Group' obj={null} />
              <AdvancedOption value='Profile' obj={null} />
              <AdvancedOption
                disabled={!!field.value.find((a) => a.type == 'Everyone')}
                value='Everyone'
                obj={null}
              />
            </AdvancedSelect>
            {field.value.map((allowee, i) => (
              <AlloweesSlice key={String(i)}>
                {allowee.type == 'Everyone' && (
                  <Row>
                    <AlloweeTitle>Everyone</AlloweeTitle>
                    <RemoveButton
                      onClick={() => field.onChange(field.value.filter((_, index) => index !== i))}
                    >
                      -
                    </RemoveButton>
                  </Row>
                )}
                {allowee.type == 'Group' && (
                  <>
                    <Row>
                      <AlloweeTitle>Group</AlloweeTitle>
                      <RemoveButton
                        onClick={() =>
                          field.onChange(field.value.filter((_, index) => index !== i))
                        }
                      >
                        -
                      </RemoveButton>
                    </Row>
                    <Controller
                      name={`allowees.${i}.group`}
                      control={control}
                      rules={{
                        required: 'Required field',
                      }}
                      render={({ field: groupField, fieldState: { error: groupError } }) => (
                        <EntitySelect
                          onChange={(_, group: Group) => groupField.onChange(group)}
                          placeholder='Select group'
                          multiselect={false}
                          value={groupField.value ? [groupField.value.name] : []}
                          valueGetter={(group: Group) => group.name}
                          size={5}
                          helperText={groupError?.message}
                          fetch={({ index, size }) =>
                            canister.list_groups({
                              page_req: {
                                page_index: index,
                                page_size: size,
                                sort: null,
                                filter: null,
                              },
                            })
                          }
                        />
                      )}
                    />
                    <Controller
                      name={`allowees.${i}.minShares`}
                      control={control}
                      rules={{
                        required: 'Required field',
                      }}
                      render={({ field: sharesField, fieldState: { error: sharesError } }) => (
                        <TextField
                          {...sharesField}
                          onChange={(e) => sharesField.onChange(BigInt(e.target.value))}
                          value={Number(sharesField.value) || 0}
                          min={0}
                          helperText={sharesError?.message}
                          type='number'
                          label='Minimum shares'
                        />
                      )}
                    />
                  </>
                )}
                {allowee.type == 'Profile' && (
                  <>
                    <Row>
                      <AlloweeTitle>Profile</AlloweeTitle>
                      <RemoveButton
                        onClick={() =>
                          field.onChange(field.value.filter((_, index) => index !== i))
                        }
                      >
                        -
                      </RemoveButton>
                    </Row>
                    <Controller
                      name={`allowees.${i}.profile`}
                      control={control}
                      rules={{
                        required: 'Required field',
                      }}
                      render={({ field: profileField, fieldState: { error: profileError } }) => (
                        <EntitySelect
                          onChange={(_, profile: Profile) =>
                            profileField.onChange({ target: { value: profile } })
                          }
                          placeholder='Select profile'
                          multiselect={false}
                          value={profileField.value ? [profileField.value.name] : []}
                          valueGetter={(profile: Profile) => profile.name}
                          size={5}
                          helperText={profileError?.message}
                          fetch={({ index, size }) =>
                            canister.list_profiles({
                              page_req: {
                                page_index: index,
                                page_size: size,
                                sort: null,
                                filter: null,
                              },
                            })
                          }
                        />
                      )}
                    />
                  </>
                )}
              </AlloweesSlice>
            ))}
          </>
        )}
      />
      <UnionSubmitButton
        canisterId={principal}
        methodName='create_access_config'
        getPayload={() => [getPayload()]}
        onExecuted={() => nav(-1)}
        disabled={!isValid}
      >
        Create access config
      </UnionSubmitButton>
    </Container>
  );
};
