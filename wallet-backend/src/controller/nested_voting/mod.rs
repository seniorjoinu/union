use crate::controller::nested_voting::api::{
    CastMyNestedVoteRequest, CreateNestedVotingRequest, CreateNestedVotingResponse,
    DeleteNestedVotingRequest, GetMyNestedVoteRequest, GetMyNestedVoteResponse,
    GetNestedVotingRequest, GetNestedVotingResponse, ListNestedVotingsRequest,
    ListNestedVotingsResponse,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::nested_voting::types::NestedVotingService;
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_nested_voting(req: CreateNestedVotingRequest) -> CreateNestedVotingResponse {
    only_self();

    let id = NestedVotingService::create_nested_voting(
        req.remote_voting_id,
        req.remote_group_id,
        req.local_nested_voting_config_id,
        time(),
    )
    .expect("Unable to create nested voting");

    CreateNestedVotingResponse { id }
}

#[update]
fn delete_nested_voting(req: DeleteNestedVotingRequest) {
    only_self();

    NestedVotingService::delete_nested_voting(&req.id).expect("Unable to delete nested voting");
}

#[query]
fn get_nested_voting(req: GetNestedVotingRequest) -> GetNestedVotingResponse {
    only_self_or_with_access("get_nested_voting");

    let nested_voting =
        NestedVotingService::get_nested_voting(&req.id).expect("Unable to get nested voting");

    GetNestedVotingResponse { nested_voting }
}

#[query]
fn list_nested_votings(req: ListNestedVotingsRequest) -> ListNestedVotingsResponse {
    only_self_or_with_access("list_nested_votings");

    let page = NestedVotingService::list_nested_votings(&req.page_req);

    ListNestedVotingsResponse { page }
}

// -------------- PERSONAL --------------

#[query]
fn get_my_nested_vote(req: GetMyNestedVoteRequest) -> GetMyNestedVoteResponse {
    let my_vote = NestedVotingService::get_vote_of(&req.id, req.group_id, &caller())
        .expect("Unable to get my nested vote");

    GetMyNestedVoteResponse { my_vote }
}

#[update]
async fn cast_my_nested_vote(req: CastMyNestedVoteRequest) {
    NestedVotingService::cast_vote(&req.id, caller(), req.vote)
        .await
        .expect("Unable to cast my nested vote");
}
