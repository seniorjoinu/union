import React, { useContext, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import { FieldValues, FieldPath, RegisterOptions, DefaultValues } from 'react-hook-form';

export class Empty extends IDL.Visitor<null, any> {
  visitBool = () => false;
  visitText = () => '';
  visitService = () => '';
  visitFunc = () => '';
  visitFloat = () => null;
  visitNumber = () => null;
  visitNull = () => null;
  visitPrincipal = () => null;
  visitNat = () => null;
  visitFixedNat = () => null;
  visitPrimitive = () => null;

  visitType = (t: IDL.Type): any => t.accept(new Empty(), null);

  visitRecord = (_: IDL.Type, fields: Array<[string, IDL.Type]>): any =>
    fields.reduce(
      (acc, [name, field]) => ({
        ...acc,
        [name]: field.accept(new Empty(), null),
      }),
      {},
    );
  visitTuple = (_: IDL.Type, fields: IDL.Type[]): any =>
    fields.map((t) => t.accept(new Empty(), null));
  visitVariant = (t: IDL.Type, fields: Array<[string, IDL.Type]>): any => ({});
  visitOpt = (): any => [];
  visitVec = (): any => [];
  visitRec = (_: IDL.Type, ty: IDL.ConstructType): any => ty.accept(new Empty(), null);
}

export type FieldSetting<T, CTX> = {
  order?: number;
  hide?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  defaultValue?: any;
  options?: RegisterOptions<T, any> | ((ctx: CTX, path: string) => RegisterOptions<T, any>);
  adornment?: {
    kind?: 'start' | 'end' | 'replace';
    render?: (
      ctx: CTX,
      path: string,
      name: React.ReactNode,
      origin: React.ReactNode,
    ) => JSX.Element | null | void | false;
  };
};

export type FieldSettings<
  T extends FieldValues,
  CTX,
  TFieldName extends FieldPath<T> = FieldPath<T>
> = Partial<Record<TFieldName, FieldSetting<T, CTX>>>;

export type Settings<T extends FieldValues, CTX> = {
  defaultValue?: DefaultValues<T>;
  fields?: FieldSettings<T, CTX>;
  rules?: Record<string, FieldSetting<T, CTX>>;
};

export const getSettings = <T extends FieldValues, CTX>(
  path: FieldPath<T>,
  absolutePath: FieldPath<T>,
  settings: Settings<T, CTX>,
) => {
  const fields = settings.fields || ({} as FieldSettings<T, CTX>);
  const rules = settings.rules || ({} as Record<string, FieldSetting<T, CTX>>);
  const recEntry = Object.entries(rules).find(([key, s]) => {
    if (!s || !key) {
      return false;
    }

    return absolutePath.endsWith(key) || path.endsWith(key);
  }) || ['', {}];

  const recConfig = recEntry ? recEntry[1] || {} : {};

  const absConfig = fields[absolutePath] || {};
  const config = fields[path] || {};

  return { ...recConfig, ...absConfig, ...config } as FieldSetting<T, CTX>;
};

export const SettingsWrapper = <T extends FieldValues, CTX>({
  settings,
  children,
  ctx,
  path,
  name,
}: {
  children: React.ReactNode;
  ctx: CTX;
  path: FieldPath<T>;
  settings: FieldSetting<T, CTX>;
  name?: React.ReactNode;
}): JSX.Element | null => {
  const { hide, adornment } = settings;

  if (hide) {
    return null;
  }

  if (!adornment) {
    return <>{children}</>;
  }
  return (
    <>
      {adornment.kind == 'start' && adornment.render && adornment.render(ctx, path, name, children)}
      {adornment.kind == 'replace' && adornment.render
        ? adornment.render(ctx, path, name || '', children)
        : children}
      {adornment.kind == 'end' && adornment.render && adornment.render(ctx, path, name, children)}
    </>
  );
};
