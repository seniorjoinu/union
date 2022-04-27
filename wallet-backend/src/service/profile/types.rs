use crate::service::group::types::GroupError;
use shared::types::wallet::ProfileId;
use shared::validation::ValidationError;

#[derive(Debug)]
pub enum ProfileError {
    ValidationError(ValidationError),
    ProfileAlreadyExists(ProfileId),
    GroupError(GroupError),
    ProfileNotFound(ProfileId),
}

pub struct ProfileService;
