use ic_cdk_macros::query;
use history_ledger_client::api::{GetProgramExecutionEntryProgramRequest, GetProgramExecutionEntryProgramResponse, GetProgramExecutionEntryResultRequest, GetProgramExecutionEntryResultResponse, ListProgramExecutionEntryIdsRequest, ListProgramExecutionEntryIdsResponse};
use shared::mvc::{HasRepository, Repository};
use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::service::program_execution::ProgramExecutionService;

#[query]
fn list_program_execution_entry_ids(
    req: ListProgramExecutionEntryIdsRequest,
) -> ListProgramExecutionEntryIdsResponse {
    let page = ProgramExecutionService::list_program_execution_entry_ids(&req.page_req);

    ListProgramExecutionEntryIdsResponse { page }
}

#[query]
fn get_program_execution_entry_program(
    req: GetProgramExecutionEntryProgramRequest,
) -> GetProgramExecutionEntryProgramResponse {
    let program = ProgramExecutionEntry::repo().get(&req.id).expect("Entry not found").program;

    GetProgramExecutionEntryProgramResponse { program }
}

#[query]
fn get_program_execution_entry_result(
    req: GetProgramExecutionEntryResultRequest,
) -> GetProgramExecutionEntryResultResponse {
    let result = ProgramExecutionEntry::repo().get(&req.id).expect("Entry not found").result;

    GetProgramExecutionEntryResultResponse { result }
}
