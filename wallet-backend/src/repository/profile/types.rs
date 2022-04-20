use candid::{CandidType, Deserialize, Principal};
use shared::validation::{validate_and_trim_str, ValidationError};

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 100;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 300;

pub type ProfileId = Principal;

#[derive(Debug)]
pub enum ProfileRepositoryError {
    ValidationError(ValidationError),
    ProfileNotFound(ProfileId),
    ProfileAlreadyExists(ProfileId),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct Profile {
    pub id: ProfileId,
    pub name: String,
    pub description: String,
}

impl Profile {
    pub fn new(
        id: ProfileId,
        name: String,
        description: String,
    ) -> Result<Self, ProfileRepositoryError> {
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
    ) -> Result<(), ProfileRepositoryError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        Ok(())
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
