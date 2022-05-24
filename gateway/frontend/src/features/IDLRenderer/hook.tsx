import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Principal } from '@dfinity/principal';
import { TId } from '@union/candid-parser';
import { Column } from '@union/components';
import { useForm, UseFormGetValues, UseFormReturn } from 'react-hook-form';
import { useCandid } from '../Wallet/useCandid';
import { Render } from './visitor';
import {
  RenderContext,
  getProvider,
  Empty,
  FieldSettings,
  transformName,
  normalizeValues,
} from './utils';

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
  settings?: FieldSettings<T>;
  transformLabel?(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
  children?(ctx: FormContext<T> & { isValid: boolean }): JSX.Element | null | false;
}
export interface ViewerProps {
  value: any;
}

export const useRender = <T extends {}>({ canisterId, type }: UseRenderProps) => {
  const Provider = getProvider<T>();
  const { prog } = useCandid({ canisterId });

  const traversedIdlType = useMemo(() => prog?.traverseIdlType(new TId(type)), [prog, type]);

  const Form = useMemo(() => {
    if (!traversedIdlType) {
      return () => <span>Type is null</span>;
    }

    const form = traversedIdlType.accept(new Render({ path: '', absolutePath: '' }), null);
    const defaultValues = traversedIdlType.accept(new Empty(), null) as T;

    return ({
      defaultValue,
      children = () => null,
      useFormEffect = () => {},
      settings = {},
      transformLabel = transformName,
      ...p
    }: FormProps<T>) => {
      const {
        control,
        getValues: originalGetValues,
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
      const [isValid, setIsValid] = useState(false);

      const getValues: UseFormGetValues<T> = useCallback(
        (...args: any[]) => {
          // FIXME check TODO for normalizeValues
          // @ts-expect-error
          const values = originalGetValues(...args);

          const normalizedValues = normalizeValues(values);

          return normalizedValues;
        },
        [originalGetValues],
      );

      useEffect(() => {
        formReturn.trigger().then((isFormValid) => {
          formReturn.clearErrors();
          const isValid = traversedIdlType.covariant(getValues());

          setIsValid(isValid && isFormValid);
        });
        const { unsubscribe } = formReturn.watch(async (value, { name }) => {
          const isValid = traversedIdlType.covariant(value);

          const isFormValid = await formReturn.trigger();

          formReturn.clearErrors(name);

          setIsValid(isValid && isFormValid);
        });

        return () => unsubscribe();
      }, [formReturn.watch, setIsValid, formReturn, getValues]);

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
        settings,
        transformLabel,
      };
      const ctx = {
        ...value,
        ...formReturn,
        reset,
        isValid,
      };

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
    Form,
  };
};
