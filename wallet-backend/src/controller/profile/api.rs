use crate::repository::profile::model::Profile;
use crate::service::access_config::types::QueryDelegationProof;
use candid::{CandidType, Deserialize};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::ProfileId;

#[derive(CandidType, Deserialize)]
pub struct CreateProfileRequest {
    pub id: ProfileId,
    pub name: String,
    pub description: String,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteProfileRequest {
    pub id: ProfileId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateMyProfileRequest {
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateProfileRequest {
    pub id: ProfileId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetProfileRequest {
    pub id: ProfileId,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct GetProfileResponse {
    pub profile: Profile,
}

#[derive(CandidType, Deserialize)]
pub struct ListProfilesRequest {
    pub page_req: PageRequest<(), ()>,
    pub query_delegation_proof_opt: Option<QueryDelegationProof>,
}

#[derive(CandidType, Deserialize)]
pub struct ListProfilesResponse {
    pub page: Page<Profile>,
}
