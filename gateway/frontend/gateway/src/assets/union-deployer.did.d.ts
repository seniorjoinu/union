import type { Principal } from '@dfinity/principal';
export interface BinaryInstance {
  'binary_version' : string,
  'canister_id' : Principal,
  'created_at' : bigint,
  'upgraded_at' : bigint,
}
export interface BinaryVersionInfo {
  'status' : BinaryVersionStatus,
  'updated_at' : bigint,
  'description' : string,
  'created_at' : bigint,
  'version' : string,
  'binary' : [] | [Array<number>],
}
export type BinaryVersionStatus = { 'Released' : null } |
  { 'Created' : null } |
  { 'Deleted' : null };
export interface CreateBinaryVersionRequest {
  'description' : string,
  'version' : string,
}
export interface DeleteBinaryVersionRequest { 'version' : string }
export interface DownloadBinaryRequest { 'version' : string }
export interface DownloadBinaryResponse { 'binary' : [] | [Array<number>] }
export interface GetBinaryVersionInfosRequest { 'versions' : Array<string> }
export interface GetBinaryVersionInfosResponse {
  'infos' : Array<BinaryVersionInfo>,
}
export interface GetBinaryVersionsResponse { 'versions' : Array<string> }
export interface GetControllerResponse { 'controller' : Principal }
export interface GetInstanceIdsResponse { 'ids' : Array<Principal> }
export interface GetInstancesRequest { 'ids' : Array<Principal> }
export interface GetInstancesResponse { 'instances' : Array<BinaryInstance> }
export interface GetLatestVersionResponse { 'version' : string }
export interface ReleaseBinaryVersionRequest { 'version' : string }
export interface SpawnWalletRequest {
  'version' : string,
  'gateway' : Principal,
  'wallet_creator' : Principal,
}
export interface SpawnWalletResponse { 'canister_id' : Principal }
export interface TransferControlRequest { 'new_controller' : Principal }
export interface UpdateBinaryVersionDescriptionRequest {
  'new_description' : string,
  'version' : string,
}
export interface UpgradeWalletVersionRequest {
  'new_version' : string,
  'canister_id' : Principal,
}
export interface UploadBinaryRequest {
  'version' : string,
  'binary' : Array<number>,
}
export interface _SERVICE {
  'create_binary_version' : (arg_0: CreateBinaryVersionRequest) => Promise<
      undefined
    >,
  'delete_binary_version' : (arg_0: DeleteBinaryVersionRequest) => Promise<
      undefined
    >,
  'download_binary' : (arg_0: DownloadBinaryRequest) => Promise<
      DownloadBinaryResponse
    >,
  'export_candid' : () => Promise<string>,
  'get_binary_controller' : () => Promise<GetControllerResponse>,
  'get_binary_version_infos' : (arg_0: GetBinaryVersionInfosRequest) => Promise<
      GetBinaryVersionInfosResponse
    >,
  'get_binary_versions' : () => Promise<GetBinaryVersionsResponse>,
  'get_instance_ids' : () => Promise<GetInstanceIdsResponse>,
  'get_instances' : (arg_0: GetInstancesRequest) => Promise<
      GetInstancesResponse
    >,
  'get_latest_version' : () => Promise<GetLatestVersionResponse>,
  'get_spawn_controller' : () => Promise<GetControllerResponse>,
  'release_binary_version' : (arg_0: ReleaseBinaryVersionRequest) => Promise<
      undefined
    >,
  'spawn_wallet' : (arg_0: SpawnWalletRequest) => Promise<SpawnWalletResponse>,
  'transfer_binary_control' : (arg_0: TransferControlRequest) => Promise<
      undefined
    >,
  'transfer_spawn_control' : (arg_0: TransferControlRequest) => Promise<
      undefined
    >,
  'update_binary_version_description' : (
      arg_0: UpdateBinaryVersionDescriptionRequest,
    ) => Promise<undefined>,
  'upgrade_wallet_version' : (arg_0: UpgradeWalletVersionRequest) => Promise<
      undefined
    >,
  'upload_binary' : (arg_0: UploadBinaryRequest) => Promise<undefined>,
}
