use crate::service::access_config::types::QueryDelegationProof;
use crate::settings::Settings;
use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize)]
pub struct UpdateSettingsRequest {
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetSettingsRequest {
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetSettingsResponse {
    pub settings: Settings,
}
