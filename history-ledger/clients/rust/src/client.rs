use crate::api::{
    GetProgramExecutionEntryMetaRequest, GetProgramExecutionEntryMetaResponse,
    GetProgramExecutionEntryProgramRequest, GetProgramExecutionEntryProgramResponse,
    GetProgramExecutionEntryResultRequest, GetProgramExecutionEntryResultResponse,
    GetSharesInfoOfAtRequest, GetSharesInfoOfAtResponse, ListProgramExecutionEntryIdsRequest,
    ListProgramExecutionEntryIdsResponse,
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

    // ------------- PROGRAM EXECUTION --------------
    async fn list_program_execution_entry_ids(
        &self,
        req: ListProgramExecutionEntryIdsRequest,
    ) -> CandidCallResult<ListProgramExecutionEntryIdsResponse>;
    async fn get_program_execution_entry_meta(
        &self,
        req: GetProgramExecutionEntryMetaRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryMetaResponse>;
    async fn get_program_execution_entry_program(
        &self,
        req: GetProgramExecutionEntryProgramRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryProgramResponse>;
    async fn get_program_execution_entry_result(
        &self,
        req: GetProgramExecutionEntryResultRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryResultResponse>;
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

    // ------------ PROGRAM EXECUTION ----------------

    async fn list_program_execution_entry_ids(
        &self,
        req: ListProgramExecutionEntryIdsRequest,
    ) -> CandidCallResult<ListProgramExecutionEntryIdsResponse> {
        RemoteCallPayload::new_encode(*self, "list_program_execution_entry_ids", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    async fn get_program_execution_entry_meta(
        &self,
        req: GetProgramExecutionEntryMetaRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryMetaResponse> {
        RemoteCallPayload::new_encode(*self, "get_program_execution_entry_meta", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    async fn get_program_execution_entry_program(
        &self,
        req: GetProgramExecutionEntryProgramRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryProgramResponse> {
        RemoteCallPayload::new_encode(*self, "get_program_execution_entry_program", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }

    async fn get_program_execution_entry_result(
        &self,
        req: GetProgramExecutionEntryResultRequest,
    ) -> CandidCallResult<GetProgramExecutionEntryResultResponse> {
        RemoteCallPayload::new_encode(*self, "get_program_execution_entry_result", (req,), 0)
            .do_call()
            .await
            .map(|(it,)| it)
    }
}
