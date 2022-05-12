import type { Principal } from '@dfinity/principal';
export interface AttachToUnionWalletRequest { 'union_wallet_id' : Principal }
export type BillId = bigint;
export interface BillPaymentProof { 'bill_id' : BillId }
export interface ControllerSpawnWalletRequest {
  'version' : string,
  'wallet_creator' : Principal,
}
export interface ControllerSpawnWalletResponse { 'canister_id' : Principal }
export type DetachFromUnionWalletRequest = AttachToUnionWalletRequest;
export interface GetAttachedUnionWalletsResponse {
  'wallet_ids' : Array<Principal>,
}
export interface GetMyNotificationsResponse {
  'notifications' : Array<ProfileCreatedNotification>,
}
export type NotificationId = bigint;
export interface ProfileCreatedNotification {
  'id' : NotificationId,
  'union_wallet_id' : Principal,
  'receiver' : Principal,
}
export interface ProveBillPaidRequest { 'proof' : BillPaymentProof }
export interface ProveBillPaidResponse { 'canister_id' : Principal }
export type RoleId = number;
export interface SpawnUnionWalletRequest {
  'version' : string,
  'wallet_creator' : Principal,
}
export interface SpawnUnionWalletResponse { 'bill_id' : BillId }
export interface TransferControlRequest { 'new_controller' : Principal }
export interface UpgradeUnionWalletRequest { 'new_version' : string }
export interface _SERVICE {
  'attach_to_union_wallet' : (arg_0: AttachToUnionWalletRequest) => Promise<
      undefined
    >,
  'controller_spawn_wallet' : (arg_0: ControllerSpawnWalletRequest) => Promise<
      ControllerSpawnWalletResponse
    >,
  'detach_from_union_wallet' : (arg_0: DetachFromUnionWalletRequest) => Promise<
      undefined
    >,
  'export_candid' : () => Promise<string>,
  'get_attached_union_wallets' : () => Promise<GetAttachedUnionWalletsResponse>,
  'get_controller' : () => Promise<Principal>,
  'get_my_notifications' : () => Promise<GetMyNotificationsResponse>,
  'prove_bill_paid' : (arg_0: ProveBillPaidRequest) => Promise<
      ProveBillPaidResponse
    >,
  'spawn_union_wallet' : (arg_0: SpawnUnionWalletRequest) => Promise<
      SpawnUnionWalletResponse
    >,
  'transfer_control' : (arg_0: TransferControlRequest) => Promise<undefined>,
  'upgrade_union_wallet' : (arg_0: UpgradeUnionWalletRequest) => Promise<
      undefined
    >,
}
