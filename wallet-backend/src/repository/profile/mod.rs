use crate::repository::profile::types::{Profile, ProfileId, ProfileRepositoryError};
use candid::{CandidType, Deserialize, Principal};
use std::collections::HashMap;

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ProfileRepository {
    profiles: HashMap<ProfileId, Profile>,
}

impl ProfileRepository {
    #[inline(always)]
    pub fn create_profile(
        &mut self,
        profile_id: ProfileId,
        name: String,
        description: String,
    ) -> Result<(), ProfileRepositoryError> {
        let profile = Profile::new(profile_id, name, description)?;
        
        self.profiles.insert(profile_id, profile);

        Ok(())
    }
    
    #[inline(always)]
    pub fn update_profile(
        &mut self,
        profile_id: ProfileId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ProfileRepositoryError> {
        let profile = self.get_profile_mut(&profile_id)?;
        profile.update(new_name, new_description)
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
}
