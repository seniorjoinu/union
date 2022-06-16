import React, { useContext, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import { FieldValues, FieldPath, RegisterOptions, DefaultValues } from 'react-hook-form';
import { FieldProps } from '@union/components';

export const defaultFieldProps: Partial<FieldProps> = {
  weight: { title: 'regular' },
  variant: { title: 'p3', value: 'p3' },
};

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
    ) => JSX.Element | null | false;
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

export interface GetSettingsResult<T, CTX> {
  settings: FieldSetting<T, CTX>;
  rule: FieldSetting<T, CTX>;
  abs: FieldSetting<T, CTX>;
  field: FieldSetting<T, CTX>;
}

export const getSettings = <T extends FieldValues, CTX>(
  path: FieldPath<T>,
  absolutePath: FieldPath<T>,
  settings: Settings<T, CTX>,
): GetSettingsResult<T, CTX> => {
  const fields = settings.fields || ({} as FieldSettings<T, CTX>);
  const rules = settings.rules || ({} as Record<string, FieldSetting<T, CTX>>);
  const recEntry = Object.entries(rules).find(([key, s]) => {
    if (!s || !key) {
      return false;
    }

    return absolutePath.endsWith(key) || path.endsWith(key);
  }) || ['', {}];

  const rule = (recEntry ? recEntry[1] || {} : {}) as FieldSetting<T, CTX>;
  const abs = (absolutePath !== path ? fields[absolutePath] || {} : {}) as FieldSetting<T, CTX>;
  const field = (fields[path] || {}) as FieldSetting<T, CTX>;

  return { settings: { ...rule, ...abs, ...field }, rule, abs, field };
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
  settings: GetSettingsResult<T, CTX>;
  name?: React.ReactNode;
}): JSX.Element | null => {
  const { hide, adornment } = settings.settings;

  const origin = useMemo(() => {
    let origin = settings.rule.adornment?.render
      ? settings.rule.adornment.render(ctx, path, name, children)
      : children;

    origin = settings.abs.adornment?.render
      ? settings.abs.adornment.render(ctx, path, name, origin)
      : origin;

    origin = settings.field.adornment?.render
      ? settings.field.adornment.render(ctx, path, name, origin)
      : origin;
    return origin;
  }, [settings, children]);

  if (hide) {
    return null;
  }

  if (!adornment) {
    return <>{children}</>;
  }

  return (
    <>
      {adornment.kind == 'start' && adornment.render && origin}
      {adornment.kind == 'replace' && adornment.render ? origin : children}
      {adornment.kind == 'end' && adornment.render && origin}
    </>
  );
};
