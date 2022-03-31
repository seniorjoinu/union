import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { Button as B, Text, TextField as TF, TextArea as TA } from 'components';
import { checkPrincipal } from 'toolkit';
import { Principal } from '@dfinity/principal';
import { ExecuteResponse } from 'wallet-ts';
import { useWallet } from 'services';
import moment from 'moment';
import { ExecutorFormData, getEmptyProgram } from '../types';
import { RoleSwitcher as RS } from './RoleSwitcher';

const RoleSwitcher = styled(RS)``;
const TextField = styled(TF)``;
const TextArea = styled(TA)``;
const Title = styled(Text)``;
const RemoveButton = styled(B)``;
const AddButton = styled(B)``;
const Button = styled(B)``;

const Result = styled.div`
  display: flex;
  flex-direction: column;

  &:empty {
    display: none;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;

  & > *:first-child {
    flex-grow: 1;
  }

  ${RemoveButton} {
    margin-left: 8px;
    align-self: flex-end;
  }
`;
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
    margin-top: 16px;
    align-self: flex-start;
  }

  ${ProgramSlice} {
    margin-top: 8px;
  }

  ${Result} {
    margin-top: 8px;
  }
`;

export interface ExecutorFormProps extends IClassName {
  mode: 'edit' | 'view';
  canisterId: string;
  data: Partial<ExecutorFormData>;
  renderResult?(index: number): React.ReactNode | null | void;
  onSubmit(response: ExecuteResponse): void;
}

export function ExecutorForm({
  canisterId,
  data,
  onSubmit,
  mode,
  renderResult = () => null,
  ...p
}: ExecutorFormProps) {
  const { canister, fetching } = useWallet(canisterId);
  const {
    control,
    getValues,
    formState: { isValid },
  } = useForm<ExecutorFormData>({
    defaultValues: data,
    mode: 'onTouched',
  });

  const submitting = fetching.execute;
  const editable = mode == 'edit';
  const disabled = !editable || submitting;
  const operationsLength = getValues().program.length;

  const submit = useCallback(() => {
    if (!isValid || disabled) {
      return;
    }

    const values = getValues();

    const program = values.program.filter((p) => p.endpoint.canister_id && p.endpoint.method_name);

    canister
      .execute({
        ...values,
        authorization_delay_nano: BigInt(values.authorization_delay_nano),
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
  }, [disabled, getValues, isValid, fetching.execute, canister, onSubmit]);

  return (
    <Container {...p}>
      {editable && <Title variant='h2'>Выполнение произвольного вызова</Title>}
      <Controller
        name='title'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            helperText={error?.message}
            disabled={disabled}
            label='Название действия'
          />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Обязательное поле',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField {...field} helperText={error?.message} disabled={disabled} label='Описание' />
        )}
      />
      {editable && (
        <Controller
          name='authorization_delay_nano'
          control={control}
          rules={{
            required: 'Обязательное поле',
            validate: {
              gtNow: (value) => value > 0 || 'Некорректная дата',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <TextField
              {...field}
              onChange={(e) => {
                const diff = moment(e.target.value).valueOf() - Date.now();

                if (diff < 0) {
                  return;
                }

                field.onChange(diff * 10 ** 6);
              }}
              min={moment().format('YYYY-MM-DDTHH:mm')}
              value={moment()
                .add(Math.ceil(field.value / 10 ** 6), 'milliseconds')
                .format('YYYY-MM-DDTHH:mm')}
              disabled={disabled}
              helperText={error?.message}
              type='datetime-local'
              label='Ожидание до'
            />
          )}
        />
      )}
      <RoleSwitcher
        control={control}
        getValues={getValues}
        disabled={disabled}
        label='Выполнить из под роли и пермиссии'
      />
      {(editable || !!operationsLength) && <Text variant='h5'>Операции</Text>}
      <Controller
        name='program'
        control={control}
        render={({ field }) => (
          <>
            {field.value.map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProgramSlice key={String(i)}>
                <Row>
                  <Text variant='h5'>Операция #{i + 1}</Text>
                  <RemoveButton
                    disabled={disabled}
                    onClick={() => field.onChange(field.value.filter((_, index) => index !== i))}
                  >
                    -
                  </RemoveButton>
                </Row>
                <Controller
                  name={`program.${i}.endpoint.canister_id`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                    validate: {
                      isPrincipal: (value) =>
                        (!!value && checkPrincipal(value.toString()) != null) ||
                        'Некорректный принципал',
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      label='Идентификатор канистера'
                    />
                  )}
                />
                <Controller
                  name={`program.${i}.endpoint.method_name`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      label='Наименование метода'
                    />
                  )}
                />
                <Controller
                  name={`program.${i}.cycles`}
                  control={control}
                  rules={{
                    required: 'Обязательное поле',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      type='number'
                      label='Сумма циклов для трансфера'
                    />
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
                          render={({ field: didfield, fieldState: { error } }) => (
                            <Row>
                              <TextArea
                                {...didfield}
                                helperText={error?.message}
                                disabled={disabled}
                                label={`Candid-аргумент вызова #${j + 1}`}
                              />
                              {editable && (
                                <RemoveButton
                                  disabled={disabled}
                                  onClick={() =>
                                    field.onChange(field.value.filter((_, index) => index !== j))
                                  }
                                >
                                  -
                                </RemoveButton>
                              )}
                            </Row>
                          )}
                        />
                      ))}
                      {editable && (
                        <AddButton
                          disabled={disabled}
                          onClick={() => field.onChange([...field.value, ''])}
                        >
                          + добавить аргумент
                        </AddButton>
                      )}
                      <Result>{renderResult(i) || null}</Result>
                    </>
                  )}
                />
              </ProgramSlice>
            ))}
            {editable && (
              <AddButton
                disabled={disabled}
                onClick={() => field.onChange([...field.value, getEmptyProgram()])}
              >
                + добавить операцию
              </AddButton>
            )}
          </>
        )}
      />
      {editable && (
        <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
          Выполнить
        </Button>
      )}
    </Container>
  );
}
