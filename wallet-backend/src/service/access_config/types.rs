use crate::repository::permission::types::{PermissionId, PermissionTarget};
use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::time;
use ic_cdk::caller;
use shared::types::wallet::{AccessConfigId, GroupId, ProfileId};
use shared::validation::ValidationError;
use std::collections::BTreeSet;

pub const ALLOW_VOTE_ACCESS_CONFIG_ID: AccessConfigId = 0;

pub struct AccessConfigService;

#[derive(Debug)]
pub enum AccessConfigError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    GroupNotFound(GroupId),
    ProfileNotFound(ProfileId),
    AccessConfigNotFound(AccessConfigId),
    UnableToEditDefaultAccessConfig,
    CallerNotAllowed,
    ProgramNotAllowedByAccessConfig,
}

#[derive(CandidType, Deserialize)]
pub struct QueryDelegationProof {
    pub union_id: Principal,
    pub delegate_id: Principal,
    pub allowed_query_targets: Vec<PermissionTarget>,
    pub expires_at: u64,
    // TODO: implement subnet signature
    pub signature: (),
}

impl QueryDelegationProof {
    pub fn validate(
        &self,
        caller: Principal,
        timestamp: u64,
        targets: &Vec<PermissionTarget>,
    ) -> Result<(), ValidationError> {
        // TODO: implement signature validation
        if self.expires_at < timestamp {
            return Err(ValidationError(format!(
                "Query delegation proof is expired"
            )));
        }

        if self.delegate_id != caller {
            return Err(ValidationError(format!(
                "Query delegation proof delegate is invalid"
            )));
        }

        for target in targets {
            if self.allowed_query_targets.contains(target) {
                return Ok(());
            }
        }

        Err(ValidationError(format!(
            "Query delegation proof does not contain required targets"
        )))
    }
}
