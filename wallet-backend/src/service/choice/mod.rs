use crate::repository::choice::model::Choice;
use crate::repository::token::model::Token;
use crate::service::choice::types::ChoiceService;
use crate::service::token::types::TokenService;
use candid::Principal;
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{GroupOrProfile, Shares};

pub mod crud;
pub mod types;

impl ChoiceService {
    pub fn get_token_for_gop(choice: &mut Choice, gop: GroupOrProfile) -> Token {
        let token_id = if let Some(token_id) = choice.get_shares_by_gop_token(&gop) {
            *token_id
        } else {
            let token_id = TokenService::create_token(false, false);
            choice.set_shares_by_gop_token(gop, token_id);

            token_id
        };

        Token::repo().get(&token_id).unwrap()
    }

    pub fn cast_vote(token: &mut Token, voter: Principal, voting_power: Shares) {
        token.mint(voter, voting_power);
    }

    pub fn revert_vote(token: &mut Token, voter: Principal) {
        let shares = token.balance_of(&voter);
        token.burn(voter, shares).unwrap();
    }
}
