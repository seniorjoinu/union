use crate::controller::group::api::GroupExt;
use crate::repository::access_config::model::AccessConfig;
use crate::repository::group::model::Group;
use crate::repository::token::model::Token;
use crate::repository::token::types::ChoiceOrGroup;
use crate::repository::voting_config::model::VotingConfig;
use crate::service::group::types::{GroupError, GroupService};
use crate::service::token::types::TokenService;
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
        let group = Group::new(name, description, private).map_err(GroupError::ValidationError)?;
        let id = Group::repo().save(group);

        let token_id = TokenService::create_token(ChoiceOrGroup::Group(id), private, transferable);
        let mut group = Group::repo().get(&id).unwrap();
        group.init_token(token_id);

        Ok(Group::repo().save(group))
    }

    pub fn delete_group(group_id: GroupId) -> Result<(Group, Token), GroupError> {
        GroupService::assert_not_has_profile_group(group_id)?;

        if AccessConfig::repo().group_has_related_access_configs(&group_id) {
            return Err(GroupError::RelatedAccessConfigsExist);
        }
        if VotingConfig::repo().group_has_related_voting_configs(&group_id) {
            return Err(GroupError::RelatedVotingConfigsExist);
        }

        // TODO: check for existing nested voting configs

        let group = Group::repo()
            .delete(&group_id)
            .ok_or(GroupError::GroupNotFound(group_id))?;

        let token = Token::repo().delete(&group.get_token()).unwrap();

        Ok((group, token))
    }

    pub fn update_group(
        group_id: GroupId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), GroupError> {
        let mut group = GroupService::get_group(group_id)?;

        group
            .it
            .update(new_name, new_description)
            .map_err(GroupError::ValidationError)?;

        Group::repo().save(group.it);

        Ok(())
    }

    #[inline(always)]
    pub fn get_group(group_id: GroupId) -> Result<GroupExt, GroupError> {
        let it = Group::repo()
            .get(&group_id)
            .ok_or(GroupError::GroupNotFound(group_id))?;

        // FIXME: this is not optimal - queries for token each time

        Ok(GroupExt {
            it,
            transferable: Token::repo()
                .get(&it.get_token())
                .unwrap()
                .is_transferable(),
        })
    }

    #[inline(always)]
    pub fn list_groups(page_req: &PageRequest<(), ()>) -> Page<GroupExt> {
        let page = Group::repo().list(page_req);
        let new_data = page
            .data
            .into_iter()
            .map(|it| GroupExt {
                it,
                transferable: Token::repo()
                    .get(&it.get_token())
                    .unwrap()
                    .is_transferable(),
            })
            .collect::<Vec<_>>();

        Page::new(new_data, page.has_next)
    }
}
