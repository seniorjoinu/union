export const idlFactory = ({ IDL }) => {
  const AttachToUnionWalletRequest = IDL.Record({
    'union_wallet_id' : IDL.Principal,
  });
  const DetachFromUnionWalletRequest = AttachToUnionWalletRequest;
  const GetAttachedUnionWalletsResponse = IDL.Record({
    'wallet_ids' : IDL.Vec(IDL.Principal),
  });
  const BillId = IDL.Nat;
  const BillPaymentProof = IDL.Record({ 'bill_id' : BillId });
  const ProveBillPaidRequest = IDL.Record({ 'proof' : BillPaymentProof });
  const ProveBillPaidResponse = IDL.Record({ 'canister_id' : IDL.Principal });
  const SpawnUnionWalletRequest = IDL.Record({
    'version' : IDL.Text,
    'wallet_creator' : IDL.Principal,
  });
  const SpawnUnionWalletResponse = IDL.Record({ 'bill_id' : BillId });
  const TransferControlRequest = IDL.Record({
    'new_controller' : IDL.Principal,
  });
  const UpgradeUnionWalletRequest = IDL.Record({ 'new_version' : IDL.Text });
  return IDL.Service({
    'attach_to_union_wallet' : IDL.Func([AttachToUnionWalletRequest], [], []),
    'detach_from_union_wallet' : IDL.Func(
        [DetachFromUnionWalletRequest],
        [],
        [],
      ),
    'export_candid' : IDL.Func([], [IDL.Text], ['query']),
    'get_attached_union_wallets' : IDL.Func(
        [],
        [GetAttachedUnionWalletsResponse],
        ['query'],
      ),
    'prove_bill_paid' : IDL.Func(
        [ProveBillPaidRequest],
        [ProveBillPaidResponse],
        [],
      ),
    'spawn_union_wallet' : IDL.Func(
        [SpawnUnionWalletRequest],
        [SpawnUnionWalletResponse],
        [],
      ),
    'transfer_control' : IDL.Func([TransferControlRequest], [], []),
    'upgrade_union_wallet' : IDL.Func([UpgradeUnionWalletRequest], [], []),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal, IDL.Principal]; };
