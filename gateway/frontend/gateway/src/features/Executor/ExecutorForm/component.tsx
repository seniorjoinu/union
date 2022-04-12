import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useForm, Controller } from 'react-hook-form';
import { PageWrapper, Button as B, Text, TextField as TF, TextArea as TA } from 'components';
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

  & > *:not(:first-child) {
    margin-left: 8px;
  }

  ${RemoveButton} {
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

const Container = styled(PageWrapper)`
  padding-bottom: 32px;

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
              RemoteCallSequence: program.map(({ args_candid, args_encoded, ...p }) => {
                const args = args_encoded?.length
                  ? { Encoded: args_encoded }
                  : { CandidString: args_candid.map((a) => a.trim()).filter((a) => !!a) };

                return {
                  ...p,
                  args,
                  cycles: BigInt(p.cycles),
                  endpoint: {
                    ...p.endpoint,
                    canister_id: Principal.fromText(p.endpoint.canister_id),
                  },
                };
              }),
            },
      })
      .then(onSubmit);
  }, [disabled, getValues, isValid, fetching.execute, canister, onSubmit]);

  return (
    <Container {...p} title={editable && 'Execution'}>
      <Controller
        name='title'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            helperText={error?.message}
            disabled={disabled}
            label='Action name'
          />
        )}
      />
      <Controller
        name='description'
        control={control}
        rules={{
          required: 'Required field',
        }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            helperText={error?.message}
            disabled={disabled}
            label='Description'
          />
        )}
      />
      {editable && (
        <Controller
          name='authorization_delay_nano'
          control={control}
          rules={{
            required: 'Required field',
            validate: {
              gtNow: (value) => value >= 0 || 'Incorrect date',
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <Row>
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
                label='Wait until'
              />
              <TextField
                {...field}
                min={0}
                disabled={disabled}
                helperText={error?.message}
                type='number'
                label='In nanosecs'
              />
            </Row>
          )}
        />
      )}
      <RoleSwitcher
        control={control}
        getValues={getValues}
        disabled={disabled}
        mode={mode}
        label='Execute under role and permission'
      />
      {(editable || !!operationsLength) && <Text variant='h5'>Operations</Text>}
      <Controller
        name='program'
        control={control}
        render={({ field }) => (
          <>
            {field.value.map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <ProgramSlice key={String(i)}>
                <Row>
                  <Text variant='h5'>Operation #{i + 1}</Text>
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
                    required: 'Required field',
                    validate: {
                      isPrincipal: (value) =>
                        (!!value && checkPrincipal(value.toString()) != null) ||
                        'Incorrect principal',
                    },
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      label='Canister ID'
                    />
                  )}
                />
                <Controller
                  name={`program.${i}.endpoint.method_name`}
                  control={control}
                  rules={{
                    required: 'Required field',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      label='Method name'
                    />
                  )}
                />
                <Controller
                  name={`program.${i}.cycles`}
                  control={control}
                  rules={{
                    required: 'Required field',
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      helperText={error?.message}
                      disabled={disabled}
                      type='number'
                      label='Cycles for transfer'
                    />
                  )}
                />
                {!!field.value[i].args_encoded?.length && <Text>Used encoded arguments</Text>}
                <Controller
                  name={`program.${i}.args_candid`}
                  control={control}
                  rules={
                    {
                      // required: 'Required field',
                    }
                  }
                  render={({ field }) => (
                    <>
                      {field.value.map((_, j) => (
                        <Controller
                          // eslint-disable-next-line react/no-array-index-key
                          key={String(j)}
                          name={`program.${i}.args_candid.${j}`}
                          control={control}
                          rules={{
                            required: 'Required field',
                          }}
                          render={({ field: didfield, fieldState: { error } }) => (
                            <Row>
                              <TextArea
                                {...didfield}
                                helperText={error?.message}
                                disabled={disabled}
                                label={`Candid-argument #${j + 1}`}
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
                          + add argument
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
                + add operation
              </AddButton>
            )}
          </>
        )}
      />
      {editable && (
        <Button type='submit' disabled={!isValid || submitting} onClick={submit}>
          Execute
        </Button>
      )}
    </Container>
  );
}
