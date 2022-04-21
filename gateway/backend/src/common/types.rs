use ic_cdk::export::candid::{CandidType, Deserialize, Nat, Principal};
use union_deployer_client::api::SpawnWalletRequest;

pub type BillId = Nat;
pub type RoleId = u32;

#[derive(Debug)]
pub enum GatewayError {
    BillNotFound,
    BillAlreadyPaid,
}

#[derive(CandidType, Deserialize)]
pub enum BillType {
    SpawnUnionWallet(SpawnWalletRequest),
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
