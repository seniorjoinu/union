use crate::state::profile::types::ProfileId;
use candid::{CandidType, Deserialize, Nat, Principal};
use shared::validation::ValidationError;
use std::collections::HashMap;

pub const NAME_MIN_LEN: usize = 1;
pub const NAME_MAX_LEN: usize = 100;
pub const DESCRIPTION_MIN_LEN: usize = 0;
pub const DESCRIPTION_MAX_LEN: usize = 300;
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
    NotEnoughShares((Principal, Shares, Shares)),
    NotEnoughUnacceptedShares((Principal, Shares, Shares)),
    InvalidGroupType((GroupId, GroupTypeExternal, GroupTypeExternal)),
}

#[derive(CandidType, Deserialize)]
pub struct Group {
    pub id: GroupId,
    pub name: String,
    pub description: String,

    pub group_type: GroupType,
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

impl GroupType {
    pub fn unwrap_public(&self) -> &PublicGroup {
        match self {
            GroupType::Public(p) => p,
            _ => unreachable!("Not a public group"),
        }
    }

    pub fn unwrap_private(&self) -> &PrivateGroup {
        match self {
            GroupType::Private(p) => p,
            _ => unreachable!("Not a private group"),
        }
    }

    pub fn unwrap_public_mut(&mut self) -> &mut PublicGroup {
        match self {
            GroupType::Public(p) => p,
            _ => unreachable!("Not a public group"),
        }
    }

    pub fn unwrap_private_mut(&mut self) -> &mut PrivateGroup {
        match self {
            GroupType::Private(p) => p,
            _ => unreachable!("Not a private group"),
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
            return Err(GroupRepositoryError::NotEnoughShares((from, qty, balance)));
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
            return Err(GroupRepositoryError::NotEnoughShares((from, qty, balance)));
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
            return Err(GroupRepositoryError::NotEnoughUnacceptedShares((
                from, qty, balance,
            )));
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
