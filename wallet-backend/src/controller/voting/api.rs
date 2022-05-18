use crate::repository::choice::model::Choice;
use crate::repository::choice::types::ChoiceFilter;
use crate::repository::voting::model::Voting;
use crate::service::access_config::types::QueryDelegationProof;
use crate::service::voting::types::Vote;
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, GroupId, Shares, VotingConfigId, VotingId};
use std::collections::BTreeMap;

#[derive(CandidType, Deserialize)]
pub struct CreateVotingRequest {
    pub voting_config_id: VotingConfigId,
    pub name: String,
    pub description: String,
    pub winners_need: u32,
}

#[derive(CandidType, Deserialize)]
pub struct CreateVotingResponse {
    pub id: VotingId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateVotingRequest {
    pub id: VotingId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
    pub new_winners_need: Option<u32>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteVotingRequest {
    pub id: VotingId,
}

#[derive(CandidType, Deserialize)]
pub struct CastMyVoteRequest {
    pub id: VotingId,
    pub vote: Vote,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingRequest {
    pub id: VotingId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingResponse {
    pub voting: Voting,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingsRequest {
    pub page_req: PageRequest<(), ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingsResponse {
    pub page: Page<Voting>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateVotingChoiceRequest {
    pub name: String,
    pub description: String,
    pub program: Program,
    pub voting_id: VotingId,
}

#[derive(CandidType, Deserialize)]
pub struct CreateVotingChoiceResponse {
    pub choice_id: ChoiceId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateVotingChoiceRequest {
    pub choice_id: ChoiceId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
    pub new_program: Option<Program>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteVotingChoiceRequest {
    pub choice_id: ChoiceId,
    pub voting_id: VotingId,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingChoiceRequest {
    pub choice_id: ChoiceId,
    pub voting_id: VotingId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingChoiceResponse {
    pub choice: Choice,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingChoicesRequest {
    pub page_req: PageRequest<ChoiceFilter, ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListVotingChoicesResponse {
    pub page: Page<Choice>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingResultsRequest {
    pub voting_id: VotingId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingResultsResponse {
    pub results: BTreeMap<ChoiceId, BTreeMap<GroupId, Shares>>,
}

// ------------------- PERSONAL ------------------

#[derive(CandidType, Deserialize)]
pub struct GetMyVoteRequest {
    pub voting_id: VotingId,
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyVoteResponse {
    pub vote: BTreeMap<ChoiceId, Shares>,
}
