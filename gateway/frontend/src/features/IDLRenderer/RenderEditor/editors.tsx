import React, { useContext, useEffect } from 'react';
import { IDL } from '@dfinity/candid';
import { Checkbox, TextField, TextFieldProps } from '@union/components';
import { Controller, ControllerProps } from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { SettingsWrapper } from '../utils';
import { RenderProps, context, useSettings } from './utils';

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
  const settings = useSettings(path, absolutePath);

  const defaultValue = parseValue(getValues(path));
  const name = p.label || typeof settings.label == 'string' ? settings.label : p.name;
  const disabled = p.disabled || settings.disabled;

  useEffect(() => {
    if (!settings.options) {
      return;
    }
    ctx.control.register(
      path,
      typeof settings.options == 'function' ? settings.options(ctx, path) : settings.options,
    );
  }, [settings.options, ctx.control.register, path, ctx, path]);

  return (
    <Controller
      name={path}
      control={control}
      rules={rules}
      render={({ field: { value, ...field }, fieldState: { error } }) => (
        <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
          <TextField
            {...p}
            {...field}
            {...(controlled ? { value: parseValue(value) } : { defaultValue })}
            disabled={disabled}
            key={path}
            label={name}
            onChange={({ target: { value } }) => {
              field.onChange(transformValue(value));
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder={settings.placeholder || idl.display()}
            helperText={error?.message}
          />
        </SettingsWrapper>
      )}
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
  const settings = useSettings(path, absolutePath);
  const name = typeof settings.label == 'string' ? settings.label : p.name;
  const disabled = p.disabled || settings.disabled;

  return (
    <Controller
      name={path}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
          <Checkbox
            checked={field.value}
            onChange={() => {
              field.onChange(!field.value);
            }}
            disabled={disabled}
            helperText={error?.message}
          >
            {name}
          </Checkbox>
        </SettingsWrapper>
      )}
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
