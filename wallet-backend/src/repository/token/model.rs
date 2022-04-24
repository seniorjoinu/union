use crate::repository::token::types::{Balances, TokenError};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{Shares, TokenId};
use shared::types::Blob;

#[derive(CandidType, Deserialize)]
pub struct Token {
    id: Option<TokenId>,
    total_supply: Shares,
    balances: Balances,
}

impl Token {
    pub fn mint<K: Copy + Into<Blob>>(&mut self, to: K, qty: Shares) {
        self.balances.mint(to, qty.clone());
        self.total_supply += qty;
    }

    pub fn burn<K: Copy + Into<Blob>>(
        &mut self,
        from: K,
        qty: Shares,
    ) -> Result<(), TokenError<K>> {
        if !self.balances.burn(from, qty.clone()) {
            Err(TokenError::InsufficientBalance(from))
        } else {
            self.total_supply -= qty;
            Ok(())
        }
    }

    pub fn transfer<K: Copy + Into<Blob>>(
        &mut self,
        from: K,
        to: K,
        qty: Shares,
    ) -> Result<(), TokenError<K>> {
        if !self.balances.burn(from, qty.clone()) {
            Err(TokenError::InsufficientBalance(from))
        } else {
            self.balances.mint(to, qty);
            Ok(())
        }
    }

    pub fn balance_of<K: Copy + Into<Blob>>(&self, k: &K) -> Shares {
        self.balances.balance_of(k)
    }

    pub fn total_supply(&self) -> Shares {
        self.total_supply.clone()
    }

    pub fn balances<'a, K: Copy + From<&'a Blob>>(
        &'a self,
        page_req: PageRequest<(), ()>,
    ) -> Page<(K, Shares)> {
        let (has_next, iter) = self.balances.iter().get_page(&page_req);
        let data = iter.map(|(blob, v)| (K::from(blob), v.clone())).collect();

        Page::new(data, has_next)
    }
}

impl Model<TokenId> for Token {
    fn get_id(&self) -> Option<TokenId> {
        self.id
    }

    fn _init_id(&mut self, id: TokenId) {
        assert!(self.id.is_none());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
