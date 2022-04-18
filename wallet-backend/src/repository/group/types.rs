use crate::repository::profile::types::ProfileId;
use candid::{CandidType, Deserialize, Nat, Principal};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::HashMap;

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 100;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 300;
pub const EVERYONE_GROUP_ID: GroupId = 0;

pub const ZERO_NAT: Nat = Nat::default();

pub type GroupId = u32;
pub type Shares = Nat;

#[derive(Debug)]
pub enum GroupRepositoryError {
    ValidationError(ValidationError),
    GroupNotFound(GroupId),
    UnableToEditDefaultGroup(GroupId),
    UserShouldHaveAProfile(ProfileId),
    NotEnoughShares(Principal, Shares, Shares),
    NotEnoughUnacceptedShares(Principal, Shares, Shares),
    InvalidGroupType(GroupId, GroupTypeExternal, GroupTypeExternal),
}

#[derive(CandidType, Deserialize)]
pub struct Group {
    pub id: GroupId,
    pub name: String,
    pub description: String,

    pub group_type: GroupType,
}

impl Group {
    pub fn new(
        id: GroupId,
        group_type: GroupTypeExternal,
        name: String,
        description: String,
    ) -> Result<Self, GroupRepositoryError> {
        let group = Self {
            id,
            group_type: group_type.to_group_type(),
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
        };

        Ok(group)
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), GroupRepositoryError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        Ok(())
    }
    
    pub fn mint_shares(
        &mut self,
        to: Principal,
        qty: Shares,
        has_profile: bool,
    ) -> Result<(), GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => {
                if has_profile {
                    p.mint_unaccepted(to, qty);
                    Ok(())
                } else {
                    Err(GroupRepositoryError::UserShouldHaveAProfile(to))
                }
            }
            GroupType::Public(p) => {
                p.mint(to, qty);
                Ok(())
            }
            GroupType::Everyone => unreachable!(),
        }
    }
    
    pub fn accept_shares(
        &mut self,
        profile_id: ProfileId,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => p.accept(profile_id, qty),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeExternal::Private,
                GroupTypeExternal::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn transfer_shares(
        &mut self,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Public(p) => p.transfer(from, to, qty),
            GroupType::Private(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeExternal::Public,
                GroupTypeExternal::Private,
            )),
            _ => unreachable!(),
        }
    }

    pub fn burn_shares(
        &mut self,
        from: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => p.burn(from, qty),
            GroupType::Public(p) => p.burn(from, qty),
            _ => unreachable!(),
        }
    }

    pub fn burn_unaccepted(
        &mut self,
        from: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => p.burn_unaccepted(from, qty),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeExternal::Private,
                GroupTypeExternal::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn balance_of(
        &self,
        of: &Principal,
    ) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.balance_of(of)),
            GroupType::Public(p) => Ok(p.balance_of(of)),
            _ => unreachable!(),
        }
    }

    pub fn unaccepted_balance_of(
        &self,
        of: &Principal,
    ) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.unaccepted_balance_of(of)),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeExternal::Private,
                GroupTypeExternal::Public,
            )),
            _ => unreachable!(),
        }
    }
    
    pub fn total_supply(&self) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.total_supply()),
            GroupType::Public(p) => Ok(p.total_supply()),
            _ => unreachable!(),
        }
    }

    pub fn unaccepted_total_supply(&self) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.unaccepted_total_supply()),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeExternal::Private,
                GroupTypeExternal::Public,
            )),
            _ => unreachable!(),
        }
    }
    
    fn process_name(name: String) -> Result<String, GroupRepositoryError> {
        validate_and_trim_str(name, NAME_MIN_LEN, NAME_MAX_LEN, "Name")
            .map_err(GroupRepositoryError::ValidationError)
    }

    fn process_description(description: String) -> Result<String, GroupRepositoryError> {
        validate_and_trim_str(
            description,
            DESCRIPTION_MIN_LEN,
            DESCRIPTION_MAX_LEN,
            "Description",
        )
        .map_err(GroupRepositoryError::ValidationError)
    }
}

#[derive(CandidType, Deserialize)]
pub enum GroupType {
    Everyone,
    Public(PublicGroup),
    Private(PrivateGroup),
}

#[derive(Debug, CandidType, Deserialize)]
pub enum GroupTypeExternal {
    Public,
    Private,
}

impl GroupTypeExternal {
    pub fn to_group_type(self) -> GroupType {
        match self {
            GroupTypeExternal::Private => GroupType::Private(PrivateGroup::default()),
            GroupTypeExternal::Public => GroupType::Public(PublicGroup::default()),
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct PublicGroup {
    shares: HashMap<Principal, Shares>,
    total_shares: Shares,
}

impl PublicGroup {
    pub fn mint(&mut self, to: Principal, qty: Shares) {
        self.shares.insert(to, self.balance_of(&to) + qty.clone());
        self.total_shares += qty;
    }

    pub fn burn(&mut self, from: Principal, qty: Shares) -> Result<Shares, GroupRepositoryError> {
        let balance = self.balance_of(&from);

        if balance < qty {
            return Err(GroupRepositoryError::NotEnoughShares(from, qty, balance));
        }

        let new_balance = balance - qty.clone();
        self.shares.insert(from, new_balance.clone());
        self.total_shares -= qty;

        Ok(new_balance)
    }

    pub fn transfer(
        &mut self,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        let balance_left = self.burn(from, qty.clone())?;
        self.mint(to, qty);

        Ok(balance_left)
    }

    pub fn total_supply(&self) -> Shares {
        self.total_shares.clone()
    }

    pub fn balance_of(&self, owner: &Principal) -> Shares {
        match self.shares.get(owner) {
            Some(s) => s.clone(),
            None => Shares::default(),
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct PrivateGroup {
    pub shares: HashMap<ProfileId, Shares>,
    pub total_shares: Shares,

    pub unaccepted_shares: HashMap<ProfileId, Shares>,
    pub total_unaccepted_shares: Shares,
}

impl PrivateGroup {
    pub fn mint_unaccepted(&mut self, to: ProfileId, qty: Shares) {
        self.unaccepted_shares
            .insert(to, self.balance_of(&to) + qty.clone());

        self.total_unaccepted_shares += qty;
    }

    pub fn burn(&mut self, from: ProfileId, qty: Shares) -> Result<Shares, GroupRepositoryError> {
        let balance = self.balance_of(&from);

        if balance < qty {
            return Err(GroupRepositoryError::NotEnoughShares(from, qty, balance));
        }

        let new_balance = balance - qty.clone();
        self.shares.insert(from, new_balance.clone());
        self.total_shares -= qty;

        Ok(new_balance)
    }

    pub fn burn_unaccepted(
        &mut self,
        from: ProfileId,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        let balance = self.unaccepted_balance_of(&from);

        if balance < qty {
            return Err(GroupRepositoryError::NotEnoughUnacceptedShares(
                from, qty, balance,
            ));
        }

        let new_balance = balance - qty.clone();
        self.unaccepted_shares.insert(from, new_balance.clone());
        self.total_unaccepted_shares -= qty;

        Ok(new_balance)
    }

    pub fn accept(
        &mut self,
        profile_id: ProfileId,
        qty: Shares,
    ) -> Result<Shares, GroupRepositoryError> {
        let unaccepted_balance = self.burn_unaccepted(profile_id, qty.clone())?;
        self.mint(profile_id, qty);

        Ok(unaccepted_balance)
    }

    pub fn unaccepted_total_supply(&self) -> Shares {
        self.total_unaccepted_shares.clone()
    }

    pub fn unaccepted_balance_of(&self, owner: &ProfileId) -> Shares {
        match self.unaccepted_shares.get(owner) {
            Some(s) => s.clone(),
            None => Shares::default(),
        }
    }

    pub fn total_supply(&self) -> Shares {
        self.total_shares.clone()
    }

    pub fn balance_of(&self, owner: &ProfileId) -> Shares {
        match self.shares.get(owner) {
            Some(s) => s.clone(),
            None => Shares::default(),
        }
    }

    fn mint(&mut self, to: ProfileId, qty: Shares) {
        self.shares.insert(to, self.balance_of(&to) + qty.clone());
        self.total_shares += qty;
    }
}
