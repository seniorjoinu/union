use crate::common::utils::ValidationError;
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};

pub type Blob = Vec<u8>;

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
    ValidationError(ValidationError),
}

#[derive(Clone, Copy, CandidType, Deserialize)]
pub enum UnionWalletBinaryStatus {
    Created,
    Released,
    Deleted,
}

#[derive(CandidType, Deserialize)]
pub struct UnionWalletBinary {
    pub version: String,
    pub description: String,
    pub binary: Option<Blob>,
    pub status: UnionWalletBinaryStatus,

    pub created_at: u64,
    pub updated_at: u64,
}

impl UnionWalletBinary {
    pub fn new(version: String, description: String, timestamp: u64) -> Self {
        Self {
            version,
            description,
            binary: None,
            status: UnionWalletBinaryStatus::Created,
            created_at: timestamp,
            updated_at: timestamp,
        }
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub struct UnionWalletInstance {
    pub canister_id: Principal,
    pub binary_version: String,

    pub created_at: u64,
    pub upgraded_at: u64,
}
