use crate::repository::choice::model::Choice;
use crate::repository::nested_voting::types::RemoteVotingId;
use crate::repository::token::model::Token;
use crate::repository::token::types::ChoiceOrGroup;
use crate::service::choice::types::{ChoiceError, ChoiceService};
use crate::service::token::types::TokenService;
use candid::Principal;
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::wallet::{ChoiceId, GroupId, Shares, VotingId};
use std::collections::BTreeMap;

pub mod crud;
pub mod types;

impl ChoiceService {
    pub fn get_voting_choice(
        choice_id: &ChoiceId,
        voting_id: &RemoteVotingId,
    ) -> Result<Choice, ChoiceError> {
        let choice = ChoiceService::get_choice(choice_id)?;

        if choice.get_voting_id() != *voting_id {
            Err(ChoiceError::ChoiceNotFound(*choice_id))
        } else {
            Ok(choice)
        }
    }

    pub fn get_token_for_group(choice: &mut Choice, group_id: GroupId) -> Token {
        let token_id = if let Some(token_id) = choice.get_shares_by_group_token(&group_id) {
            *token_id
        } else {
            let token_id = TokenService::create_token(
                ChoiceOrGroup::Choice(choice.get_id().unwrap(), group_id),
                false,
                false,
            );
            choice.set_shares_by_group_token(group_id, token_id);

            token_id
        };

        Token::repo().get(&token_id).unwrap()
    }

    pub fn list_total_voted_shares_by_group(choice: &Choice) -> BTreeMap<GroupId, Shares> {
        choice
            .list_tokens_by_group()
            .iter()
            .map(|(gop, token_id)| {
                let token = Token::repo().get(token_id).unwrap();

                (*gop, token.total_supply())
            })
            .collect()
    }

    pub fn cast_vote(token: &mut Token, voter: Principal, voting_power: Shares) {
        token.mint(voter, voting_power);
        Token::repo().add_to_principal_index(voter, token.get_id().unwrap());
    }

    pub fn revert_vote(token: &mut Token, voter: Principal) {
        let shares = token.balance_of(&voter);
        token.burn(voter, shares).unwrap();
        Token::repo().remove_from_principal_index(&voter, &token.get_id().unwrap());
    }
}
