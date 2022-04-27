use crate::repository::group::types::{
    GROUP_DESCRIPTION_MAX_LEN, GROUP_DESCRIPTION_MIN_LEN, GROUP_NAME_MAX_LEN, GROUP_NAME_MIN_LEN,
};
use crate::repository::token::types::TokenId;
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::types::wallet::GroupId;
use shared::validation::{validate_and_trim_str, ValidationError};

#[derive(Clone, CandidType, Deserialize)]
pub struct Group {
    id: Option<GroupId>,
    name: String,
    description: String,
    only_with_profile: bool,
    token: TokenId,
}

impl Group {
    pub fn new(
        name: String,
        description: String,
        only_with_profile: bool,
        token: TokenId,
    ) -> Result<Self, ValidationError> {
        let group = Self {
            id: None,
            only_with_profile,
            token,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
        };

        Ok(group)
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

    pub fn set_only_with_profile(&mut self, value: bool) {
        self.only_with_profile = value;
    }

    pub fn get_token(&self) -> &TokenId {
        &self.token
    }

    pub fn is_only_with_profile(&self) -> bool {
        self.only_with_profile
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(name, GROUP_NAME_MIN_LEN, GROUP_NAME_MAX_LEN, "Group name")
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            GROUP_DESCRIPTION_MIN_LEN,
            GROUP_DESCRIPTION_MAX_LEN,
            "Group description",
        )
    }
}

impl Model<GroupId> for Group {
    fn get_id(&self) -> Option<GroupId> {
        self.id
    }

    fn _init_id(&mut self, id: GroupId) {
        assert!(self.is_transient());

        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
