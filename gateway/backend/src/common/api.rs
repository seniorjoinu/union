use ic_cdk::export::candid::{CandidType, Deserialize, Principal};

pub type InvoiceId = u64;

#[derive(Debug)]
pub enum GatewayError {
    InvoiceNotFound,
    InvoiceAlreadyPaid,
}

#[derive(CandidType, Deserialize)]
pub enum InvoiceType {
    SpawnUnionWallet(SpawnUnionWalletRequest),
}

#[derive(CandidType, Deserialize)]
pub enum InvoiceStatus {
    Created,
    Paid,
}

#[derive(CandidType, Deserialize)]
pub struct Invoice {
    pub id: InvoiceId,
    pub invoice_type: InvoiceType,
    pub status: InvoiceStatus,
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
    pub invoice_id: InvoiceId,
}
