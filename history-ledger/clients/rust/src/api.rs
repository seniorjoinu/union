use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::{ProgramExecutionResult, RemoteCallEndpoint};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{ChoiceExternal, ChoiceId, GroupId, VotingConfigId, VotingId};

// ------------------ SHARES MOVE -------------------

#[derive(CandidType, Deserialize)]
pub struct GetSharesInfoOfAtRequest {
    pub group_id: GroupId,
    pub of: Principal,
    pub at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct GetSharesInfoOfAtResponse {
    pub info_opt: Option<SharesInfo>,
}

// ------------------ VOTING EXECUTION ------------------

#[derive(CandidType, Deserialize)]
pub struct TimeInterval {
    pub from: u64,
    pub to: u64,
}

#[derive(CandidType, Deserialize)]
pub struct VotingExecutionRecordFilter {
    pub voting_config_id: Option<VotingConfigId>,
    pub canister_id: Option<Principal>,
    pub endpoint: Option<RemoteCallEndpoint>,
    pub time_interval: Option<TimeInterval>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordsRequest {
    pub page_req: PageRequest<VotingExecutionRecordFilter, ()>,
}

#[derive(CandidType, Deserialize)]
pub struct VotingExecutionRecordExternal {
    pub voting_id: VotingId,
    pub voting_config_id: VotingConfigId,
    pub name: String,
    pub description: String,
    pub timestamp: u64,
    pub winners_count: usize,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordsResponse {
    pub page: Page<VotingExecutionRecordExternal>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordWinnersRequest {
    pub voting_id: VotingId,
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordWinnersResponse {
    pub page: Page<(ChoiceId, ChoiceExternal)>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordResultsRequest {
    pub voting_id: VotingId,
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct GetVotingExecutionRecordResultsResponse {
    pub page: Page<(ChoiceId, ProgramExecutionResult)>,
}
