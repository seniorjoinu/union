use crate::repository::token::model::Token;
use crate::repository::token::types::{TokenFilter, TokenId};
use crate::service::token::types::{TokenError, TokenService};
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};

impl TokenService {
    pub fn create_token(acceptable: bool, transferable: bool) -> TokenId {
        let token = Token::new(acceptable, transferable);
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
