export const idlFactory = ({ IDL }) => {
  const CreateBinaryVersionRequest = IDL.Record({
    'description' : IDL.Text,
    'version' : IDL.Text,
  });
  const DeleteBinaryVersionRequest = IDL.Record({ 'version' : IDL.Text });
  const DownloadBinaryRequest = IDL.Record({ 'version' : IDL.Text });
  const DownloadBinaryResponse = IDL.Record({
    'binary' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const GetBinaryVersionInfosRequest = IDL.Record({
    'versions' : IDL.Vec(IDL.Text),
  });
  const BinaryVersionStatus = IDL.Variant({
    'Released' : IDL.Null,
    'Created' : IDL.Null,
    'Deleted' : IDL.Null,
  });
  const BinaryVersionInfo = IDL.Record({
    'status' : BinaryVersionStatus,
    'updated_at' : IDL.Nat64,
    'description' : IDL.Text,
    'created_at' : IDL.Nat64,
    'version' : IDL.Text,
    'binary' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const GetBinaryVersionInfosResponse = IDL.Record({
    'infos' : IDL.Vec(BinaryVersionInfo),
  });
  const GetBinaryVersionsResponse = IDL.Record({
    'versions' : IDL.Vec(IDL.Text),
  });
  const GetInstanceIdsResponse = IDL.Record({ 'ids' : IDL.Vec(IDL.Principal) });
  const GetInstancesRequest = IDL.Record({ 'ids' : IDL.Vec(IDL.Principal) });
  const BinaryInstance = IDL.Record({
    'binary_version' : IDL.Text,
    'canister_id' : IDL.Principal,
    'created_at' : IDL.Nat64,
    'upgraded_at' : IDL.Nat64,
  });
  const GetInstancesResponse = IDL.Record({
    'instances' : IDL.Vec(BinaryInstance),
  });
  const GetLatestVersionResponse = IDL.Record({ 'version' : IDL.Text });
  const ReleaseBinaryVersionRequest = IDL.Record({ 'version' : IDL.Text });
  const SpawnWalletRequest = IDL.Record({
    'version' : IDL.Text,
    'gateway' : IDL.Principal,
    'wallet_creator' : IDL.Principal,
  });
  const SpawnWalletResponse = IDL.Record({ 'canister_id' : IDL.Principal });
  const TransferControlRequest = IDL.Record({
    'new_controller' : IDL.Principal,
  });
  const UpdateBinaryVersionDescriptionRequest = IDL.Record({
    'new_description' : IDL.Text,
    'version' : IDL.Text,
  });
  const UpgradeWalletVersionRequest = IDL.Record({
    'new_version' : IDL.Text,
    'canister_id' : IDL.Principal,
  });
  const UploadBinaryRequest = IDL.Record({
    'version' : IDL.Text,
    'binary' : IDL.Vec(IDL.Nat8),
  });
  return IDL.Service({
    'create_binary_version' : IDL.Func([CreateBinaryVersionRequest], [], []),
    'delete_binary_version' : IDL.Func([DeleteBinaryVersionRequest], [], []),
    'download_binary' : IDL.Func(
        [DownloadBinaryRequest],
        [DownloadBinaryResponse],
        ['query'],
      ),
    'export_candid' : IDL.Func([], [IDL.Text], ['query']),
    'get_binary_controller' : IDL.Func([], [IDL.Principal], ['query']),
    'get_binary_version_infos' : IDL.Func(
        [GetBinaryVersionInfosRequest],
        [GetBinaryVersionInfosResponse],
        ['query'],
      ),
    'get_binary_versions' : IDL.Func(
        [],
        [GetBinaryVersionsResponse],
        ['query'],
      ),
    'get_instance_ids' : IDL.Func([], [GetInstanceIdsResponse], ['query']),
    'get_instances' : IDL.Func(
        [GetInstancesRequest],
        [GetInstancesResponse],
        ['query'],
      ),
    'get_latest_version' : IDL.Func([], [GetLatestVersionResponse], ['query']),
    'get_spawn_controller' : IDL.Func([], [IDL.Principal], ['query']),
    'release_binary_version' : IDL.Func([ReleaseBinaryVersionRequest], [], []),
    'spawn_wallet' : IDL.Func([SpawnWalletRequest], [SpawnWalletResponse], []),
    'transfer_binary_control' : IDL.Func([TransferControlRequest], [], []),
    'transfer_spawn_control' : IDL.Func([TransferControlRequest], [], []),
    'update_binary_version_description' : IDL.Func(
        [UpdateBinaryVersionDescriptionRequest],
        [],
        [],
      ),
    'upgrade_wallet_version' : IDL.Func([UpgradeWalletVersionRequest], [], []),
    'upload_binary' : IDL.Func([UploadBinaryRequest], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
