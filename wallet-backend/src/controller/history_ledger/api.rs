use candid::{CandidType, Deserialize, Principal};
use history_ledger_client::api::ProgramExecutionFilter;
use shared::pageable::{Page, PageRequest};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::GroupId;

#[derive(CandidType, Deserialize)]
pub struct GetSharesInfoOfAtRequest {
    pub group_id: GroupId,
    pub of: Principal,
    pub at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct GetSharesInfoOfAtResponse {
    pub shares_info: Option<SharesInfo>,
}

#[derive(CandidType, Deserialize)]
pub struct GetMySharesInfoAtRequest {
    pub group_id: GroupId,
    pub at: u64,
}

#[derive(CandidType, Deserialize)]
pub struct ListProgramExecutionEntryIdsRequest {
    pub page_req: PageRequest<ProgramExecutionFilter, ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListProgramExecutionEntryIdsResponse {
    pub history_ledger_canister_id: Principal,
    pub page: Page<u64>,
}
