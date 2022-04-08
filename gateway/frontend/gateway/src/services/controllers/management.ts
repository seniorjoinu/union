import { IDL } from '@dfinity/candid';
import { _SERVICE } from 'management-ts';
// @ts-expect-error
import { idlFactory as idl } from 'management-idl';

const idlFactory = idl({ IDL }) as IDL.ServiceClass;

export const managementSerializer = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) =>
      func.argTypes.map((argType, index) => argType.valueToString(args[index])),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => string[] });

export const managementEncoder = idlFactory._fields.reduce((acc, next) => {
  const func = next[1] as IDL.FuncClass;

  return {
    ...acc,
    [next[0]]: (...args: any[]) => IDL.encode(func.argTypes, args),
  };
}, {} as { [key in keyof _SERVICE]: (...args: Parameters<_SERVICE[key]>) => ArrayBuffer });
