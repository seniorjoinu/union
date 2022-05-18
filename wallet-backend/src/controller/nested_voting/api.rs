use crate::repository::nested_voting::model::NestedVoting;
use crate::repository::nested_voting::types::{NestedVotingFilter, NestedVotingId, RemoteVotingId};
use crate::repository::nested_voting_config::types::NestedVotingConfigId;
use crate::service::access_config::types::QueryDelegationProof;
use crate::service::voting::types::MultiChoiceVote;
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::{ChoiceId, GroupId, Shares};
use std::collections::BTreeMap;

#[derive(CandidType, Deserialize)]
pub struct CreateNestedVotingRequest {
    pub remote_voting_id: RemoteVotingId,
    pub remote_group_id: GroupId,
    pub local_nested_voting_config_id: NestedVotingConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct CreateNestedVotingResponse {
    pub id: NestedVotingId,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteNestedVotingRequest {
    pub id: NestedVotingId,
}

#[derive(CandidType, Deserialize)]
pub struct GetNestedVotingRequest {
    pub id: NestedVotingId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetNestedVotingResponse {
    pub nested_voting: NestedVoting,
}

#[derive(CandidType, Deserialize)]
pub struct ListNestedVotingsRequest {
    pub page_req: PageRequest<NestedVotingFilter, ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListNestedVotingsResponse {
    pub page: Page<NestedVoting>,
}

// ---------- PERSONAL -----------

#[derive(CandidType, Deserialize)]
pub struct CastMyNestedVoteRequest {
    pub id: NestedVotingId,
    pub vote: MultiChoiceVote,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyNestedVoteRequest {
    pub id: NestedVotingId,
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyNestedVoteResponse {
    pub my_vote: BTreeMap<ChoiceId, Shares>,
}
