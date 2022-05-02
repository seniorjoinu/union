import { IDL } from '@dfinity/candid';
import { PatchedIDL } from './idl-monkey-patching';

interface DefaultService {}

export const buildEncoder = <_SERVICE extends DefaultService>(idl: IDL.InterfaceFactory) => {
  const idlFactory = idl({ IDL: PatchedIDL });

  const encoder = idlFactory._fields.reduce((acc, next) => {
    const func = next[1] as IDL.FuncClass;

    return {
      ...acc,
      [next[0]]: (...args: any[]) => IDL.encode(func.argTypes, args),
    };
    // @ts-expect-error
  }, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => ArrayBuffer });
  return encoder;
};
