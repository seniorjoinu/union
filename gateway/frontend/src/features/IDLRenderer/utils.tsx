import React from 'react';
import { IDL } from '@dfinity/candid';
import {
  FieldValues,
  UseFormGetValues,
  UseFormResetField,
  UseFormSetValue,
  Control,
  UseFormGetFieldState,
} from 'react-hook-form';

export type RenderContext<V extends FieldValues = FieldValues> = {
  getValues: UseFormGetValues<V>;
  getFieldState: UseFormGetFieldState<V>;
  setValue: UseFormSetValue<V>;
  resetField: UseFormResetField<V>;
  setData(data: V): void;
  control: Control<V, any>;
};
export const context = React.createContext<RenderContext>({
  getValues: () => [],
  getFieldState: () => ({ invalid: false, isDirty: false, isTouched: false }),
  setValue: () => {},
  setData: () => {},
  resetField: () => {},
  // @ts-expect-error
  control: null,
});

export const getProvider = <T extends FieldValues>() =>
  context.Provider as React.Provider<RenderContext<T>>;

export type RenderProps = { path: string; key?: string; name?: React.ReactNode };

export class Parse extends IDL.Visitor<string, null | string | number | boolean> {
  public visitNull(t: IDL.NullClass, v: string): null {
    return null;
  }
  public visitBool(t: IDL.BoolClass, v: string): boolean {
    if (v === 'true') {
      return true;
    }
    if (v === 'false') {
      return false;
    }
    throw new Error(`Cannot parse ${v} as boolean`);
  }
  public visitText(t: IDL.TextClass, v: string): string {
    return v;
  }
  public visitFloat(t: IDL.FloatClass, v: string): number {
    return parseFloat(v);
  }
  public visitNumber(t: IDL.PrimitiveType, v: string): number {
    return Number(BigInt(v));
  }
  public visitPrincipal(t: IDL.PrincipalClass, v: string): string {
    return v;
    // return Principal.fromText(v);
  }
  public visitService(t: IDL.ServiceClass, v: string): string {
    return v;
    // return Principal.fromText(v);
  }
  public visitFunc(t: IDL.FuncClass, v: string): string {
    return v;
    // const x = v.split('.', 2);
    // return [Principal.fromText(x[0]), x[1]];
  }
}

export class Empty extends IDL.Visitor<null, any> {
  // visitNat = () => BigInt(0);
  // visitFixedNat = () => BigInt(0);
  // visitFloat = () => 0;
  // visitNumber = () => 0;
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
  visitVariant = (t: IDL.Type, fields: Array<[string, IDL.Type]>): any => {
    if (!fields.length) {
      return {};
    }
    const field = fields[0];

    return { [field[0]]: field[1].accept(new Empty(), null) };
  };
  visitOpt = (): any => [];
  visitVec = (): any => [];
  visitRec = (_: IDL.Type, ty: IDL.ConstructType): any => ty.accept(new Empty(), null);
}
