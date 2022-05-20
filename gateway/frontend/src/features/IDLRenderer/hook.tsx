import React, { useEffect, useMemo } from 'react';
import { Principal } from '@dfinity/principal';
import { TId } from '@union/candid-parser';
import { IDL, renderInput } from '@dfinity/candid';
import { useCandid } from '../Wallet/useCandid';
import { Render, RenderValue } from './candid-ui';

export interface UseRenderProps {
  canisterId: Principal;
  type: string;
}

export interface UIProps {
  selector: string;
}
export interface EditorProps extends UIProps {}
export interface ViewerProps extends UIProps {
  value: any;
}

export const useRender = ({ canisterId, type }: UseRenderProps) => {
  const { prog } = useCandid({ canisterId });

  const Editor: React.ComponentType<EditorProps> = useMemo(() => {
    if (!prog) {
      return () => <span>Prog is null</span>;
    }

    const traversedIdlType = prog.traverseIdlType(new TId(type));

    const box = renderInput(traversedIdlType);

    return ({ selector }: EditorProps) => {
      useEffect(() => {
        console.log('EDITOR', box);
        box.render(document.querySelector(selector)!);
      }, []);

      return <span>Editor</span>;
    };
  }, [prog]);

  const Viewer: React.ComponentType<ViewerProps> = useMemo(() => {
    if (!prog) {
      return () => <span>Prog is null</span>;
    }

    const traversedIdlType = prog.traverseIdlType(new TId(type));

    const input = traversedIdlType.accept(new Render(), null);

    return ({ value, selector }: ViewerProps) => {
      useEffect(() => {
        input.render(document.querySelector(selector)!);
        const box = traversedIdlType.accept(new RenderValue(), { input, value });

        console.log('VIEWER', box, input);
      }, []);

      return <span>Viewer</span>;
    };
  }, [prog]);

  return {
    prog,
    Editor,
    Viewer,
  };
};
