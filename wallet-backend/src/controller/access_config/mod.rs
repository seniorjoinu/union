use crate::controller::access_config::api::{
    CreateAccessConfigRequest, CreateAccessConfigResponse, DeleteAccessConfigRequest,
    GetAccessConfigRequest, GetAccessConfigResponse, ListAccessConfigsRequest,
    ListAccessConfigsResponse, UpdateAccessConfigRequest,
};
use crate::guards::only_self_or_with_access;
use crate::service::access_config::types::AccessConfigService;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_access_config(req: CreateAccessConfigRequest) -> CreateAccessConfigResponse {
    only_self_or_with_access("create_access_config");

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
    only_self_or_with_access("update_access_config");

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
    only_self_or_with_access("delete_access_config");

    AccessConfigService::delete_access_config(&req.id).expect("Unable to delete access config");
}

#[query]
fn get_access_config(req: GetAccessConfigRequest) -> GetAccessConfigResponse {
    only_self_or_with_access("get_access_config");

    let access_config =
        AccessConfigService::get_access_config(&req.id).expect("Unable to get access config");
    GetAccessConfigResponse { access_config }
}

#[query]
fn list_access_configs(req: ListAccessConfigsRequest) -> ListAccessConfigsResponse {
    only_self_or_with_access("list_access_configs");

    let page = AccessConfigService::list_access_configs(&req.page_req);
    ListAccessConfigsResponse { page }
}
