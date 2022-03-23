use ic_cdk::export::candid::{CandidType, Deserialize, Principal};

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
