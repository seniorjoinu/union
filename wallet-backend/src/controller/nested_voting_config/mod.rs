use ic_cdk_macros::{update, query};
use crate::controller::nested_voting_config::api::{CreateNestedVotingConfigRequest, CreateNestedVotingConfigResponse, DeleteNestedVotingConfigRequest, GetNestedVotingConfigRequest, GetNestedVotingConfigResponse, ListNestedVotingConfigsRequest, ListNestedVotingConfigsResponse, UpdateNestedVotingConfigRequest};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::nested_voting_config::types::NestedVotingConfigService;

pub mod api;

#[update]
fn create_nested_voting_config(req: CreateNestedVotingConfigRequest) -> CreateNestedVotingConfigResponse {
    only_self();
    
    let id = NestedVotingConfigService::create_nested_voting_config(
        req.name,
        req.description,
        req.remote_union_id,
        req.remote_voting_config_id,
        req.vote_calculation,
        req.allowee_groups
    )
        .expect("Unable to create nested voting config");
    
    CreateNestedVotingConfigResponse { id }
}

#[update]
fn update_nested_voting_config(req: UpdateNestedVotingConfigRequest) {
    only_self();
    
    NestedVotingConfigService::update_nested_voting_config(
        &req.id,
        req.name_opt,
        req.description_opt,
        req.vote_calculation_opt,
        req.allowee_groups_opt
    )
        .expect("Unable to update nested voting config");
}

#[update]
fn delete_nested_voting_config(req: DeleteNestedVotingConfigRequest) {
    only_self();
    
    NestedVotingConfigService::delete_nested_voting_config(&req.id)
        .expect("Unable to delete nested voting config");
}

#[query]
fn get_nested_voting_config(req: GetNestedVotingConfigRequest) -> GetNestedVotingConfigResponse {
    only_self_or_with_access("get_nested_voting_config");
    
    let nested_voting_config = NestedVotingConfigService::get_nested_voting_config(&req.id)
        .expect("Unable to get nested voting config");
    
    GetNestedVotingConfigResponse { nested_voting_config }
}

#[query]
fn list_nested_voting_configs(req: ListNestedVotingConfigsRequest) -> ListNestedVotingConfigsResponse {
    only_self_or_with_access("list_nested_voting_configs");
    
    let page = NestedVotingConfigService::list_nested_voting_configs(&req.page_req);
    
    ListNestedVotingConfigsResponse { page }
}