use crate::repository::group::types::{
    DESCRIPTION_MAX_LEN, DESCRIPTION_MIN_LEN, NAME_MAX_LEN, NAME_MIN_LEN,
};
use crate::repository::profile::types::{Profile, ProfileId, ProfileRepositoryError};
use candid::{CandidType, Deserialize, Principal};
use shared::validation::validate_and_trim_str;
use std::collections::HashMap;

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ProfileRepository {
    profiles: HashMap<ProfileId, Profile>,
}

impl ProfileRepository {
    pub fn create_profile(
        &mut self,
        profile_id: ProfileId,
        name: String,
        description: String,
    ) -> Result<(), ProfileRepositoryError> {
        self.profiles.insert(
            profile_id,
            Profile {
                id: profile_id,
                name: Self::process_name(name)?,
                description: Self::process_description(description)?,
            },
        );

        Ok(())
    }

    pub fn update_profile(
        &mut self,
        profile_id: ProfileId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ProfileRepositoryError> {
        let mut profile = self.get_profile_mut(&profile_id)?;

        if let Some(name) = new_name {
            profile.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            profile.description = Self::process_description(description)?;
        }

        Ok(())
    }

    pub fn delete_profile(
        &mut self,
        profile_id: &ProfileId,
    ) -> Result<Profile, ProfileRepositoryError> {
        self.profiles
            .remove(profile_id)
            .ok_or(ProfileRepositoryError::ProfileNotFound(*profile_id))
    }

    pub fn get_profile_cloned(
        &self,
        profile_id: &ProfileId,
    ) -> Result<Profile, ProfileRepositoryError> {
        self.get_profile(profile_id).cloned()
    }

    pub fn has_profile(&self, principal_id: &Principal) -> bool {
        self.get_profile(principal_id).is_ok()
    }

    // ----------------- PRIVATE ---------------------

    fn get_profile_mut(
        &mut self,
        profile_id: &ProfileId,
    ) -> Result<&mut Profile, ProfileRepositoryError> {
        self.profiles
            .get_mut(profile_id)
            .ok_or(ProfileRepositoryError::ProfileNotFound(*profile_id))
    }

    fn get_profile(&self, profile_id: &ProfileId) -> Result<&Profile, ProfileRepositoryError> {
        self.profiles
            .get(profile_id)
            .ok_or(ProfileRepositoryError::ProfileNotFound(*profile_id))
    }

    fn process_name(name: String) -> Result<String, ProfileRepositoryError> {
        validate_and_trim_str(name, NAME_MIN_LEN, NAME_MAX_LEN, "Name")
            .map_err(ProfileRepositoryError::ValidationError)
    }

    fn process_description(description: String) -> Result<String, ProfileRepositoryError> {
        validate_and_trim_str(
            description,
            DESCRIPTION_MIN_LEN,
            DESCRIPTION_MAX_LEN,
            "Description",
        )
        .map_err(ProfileRepositoryError::ValidationError)
    }
}
