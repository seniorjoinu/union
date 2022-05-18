use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionFilter, PermissionId, PermissionTarget};
use crate::service::access_config::types::QueryDelegationProof;
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize)]
pub struct CreatePermissionRequest {
    pub name: String,
    pub description: String,
    pub targets: Vec<PermissionTarget>,
}

#[derive(CandidType, Deserialize)]
pub struct CreatePermissionResponse {
    pub id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdatePermissionRequest {
    pub id: PermissionId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
    pub new_targets: Option<BTreeSet<PermissionTarget>>,
}

#[derive(CandidType, Deserialize)]
pub struct DeletePermissionRequest {
    pub id: PermissionId,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionRequest {
    pub id: PermissionId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetPermissionResponse {
    pub permission: Permission,
}

#[derive(CandidType, Deserialize)]
pub struct ListPermissionsRequest {
    pub page_req: PageRequest<PermissionFilter, ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListPermissionsResponse {
    pub page: Page<Permission>,
}
