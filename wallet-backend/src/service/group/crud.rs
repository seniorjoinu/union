use crate::repository::access_config::model::AccessConfig;
use crate::repository::group::model::Group;
use crate::repository::token::model::Token;
use crate::repository::voting_config::model::VotingConfig;
use crate::service::group::types::{GroupError, GroupService};
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::{GroupId, GroupOrProfile};

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

    pub fn delete_group(group_id: GroupId) -> Result<(Group, Token), GroupError> {
        GroupService::assert_not_has_profile_group(group_id)?;

        let gop = GroupOrProfile::Group(group_id);
        if AccessConfig::repo().gop_has_related_access_configs(&gop) {
            return Err(GroupError::RelatedAccessConfigsExist);
        }
        if VotingConfig::repo().gop_has_related_voting_configs(&gop) {
            return Err(GroupError::RelatedVotingConfigsExist);
        }

        let group = Group::repo()
            .delete(&group_id)
            .ok_or(GroupError::GroupNotFound(group_id))?;

        let token = Token::repo().delete(group.get_token()).unwrap();

        Ok((group, token))
    }
    
    pub fn update_group(
        group_id: GroupId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), GroupError> {
        let mut group = GroupService::get_group(group_id)?;
        
        group.update(new_name, new_description).map_err(GroupError::ValidationError)?;
        Group::repo().save(group);
        
        Ok(())
    }
    
    #[inline(always)]
    pub fn get_group(group_id: GroupId) -> Result<Group, GroupError> {
        Group::repo().get(&group_id).ok_or(GroupError::GroupNotFound(group_id))
    }
    
    #[inline(always)]
    pub fn list_groups(page_req: &PageRequest<(), ()>) -> Page<Group> {
        Group::repo().list(page_req)
    }
}
