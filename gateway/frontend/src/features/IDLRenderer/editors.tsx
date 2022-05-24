import React, { useContext, useMemo, useState } from 'react';
import { IDL } from '@dfinity/candid';
import { Checkbox, TextField, TextFieldProps } from '@union/components';
import { Controller, ControllerProps } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { RenderProps, context, AdornmentWrapper, getSettings } from './utils';

export interface TypeFormProps extends Omit<TextFieldProps, 'name'>, RenderProps {
  idl: IDL.Type<any>;
  path: string;
  transformValue?(value: string): any;
  parseValue?(value: any): string;
  controlled?: boolean;
  rules?: ControllerProps['rules'];
}
export const TypeForm = ({
  idl,
  path,
  absolutePath,
  transformValue = (v) => v,
  parseValue = (v) => String(v),
  controlled = true,
  rules,
  ...p
}: TypeFormProps) => {
  const ctx = useContext(context);
  const { getValues, control } = ctx;
  const settings = getSettings(path, absolutePath);

  const defaultValue = parseValue(getValues(path));
  const name = p.label || settings.label || p.name;

  return (
    <Controller
      name={path}
      control={control}
      rules={rules}
      render={({ field: { value, ...field }, fieldState: { error } }) =>
        (!settings.hide ? (
          <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
            <TextField
              {...p}
              {...field}
              {...(controlled ? { value: parseValue(value) } : {})}
              key={path}
              label={name}
              onChange={({ target: { value } }) => {
                field.onChange(transformValue(value));
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder={idl.display()}
              defaultValue={defaultValue}
              helperText={error?.message}
            />
          </AdornmentWrapper>
        ) : (
          <></>
        ))
      }
    />
  );
};

export const StringForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const NumberForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => Number(v)} type='number' />
);
export const BigIntForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => BigInt(v)} type='number' />
);
export const FloatForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => parseFloat(v)} type='number' />
);
export const IntForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => parseInt(v)} type='number' />
);
export const PrincipalForm = (p: TypeFormProps) => (
  <TypeForm
    {...p}
    transformValue={(v) => checkPrincipal(v)}
    parseValue={(v) => checkPrincipal(v)?.toString() || ''}
    controlled={false}
    rules={{
      validate: {
        isPrincipal: (v) => !!checkPrincipal(v) || 'Wrong principal',
      },
    }}
  />
);
export const BoolForm = ({ path, absolutePath, ...p }: TypeFormProps) => {
  const ctx = useContext(context);
  const { control } = ctx;
  const settings = getSettings(path, absolutePath);
  const name = settings.label || p.name;

  return (
    <Controller
      name={path}
      control={control}
      render={({ field, fieldState: { error } }) =>
        (!settings.hide ? (
          <AdornmentWrapper adornment={settings.adornment} ctx={ctx} path={path} name={name}>
            <Checkbox
              checked={field.value}
              onChange={() => {
                field.onChange(!field.value);
              }}
              helperText={error?.message}
            >
              {name}
            </Checkbox>
          </AdornmentWrapper>
        ) : (
          <></>
        ))
      }
    />
  );
};

export class Editor extends IDL.Visitor<null, JSX.Element | null> {
  constructor(protected props: RenderProps) {
    super();
  }

  visitEmpty = () => null;

  visitType = <T extends {}>(t: IDL.Type<T>) => <StringForm {...this.props} idl={t} />;

  visitInt = <T extends {}>(t: IDL.Type<T>) => <IntForm {...this.props} idl={t} />;
  visitFixedInt = <T extends {}>(t: IDL.Type<T>) => <IntForm {...this.props} idl={t} />;

  visitFloat = <T extends {}>(t: IDL.Type<T>) => <FloatForm {...this.props} idl={t} />;

  visitNumber = <T extends {}>(t: IDL.Type<T>) => <NumberForm {...this.props} idl={t} />;

  visitNat = <T extends {}>(t: IDL.Type<T>) => <BigIntForm {...this.props} idl={t} />;
  visitFixedNat = <T extends {}>(t: IDL.Type<T>) => <BigIntForm {...this.props} idl={t} />;

  visitBool = <T extends {}>(t: IDL.Type<T>) => <BoolForm {...this.props} idl={t} />;

  visitPrincipal = <T extends {}>(t: IDL.Type<T>) => <PrincipalForm {...this.props} idl={t} />;
}
