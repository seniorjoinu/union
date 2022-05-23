import React, { useCallback, useEffect, useMemo } from 'react';
import { Principal } from '@dfinity/principal';
import { TId } from '@union/candid-parser';
import { Column } from '@union/components';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useCandid } from '../Wallet/useCandid';
import { Render } from './visitor';
import { RenderContext, getProvider, Empty } from './utils';

export interface UseRenderProps {
  canisterId: Principal;
  type: string;
}

export interface UIProps {
  selector: string;
}
export interface EditorProps<T> extends RenderContext<T> {}

export type FormContext<T> = RenderContext<T> & UseFormReturn<T>;
export interface FormProps<T> {
  defaultValue?: Partial<T>;
  useFormEffect?(ctx: FormContext<T>): void;
  children?(ctx: FormContext<T>): JSX.Element | null | false;
}
export interface ViewerProps {
  value: any;
}

export const useRender = <T extends {}>({ canisterId, type }: UseRenderProps) => {
  const Provider = getProvider<T>();
  const { prog } = useCandid({ canisterId });

  const traversedIdlType = useMemo(() => prog?.traverseIdlType(new TId(type)), [prog, type]);

  const Editor = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    const form = traversedIdlType.accept(new Render({ path: '' }), null);
    const defaultValues = traversedIdlType.accept(new Empty(), null) as T;

    return ({
      setValue,
      setData,
      resetField,
      getValues,
      control,
      getFieldState,
      ...p
    }: EditorProps<T>) => {
      useEffect(() => {
        setData(defaultValues);
      }, []);

      return (
        <Column {...p}>
          <Provider value={{ setValue, setData, resetField, getValues, control, getFieldState }}>
            {form}
          </Provider>
        </Column>
      );
    };
  }, [traversedIdlType]);

  const Form = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    const form = traversedIdlType.accept(new Render({ path: '' }), null);
    const defaultValues = traversedIdlType.accept(new Empty(), null) as T;

    return ({
      defaultValue,
      children = () => null,
      useFormEffect = () => {},
      ...p
    }: FormProps<T>) => {
      const {
        control,
        getValues,
        setValue,
        reset,
        resetField,
        getFieldState,
        ...formReturn
      } = useForm<T>({
        // @ts-expect-error
        defaultValues: {
          ...defaultValues,
          ...defaultValue,
        },
        mode: 'all',
      });

      useEffect(() => {
        useFormEffect(ctx);
      }, [useFormEffect]);

      const setData = useCallback(
        (data: T) => {
          // @ts-expect-error
          reset(data);
        },
        [reset],
      );

      const value = {
        control,
        getFieldState,
        setValue,
        setData,
        resetField,
        getValues,
      };
      const ctx = { ...value, ...formReturn, reset };

      return (
        <Column {...p}>
          <Provider value={value}>{form}</Provider>
          {children(ctx)}
        </Column>
      );
    };
  }, [traversedIdlType]);

  return {
    prog,
    traversedIdlType,
    Editor,
    Form,
  };
};
