use candid::{CandidType, Deserialize, Principal};
use shared::candid::Blob;

#[derive(Clone, Copy, CandidType, Deserialize)]
pub enum BinaryVersionStatus {
    Created,
    Released,
    Deleted,
}

#[derive(CandidType, Deserialize)]
pub struct BinaryVersionInfo {
    pub version: String,
    pub description: String,
    pub binary: Option<Blob>,
    pub status: BinaryVersionStatus,

    pub created_at: u64,
    pub updated_at: u64,
}

impl BinaryVersionInfo {
    pub fn new(version: String, description: String, timestamp: u64) -> Self {
        Self {
            version,
            description,
            binary: None,
            status: BinaryVersionStatus::Created,
            created_at: timestamp,
            updated_at: timestamp,
        }
    }

    pub fn is_deleted(&self) -> bool {
        matches!(self.status, BinaryVersionStatus::Deleted)
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub struct BinaryInstance {
    pub canister_id: Principal,
    pub binary_version: String,

    pub created_at: u64,
    pub upgraded_at: u64,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct SpawnWalletRequest {
    pub version: String,
    pub wallet_creator: Principal,
    pub gateway: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct SpawnWalletResponse {
    pub canister_id: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct UpgradeWalletVersionRequest {
    pub canister_id: Principal,
    pub new_version: String,
}

#[derive(CandidType, Deserialize)]
pub struct CreateBinaryVersionRequest {
    pub version: String,
    pub description: String,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateBinaryVersionDescriptionRequest {
    pub version: String,
    pub new_description: String,
}

#[derive(CandidType, Deserialize)]
pub struct ReleaseBinaryVersionRequest {
    pub version: String,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteBinaryVersionRequest {
    pub version: String,
}

#[derive(CandidType, Deserialize)]
pub struct UploadBinaryRequest {
    pub version: String,
    pub binary: Blob,
}

#[derive(CandidType, Deserialize)]
pub struct DownloadBinaryRequest {
    pub version: String,
}

#[derive(CandidType, Deserialize)]
pub struct DownloadBinaryResponse {
    pub binary: Option<Blob>,
}

#[derive(CandidType, Deserialize)]
pub struct GetBinaryVersionsResponse {
    pub versions: Vec<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetBinaryVersionInfosRequest {
    pub versions: Vec<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetBinaryVersionInfosResponse {
    pub infos: Vec<BinaryVersionInfo>,
}

#[derive(CandidType, Deserialize)]
pub struct GetInstanceIdsResponse {
    pub ids: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct GetInstancesRequest {
    pub ids: Vec<Principal>,
}

#[derive(CandidType, Deserialize)]
pub struct GetInstancesResponse {
    pub instances: Vec<BinaryInstance>,
}

#[derive(CandidType, Deserialize)]
pub struct TransferControlRequest {
    pub new_controller: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct GetLatestVersionResponse {
    pub version: String,
}

#[derive(CandidType, Deserialize)]
pub struct GetControllerResponse {
    pub controller: Principal,
}
