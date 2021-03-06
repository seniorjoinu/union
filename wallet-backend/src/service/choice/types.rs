use crate::repository::choice::model::Choice;
use crate::repository::token::model::Token;
use crate::service::voting::types::VotingError;
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{ChoiceId, VotingId};
use shared::validation::ValidationError;

#[derive(Debug)]
pub enum ChoiceError {
    ValidationError(ValidationError),
    ChoiceNotFound(ChoiceId),
    VotingError(VotingError),
    UnableToEditVoting(VotingId),
    ProgramNotAllowedByVotingConfig,
}

pub struct ChoiceService;

impl ChoiceService {
    pub fn reset(choice: &Choice) {
        for (_, token_id) in choice.list_tokens_by_group() {
            let mut token = Token::repo().get(token_id).unwrap();
            token.reset();
            Token::repo().save(token);
        }
    }
}
