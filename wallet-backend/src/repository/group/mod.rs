use crate::repository::group::types::{
    Group, GroupId, GroupRepositoryError, GroupType, GroupTypeExternal, Shares, EVERYONE_GROUP_ID,
    ZERO_NAT,
};
use crate::repository::profile::types::ProfileId;
use candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{BTreeSet, HashMap};

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct GroupRepository {
    groups: HashMap<GroupId, Group>,
    group_id_counter: GroupId,

    groups_by_principal_index: HashMap<Principal, BTreeSet<GroupId>>,
}

impl GroupRepository {
    pub fn new() -> Self {
        let mut it = Self::default();
        let id = it.generate_group_id();
        assert_eq!(EVERYONE_GROUP_ID, id);

        let everyone_group = Group {
            id,
            name: String::from("Public"),
            description: String::from("This group is default and non-deletable. Use it for methods you want to be public (usable by anyone)."),
            group_type: GroupType::Everyone,
        };

        it.groups.insert(everyone_group.id, everyone_group);

        it
    }

    #[inline(always)]
    pub fn create_group(
        &mut self,
        group_type: GroupTypeExternal,
        name: String,
        description: String,
    ) -> Result<GroupId, GroupRepositoryError> {
        let id = self.generate_group_id();
        let group = Group::new(id, group_type, name, description)?;

        self.groups.insert(id, group);

        Ok(id)
    }

    #[inline(always)]
    pub fn update_group(
        &mut self,
        group_id: &GroupId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), GroupRepositoryError> {
        let group = self.get_group_mut(group_id)?;
        group.update(new_name, new_description)?;

        Ok(())
    }

    pub fn delete_group(&mut self, group_id: GroupId) -> Result<Group, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        self.groups
            .remove(&group_id)
            .ok_or(GroupRepositoryError::GroupNotFound(group_id))
    }

    #[inline(always)]
    pub fn mint_shares(
        &mut self,
        group_id: GroupId,
        to: Principal,
        qty: Shares,
        has_profile: bool,
    ) -> Result<(), GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group_mut(&group_id)?;
        group.mint_shares(to, qty, has_profile)?;

        self.add_to_index(to, group_id);

        Ok(())
    }

    #[inline(always)]
    pub fn accept_shares(
        &mut self,
        group_id: GroupId,
        profile_id: ProfileId,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group_mut(&group_id)?;
        group.accept_shares(profile_id, qty)
    }

    #[inline(always)]
    pub fn transfer_shares(
        &mut self,
        group_id: GroupId,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group_mut(&group_id)?;
        let sender_balance = group.transfer_shares(from, to, qty)?;

        self.add_to_index(to, group_id);

        if sender_balance == ZERO_NAT {
            self.remove_from_index(&from, &group_id);
        }

        Ok(sender_balance)
    }

    #[inline(always)]
    pub fn burn_shares(
        &mut self,
        group_id: GroupId,
        from: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group_mut(&group_id)?;
        let shares_left = group.burn_shares(from, qty)?;

        match &mut group.group_type {
            GroupType::Private(p) => {
                if shares_left == ZERO_NAT
                    && self.unaccepted_balance_of(group_id, &from).unwrap() == ZERO_NAT
                {
                    self.remove_from_index(&from, &group_id);
                }

                Ok(shares_left)
            }
            GroupType::Public(p) => {
                if shares_left == ZERO_NAT {
                    self.remove_from_index(&from, &group_id);
                }

                Ok(shares_left)
            }
            _ => unreachable!(),
        }
    }

    #[inline(always)]
    pub fn burn_unaccepted(
        &mut self,
        group_id: GroupId,
        from: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group_mut(&group_id)?;
        let shares_left = group.burn_unaccepted(from, qty)?;
        if shares_left == ZERO_NAT && self.balance_of(group_id, &from)? == ZERO_NAT {
            self.remove_from_index(&from, &group_id);
        }

        Ok(shares_left)
    }

    #[inline(always)]
    pub fn balance_of(
        &self,
        group_id: GroupId,
        of: &Principal,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group(&group_id)?;
        group.balance_of(of)
    }

    #[inline(always)]
    pub fn unaccepted_balance_of(
        &self,
        group_id: GroupId,
        of: &Principal,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group(&group_id)?;
        group.unaccepted_balance_of(of)
    }

    #[inline(always)]
    pub fn total_supply(&self, group_id: GroupId) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group(&group_id)?;
        group.total_supply()
    }

    #[inline(always)]
    pub fn unaccepted_total_supply(
        &self,
        group_id: GroupId,
    ) -> Result<Shares, GroupRepositoryError> {
        Self::validate_group_id(group_id)?;

        let group = self.get_group(&group_id)?;
        group.unaccepted_total_supply()
    }

    // --------------- PRIVATE ------------------

    fn add_to_index(&mut self, principal: Principal, group_id: GroupId) {
        match self.groups_by_principal_index.entry(principal) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(group_id);
            }
            Entry::Vacant(e) => {
                let mut set = BTreeSet::new();
                set.insert(group_id);

                e.insert(set);
            }
        }
    }

    fn remove_from_index(&mut self, principal: &Principal, group_id: &GroupId) {
        let set = self.groups_by_principal_index.get_mut(principal).unwrap();
        assert!(set.remove(group_id));
    }

    fn get_group_mut(&mut self, group_id: &GroupId) -> Result<&mut Group, GroupRepositoryError> {
        self.groups
            .get_mut(group_id)
            .ok_or(GroupRepositoryError::GroupNotFound(*group_id))
    }

    fn get_group(&self, group_id: &GroupId) -> Result<&Group, GroupRepositoryError> {
        self.groups
            .get(group_id)
            .ok_or(GroupRepositoryError::GroupNotFound(*group_id))
    }

    fn generate_group_id(&mut self) -> GroupId {
        let id = self.group_id_counter;
        self.group_id_counter += 1;

        id
    }

    fn validate_group_id(group_id: GroupId) -> Result<(), GroupRepositoryError> {
        if group_id == EVERYONE_GROUP_ID {
            Err(GroupRepositoryError::UnableToEditDefaultGroup(
                EVERYONE_GROUP_ID,
            ))
        } else {
            Ok(())
        }
    }
}
