use crate::repository::group::types::{
    GroupType, GROUP_DESCRIPTION_MAX_LEN, GROUP_DESCRIPTION_MIN_LEN, GROUP_NAME_MAX_LEN,
    GROUP_NAME_MIN_LEN,
};
use shared::mvc::Model;
use shared::types::wallet::GroupId;
use shared::validation::{validate_and_trim_str, ValidationError};

#[derive(Clone, CandidType, Deserialize)]
pub struct Group {
    id: Option<GroupId>,
    name: String,
    description: String,
    group_type: GroupType,
}

impl Group {
    pub fn new(
        name: String,
        description: String,
        group_type: GroupType,
    ) -> Result<Self, ValidationError> {
        let group = Self {
            id: None,
            group_type,
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

    pub fn get_group_type(&self) -> &GroupType {
        &self.group_type
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
