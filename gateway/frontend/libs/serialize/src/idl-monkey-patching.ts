import * as candid from '@dfinity/candid';

// NOTE
// standart implementation of "valueToString" just converts value to string
// to make universal serialization
// need to add number variable type to end
// Was (x) => x.toString(); valueToString(1) = '1'
// Now (x) => `${x.toString()} : ${candid.IDL.Nat32.name}`; valueToString(1) = '1 : nat32'
// This is dumb monkey pathing
// Need to create fix PR to @dfinity/candid
const patch = <S, T extends { name: string; valueToString(x: S): string }>(instance: T) => {
  instance.valueToString = (x: any) => `${x.toString()} : ${instance.name}`;

  return instance;
};
const patchFloat = <S, T extends { name: string; valueToString(x: S): string }>(instance: T) => {
  instance.valueToString = (x: any) =>
    `${x.toString().includes('.') ? x.toString() : `${x.toString()}.0`} : ${instance.name}`;

  return instance;
};

export const PatchedIDL: typeof candid.IDL = {
  ...candid.IDL,
  Float32: patchFloat(new candid.IDL.FloatClass(32)),
  Float64: patchFloat(new candid.IDL.FloatClass(64)),
  Int: patch(new candid.IDL.IntClass()),
  Int8: patch(new candid.IDL.FixedIntClass(8)),
  Int16: patch(new candid.IDL.FixedIntClass(16)),
  Int32: patch(new candid.IDL.FixedIntClass(32)),
  Int64: patch(new candid.IDL.FixedIntClass(64)),
  Nat: patch(new candid.IDL.NatClass()),
  Nat8: patch(new candid.IDL.FixedNatClass(8)),
  Nat16: patch(new candid.IDL.FixedNatClass(16)),
  Nat32: patch(new candid.IDL.FixedNatClass(32)),
  Nat64: patch(new candid.IDL.FixedNatClass(64)),
};
