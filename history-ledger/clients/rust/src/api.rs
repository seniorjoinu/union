use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::{Program, ProgramExecutionResult};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::GroupId;

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

// ------------------ PROGRAM EXECUTION ------------------

#[derive(CandidType, Deserialize)]
pub struct ListProgramExecutionEntryIdsRequest {
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListProgramExecutionEntryIdsResponse {
    pub page: Page<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct GetProgramExecutionEntryProgramRequest {
    pub id: u64,
}

#[derive(CandidType, Deserialize)]
pub struct GetProgramExecutionEntryProgramResponse {
    pub program: Program,
}

#[derive(CandidType, Deserialize)]
pub struct GetProgramExecutionEntryResultRequest {
    pub id: u64,
}

#[derive(CandidType, Deserialize)]
pub struct GetProgramExecutionEntryResultResponse {
    pub result: Option<ProgramExecutionResult>,
}
