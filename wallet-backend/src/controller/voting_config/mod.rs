use crate::controller::voting_config::api::{
    CreateVotingConfigRequest, CreateVotingConfigResponse, DeleteVotingConfigRequest,
    GetVotingConfigRequest, GetVotingConfigResponse, ListVotingConfigsRequest,
    ListVotingConfigsResponse, UpdateVotingConfigRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::voting_config::types::VotingConfigService;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_voting_config(req: CreateVotingConfigRequest) -> CreateVotingConfigResponse {
    only_self();

    let id = VotingConfigService::create_voting_config(
        req.name,
        req.description,
        req.choices_count,
        req.winners_count,
        req.permissions,
        req.round,
        req.approval,
        req.quorum,
        req.rejection,
        req.win,
        req.next_round,
    )
    .expect("Unable to create voting config");
    CreateVotingConfigResponse { id }
}

#[update]
fn update_voting_config(req: UpdateVotingConfigRequest) {
    only_self();

    VotingConfigService::update_voting_config(
        req.id,
        req.name_opt,
        req.description_opt,
        req.choices_count_opt,
        req.winners_count_opt,
        req.permissions_opt,
        req.round_opt,
        req.approval_opt,
        req.quorum_opt,
        req.rejection_opt,
        req.win_opt,
        req.next_round_opt,
    )
    .expect("Unable to update voting config");
}

#[update]
fn delete_voting_config(req: DeleteVotingConfigRequest) {
    only_self();

    VotingConfigService::delete_voting_config(req.id).expect("Unable to delete voting config");
}

#[query]
fn get_voting_config(req: GetVotingConfigRequest) -> GetVotingConfigResponse {
    only_self_or_with_access("get_voting_config");

    let voting_config =
        VotingConfigService::get_voting_config(&req.id).expect("Unable to get voting config");
    GetVotingConfigResponse { voting_config }
}

#[query]
fn list_voting_configs(req: ListVotingConfigsRequest) -> ListVotingConfigsResponse {
    only_self_or_with_access("list_voting_configs");

    let page = VotingConfigService::list_voting_configs(&req.page_req);
    ListVotingConfigsResponse { page }
}
