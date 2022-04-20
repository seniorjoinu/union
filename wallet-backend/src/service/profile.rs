use candid::Principal;
use crate::common::utils::{Page, PageRequest};
use crate::repository::get_repositories;
use crate::repository::profile::types::{ProfileId, ProfileRepositoryError, Profile};
use crate::service::group as GroupService;

#[derive(Debug)]
pub enum ProfileServiceError {
    RepositoryError(ProfileRepositoryError),
}

pub fn create_profile(
    profile_id: ProfileId,
    name: String,
    description: String,
) -> Result<(), ProfileServiceError> {
    get_repositories()
        .profile
        .create_profile(profile_id, name, description)
        .map_err(ProfileServiceError::RepositoryError)?;

    assert!(!GroupService::_profile_exists(&profile_id));

    GroupService::_add_profile(profile_id);

    Ok(())
}

#[inline(always)]
pub fn update_profile(
    profile_id: ProfileId,
    new_name: Option<String>,
    new_description: Option<String>,
) -> Result<(), ProfileServiceError> {
    get_repositories()
        .profile
        .update_profile(profile_id, new_name, new_description)
        .map_err(ProfileServiceError::RepositoryError)
}

#[inline(always)]
pub fn delete_profile(profile_id: &ProfileId) -> Result<Profile, ProfileServiceError> {
    get_repositories()
        .profile
        .delete_profile(profile_id)
        .map_err(ProfileServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_my_profile(caller: &Principal) -> Result<Profile, ProfileServiceError> {
    get_repositories()
        .profile
        .get_profile_cloned(caller)
        .map_err(ProfileServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_profiles(page_req: PageRequest<(), ()>) -> Page<Profile> {
    get_repositories()
        .profile
        .get_profiles_cloned(page_req)
}