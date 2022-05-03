use crate::controller::voting::api::{
    CastVoteRequest, CreateVotingChoiceRequest, CreateVotingChoiceResponse, CreateVotingRequest,
    CreateVotingResponse, DeleteVotingChoiceRequest, DeleteVotingRequest, GetMyVoteRequest,
    GetMyVoteResponse, GetVotingChoiceRequest, GetVotingChoiceResponse, GetVotingRequest,
    GetVotingResponse, GetVotingResultsRequest, GetVotingResultsResponse, ListVotingChoicesRequest,
    ListVotingChoicesResponse, ListVotingsRequest, ListVotingsResponse, UpdateVotingChoiceRequest,
    UpdateVotingRequest,
};
use crate::guards::only_self_or_with_access;
use crate::service::choice::types::ChoiceService;
use crate::service::voting::types::VotingService;
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_voting(req: CreateVotingRequest) -> CreateVotingResponse {
    only_self_or_with_access("create_voting");

    let id = VotingService::create_voting(
        req.voting_config_id,
        req.name,
        req.description,
        req.winners_need,
        caller(),
        time(),
    )
    .expect("Unable to create voting");

    CreateVotingResponse { id }
}

#[update]
fn update_voting(req: UpdateVotingRequest) {
    only_self_or_with_access("update_voting");

    VotingService::update_voting(
        &req.id,
        req.new_name,
        req.new_description,
        req.new_winners_need,
        time(),
    )
    .expect("Unable to update voting");
}

#[update]
fn create_voting_choice(req: CreateVotingChoiceRequest) -> CreateVotingChoiceResponse {
    only_self_or_with_access("create_voting_choice");

    let choice_id = ChoiceService::create_choice(
        req.name,
        req.description,
        req.program,
        req.voting_id,
        time(),
    )
    .expect("Unable to create voting choice");
    CreateVotingChoiceResponse { choice_id }
}

#[update]
fn update_voting_choice(req: UpdateVotingChoiceRequest) {
    only_self_or_with_access("update_voting_choice");

    ChoiceService::update_choice(
        &req.choice_id,
        req.new_name,
        req.new_description,
        req.new_program,
    )
    .expect("Unable to update voting choice");
}

#[update]
fn delete_voting_choice(req: DeleteVotingChoiceRequest) {
    only_self_or_with_access("delete_voting_choice");

    ChoiceService::delete_choice(&req.choice_id, &req.voting_id)
        .expect("Unable to delete voting choice");
}

#[update]
fn delete_voting(req: DeleteVotingRequest) {
    only_self_or_with_access("delete_voting");

    VotingService::delete_voting(&req.id).expect("Unable to delete voting");
}

#[update]
fn cast_vote(req: CastVoteRequest) {
    only_self_or_with_access("cast_vote");

    VotingService::cast_vote(&req.id, req.vote, caller(), time()).expect("Unable to cast vote");
}

#[query]
fn get_voting(req: GetVotingRequest) -> GetVotingResponse {
    only_self_or_with_access("get_voting");

    let voting = VotingService::get_voting(&req.id).expect("Unable to get voting");
    GetVotingResponse { voting }
}

#[query]
fn list_votings(req: ListVotingsRequest) -> ListVotingsResponse {
    only_self_or_with_access("list_votings");

    let page = VotingService::list_votings(&req.page_req);
    ListVotingsResponse { page }
}

#[query]
fn get_voting_choice(req: GetVotingChoiceRequest) -> GetVotingChoiceResponse {
    only_self_or_with_access("get_voting_choice");

    let choice = ChoiceService::get_voting_choice(&req.choice_id, &req.voting_id)
        .expect("Unable to get voting choice");
    GetVotingChoiceResponse { choice }
}

#[query]
fn list_voting_choices(req: ListVotingChoicesRequest) -> ListVotingChoicesResponse {
    only_self_or_with_access("list_voting_choices");

    let page = ChoiceService::list_choices(&req.page_req);
    ListVotingChoicesResponse { page }
}

#[query]
fn get_voting_results(req: GetVotingResultsRequest) -> GetVotingResultsResponse {
    only_self_or_with_access("get_voting_results");

    let results =
        VotingService::get_voting_results(&req.voting_id).expect("Unable to get voting results");
    GetVotingResultsResponse { results }
}

// ------------------- PERSONAL ----------------------

#[query]
fn get_my_vote(req: GetMyVoteRequest) -> GetMyVoteResponse {
    let vote = VotingService::get_vote_of(&req.voting_id, req.gop, caller())
        .expect("Unable to get my vote");
    GetMyVoteResponse { vote }
}
