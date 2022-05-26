import React, { useContext, useMemo } from 'react';
import {
  FieldValues,
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
  Control,
  UseFormGetFieldState,
  FieldPath,
} from 'react-hook-form';
import { checkPrincipal } from 'toolkit';
import { getSettings, Settings } from '../utils';

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
  return `${v[0].toUpperCase()}${v.slice(1)}`.replaceAll('_', ' ');
};

export type RenderEditorContext<V extends FieldValues = FieldValues> = {
  getValues: UseFormGetValues<V>;
  getFieldState: UseFormGetFieldState<V>;
  setValue: UseFormSetValue<V>;
  resetField: UseFormResetField<V>;
  setData(data: V): void;
  control: Control<V, any>;
  settings: Settings<V, RenderEditorContext<V>>;
  transformLabel(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
};

export const context = React.createContext<RenderEditorContext>({
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
  context.Provider as React.Provider<RenderEditorContext<T>>;

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
  const { settings } = useContext(context as React.Context<RenderEditorContext<T>>);

  return useMemo(() => getSettings<T, RenderEditorContext<T>>(path, absolutePath, settings), [
    path,
    absolutePath,
    settings,
  ]);
};

export type EditorSettings<T extends {}> = Settings<T, RenderEditorContext<T>>;
