import React, { useContext, useMemo } from 'react';
import { IDL } from '@dfinity/candid';
import {
  FieldValues,
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
  Control,
  UseFormGetFieldState,
  FieldPath,
  DefaultValues,
  RegisterOptions,
} from 'react-hook-form';
import { checkPrincipal } from 'toolkit';

const isObject = (value: any) =>
  value !== null &&
  value !== undefined &&
  !Array.isArray(value) &&
  typeof value === 'object' &&
  !(value instanceof Date);

// FIXME https://github.com/react-hook-form/react-hook-form/discussions/8030
export const normalizeValues = (data: any): any => {
  // while react-hook-from clones Principal, result principal become bad. Try to fix this
  if (isObject(data) && '_isPrincipal' in data) {
    return checkPrincipal(Object.values(data._arr || []));
  }

  if (
    data instanceof Date ||
    data instanceof Set ||
    (globalThis.Blob && data instanceof Blob) ||
    (globalThis.FileList && data instanceof FileList)
  ) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeValues);
  }
  if (isObject(data)) {
    for (const key in data) {
      data[key] = normalizeValues(data[key]);
    }
  }

  return data;
};

export const transformName = (v: string | null | void) => {
  if (!v) {
    return '';
  }
  return `${v[0].toUpperCase()}${v.slice(1)}`;
};

export type FieldSetting<T> = {
  order?: number;
  hide?: boolean;
  label?: React.ReactNode;
  placeholder?: string;
  options?: RegisterOptions<T, any>;
  adornment?: {
    kind?: 'start' | 'end' | 'replace';
    render?: (
      ctx: RenderContext<T>,
      path: string,
      name?: React.ReactNode,
    ) => JSX.Element | null | void | false;
  };
};

export type FieldSettings<
  T extends FieldValues,
  TFieldName extends FieldPath<T> = FieldPath<T>
> = Partial<Record<TFieldName, FieldSetting<T>>>;

export type Settings<T extends FieldValues> = {
  defaultValue?: DefaultValues<T>;
  fields?: FieldSettings<T>;
  rules?: Record<string, FieldSetting<T>>;
};

export type RenderContext<V extends FieldValues = FieldValues> = {
  getValues: UseFormGetValues<V>;
  getFieldState: UseFormGetFieldState<V>;
  setValue: UseFormSetValue<V>;
  resetField: UseFormResetField<V>;
  setData(data: V): void;
  control: Control<V, any>;
  settings: Settings<V>;
  transformLabel(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
};
export const context = React.createContext<RenderContext>({
  getValues: () => [],
  getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false }),
  setValue: () => {},
  setData: () => {},
  resetField: () => {},
  // @ts-expect-error
  control: null,
  settings: { defaultValue: {}, fields: {}, rules: {} },
  transformLabel: transformName,
});

export const getProvider = <T extends FieldValues>() =>
  context.Provider as React.Provider<RenderContext<T>>;

export type RenderProps = {
  path: string;
  absolutePath: string;
  key?: string;
  name?: React.ReactNode;
};

export const useSettings = <T extends FieldValues>(
  path: FieldPath<T>,
  absolutePath: FieldPath<T>,
) => {
  const { settings } = useContext(context);

  return useMemo(() => getSettings(path, absolutePath, settings), [path, absolutePath, settings]);
};

export const getSettings = <T extends FieldValues>(
  path: FieldPath<T>,
  absolutePath: FieldPath<T>,
  settings: Settings<T>,
) => {
  const fields = settings.fields || ({} as FieldSettings<T>);
  const rules = settings.rules || ({} as Record<string, FieldSetting<T>>);
  const recEntry = Object.entries(rules).find(([key, s]) => {
    if (!s || !key) {
      return false;
    }

    return absolutePath.endsWith(key) || path.endsWith(key);
  }) || ['', {}];

  const recConfig = recEntry ? recEntry[1] || {} : {};

  const absConfig = fields[absolutePath] || {};
  const config = fields[path] || {};

  return { ...recConfig, ...absConfig, ...config } as FieldSetting<T>;
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

export const SettingsWrapper = <T extends FieldValues>({
  settings,
  children,
  ctx,
  path,
  name,
}: {
  children: React.ReactNode;
  ctx: RenderContext<T>;
  path: FieldPath<T>;
  settings: FieldSetting<T>;
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
      {adornment.kind == 'start' && adornment.render && adornment.render(ctx, path, name)}
      {adornment.kind == 'replace' && adornment.render
        ? adornment.render(ctx, path, name)
        : children}
      {adornment.kind == 'end' && adornment.render && adornment.render(ctx, path, name)}
    </>
  );
};
