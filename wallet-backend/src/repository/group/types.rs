use candid::{CandidType, Deserialize, Principal};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::HashMap;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupId, ProfileId, Shares};

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 100;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 300;
pub const EVERYONE_GROUP_ID: GroupId = 0;

#[derive(Debug)]
pub enum GroupRepositoryError {
    ValidationError(ValidationError),
    GroupNotFound(GroupId),
    UnableToEditDefaultGroup(GroupId),
    UserShouldHaveAProfile(ProfileId),
    NotEnoughShares(Principal, Shares, Shares),
    NotEnoughUnacceptedShares(Principal, Shares, Shares),
    InvalidGroupType(GroupId, GroupTypeParam, GroupTypeParam),
}

#[derive(CandidType, Deserialize)]
pub enum GroupTypeExternal {
    Everyone,
    Private,
    Public,
}

#[derive(CandidType, Deserialize)]
pub struct GroupExternal {
    pub id: GroupId,
    pub name: String,
    pub description: String,
    pub group_type: GroupTypeExternal,
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
        group_type: GroupTypeParam,
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
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => {
                if has_profile {
                    Ok(p.mint_unaccepted(to, qty))
                } else {
                    Err(GroupRepositoryError::UserShouldHaveAProfile(to))
                }
            }
            GroupType::Public(p) => Ok(p.mint(to, qty)),
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
                GroupTypeParam::Private,
                GroupTypeParam::Public,
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
                GroupTypeParam::Public,
                GroupTypeParam::Private,
            )),
            _ => unreachable!(),
        }
    }

    pub fn burn_shares(
        &mut self,
        from: Principal,
        qty: Shares,
        private: bool,
    ) -> Result<Shares, GroupRepositoryError> {
        match &mut self.group_type {
            GroupType::Private(p) => {
                if private {
                    p.burn(from, qty)
                } else {
                    Err(GroupRepositoryError::InvalidGroupType(
                        self.id,
                        GroupTypeParam::Public,
                        GroupTypeParam::Private,
                    ))
                }
            }
            GroupType::Public(p) => {
                if !private {
                    p.burn(from, qty)
                } else {
                    Err(GroupRepositoryError::InvalidGroupType(
                        self.id,
                        GroupTypeParam::Private,
                        GroupTypeParam::Public,
                    ))
                }
            }
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
                GroupTypeParam::Private,
                GroupTypeParam::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn balance_of(&self, of: &Principal) -> Shares {
        match &self.group_type {
            GroupType::Private(p) => p.balance_of(of),
            GroupType::Public(p) => p.balance_of(of),
            _ => unreachable!(),
        }
    }

    pub fn unaccepted_balance_of(&self, of: &Principal) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.unaccepted_balance_of(of)),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeParam::Private,
                GroupTypeParam::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn total_supply(&self) -> Shares {
        match &self.group_type {
            GroupType::Private(p) => p.total_supply(),
            GroupType::Public(p) => p.total_supply(),
            _ => unreachable!(),
        }
    }

    pub fn unaccepted_total_supply(&self) -> Result<Shares, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.unaccepted_total_supply()),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeParam::Private,
                GroupTypeParam::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn balances(&self, page_req: PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        match &self.group_type {
            GroupType::Private(p) => p.balances(page_req),
            GroupType::Public(p) => p.balances(page_req),
            _ => unreachable!(),
        }
    }

    pub fn unaccepted_balances(
        &self,
        page_req: PageRequest<(), ()>,
    ) -> Result<Page<(Principal, Shares)>, GroupRepositoryError> {
        match &self.group_type {
            GroupType::Private(p) => Ok(p.unaccepted_balances(page_req)),
            GroupType::Public(_) => Err(GroupRepositoryError::InvalidGroupType(
                self.id,
                GroupTypeParam::Private,
                GroupTypeParam::Public,
            )),
            _ => unreachable!(),
        }
    }

    pub fn to_external(&self) -> GroupExternal {
        GroupExternal {
            id: self.id,
            name: self.name.clone(),
            description: self.description.clone(),
            group_type: self.group_type.to_external(),
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

impl GroupType {
    pub fn to_external(&self) -> GroupTypeExternal {
        match &self {
            GroupType::Everyone => GroupTypeExternal::Everyone,
            GroupType::Public(_) => GroupTypeExternal::Public,
            GroupType::Private(_) => GroupTypeExternal::Private,
        }
    }
}

#[derive(Debug, CandidType, Deserialize)]
pub enum GroupTypeParam {
    Public,
    Private,
}

impl GroupTypeParam {
    pub fn to_group_type(self) -> GroupType {
        match self {
            GroupTypeParam::Private => GroupType::Private(PrivateGroup::default()),
            GroupTypeParam::Public => GroupType::Public(PublicGroup::default()),
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct PublicGroup {
    shares: HashMap<Principal, Shares>,
    total_shares: Shares,
}

impl PublicGroup {
    pub fn mint(&mut self, to: Principal, qty: Shares) -> Shares {
        let new_balance = self.balance_of(&to) + qty.clone();
        self.shares.insert(to, new_balance.clone());
        self.total_shares += qty;

        new_balance
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

    pub fn balances(&self, page_req: PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.shares.iter().get_page(&page_req);
        let data = iter.map(|(id, it)| (*id, it.clone())).collect();

        Page {
            has_next,
            data,
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
    pub fn mint_unaccepted(&mut self, to: ProfileId, qty: Shares) -> Shares {
        let new_balance = self.balance_of(&to) + qty.clone();
        self.unaccepted_shares.insert(to, new_balance.clone());

        self.total_unaccepted_shares += qty;

        new_balance
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

    pub fn balances(&self, page_req: PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.shares.iter().get_page(&page_req);
        let data = iter.map(|(id, it)| (*id, it.clone())).collect();

        Page {
            has_next,
            data,
        }
    }

    pub fn unaccepted_balances(&self, page_req: PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.unaccepted_shares.iter().get_page(&page_req);
        let data = iter.map(|(id, it)| (*id, it.clone())).collect();

        Page {
            has_next,
            data,
        }
    }

    fn mint(&mut self, to: ProfileId, qty: Shares) {
        self.shares.insert(to, self.balance_of(&to) + qty.clone());
        self.total_shares += qty;
    }
}

#[derive(CandidType, Deserialize)]
pub struct GroupFilter {
    pub principal_id: Option<Principal>,
}
