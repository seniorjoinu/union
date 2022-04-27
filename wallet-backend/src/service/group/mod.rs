use crate::repository::group::model::Group;
use crate::repository::token::model::Token;
use crate::service::group::types::{GroupError, GroupService, HAS_PROFILE_GROUP_ID};
use crate::service::profile::types::ProfileService;
use candid::Principal;
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::wallet::{GroupId, ProfileId, Shares};

pub mod crud;
pub mod types;

impl GroupService {
    pub fn init_has_profile_group() {
        let group_id = GroupService::create_group(
            String::from("Has profile"),
            String::from(
                "Automatic, non-deletable group. Contains every user with existing profile.",
            ),
            true,
            false,
        )
        .unwrap();

        assert_eq!(group_id, HAS_PROFILE_GROUP_ID);
    }

    pub fn get_has_profile_group() -> Group {
        Group::repo().get(&HAS_PROFILE_GROUP_ID).unwrap()
    }

    pub fn mint_shares(
        group: &Group,
        token: &mut Token,
        owner: Principal,
        qty: Shares,
    ) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;

        if group.is_private() {
            token.mint_unaccepted(owner, qty);
        } else {
            token.mint(owner, qty);
        }

        Ok(())
    }

    pub fn transfer_shares(
        group: &Group,
        token: &mut Token,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;
        GroupService::assert_transferable(group, token)?;

        if group.is_private() {
            GroupService::assert_profile_exists(from)?;
            GroupService::assert_profile_exists(to)?;
        }

        token
            .transfer(from, to, qty)
            .map_err(GroupError::ValidationError)
    }

    pub fn accept_shares(
        group: &Group,
        token: &mut Token,
        owner: Principal,
        qty: Shares,
    ) -> Result<(), GroupError> {
        GroupService::assert_acceptable(group, token)?;
        GroupService::assert_profile_exists(owner)?;

        token
            .accept(owner, qty)
            .map_err(GroupError::ValidationError)
    }

    pub fn convert_to_private(group: &mut Group, token: &mut Token) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;
        GroupService::assert_public(&group)?;
        group.set_private(true);
        token.make_acceptable();

        Ok(())
    }

    pub fn convert_to_public(group: &mut Group, token: &mut Token) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;
        GroupService::assert_private(&group)?;
        group.set_private(false);
        token.make_not_acceptable();

        Ok(())
    }

    pub fn get_token(group: &Group) -> Token {
        Token::repo().get(group.get_token()).unwrap()
    }

    fn assert_private(group: &Group) -> Result<(), GroupError> {
        if !group.is_private() {
            Err(GroupError::GroupIsPublic(group.get_id().unwrap()))
        } else {
            Ok(())
        }
    }

    fn assert_public(group: &Group) -> Result<(), GroupError> {
        if group.is_private() {
            Err(GroupError::GroupIsPrivate(group.get_id().unwrap()))
        } else {
            Ok(())
        }
    }

    fn assert_transferable(group: &Group, token: &Token) -> Result<(), GroupError> {
        if !token.is_transferable() {
            Err(GroupError::GroupSharesAreNotTransferable(
                group.get_id().unwrap(),
            ))
        } else {
            Ok(())
        }
    }

    fn assert_acceptable(group: &Group, token: &Token) -> Result<(), GroupError> {
        if !token.is_acceptable() {
            Err(GroupError::GroupSharesAreNotAcceptable(
                group.get_id().unwrap(),
            ))
        } else {
            Ok(())
        }
    }

    fn assert_not_has_profile_group(group_id: GroupId) -> Result<(), GroupError> {
        if group_id == HAS_PROFILE_GROUP_ID {
            Err(GroupError::UnableToEditHasProfileGroup)
        } else {
            Ok(())
        }
    }

    fn assert_profile_exists(of: Principal) -> Result<(), GroupError> {
        let has_profile_group = GroupService::get_has_profile_group();
        let has_profile_token = GroupService::get_token(&has_profile_group);

        if !ProfileService::is_profile_listed_in_has_profile_group(&has_profile_token, &of) {
            return Err(GroupError::ProfileDoesNotExist(of));
        } else {
            Ok(())
        }
    }
}
