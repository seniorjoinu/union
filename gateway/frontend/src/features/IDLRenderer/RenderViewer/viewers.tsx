import React, { useContext } from 'react';
import { IDL } from '@dfinity/candid';
import { get } from 'react-hook-form';
import { Field } from '@union/components';
import { checkPrincipal } from 'toolkit';
import { SettingsWrapper } from '../utils';
import { RenderProps, context, useSettings } from './utils';

export interface TypeFormProps extends RenderProps {
  idl: IDL.Type<any>;
  path: string;
  transformValue?(value: string): any;
}
export const TypeForm = ({
  idl,
  path,
  absolutePath,
  transformValue = (v) => String(v),
  ...p
}: TypeFormProps) => {
  const ctx = useContext(context);
  const settings = useSettings(path, absolutePath);

  const value = get(ctx.value, path);
  const name = typeof settings.label == 'string' ? settings.label : p.name;

  return (
    <SettingsWrapper settings={settings} ctx={ctx} path={path} name={name}>
      <Field
        title={name}
        weight={{ title: 'medium' }}
        variant={{ title: 'p3', value: 'p3' }}
        align='row'
      >
        {transformValue(value)}
      </Field>
    </SettingsWrapper>
  );
};

export const StringForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const NumberForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const BigIntForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const FloatForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const IntForm = (p: TypeFormProps) => <TypeForm {...p} />;
export const PrincipalForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => checkPrincipal(v)?.toString() || 'empty'} />
);
export const BoolForm = (p: TypeFormProps) => (
  <TypeForm {...p} transformValue={(v) => (v ? 'true' : 'false')} />
);

export class Viewer extends IDL.Visitor<null, JSX.Element | null> {
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
