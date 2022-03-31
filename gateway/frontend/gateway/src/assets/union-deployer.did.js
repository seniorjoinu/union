export const idlFactory = ({ IDL }) => {
  const SpawnRequest = IDL.Record({ 'wasm_module' : IDL.Vec(IDL.Nat8) });
  const UpdateCodeRequest = IDL.Record({ 'wasm_module' : IDL.Vec(IDL.Nat8) });
  return IDL.Service({
    'export_candid' : IDL.Func([], [IDL.Text], ['query']),
    'get_spawned_instances' : IDL.Func([], [IDL.Vec(IDL.Principal)], ['query']),
    'spawn' : IDL.Func([SpawnRequest], [IDL.Principal], []),
    'update_code' : IDL.Func([UpdateCodeRequest], [IDL.Principal], []),
  });
};
export const init = ({ IDL }) => { return []; };
