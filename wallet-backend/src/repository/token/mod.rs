use crate::repository::token::model::Token;
use crate::repository::token::types::TokenId;
use shared::mvc::{IdGenerator, Model, Repository};
use std::collections::HashMap;
use shared::types::wallet::TokenId;

pub mod model;
pub mod types;

#[derive(Default)]
pub struct TokenRepository {
    tokens: HashMap<TokenId, Token>,
    id_gen: IdGenerator,
}

impl Repository<Token, TokenId> for TokenRepository {
    fn save(&mut self, mut it: Token) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }
        
        self.tokens.insert(it.get_id().unwrap(), it);
    }

    fn delete(&mut self, id: &TokenId) -> Option<Token> {
        self.tokens.remove(id)
    }

    fn get(&self, id: &TokenId) -> Option<&Token> {
        self.tokens.get(id)
    }
}
