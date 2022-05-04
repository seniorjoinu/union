use crate::repository::choice::model::Choice;
use crate::repository::choice::types::ChoiceFilter;
use crate::repository::token::model::Token;
use crate::repository::voting::model::Voting;
use crate::service::choice::types::{ChoiceError, ChoiceService};
use crate::service::voting::types::VotingService;
use crate::service::voting_config::types::VotingConfigService;
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, VotingId};

impl ChoiceService {
    pub fn create_choice(
        name: String,
        description: String,
        program: Program,
        voting_id: VotingId,
        timestamp: u64,
    ) -> Result<ChoiceId, ChoiceError> {
        let mut voting = VotingService::get_voting(&voting_id).map_err(ChoiceError::VotingError)?;
        let vc = VotingConfigService::get_voting_config(voting.get_voting_config_id()).unwrap();

        if !VotingService::is_editable(&voting) {
            return Err(ChoiceError::UnableToEditVoting(voting_id));
        }

        if !VotingConfigService::does_program_fit(&vc, &program) {
            return Err(ChoiceError::ProgramNotAllowedByVotingConfig);
        }

        VotingService::reset_approval_choice(&voting);

        let choice = Choice::new(name, description, program, voting_id)
            .map_err(ChoiceError::ValidationError)?;

        let id = Choice::repo().save(choice);

        voting.add_choice(id, timestamp);
        Voting::repo().save(voting);

        Ok(id)
    }

    pub fn create_rejection_and_approval_choices(voting_id: VotingId) -> (ChoiceId, ChoiceId) {
        let rejection_choice = Choice::new_rejection(voting_id);
        let approval_choice = Choice::new_approval(voting_id);

        let rejection_choice_id = Choice::repo().save(rejection_choice);
        let approval_choice_id = Choice::repo().save(approval_choice);

        (rejection_choice_id, approval_choice_id)
    }

    pub fn update_choice(
        choice_id: &ChoiceId,
        new_name: Option<String>,
        new_description: Option<String>,
        new_program: Option<Program>,
    ) -> Result<(), ChoiceError> {
        let mut choice = ChoiceService::get_choice(choice_id)?;

        let voting = VotingService::get_voting(choice.get_voting_id()).unwrap();
        let vc = VotingConfigService::get_voting_config(voting.get_voting_config_id()).unwrap();

        if !VotingService::is_editable(&voting) {
            return Err(ChoiceError::UnableToEditVoting(*choice.get_voting_id()));
        }

        if let Some(program) = &new_program {
            if !VotingConfigService::does_program_fit(&vc, program) {
                return Err(ChoiceError::ProgramNotAllowedByVotingConfig);
            }
        }

        VotingService::reset_approval_choice(&voting);

        choice
            .update(new_name, new_description, new_program)
            .map_err(ChoiceError::ValidationError)?;

        Choice::repo().save(choice);

        Ok(())
    }

    pub fn delete_choice(choice_id: &ChoiceId, voting_id: &VotingId) -> Result<(), ChoiceError> {
        let choice = ChoiceService::get_choice(choice_id)?;

        if choice.get_voting_id() != voting_id {
            return Err(ChoiceError::ChoiceNotFound(*choice_id));
        }

        let voting = VotingService::get_voting(choice.get_voting_id()).unwrap();

        if !VotingService::is_editable(&voting) {
            return Err(ChoiceError::UnableToEditVoting(*choice.get_voting_id()));
        }

        for (_, token_id) in choice.list_tokens_by_group() {
            Token::repo().delete(token_id).unwrap();
        }

        Choice::repo().delete(choice_id).unwrap();

        Ok(())
    }

    #[inline(always)]
    pub fn get_choice(id: &ChoiceId) -> Result<Choice, ChoiceError> {
        Choice::repo()
            .get(id)
            .ok_or(ChoiceError::ChoiceNotFound(*id))
    }

    #[inline(always)]
    pub fn list_choices(page_req: &PageRequest<ChoiceFilter, ()>) -> Page<Choice> {
        Choice::repo().list(page_req)
    }
}
