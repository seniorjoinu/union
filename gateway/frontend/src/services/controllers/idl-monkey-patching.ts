import * as candid from '@dfinity/candid';

// @ts-expect-error
window.candid = candid;

// NOTE
// стандартная реализация valueToString просто конвертирует число в строку
// чтобы сделать универсальную сериализацию, необходимо
// каждой числовой переменной приписывать точный тип в конце
// Было (x) => x.toString(); valueToString(1) = '1'
// Стало (x) => `${x.toString()} : ${candid.IDL.Nat32.name}`; valueToString(1) = '1 : nat32'
// Делаем тупой манки-патчинг функций, в идеале - нужно дотащить этот фикс до репы @dfinity/candid

candid.IDL.Float32.valueToString = (x) => `${x.toString()} : ${candid.IDL.Float32.name}`;
candid.IDL.Float64.valueToString = (x) => `${x.toString()} : ${candid.IDL.Float64.name}`;
candid.IDL.Int8.valueToString = (x) => `${x.toString()} : ${candid.IDL.Int8.name}`;
candid.IDL.Int16.valueToString = (x) => `${x.toString()} : ${candid.IDL.Int16.name}`;
candid.IDL.Int32.valueToString = (x) => `${x.toString()} : ${candid.IDL.Int32.name}`;
candid.IDL.Int64.valueToString = (x) => `${x.toString()} : ${candid.IDL.Int64.name}`;
candid.IDL.Nat8.valueToString = (x) => `${x.toString()} : ${candid.IDL.Nat8.name}`;
candid.IDL.Nat16.valueToString = (x) => `${x.toString()} : ${candid.IDL.Nat16.name}`;
candid.IDL.Nat32.valueToString = (x) => `${x.toString()} : ${candid.IDL.Nat32.name}`;
candid.IDL.Nat64.valueToString = (x) => `${x.toString()} : ${candid.IDL.Nat64.name}`;
