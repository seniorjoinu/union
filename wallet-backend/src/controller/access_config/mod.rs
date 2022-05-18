use crate::controller::access_config::api::{
    CreateAccessConfigRequest, CreateAccessConfigResponse, DeleteAccessConfigRequest,
    ExecuteRequest, ExecuteResponse, GetAccessConfigRequest, GetAccessConfigResponse,
    GetMyQueryDelegationProofRequest, GetMyQueryDelegationProofResponse, ListAccessConfigsRequest,
    ListAccessConfigsResponse, UpdateAccessConfigRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::access_config::types::AccessConfigService;
use ic_cdk::api::time;
use ic_cdk::{caller, id};
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
async fn execute(req: ExecuteRequest) -> ExecuteResponse {
    let result = AccessConfigService::execute(&req.access_config_id, req.program, caller(), time())
        .await
        .expect("Unable to execute");

    ExecuteResponse { result }
}

#[update]
fn create_access_config(req: CreateAccessConfigRequest) -> CreateAccessConfigResponse {
    only_self();

    let id = AccessConfigService::create_access_config(
        req.name,
        req.description,
        req.permissions,
        req.allowees,
    )
    .expect("Unable to create access config");
    CreateAccessConfigResponse { id }
}

#[update]
fn update_access_config(req: UpdateAccessConfigRequest) {
    only_self();

    AccessConfigService::update_access_config(
        &req.id,
        req.new_name,
        req.new_description,
        req.new_permissions,
        req.new_allowees,
    )
    .expect("Unable to update access config");
}

#[update]
fn delete_access_config(req: DeleteAccessConfigRequest) {
    only_self();

    AccessConfigService::delete_access_config(&req.id).expect("Unable to delete access config");
}

#[query]
fn get_access_config(req: GetAccessConfigRequest) -> GetAccessConfigResponse {
    only_self_or_with_access("get_access_config", req.query_delegation_proof_opt);

    let access_config =
        AccessConfigService::get_access_config(&req.id).expect("Unable to get access config");
    GetAccessConfigResponse { access_config }
}

#[query]
fn list_access_configs(req: ListAccessConfigsRequest) -> ListAccessConfigsResponse {
    only_self_or_with_access("list_access_configs", req.query_delegation_proof_opt);

    let page = AccessConfigService::list_access_configs(&req.page_req);
    ListAccessConfigsResponse { page }
}

// ------------- PERSONAL --------------

#[query]
fn get_my_query_delegation_proof(
    req: GetMyQueryDelegationProofRequest,
) -> GetMyQueryDelegationProofResponse {
    let proof = AccessConfigService::get_query_delegation_proof(
        id(),
        caller(),
        req.requested_targets,
        time(),
    );
    GetMyQueryDelegationProofResponse { proof }
}
