import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Button as B, Text, TextField as TF, TextArea as TA } from 'components';
import { checkPrincipal } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { ExecuteResponse } from 'wallet-ts';
import { ExecutorFormData, getEmptyProgram } from '../types';
import { useWallet } from '../../../services';
import { RoleSwitcher as RS } from './RoleSwitcher';

const RoleSwitcher = styled(RS)``;
const TextField = styled(TF)``;
const TextArea = styled(TA)``;
const Title = styled(Text)``;
const AddButton = styled(B)``;
const Button = styled(B)``;

const ProgramSlice = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid grey;
  border-radius: 4px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;

  ${Title} {
    margin-bottom: 64px;
  }

  ${TextField}, ${RoleSwitcher} {
    margin-bottom: 24px;
  }

  ${Button} {
    margin-top: 32px;
    align-self: center;
  }

  ${AddButton} {
    margin-top: 8px;
    align-self: flex-start;
  }

  ${ProgramSlice} {
    margin-top: 24px;
  }
`;

export interface ExecutorFormProps extends IClassName {
  canisterId: string;
  data: Partial<ExecutorFormData>;
  onSubmit(response: ExecuteResponse): void;
}

export function ExecutorForm({ canisterId, data, onSubmit, ...p }: ExecutorFormProps) {
  const { canister, fetching } = useWallet(canisterId);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<ExecutorFormData>({
    defaultValues: data,
    mode: 'onTouched',
  });

  const submit = useCallback(() => {
    if (!isValid) {
      return;
    }

    const values = getValues();

    const program = values.program.filter((p) => p.endpoint.canister_id && p.endpoint.method_name);

    canister
      .execute({
        ...values,
        authorization_delay_nano: BigInt(100),
        program: !program.length
          ? { Empty: null }
          : {
              RemoteCallSequence: program.map((p) => ({
                ...p,
                args_candid: p.args_candid.map((a) => a.trim()),
                cycles: BigInt(p.cycles),
                endpoint: {
                  ...p.endpoint,
                  canister_id: Principal.fromText(p.endpoint.canister_id),
                },
              })),
            },
      })
      .then(onSubmit);
  }, [getValues, isValid, fetching.execute, canister, onSubmit]);

  return (
    <Container {...p}>
      <Title variant='h2'>Выполнение произвольного вызова</Title>
      <Controller
        name='title'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field }) => <TextField {...field} label='Название действия' />}
      />
      <Controller
        name='description'
        control={control}
        render={({ field }) => <TextField {...field} label='Описание' />}
      />
      <Controller
        name='rnp'
        control={control}
        render={({ field }) => <RoleSwitcher {...field} label='Ваша роль и пермиссия' />}
      />
      <Text variant='h5'>Операции</Text>
      <Controller
        name='program'
        control={control}
        render={({ field }) => (
          <>
            {field.value.map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProgramSlice key={String(i)}>
                <Text variant='h5'>Операция #{i + 1}</Text>
                <Controller
                  name={`program.${i}.endpoint.canister_id`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                    validate: {
                      isPrincipal: (value) => !!value && checkPrincipal(value.toString()) != null,
                    },
                  }}
                  render={({ field }) => <TextField {...field} label='Идентификатор канистера' />}
                />
                <Controller
                  name={`program.${i}.endpoint.method_name`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                  }}
                  render={({ field }) => <TextField {...field} label='Наименование метода' />}
                />
                <Controller
                  name={`program.${i}.cycles`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                  }}
                  render={({ field }) => (
                    <TextField {...field} type='number' label='Сумма циклов для трансфера' />
                  )}
                />
                <Controller
                  name={`program.${i}.args_candid`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                  }}
                  render={({ field }) => (
                    <>
                      {field.value.map((_, j) => (
                        <Controller
                          // eslint-disable-next-line react/no-array-index-key
                          key={String(j)}
                          name={`program.${i}.args_candid.${j}`}
                          control={control}
                          rules={{
                            required: 'Обязательное поле',
                          }}
                          render={({ field }) => (
                            <TextArea {...field} label={`Candid-аргумент вызова #${j + 1}`} />
                          )}
                        />
                      ))}
                      <AddButton onClick={() => field.onChange([...field.value, ''])}>
                        + добавить аргумент
                      </AddButton>
                    </>
                  )}
                />
              </ProgramSlice>
            ))}
            <AddButton onClick={() => field.onChange([...field.value, getEmptyProgram()])}>
              + добавить операцию
            </AddButton>
          </>
        )}
      />
      <Button type='submit' disabled={!isValid || fetching.execute} onClick={submit}>
        Выполнить
      </Button>
    </Container>
  );
}
