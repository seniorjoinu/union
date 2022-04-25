use crate::repository::profile::types::{
    PROFILE_DESCRIPTION_MAX_LEN, PROFILE_DESCRIPTION_MIN_LEN, PROFILE_NAME_MAX_LEN,
    PROFILE_NAME_MIN_LEN,
};
use shared::mvc::Model;
use shared::types::wallet::ProfileId;
use shared::validation::{validate_and_trim_str, ValidationError};

#[derive(Clone, CandidType, Deserialize)]
pub struct Profile {
    pub id: ProfileId,
    pub name: String,
    pub description: String,
}

impl Profile {
    pub fn new(id: ProfileId, name: String, description: String) -> Result<Self, ValidationError> {
        let profile = Self {
            id,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
        };

        Ok(profile)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        Ok(())
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            PROFILE_NAME_MIN_LEN,
            PROFILE_NAME_MAX_LEN,
            "Profile name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            PROFILE_DESCRIPTION_MIN_LEN,
            PROFILE_DESCRIPTION_MAX_LEN,
            "Profile description",
        )
    }
}

impl Model<ProfileId> for Profile {
    fn get_id(&self) -> Option<ProfileId> {
        Some(self.id)
    }

    fn _init_id(&mut self, id: ProfileId) {}

    fn is_transient(&self) -> bool {
        false
    }
}
