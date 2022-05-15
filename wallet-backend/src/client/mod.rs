use crate::controller::group::api::GetGroupsResponse;
use crate::controller::history_ledger::api::{GetMySharesInfoAtRequest, GetSharesInfoOfAtResponse};
use crate::controller::voting::api::{
    CastMyVoteRequest, GetMyVoteRequest, GetMyVoteResponse, GetVotingChoiceRequest,
    GetVotingChoiceResponse, GetVotingRequest, GetVotingResponse, GetVotingResultsRequest,
    GetVotingResultsResponse,
};
use async_trait::async_trait;
use candid::Principal;
use shared::candid::CandidCallResult;
use shared::remote_call::RemoteCallPayload;

#[async_trait]
pub trait UnionWalletClient {
    async fn get_voting(&self, req: GetVotingRequest) -> CandidCallResult<(GetVotingResponse,)>;
    async fn get_voting_choice(
        &self,
        req: GetVotingChoiceRequest,
    ) -> CandidCallResult<(GetVotingChoiceResponse,)>;
    async fn get_voting_results(
        &self,
        req: GetVotingResultsRequest,
    ) -> CandidCallResult<(GetVotingResultsResponse,)>;

    async fn cast_my_vote(&self, req: CastMyVoteRequest) -> CandidCallResult<()>;
    async fn get_my_vote(&self, req: GetMyVoteRequest) -> CandidCallResult<(GetMyVoteResponse,)>;

    async fn get_my_shares_info_at(
        &self,
        req: GetMySharesInfoAtRequest,
    ) -> CandidCallResult<(GetSharesInfoOfAtResponse,)>;

    async fn get_my_groups(&self) -> CandidCallResult<(GetGroupsResponse,)>;
}

#[async_trait]
impl UnionWalletClient for Principal {
    async fn get_voting(&self, req: GetVotingRequest) -> CandidCallResult<(GetVotingResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_voting", (req,), 0)
            .do_call()
            .await
    }

    async fn get_voting_choice(
        &self,
        req: GetVotingChoiceRequest,
    ) -> CandidCallResult<(GetVotingChoiceResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_voting_choice", (req,), 0)
            .do_call()
            .await
    }

    async fn get_voting_results(
        &self,
        req: GetVotingResultsRequest,
    ) -> CandidCallResult<(GetVotingResultsResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_voting_results", (req,), 0)
            .do_call()
            .await
    }

    async fn cast_my_vote(&self, req: CastMyVoteRequest) -> CandidCallResult<()> {
        RemoteCallPayload::new_encode(*self, "cast_my_vote", (req,), 0)
            .do_call()
            .await
    }

    async fn get_my_vote(&self, req: GetMyVoteRequest) -> CandidCallResult<(GetMyVoteResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_my_vote", (req,), 0)
            .do_call()
            .await
    }

    async fn get_my_shares_info_at(
        &self,
        req: GetMySharesInfoAtRequest,
    ) -> CandidCallResult<(GetSharesInfoOfAtResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_my_shares_info_at", (req,), 0)
            .do_call()
            .await
    }

    async fn get_my_groups(&self) -> CandidCallResult<(GetGroupsResponse,)> {
        RemoteCallPayload::new_encode(*self, "get_my_groups", (req,), 0)
            .do_call()
            .await
    }
}
