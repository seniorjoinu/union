use crate::repository::token::model::Token;
use crate::repository::token::types::{TokenFilter, TokenId};
use crate::Principal;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct TokenRepository {
    tokens: HashMap<TokenId, Token>,
    id_gen: IdGenerator,

    tokens_by_principal_index: BTreeMap<Principal, BTreeSet<TokenId>>,
}

impl Repository<Token, TokenId, TokenFilter, ()> for TokenRepository {
    fn save(&mut self, mut it: Token) -> TokenId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        self.tokens.insert(id, it);

        id
    }

    fn delete(&mut self, id: &TokenId) -> Option<Token> {
        self.tokens.remove(id)
    }

    fn get(&self, id: &TokenId) -> Option<Token> {
        // TODO: this should work just fine when we switch to ic-stable-memory
        // TODO: but now it does some very bad things
        self.tokens.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<TokenFilter, ()>) -> Page<Token> {
        if let Some(index) = self
            .tokens_by_principal_index
            .get(&page_req.filter.principal_id)
        {
            let (has_next, iter) = index.iter().get_page(page_req);
            let data = iter.map(|id| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        } else {
            Page::empty()
        }
    }
}

impl TokenRepository {
    pub fn add_to_principal_index(&mut self, principal: Principal, id: TokenId) {
        self.tokens_by_principal_index
            .entry(principal)
            .or_default()
            .insert(id);
    }

    pub fn remove_from_principal_index(&mut self, principal: &Principal, id: &TokenId) {
        if let Some(index) = self.tokens_by_principal_index.get_mut(principal) {
            index.remove(id);
        }
    }

    pub fn get_tokens_by_principal(&self, principal: &Principal) -> BTreeSet<TokenId> {
        self.tokens_by_principal_index
            .get(principal)
            .cloned()
            .unwrap_or_default()
    }
}
