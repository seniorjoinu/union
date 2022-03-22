import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { Principal } from '@dfinity/principal';
import { Text, Button as B, MultiSelect as MS } from 'components';
import { useForm, Controller } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { useCurrentWallet } from '../context';
import { useWallet, walletSerializer } from '../../../services';

const MultiSelect = styled(MS)``;
const Title = styled(Text)``;
const Button = styled(B)``;

const Container = styled.div`
  display: flex;
  flex-direction: column;

  ${Title} {
    margin-bottom: 16px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }
`;

export const Invite = () => {
  const [submitting, setSubmitting] = useState(false);
  const { rnp, principal } = useCurrentWallet();
  const { canister } = useWallet(principal);
  const {
    control,
    getValues,
    setValue,
    formState: { isValid },
  } = useForm<{ members: string[] }>({
    defaultValues: { members: [] },
    mode: 'onTouched',
  });

  const onSubmit = useCallback(() => {
    if (!rnp) {
      return;
    }

    setSubmitting(true);

    const { members } = getValues();

    canister
      .execute({
        title: 'Invite members',
        description: 'Invite members and create profiles',
        rnp,
        authorization_delay_nano: 100n,
        program: {
          RemoteCallSequence: [
            ...members.map((member) => {
              const args = walletSerializer.create_role({
                role_type: {
                  Profile: {
                    principal_id: Principal.fromText(member),
                    name: 'Invited profile',
                    description: 'Invited profile to union-wallet',
                  },
                },
              });

              return {
                endpoint: {
                  canister_id: Principal.fromText(principal),
                  method_name: 'create_role',
                },
                cycles: 0n,
                args_candid: args,
              };
            }),
          ],
        },
      })
      .then((res) => {
        // Executed | ScheduledForAuthorization
        console.log('RESULT', res);
        setValue('members', []);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }, [getValues, rnp, canister, principal, setSubmitting, setValue]);

  return (
    <Container>
      <Title variant='h2'>Приглашение</Title>
      <Controller
        name='members'
        control={control}
        rules={{
          required: 'Обязательное поле',
          validate: {
            isPrincipal: (value) =>
              value.reduce((acc, next) => acc && checkPrincipal(next) !== null, true as boolean),
          },
        }}
        render={({ field }) => <MultiSelect {...field} label='Приглашаемые' />}
      />
      <Button type='submit' disabled={!isValid || submitting} onClick={onSubmit}>
        Пригласить
      </Button>
    </Container>
  );
};
