import { IDL } from '@dfinity/candid';
import { PatchedIDL } from './idl-monkey-patching';

interface DefaultService {}

type Unpromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;

export function buildEncoder<
  _SERVICE extends DefaultService,
  // @ts-expect-error
  R = { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => ArrayBuffer }
>(idl: IDL.InterfaceFactory, key?: 'argTypes'): R;

export function buildEncoder<
  _SERVICE extends DefaultService,
  // @ts-expect-error
  R = { [key in keyof _SERVICE]: (args: Unpromise<ReturnType<_SERVICE[key]>>) => ArrayBuffer }
>(idl: IDL.InterfaceFactory, key?: 'retTypes'): R;

export function buildEncoder<
  _SERVICE extends DefaultService,
  // @ts-expect-error
  R = { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => ArrayBuffer }
>(idl: IDL.InterfaceFactory, key: 'argTypes' | 'retTypes' = 'argTypes') {
  const idlFactory = idl({ IDL: PatchedIDL });

  const encoder = idlFactory._fields.reduce((acc, next) => {
    const func = next[1] as IDL.FuncClass;

    return {
      ...acc,
      [next[0]]: (...args: any[]) => IDL.encode(func[key], args),
    };
  }, {} as R);
  return encoder;
}

export const buildDecoder = <_SERVICE extends DefaultService>(
  idl: IDL.InterfaceFactory,
  key: 'argTypes' | 'retTypes' = 'retTypes',
) => {
  const idlFactory = idl({ IDL: PatchedIDL });

  const decoder = idlFactory._fields.reduce((acc, next) => {
    const func = next[1] as IDL.FuncClass;

    return {
      ...acc,
      [next[0]]: (bytes: ArrayBuffer) => IDL.decode(func[key], bytes),
    };
    // @ts-expect-error
  }, {} as { [key in keyof _SERVICE]: (bytes: ArrayBuffer) => [Unpromise<ReturnType<_SERVICE[key]>>] });
  return decoder;
};
