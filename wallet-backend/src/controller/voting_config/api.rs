use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{
    EditorConstraint, LenInterval, ProposerConstraint, RoundSettings, ThresholdValue,
    VotingConfigFilter,
};
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::VotingConfigId;
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize)]
pub struct CreateVotingConfigRequest {
    pub name: String,
    pub description: String,
    pub choices_count: Option<LenInterval>,
    pub winners_count: Option<LenInterval>,
    pub permissions: BTreeSet<PermissionId>,
    pub proposers: BTreeSet<ProposerConstraint>,
    pub editors: BTreeSet<EditorConstraint>,
    pub round: RoundSettings,
    pub approval: ThresholdValue,
    pub quorum: ThresholdValue,
    pub rejection: ThresholdValue,
    pub win: ThresholdValue,
    pub next_round: ThresholdValue,
}

#[derive(CandidType, Deserialize)]
pub struct CreateVotingConfigResponse {
    pub id: VotingConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateVotingConfigRequest {
    pub id: VotingConfigId,
    pub name_opt: Option<String>,
    pub description_opt: Option<String>,
    pub choices_count_opt: Option<Option<LenInterval>>,
    pub winners_count_opt: Option<Option<LenInterval>>,
    pub permissions_opt: Option<BTreeSet<PermissionId>>,
    pub proposers_opt: Option<BTreeSet<ProposerConstraint>>,
    pub editors_opt: Option<BTreeSet<EditorConstraint>>,
    pub round_opt: Option<RoundSettings>,
    pub approval_opt: Option<ThresholdValue>,
    pub quorum_opt: Option<ThresholdValue>,
    pub rejection_opt: Option<ThresholdValue>,
    pub win_opt: Option<ThresholdValue>,
    pub next_round_opt: Option<ThresholdValue>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteVotingConfigRequest {
    pub id: VotingConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingConfigRequest {
    pub id: VotingConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingConfigResponse {
    pub voting_config: VotingConfig,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingConfigsRequest {
    pub page_req: PageRequest<VotingConfigFilter, ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingConfigsResponse {
    pub page: Page<VotingConfig>,
}
