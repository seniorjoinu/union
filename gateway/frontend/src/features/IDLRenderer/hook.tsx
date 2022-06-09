import React, { useEffect, useMemo } from 'react';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { TId, TProg } from '@union/candid-parser';
import { DefaultValues } from 'react-hook-form';
import { useCandid } from '../Wallet/useCandid';
import { getEditor } from './RenderEditor';
import { getViewer } from './RenderViewer';
import { Empty } from './utils';

export interface UseRenderProps {
  path?: string;
  canisterId: Principal;
  type: string | ((prog: TProg) => TId | IDL.Type<any> | undefined);
}

export const useRender = <T extends {}>({ canisterId, type, path }: UseRenderProps) => {
  const { prog } = useCandid({ canisterId });

  const traversedIdlType = useMemo(() => {
    if (!prog) {
      return null;
    }
    return typeof type == 'string' ? prog?.traverseIdlType(new TId(type)) : type(prog);
  }, [prog, type]);

  const defaultValues = traversedIdlType?.accept(new Empty(), null) as DefaultValues<T>;

  const Form = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    return getEditor<T>({ defaultValues, traversedIdlType, path });
  }, [traversedIdlType]);

  const View = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    return getViewer<T>({ traversedIdlType, path });
  }, [traversedIdlType]);

  return {
    prog,
    traversedIdlType,
    defaultValues,
    Form,
    View,
  };
};
