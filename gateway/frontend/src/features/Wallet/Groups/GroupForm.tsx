import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { PageWrapper, TextField as TF, SubmitButton as SB, Checkbox } from '@union/components';
import { useForm, Controller } from 'react-hook-form';
import { useUnion } from 'services';
import { CreateGroupRequest } from 'union-ts';
import { useCurrentUnion } from '../context';

const TextField = styled(TF)``;
const Button = styled(SB)``;

const Container = styled(PageWrapper)`
  & > ${TextField}, & > ${Checkbox} {
    margin-bottom: 24px;
  }

  ${Button} {
    align-self: flex-start;
  }
`;

export interface GroupFormFormData extends CreateGroupRequest {}

export interface GroupFormProps {
  className?: string;
  style?: React.CSSProperties;
}

export const GroupForm = ({ ...p }: GroupFormProps) => {
  const data: GroupFormFormData = useMemo(
    () => ({
      name: '',
      description: '',
      transferable: false,
      private: false,
    }),
    [],
  );

  return <GroupFormComponent {...p} data={data} />;
};

export const GroupFormComponent = ({
  data,
  ...p
}: GroupFormProps & {
  data: GroupFormFormData;
}) => {
  const { principal } = useCurrentUnion();
  const { canister } = useUnion(principal);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<GroupFormFormData>({
    defaultValues: { ...data },
    mode: 'onTouched',
  });

  useEffect(() => {
    // export const ALLOW_WRITE_PERMISSION_ID = 0n;
    // export const ALLOW_READ_PERMISSION_ID = 1n;
    // export const ALLOW_SEND_FEEDBACK_PERMISSION_ID = 2n;
    // export const ALLOW_VOTE_PERMISSION_ID = 3n;

    // export const HAS_PROFILE_GROUP_ID = 0n;

    // export const ALLOW_VOTE_ACCESS_CONFIG_ID = 0n;
    // export const UNLIMITED_ACCESS_CONFIG_ID = 1n;
    // export const READ_ONLY_ACCESS_CONFIG_ID = 2n;

    // export const EMERGENCY_VOTING_CONFIG_ID = 0n;
    // export const FEEDBACK_VOTING_CONFIG_ID = 1n;

    canister.list_access_configs({
      page_req: {
        page_index: 0,
        page_size: 10,
        sort: null,
        filter: {
          permission: [],
          group: [],
          profile: [],
        },
      },
    });
    // canister.get_permission({id: BigInt(0)})
    // .then(p => {
    // 	p.permission.targets[0]
    // });
  }, []);

  const submit = useCallback(
    async (data: GroupFormFormData) => {
      await canister.create_group(data);
    },
    [canister],
  );

  return (
    <Container {...p} title='Form' withBack>
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
        name='private'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Checkbox checked={field.value} onChange={field.onChange}>
            private
          </Checkbox>
        )}
      />
      <Controller
        name='transferable'
        control={control}
        render={({ field, fieldState: { error } }) => (
          <Checkbox checked={field.value} onChange={field.onChange}>
            transferable
          </Checkbox>
        )}
      />
      <Button type='submit' disabled={!isValid} onClick={() => submit(getValues())}>
        Submit
      </Button>
    </Container>
  );
};
