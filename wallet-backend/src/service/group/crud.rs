use crate::repository::group::model::Group;
use crate::repository::token::model::Token;
use crate::repository::token::types::TokenId;
use crate::service::group::types::{GroupError, GroupService};
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::GroupId;

impl GroupService {
    pub fn create_group(
        name: String,
        description: String,
        private: bool,
        transferable: bool,
    ) -> Result<GroupId, GroupError> {
        let token = Token::new(private, transferable);
        let token_id = Token::repo().save(token);

        let group = Group::new(name, description, private, token_id)
            .map_err(GroupError::ValidationError)?;

        Ok(Group::repo().save(group))
    }

    pub fn delete_group(group_id: &GroupId) -> Result<(Group, Token), GroupError> {
        GroupService::assert_not_has_profile_group(*group_id)?;

        // TODO: check for existing voting and query configs
        
        let group = Group::repo()
            .delete(group_id)
            .ok_or(GroupError::GroupNotFound(*group_id))?;

        let token = Token::repo().delete(group.get_token()).unwrap();

        Ok((group, token))
    }
}
