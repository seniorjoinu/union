use crate::repository::token::model::Token;
use crate::repository::token::types::{ChoiceOrGroup, TokenFilter, TokenId};
use crate::service::token::types::TokenService;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};

impl TokenService {
    pub fn create_token(cog: ChoiceOrGroup, acceptable: bool, transferable: bool) -> TokenId {
        let token = Token::new(cog, acceptable, transferable);
        Token::repo().save(token)
    }

    pub fn list_tokens(page_req: &PageRequest<TokenFilter, ()>) -> Page<TokenId> {
        let page = Token::repo().list(page_req);
        let data = page
            .data
            .into_iter()
            .map(|it| it.get_id().unwrap())
            .collect();

        Page::new(data, page.has_next)
    }
}
