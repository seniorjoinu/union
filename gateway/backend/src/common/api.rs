use crate::common::types::{BillId, BillPaymentProof, RoleId};
use crate::ProfileCreatedNotification;
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use ic_event_hub_macros::Event;

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

#[derive(CandidType, Deserialize)]
pub struct GetMyNotificationsResponse {
    pub notifications: Vec<ProfileCreatedNotification>,
}

// ------------------- EVENTS --------------------

#[derive(Event)]
pub struct ProfileCreatedEvent {
    #[topic]
    pub profile_owner: Principal,
    pub profile_role_id: RoleId,
}

#[derive(Event)]
pub struct ProfileActivatedEvent {
    #[topic]
    pub profile_owner: Principal,
}
