use crate::repository::token::types::{ChoiceOrGroup, TokenId};
use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Model;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::Shares;
use shared::validation::ValidationError;
use std::collections::HashMap;

#[derive(Clone, CandidType, Deserialize)]
pub struct Token {
    id: Option<TokenId>,
    cog: ChoiceOrGroup,

    acceptable: bool,
    transferable: bool,

    total_supply: Shares,
    balances: HashMap<Principal, Shares>,

    unaccepted_total_supply: Shares,
    unaccepted_balances: HashMap<Principal, Shares>,
}

impl Token {
    pub fn new(cog: ChoiceOrGroup, acceptable: bool, transferable: bool) -> Self {
        Self {
            id: None,
            acceptable,
            transferable,
            cog,
            total_supply: Shares::default(),
            balances: HashMap::default(),
            unaccepted_total_supply: Shares::default(),
            unaccepted_balances: HashMap::default(),
        }
    }

    pub fn reset(&mut self) {
        self.balances = HashMap::new();
        self.total_supply = Shares::default();
        self.unaccepted_balances = HashMap::new();
        self.unaccepted_total_supply = Shares::default();
    }

    pub fn mint(&mut self, to: Principal, qty: Shares) {
        self.balances.insert(to, self.balance_of(&to) + qty.clone());
        self.total_supply += qty;
    }

    pub fn mint_unaccepted(&mut self, to: Principal, qty: Shares) {
        assert!(self.acceptable);

        self.unaccepted_balances
            .insert(to, self.unaccepted_balance_of(&to) + qty.clone());
        self.unaccepted_total_supply += qty;
    }

    pub fn burn(&mut self, from: Principal, qty: Shares) -> Result<(), ValidationError> {
        let balance = self.balance_of(&from);
        if balance < qty {
            Err(ValidationError(String::from("Insufficient balance")))
        } else {
            self.balances.insert(from, balance - qty.clone());
            self.total_supply -= qty;
            Ok(())
        }
    }

    pub fn burn_unaccepted(&mut self, from: Principal, qty: Shares) -> Result<(), ValidationError> {
        assert!(self.acceptable);

        let balance = self.unaccepted_balance_of(&from);
        if balance < qty {
            Err(ValidationError(String::from(
                "Insufficient unaccepted balance",
            )))
        } else {
            self.unaccepted_balances.insert(from, balance - qty.clone());
            self.unaccepted_total_supply -= qty;
            Ok(())
        }
    }

    pub fn transfer(
        &mut self,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<(), ValidationError> {
        assert!(self.transferable);

        self.burn(from, qty.clone())?;
        self.mint(to, qty);

        Ok(())
    }

    pub fn make_acceptable(&mut self) {
        assert!(!self.acceptable);
        assert!(self.unaccepted_balances.is_empty());
        assert_eq!(self.unaccepted_total_supply, Shares::default());

        self.acceptable = true;

        std::mem::swap(&mut self.balances, &mut self.unaccepted_balances);
        std::mem::swap(&mut self.total_supply, &mut self.unaccepted_total_supply);
    }

    pub fn make_not_acceptable(&mut self) {
        assert!(self.acceptable);

        self.acceptable = false;

        let all_unaccepted = std::mem::take(&mut self.unaccepted_balances);
        self.unaccepted_total_supply = Shares::default();

        for (of, qty) in all_unaccepted {
            self.mint(of, qty);
        }
    }

    pub fn set_transferable(&mut self, value: bool) {
        self.transferable = value;
    }

    pub fn accept(&mut self, of: Principal, qty: Shares) -> Result<(), ValidationError> {
        assert!(self.acceptable);

        self.burn_unaccepted(of, qty.clone())?;
        self.mint(of, qty);

        Ok(())
    }

    pub fn is_acceptable(&self) -> bool {
        self.acceptable
    }

    pub fn is_transferable(&self) -> bool {
        self.transferable
    }

    pub fn is_choice_or_group(&self) -> ChoiceOrGroup {
        self.cog
    }

    pub fn balance_of(&self, of: &Principal) -> Shares {
        self.balances.get(of).cloned().unwrap_or_default()
    }

    pub fn unaccepted_balance_of(&self, of: &Principal) -> Shares {
        self.unaccepted_balances
            .get(of)
            .cloned()
            .unwrap_or_default()
    }

    pub fn total_supply(&self) -> Shares {
        self.total_supply.clone()
    }

    pub fn unaccepted_total_supply(&self) -> Shares {
        self.unaccepted_total_supply.clone()
    }

    pub fn balances(&self, page_req: &PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.balances.iter().get_page(page_req);
        let data = iter.map(|(id, it)| (*id, it.clone())).collect();

        Page::new(data, has_next)
    }

    pub fn unaccepted_balances(&self, page_req: &PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.unaccepted_balances.iter().get_page(page_req);
        let data = iter.map(|(id, it)| (*id, it.clone())).collect();

        Page::new(data, has_next)
    }
}

impl Model<TokenId> for Token {
    fn get_id(&self) -> Option<TokenId> {
        self.id
    }

    fn _init_id(&mut self, id: TokenId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
