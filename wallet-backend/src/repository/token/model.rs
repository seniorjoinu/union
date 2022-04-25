use candid::{CandidType, Deserialize, Principal};
use shared::mvc::{Id, Model};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::Shares;
use shared::validation::ValidationError;
use std::collections::HashMap;
use crate::repository::token::types::TokenId;

#[derive(Default, Clone, CandidType, Deserialize)]
pub struct Token {
    id: Option<TokenId>,
    total_supply: Shares,
    balances: HashMap<Principal, Shares>,
}

impl Token {
    pub fn mint(&mut self, to: Principal, qty: Shares) {
        self.balances.insert(to, self.balance_of(&to) + qty);
    }

    pub fn burn(&mut self, from: Principal, qty: Shares) -> Result<(), ValidationError> {
        let balance = self.balance_of(&from);
        if balance < qty {
            Err(ValidationError(String::from("Insufficient balance")))
        } else {
            self.balances.insert(from, balance - qty);
            Ok(())
        }
    }

    pub fn transfer(
        &mut self,
        from: Principal,
        to: Principal,
        qty: Shares,
    ) -> Result<(), ValidationError> {
        self.burn(from, qty.clone())?;
        self.mint(to, qty);

        Ok(())
    }

    pub fn balance_of(&self, of: &Principal) -> Shares {
        self.balances.get(of).cloned().unwrap_or_default()
    }

    pub fn total_supply(&self) -> Shares {
        self.total_supply.clone()
    }

    pub fn balances(&self, page_req: &PageRequest<(), ()>) -> Page<(Principal, Shares)> {
        let (has_next, iter) = self.balances.iter().get_page(page_req);
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
