use crate::common::utils::{validate_and_trim_str, ValidationError};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug)]
pub enum ProfilesError {
    ProfileNotFound,
    ProfileAlreadyExists,
    ValidationError(ValidationError),
    ThereShouldBeAtLeastOneProfile,
}

#[derive(CandidType, Deserialize, Debug, Default)]
pub struct ProfilesState {
    pub profiles: HashMap<Principal, Profile>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct Profile {
    pub principal_id: Principal,
    pub name: String,
    pub description: String,
}

impl ProfilesState {
    pub fn create_profile(
        &mut self,
        principal_id: Principal,
        name: String,
        description: String,
    ) -> Result<(), ProfilesError> {
        match self.profiles.entry(principal_id) {
            Entry::Occupied(_) => Err(ProfilesError::ProfileAlreadyExists),
            Entry::Vacant(e) => {
                let name = validate_and_trim_str(name, 1, 100, "Name")
                    .map_err(ProfilesError::ValidationError)?;

                let description = validate_and_trim_str(description, 0, 300, "Description")
                    .map_err(ProfilesError::ValidationError)?;

                e.insert(Profile {
                    principal_id,
                    name,
                    description,
                });

                Ok(())
            }
        }
    }

    pub fn update_profile(
        &mut self,
        principal_id: Principal,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ProfilesError> {
        match self.profiles.entry(principal_id) {
            Entry::Occupied(mut e) => {
                let profile = e.get_mut();

                if let Some(name) = new_name {
                    let name = validate_and_trim_str(name, 1, 100, "Name")
                        .map_err(ProfilesError::ValidationError)?;

                    profile.name = name;
                }

                if let Some(description) = new_description {
                    let description = validate_and_trim_str(description, 0, 300, "Description")
                        .map_err(ProfilesError::ValidationError)?;

                    profile.description = description;
                }

                Ok(())
            }
            Entry::Vacant(_) => Err(ProfilesError::ProfileNotFound),
        }
    }

    pub fn remove_profile(&mut self, principal_id: &Principal) -> Result<Profile, ProfilesError> {
        if self.profiles.len() == 1 {
            return Err(ProfilesError::ThereShouldBeAtLeastOneProfile);
        }

        self.profiles
            .remove(principal_id)
            .ok_or(ProfilesError::ProfileNotFound)
    }

    pub fn get_profile_ids_cloned(&self) -> Vec<Principal> {
        self.profiles.keys().cloned().collect()
    }

    pub fn get_profile(&self, principal_id: &Principal) -> Result<&Profile, ProfilesError> {
        self.profiles
            .get(principal_id)
            .ok_or(ProfilesError::ProfileNotFound)
    }
}
