use ic_cdk::export::candid::{CandidType, Deserialize, Nat, Principal};

pub type BillId = Nat;
pub type RoleId = u32;

#[derive(Debug)]
pub enum GatewayError {
    BillNotFound,
    BillAlreadyPaid,
}

#[derive(CandidType, Deserialize)]
pub enum BillType {
    SpawnUnionWallet(DeployerSpawnWalletRequest),
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

// TODO: this proof should be issued to the right principal that should match the caller
#[derive(CandidType, Deserialize)]
pub struct BillPaymentProof {
    pub bill_id: BillId,
}

#[derive(CandidType, Deserialize)]
pub struct DeployerSpawnWalletRequest {
    pub version: String,
    pub wallet_creator: Principal,
    pub gateway: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct DeployerSpawnWalletResponse {
    pub canister_id: Principal,
}
