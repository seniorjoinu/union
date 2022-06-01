import React, { useCallback, useEffect, useState } from 'react';
import { IDL } from '@dfinity/candid';
import { DefaultValues, useForm, UseFormGetValues, UseFormReturn } from 'react-hook-form';
import { TId } from '@union/candid-parser';
import { Column } from '@union/components';
import { Settings } from '../utils';
import { transformName, RenderEditorContext, normalizeValues, getProvider } from './utils';
import { RenderEditor } from './visitor';

export interface GetComponentProps<T> {
  path?: string;
  defaultValues?: DefaultValues<T>;
  traversedIdlType: TId | IDL.Type<any>;
}

export type FormContext<T> = RenderEditorContext<T> & UseFormReturn<T>;

export interface EditorProps<T> {
  defaultValue?: Partial<T>;
  useFormEffect?(ctx: FormContext<T>): void;
  settings?: Settings<T, RenderEditorContext<T>>;
  transformLabel?(value: string, defaultTransformator: (v: string) => string): React.ReactNode;
  children?(ctx: FormContext<T> & { isValid: boolean }): JSX.Element | null | false;
}

export const getEditor = <T extends {}>({
  path = '',
  defaultValues,
  traversedIdlType,
}: GetComponentProps<T>) => {
  const Provider = getProvider<T>();
  const form = traversedIdlType.accept(new RenderEditor({ path, absolutePath: path }), null);

  return ({
    defaultValue,
    children = () => null,
    useFormEffect = () => {},
    settings = { rules: {}, fields: {} },
    transformLabel = transformName,
    ...p
  }: EditorProps<T>) => {
    const {
      control,
      getValues: originalGetValues,
      setValue,
      reset,
      resetField,
      getFieldState,
      setError,
      ...formReturn
    } = useForm<T>({
      defaultValues: {
        ...defaultValues,
        ...defaultValue,
      } as DefaultValues<T>,
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
      setError,
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
};
