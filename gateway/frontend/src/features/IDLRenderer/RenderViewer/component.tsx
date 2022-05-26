import React, { useEffect } from 'react';
import { IDL } from '@dfinity/candid';
import { TId } from '@union/candid-parser';
import { Column } from '@union/components';
import { Settings } from '../utils';
import { transformName, RenderViewerContext, getProvider } from './utils';
import { RenderViewer } from './visitor';

export interface GetComponentProps {
  traversedIdlType: TId | IDL.Type<any>;
}

export interface ViewProps<T> {
  value: T;
  useViewEffect?(ctx: RenderViewerContext<T>): void;
  settings?: Settings<T, RenderViewerContext<T>>;
  transformLabel?(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
  children?(ctx: RenderViewerContext<T>): JSX.Element | null | false;
}

export const getViewer = <T extends {}>({ traversedIdlType }: GetComponentProps) => {
  const Provider = getProvider<T>();
  const view = traversedIdlType.accept(new RenderViewer({ path: '', absolutePath: '' }), null);

  return ({
    value,
    children = () => null,
    useViewEffect = () => {},
    settings = { rules: {}, fields: {} },
    transformLabel = transformName,
    ...p
  }: ViewProps<T>) => {
    useEffect(() => {
      useViewEffect(ctx);
    }, [useViewEffect]);

    const ctx = {
      settings,
      transformLabel,
      value,
    };

    return (
      <Column {...p}>
        <Provider value={ctx}>{view}</Provider>
        {children(ctx)}
      </Column>
    );
  };
};
