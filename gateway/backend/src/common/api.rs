use ic_cdk::export::candid::{CandidType, Deserialize, Nat, Principal};

pub type BillId = Nat;

#[derive(Debug)]
pub enum GatewayError {
    BillNotFound,
    BillAlreadyPaid,
}

#[derive(CandidType, Deserialize)]
pub enum BillType {
    SpawnUnionWallet(SpawnUnionWalletRequest),
}

#[derive(CandidType, Deserialize)]
pub enum BillStatus {
    Created,
    Paid,
}

#[derive(CandidType, Deserialize)]
pub struct Bill {
    pub id: BillId,
    pub bill_type: BillType,
    pub status: BillStatus,
    pub to: Principal,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct TransferControlRequest {
    pub new_controller: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct AttachToUnionWalletRequest {
    pub union_wallet_id: Principal,
}

pub type DetachFromUnionWalletRequest = AttachToUnionWalletRequest;

#[derive(CandidType, Deserialize)]
pub struct GetAttachedUnionWalletsResponse {
    pub wallet_ids: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct SpawnUnionWalletRequest {
    pub version: String,
    pub wallet_creator: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct SpawnUnionWalletResponse {
    pub bill_id: BillId,
}

// TODO: this proof should be issued to the right principal that should match the caller
#[derive(CandidType, Deserialize)]
pub struct BillPaymentProof {
    pub bill_id: BillId,
}

#[derive(CandidType, Deserialize)]
pub struct ProveBillPaidRequest {
    pub proof: BillPaymentProof,
}

#[derive(CandidType, Deserialize)]
pub struct ProveBillPaidResponse {
    pub canister_id: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct UpgradeUnionWalletRequest {
    pub new_version: String,
}

#[derive(CandidType, Deserialize)]
pub struct UpgradeWalletVersionRequest {
    pub canister_id: Principal,
    pub new_version: String,
}

#[derive(CandidType, Deserialize)]
pub struct ControllerSpawnWalletRequest {
    pub version: String,
    pub wallet_creator: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct ControllerSpawnWalletResponse {
    pub canister_id: Principal,
}