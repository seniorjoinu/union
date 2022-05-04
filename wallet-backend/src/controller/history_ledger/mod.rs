use crate::controller::history_ledger::api::{
    GetSharesInfoOfAtRequest, GetSharesInfoOfAtResponse, ListProgramExecutionEntryIdsRequest,
    ListProgramExecutionEntryIdsResponse,
};
use crate::guards::only_self_or_with_access;
use crate::service::history_ledger::HistoryLedgerService;
use ic_cdk_macros::update;

pub mod api;

#[update]
async fn get_shares_info_of_at(req: GetSharesInfoOfAtRequest) -> GetSharesInfoOfAtResponse {
    only_self_or_with_access("get_shares_info_of_at");

    let shares_info = HistoryLedgerService::get_shares_info_of_at(req.group_id, req.of, req.at)
        .await
        .expect("Unable to get shares info of at");

    GetSharesInfoOfAtResponse { shares_info }
}

#[update]
async fn list_program_execution_entry_ids(
    req: ListProgramExecutionEntryIdsRequest,
) -> ListProgramExecutionEntryIdsResponse {
    only_self_or_with_access("list_program_execution_entry_ids");

    let (page, history_ledger_canister_id) =
        HistoryLedgerService::list_program_execution_entry_ids(req.page_req)
            .await
            .expect("Unable to list program execution entry ids");

    ListProgramExecutionEntryIdsResponse {
        page,
        history_ledger_canister_id,
    }
}
