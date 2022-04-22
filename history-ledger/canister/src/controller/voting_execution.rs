use crate::service::voting_execution as VotingExecutionService;
use history_ledger_client::api::{
    GetVotingExecutionRecordResultsRequest, GetVotingExecutionRecordResultsResponse,
    GetVotingExecutionRecordWinnersRequest, GetVotingExecutionRecordWinnersResponse,
    GetVotingExecutionRecordsRequest, GetVotingExecutionRecordsResponse,
};
use ic_cdk_macros::query;

#[query]
fn get_voting_execution_records(
    req: GetVotingExecutionRecordsRequest,
) -> GetVotingExecutionRecordsResponse {
    let page = VotingExecutionService::get_records(req.page_req);

    GetVotingExecutionRecordsResponse { page }
}

#[query]
fn get_voting_execution_record_winners(
    req: GetVotingExecutionRecordWinnersRequest,
) -> GetVotingExecutionRecordWinnersResponse {
    let page = VotingExecutionService::get_winners_of_record(req.voting_id, req.page_req)
        .expect("Unable to get voting execution record winners");

    GetVotingExecutionRecordWinnersResponse { page }
}

#[query]
fn get_voting_execution_record_results(
    req: GetVotingExecutionRecordResultsRequest,
) -> GetVotingExecutionRecordResultsResponse {
    let page = VotingExecutionService::get_results_of_record(req.voting_id, req.page_req)
        .expect("Unable to get voting execution record results");

    GetVotingExecutionRecordResultsResponse { page }
}
