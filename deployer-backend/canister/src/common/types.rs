use crate::common::utils::ValidationError;
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};


#[derive(Debug)]
pub enum DeployerError {
    BinaryVersionAlreadyExists,
    BinaryVersionNotFound,
    BinaryVersionHasWrongStatus,
    BinaryIsImmutable,
    UnableToDeleteLatestVersion,
    MissingBinary,
    InstanceAlreadyExists,
    InstanceNotFound,
    LatestVersionDoesNotExist,
    ValidationError(ValidationError),
}
