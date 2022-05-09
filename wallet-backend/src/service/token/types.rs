use crate::repository::token::types::TokenId;

pub struct TokenService;

#[derive(Debug)]
pub enum TokenError {
    TokenNotFound(TokenId),
}
