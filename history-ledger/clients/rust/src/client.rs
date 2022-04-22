use crate::api::{
    GetSharesInfoOfAtRequest, GetSharesInfoOfAtResponse, GetVotingExecutionRecordResultsRequest,
    GetVotingExecutionRecordResultsResponse, GetVotingExecutionRecordWinnersRequest,
    GetVotingExecutionRecordWinnersResponse, GetVotingExecutionRecordsRequest,
    GetVotingExecutionRecordsResponse,
};
use async_trait::async_trait;
use candid::Principal;
use shared::candid::CandidCallResult;
use shared::remote_call::RemoteCallPayload;

#[async_trait]
pub trait IHistoryLedger {
    // -------------- SHARES MOVE -----------------
    async fn get_shares_info_of_at(
        &self,
        req: GetSharesInfoOfAtRequest,
    ) -> CandidCallResult<GetSharesInfoOfAtResponse>;

    // ------------- VOTING EXECUTION --------------
    async fn get_voting_execution_records(
        &self,
        req: GetVotingExecutionRecordsRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordsResponse>;
    async fn get_voting_execution_record_winners(
        &self,
        req: GetVotingExecutionRecordWinnersRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordWinnersResponse>;
    async fn get_voting_execution_record_results(
        &self,
        req: GetVotingExecutionRecordResultsRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordResultsResponse>;
}

#[async_trait]
impl IHistoryLedger for Principal {
    // ----------------- SHARES MOVE ------------------

    async fn get_shares_info_of_at(
        &self,
        req: GetSharesInfoOfAtRequest,
    ) -> CandidCallResult<GetSharesInfoOfAtResponse> {
        RemoteCallPayload::new_encode(*self, "get_shares_info_of_at", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    // ------------ VOTING EXECUTION ----------------

    async fn get_voting_execution_records(
        &self,
        req: GetVotingExecutionRecordsRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordsResponse> {
        RemoteCallPayload::new_encode(*self, "get_voting_execution_records", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    async fn get_voting_execution_record_winners(
        &self,
        req: GetVotingExecutionRecordWinnersRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordWinnersResponse> {
        RemoteCallPayload::new_encode(*self, "get_voting_execution_record_winners", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    async fn get_voting_execution_record_results(
        &self,
        req: GetVotingExecutionRecordResultsRequest,
    ) -> CandidCallResult<GetVotingExecutionRecordResultsResponse> {
        RemoteCallPayload::new_encode(*self, "get_voting_execution_record_results", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }
}
