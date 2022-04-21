use crate::common::utils::{Page, PageRequest};
use crate::repository::get_repositories;
use crate::repository::group::types::{
    Group, GroupExternal, GroupFilter, GroupId, GroupRepositoryError, GroupTypeParam, Shares,
};
use crate::repository::profile::types::ProfileId;
use candid::Principal;

pub const HAS_PROFILE_GROUP_ID: GroupId = 1;
pub const DEFAULT_SHARES: u32 = 100;

#[derive(Debug)]
pub enum GroupServiceError {
    RepositoryError(GroupRepositoryError),
    UnableToEditHasProfileGroup,
}

pub fn _init_has_profile_group() {
    let id = get_repositories().group.create_group(
        GroupTypeParam::Private,
        String::from("Has profile"),
        String::from("This group is default and non-deletable. It defines all users which have a profile.")
    )
        .unwrap();

    assert_eq!(id, HAS_PROFILE_GROUP_ID);
}

pub fn _add_profile(profile_id: ProfileId) {
    get_repositories()
        .group
        .mint_shares(
            HAS_PROFILE_GROUP_ID,
            profile_id,
            Shares::from(DEFAULT_SHARES),
            true,
        )
        .unwrap();
}

pub fn _profile_exists(profile_id: &ProfileId) -> bool {
    let balance = get_repositories()
        .group
        .balance_of(HAS_PROFILE_GROUP_ID, profile_id)
        .unwrap();

    let unaccepted_balance = get_repositories()
        .group
        .unaccepted_balance_of(HAS_PROFILE_GROUP_ID, profile_id)
        .unwrap();

    balance + unaccepted_balance > Shares::default()
}

#[inline(always)]
pub fn create_group(
    group_type: GroupTypeParam,
    name: String,
    description: String,
) -> Result<GroupId, GroupServiceError> {
    get_repositories()
        .group
        .create_group(group_type, name, description)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn update_group(
    group_id: &GroupId,
    new_name: Option<String>,
    new_description: Option<String>,
) -> Result<(), GroupServiceError> {
    get_repositories()
        .group
        .update_group(group_id, new_name, new_description)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn delete_group(group_id: GroupId) -> Result<Group, GroupServiceError> {
    assert_group_id(group_id)?;

    // TODO: check for existing voting configs

    get_repositories()
        .group
        .delete_group(group_id)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn mint_shares(
    group_id: GroupId,
    to: Principal,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    assert_group_id(group_id)?;

    get_repositories()
        .group
        .mint_shares(group_id, to, qty, _profile_exists(&to))
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn accept_shares(
    group_id: GroupId,
    profile_id: ProfileId,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .accept_shares(group_id, profile_id, qty)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn transfer_shares(
    group_id: GroupId,
    from: Principal,
    to: Principal,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    assert_group_id(group_id)?;

    get_repositories()
        .group
        .transfer_shares(group_id, from, to, qty)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn burn_private_group_shares(
    group_id: GroupId,
    from: Principal,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    assert_group_id(group_id)?;

    get_repositories()
        .group
        .burn_shares(group_id, from, qty, true)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn burn_public_group_shares(
    group_id: GroupId,
    from: Principal,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    assert_group_id(group_id)?;

    get_repositories()
        .group
        .burn_shares(group_id, from, qty, false)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn burn_unaccepted(
    group_id: GroupId,
    from: Principal,
    qty: Shares,
) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .burn_unaccepted(group_id, from, qty)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn balance_of(group_id: GroupId, of: &Principal) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .balance_of(group_id, of)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn unaccepted_balance_of(
    group_id: GroupId,
    of: &Principal,
) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .unaccepted_balance_of(group_id, of)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn total_supply(group_id: GroupId) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .total_supply(group_id)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn unaccepted_total_supply(group_id: GroupId) -> Result<Shares, GroupServiceError> {
    get_repositories()
        .group
        .unaccepted_total_supply(group_id)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_groups(page_req: PageRequest<GroupFilter, ()>) -> Page<GroupExternal> {
    get_repositories().group.get_groups_cloned(page_req)
}

#[inline(always)]
pub fn get_my_groups(caller: Principal, page_req: PageRequest<(), ()>) -> Page<GroupExternal> {
    let page_req = PageRequest {
        page_index: page_req.page_index,
        page_size: page_req.page_size,
        filter: GroupFilter {
            principal_id: Some(caller),
        },
        sort: (),
    };

    get_repositories().group.get_groups_cloned(page_req)
}

#[inline(always)]
pub fn get_group(group_id: &GroupId) -> Result<GroupExternal, GroupServiceError> {
    get_repositories()
        .group
        .get_group(group_id)
        .map(|it| it.to_external())
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_balances_of_group(
    group_id: GroupId,
    page_req: PageRequest<(), ()>,
) -> Result<Page<(Principal, Shares)>, GroupServiceError> {
    get_repositories()
        .group
        .get_balances_of_group(group_id, page_req)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_unaccepted_balances_of_group(
    group_id: GroupId,
    page_req: PageRequest<(), ()>,
) -> Result<Page<(Principal, Shares)>, GroupServiceError> {
    get_repositories()
        .group
        .get_unaccepted_balances_of_group(group_id, page_req)
        .map_err(GroupServiceError::RepositoryError)
}

#[inline(always)]
pub fn assert_group_exists(group_id: &GroupId) -> Result<(), GroupServiceError> {
    get_repositories()
        .group
        .get_group(group_id)
        .map(|_| ())
        .map_err(GroupServiceError::RepositoryError)
}

fn assert_group_id(id: GroupId) -> Result<(), GroupServiceError> {
    if id == HAS_PROFILE_GROUP_ID {
        Err(GroupServiceError::UnableToEditHasProfileGroup)
    } else {
        Ok(())
    }
}
