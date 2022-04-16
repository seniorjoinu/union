use candid::{CandidType, Deserialize, Principal};
use shared::validation::ValidationError;

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 100;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 300;

pub type ProfileId = Principal;

#[derive(Debug)]
pub enum ProfileRepositoryError {
    ValidationError(ValidationError),
    ProfileNotFound(ProfileId),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct Profile {
    pub id: ProfileId,
    pub name: String,
    pub description: String,
}
