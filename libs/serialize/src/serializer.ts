import { IDL } from '@dfinity/candid';
import { PatchedIDL } from './idl-monkey-patching';

type DefaultService = {};

export const buildSerializer = <_SERVICE extends DefaultService>(idl: IDL.InterfaceFactory) => {
  const idlFactory = idl({ IDL: PatchedIDL });

  const serializer = idlFactory._fields.reduce((acc, next) => {
    const func = next[1] as IDL.FuncClass;

    return {
      ...acc,
      [next[0]]: (...args: any[]) =>
        func.argTypes.map((argType, index) => argType.valueToString(args[index])),
    };
    // @ts-expect-error
  }, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });
  return serializer;
};
