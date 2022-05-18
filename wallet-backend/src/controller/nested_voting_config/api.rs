use std::collections::BTreeMap;
use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::GroupId;
use crate::repository::nested_voting_config::model::NestedVotingConfig;
use crate::repository::nested_voting_config::types::{NestedVoteCalculation, NestedVotingConfigFilter, NestedVotingConfigId, RemoteVotingConfigId};
use crate::repository::voting_config::types::Fraction;

#[derive(CandidType, Deserialize)]
pub struct CreateNestedVotingConfigRequest {
    pub name: String,
    pub description: String,
    pub remote_union_id: Principal,
    pub remote_voting_config_id: RemoteVotingConfigId,
    pub vote_calculation: NestedVoteCalculation,
    pub allowee_groups: BTreeMap<GroupId, Fraction>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateNestedVotingConfigResponse {
    pub id: NestedVotingConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateNestedVotingConfigRequest {
    pub id: NestedVotingConfigId,
    pub name_opt: Option<String>,
    pub description_opt: Option<String>,
    pub vote_calculation_opt: Option<NestedVoteCalculation>,
    pub allowee_groups_opt: Option<BTreeMap<GroupId, Fraction>>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteNestedVotingConfigRequest {
    pub id: NestedVotingConfigId
}

#[derive(CandidType, Deserialize)]
pub struct GetNestedVotingConfigRequest {
    pub id: NestedVotingConfigId
}

#[derive(CandidType, Deserialize)]
pub struct GetNestedVotingConfigResponse {
    pub nested_voting_config: NestedVotingConfig,
}

#[derive(CandidType, Deserialize)]
pub struct ListNestedVotingConfigsRequest {
    pub page_req: PageRequest<NestedVotingConfigFilter, ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListNestedVotingConfigsResponse {
    pub page: Page<NestedVotingConfig>,
}