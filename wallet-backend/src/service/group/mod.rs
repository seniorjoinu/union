use crate::repository::group::model::Group;
use crate::repository::token::model::Token;
use crate::service::events::EventsService;
use crate::service::group::types::{GroupError, GroupService, HAS_PROFILE_GROUP_ID};
use crate::service::profile::types::ProfileService;
use candid::Principal;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::{GroupId, Shares};

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
        group_id: GroupId,
        owner: Principal,
        qty: Shares,
        timestamp: u64,
    ) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group_id)?;

        let group = GroupService::get_group(group_id)?;
        let mut token = GroupService::get_token(&group);

        if group.is_private() {
            token.mint_unaccepted(owner, qty);
        } else {
            token.mint(owner, qty.clone());
            let balance = token.balance_of(&owner);
            let total_supply = token.total_supply();

            EventsService::emit_shares_mint_event(
                group.get_id().unwrap(),
                owner,
                qty,
                balance,
                total_supply,
                timestamp,
            );
        }

        Token::repo().save(token);

        Ok(())
    }

    pub fn burn_shares(
        group_id: GroupId,
        owner: Principal,
        qty: Shares,
        timestamp: u64,
    ) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group_id)?;

        let group = GroupService::get_group(group_id)?;
        let mut token = GroupService::get_token(&group);

        if group.is_private() {
            GroupService::assert_profile_exists(owner)?;
        }

        token
            .burn(owner, qty.clone())
            .map_err(GroupError::ValidationError)?;

        Token::repo().save(token);

        let new_balance = token.balance_of(&owner);
        let total_supply = token.total_supply();

        EventsService::emit_shares_burn_event(
            group_id,
            owner,
            qty,
            new_balance,
            total_supply,
            timestamp,
        );

        Ok(())
    }

    pub fn transfer_shares(
        group_id: GroupId,
        from: Principal,
        to: Principal,
        qty: Shares,
        timestamp: u64,
    ) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group_id)?;

        let group = GroupService::get_group(group_id)?;
        let mut token = GroupService::get_token(&group);

        GroupService::assert_transferable(&group, &token)?;

        if group.is_private() {
            GroupService::assert_profile_exists(from)?;
            GroupService::assert_profile_exists(to)?;
        }

        token
            .transfer(from, to, qty.clone())
            .map_err(GroupError::ValidationError)?;

        Token::repo().save(token);

        let from_balance = token.balance_of(&from);
        let to_balance = token.balance_of(&to);
        let total_supply = token.total_supply();

        EventsService::emit_shares_transfer_event(
            group.get_id().unwrap(),
            from,
            to,
            qty,
            from_balance,
            to_balance,
            total_supply,
            timestamp,
        );

        Ok(())
    }

    pub fn accept_shares(
        group_id: GroupId,
        owner: Principal,
        qty: Shares,
        timestamp: u64,
    ) -> Result<(), GroupError> {
        GroupService::assert_profile_exists(owner)?;

        let group = GroupService::get_group(group_id)?;
        let mut token = GroupService::get_token(&group);

        GroupService::assert_acceptable(&group, &token)?;

        token
            .accept(owner, qty.clone())
            .map_err(GroupError::ValidationError)?;

        Token::repo().save(token);

        let balance = token.balance_of(&owner);
        let total_supply = token.total_supply();

        EventsService::emit_shares_mint_event(
            group.get_id().unwrap(),
            owner,
            qty,
            balance,
            total_supply,
            timestamp,
        );

        if group_id == HAS_PROFILE_GROUP_ID {
            EventsService::emit_profile_activated_event(owner);
        }

        Ok(())
    }

    pub fn burn_unaccepted_shares(
        group_id: GroupId,
        owner: Principal,
        qty: Shares,
    ) -> Result<(), GroupError> {
        let group = GroupService::get_group(group_id)?;
        let mut token = GroupService::get_token(&group);

        GroupService::assert_acceptable(&group, &token)?;

        token
            .burn_unaccepted(owner, qty)
            .map_err(GroupError::ValidationError)?;
        Token::repo().save(token);

        Ok(())
    }

    pub fn get_group_shares_balance_of(
        group_id: GroupId,
        owner: &Principal,
    ) -> Result<Shares, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        Ok(token.balance_of(owner))
    }

    pub fn get_unaccepted_group_shares_balance_of(
        group_id: GroupId,
        owner: &Principal,
    ) -> Result<Shares, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        GroupService::assert_acceptable(&group, &token)?;

        Ok(token.unaccepted_balance_of(owner))
    }

    pub fn get_total_group_shares(group_id: GroupId) -> Result<Shares, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        Ok(token.total_supply())
    }

    pub fn get_total_unaccepted_group_shares(group_id: GroupId) -> Result<Shares, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        GroupService::assert_acceptable(&group, &token)?;

        Ok(token.unaccepted_total_supply())
    }

    pub fn list_group_shares(
        group_id: GroupId,
        page_req: &PageRequest<(), ()>,
    ) -> Result<Page<(Principal, Shares)>, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        Ok(token.balances(page_req))
    }

    pub fn list_group_unaccepted_shares(
        group_id: GroupId,
        page_req: &PageRequest<(), ()>,
    ) -> Result<Page<(Principal, Shares)>, GroupError> {
        let group = GroupService::get_group(group_id)?;
        let token = GroupService::get_token(&group);

        GroupService::assert_acceptable(&group, &token)?;

        Ok(token.unaccepted_balances(page_req))
    }

    // unused, but maybe one day...
    fn convert_to_private(group: &mut Group, token: &mut Token) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;
        GroupService::assert_public(&group)?;
        group.set_private(true);
        token.make_acceptable();

        // TODO: sends correct events

        Ok(())
    }

    // unused, but maybe one day...
    fn convert_to_public(group: &mut Group, token: &mut Token) -> Result<(), GroupError> {
        GroupService::assert_not_has_profile_group(group.get_id().unwrap())?;
        GroupService::assert_private(&group)?;
        group.set_private(false);
        token.make_not_acceptable();

        // TODO: send correct events

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
