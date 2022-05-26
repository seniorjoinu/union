import React, { useMemo } from 'react';
import { Principal } from '@dfinity/principal';
import { TId } from '@union/candid-parser';
import { DefaultValues } from 'react-hook-form';
import { useCandid } from '../Wallet/useCandid';
import { getEditor } from './RenderEditor';
import { getViewer } from './RenderViewer';
import { Empty } from './utils';

export interface UseRenderProps {
  canisterId: Principal;
  type: string;
}

export const useRender = <T extends {}>({ canisterId, type }: UseRenderProps) => {
  const { prog } = useCandid({ canisterId });

  const traversedIdlType = useMemo(() => prog?.traverseIdlType(new TId(type)), [prog, type]);
  const defaultValues = traversedIdlType?.accept(new Empty(), null) as DefaultValues<T>;

  const Form = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    return getEditor<T>({ defaultValues, traversedIdlType });
  }, [traversedIdlType]);

  const View = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    return getViewer<T>({ traversedIdlType });
  }, [traversedIdlType]);

  return {
    prog,
    traversedIdlType,
    defaultValues,
    Form,
    View,
  };
};
