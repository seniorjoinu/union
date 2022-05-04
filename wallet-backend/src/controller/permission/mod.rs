use crate::controller::permission::api::{
    CreatePermissionRequest, CreatePermissionResponse, DeletePermissionRequest,
    GetPermissionRequest, GetPermissionResponse, ListPermissionsRequest, ListPermissionsResponse,
    UpdatePermissionRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::permission::types::PermissionService;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_permission(req: CreatePermissionRequest) -> CreatePermissionResponse {
    only_self();

    let id = PermissionService::create_permission(req.name, req.description, req.targets)
        .expect("Unable to create permission");
    CreatePermissionResponse { id }
}

#[update]
fn update_permission(req: UpdatePermissionRequest) {
    only_self();

    PermissionService::update_permission(
        &req.id,
        req.new_name,
        req.new_description,
        req.new_targets,
    )
    .expect("Unable to update permission");
}

#[update]
fn delete_permission(req: DeletePermissionRequest) {
    only_self();

    PermissionService::delete_permission(&req.id).expect("Unable to delete permission");
}

#[query]
fn get_permission(req: GetPermissionRequest) -> GetPermissionResponse {
    only_self_or_with_access("get_permission");

    let permission = PermissionService::get_permission(&req.id).expect("Unable to get permission");
    GetPermissionResponse { permission }
}

#[query]
fn list_permissions(req: ListPermissionsRequest) -> ListPermissionsResponse {
    only_self_or_with_access("list_permissions");

    let page = PermissionService::list_permissions(&req.page_req);
    ListPermissionsResponse { page }
}
