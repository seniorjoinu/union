import React, { useContext, useMemo } from 'react';
import { FieldValues, FieldPath } from 'react-hook-form';
import { getSettings, Settings } from '../utils';

export const transformName = (v: string | null | void) => {
  if (!v) {
    return '';
  }
  return `${v[0].toUpperCase()}${v.slice(1)}`.replaceAll('_', ' ');
};

export type RenderViewerContext<V extends FieldValues = FieldValues> = {
  value: V;
  settings: Settings<V, RenderViewerContext<V>>;
  transformLabel(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
};

export const context = React.createContext<RenderViewerContext>({
  value: {},
  settings: { defaultValue: {}, fields: {}, rules: {} },
  transformLabel: transformName,
});

export const getProvider = <T extends FieldValues>() =>
  context.Provider as React.Provider<RenderViewerContext<T>>;

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
  const { settings } = useContext(context as React.Context<RenderViewerContext<T>>);

  return useMemo(() => getSettings<T, RenderViewerContext<T>>(path, absolutePath, settings), [
    path,
    absolutePath,
    settings,
  ]);
};

export type ViewerSettings<T extends {}> = Settings<T, RenderViewerContext<T>>;
