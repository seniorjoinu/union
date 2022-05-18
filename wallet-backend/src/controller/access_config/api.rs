use crate::repository::access_config::model::AccessConfig;
use crate::repository::access_config::types::{AccessConfigFilter, AlloweeConstraint};
use crate::repository::permission::types::{PermissionId, PermissionTarget};
use crate::service::access_config::types::QueryDelegationProof;
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::{Program, ProgramExecutionResult};
use shared::types::wallet::AccessConfigId;
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize)]
pub struct ExecuteRequest {
    pub access_config_id: AccessConfigId,
    pub program: Program,
}

#[derive(CandidType, Deserialize)]
pub struct ExecuteResponse {
    pub result: ProgramExecutionResult,
}

#[derive(CandidType, Deserialize)]
pub struct CreateAccessConfigRequest {
    pub name: String,
    pub description: String,
    pub permissions: BTreeSet<PermissionId>,
    pub allowees: BTreeSet<AlloweeConstraint>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateAccessConfigResponse {
    pub id: AccessConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateAccessConfigRequest {
    pub id: AccessConfigId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
    pub new_permissions: Option<BTreeSet<PermissionId>>,
    pub new_allowees: Option<BTreeSet<AlloweeConstraint>>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteAccessConfigRequest {
    pub id: AccessConfigId,
}

#[derive(CandidType, Deserialize)]
pub struct GetAccessConfigRequest {
    pub id: AccessConfigId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetAccessConfigResponse {
    pub access_config: AccessConfig,
}

#[derive(CandidType, Deserialize)]
pub struct ListAccessConfigsRequest {
    pub page_req: PageRequest<AccessConfigFilter, ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListAccessConfigsResponse {
    pub page: Page<AccessConfig>,
}

// ----------- PERSONAL ------------

#[derive(CandidType, Deserialize)]
pub struct GetMyQueryDelegationProofRequest {
    pub requested_targets: BTreeSet<PermissionTarget>,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyQueryDelegationProofResponse {
    pub proof: QueryDelegationProof,
}
