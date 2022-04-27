use crate::repository::choice::model::Choice;
use crate::service::choice::types::{ChoiceError, ChoiceService};
use candid::Principal;
use shared::mvc::{HasRepository, Repository};
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, VotingId};

impl ChoiceService {
    pub fn create_choice(
        name: String,
        description: String,
        program: Program,
        voting_id: VotingId,
        creator: Principal,
    ) -> Result<ChoiceId, ChoiceError> {
        // TODO: get voting, get voting-config, check if the program fits permissions of the config
        // TODO: also check if the creator is listed in editors of voting config (or it is the creator of the voting)

        let choice = Choice::new(name, description, program, voting_id)
            .map_err(ChoiceError::ValidationError)?;

        Ok(Choice::repo().save(choice))
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
        editor: Principal,
    ) -> Result<(), ChoiceError> {
        let mut choice = Choice::repo().get(choice_id).ok_or(ChoiceError::ChoiceNotFound(*choice_id))?;
        // TODO: check program and editor

        choice
            .update(new_name, new_description, new_program)
            .map_err(ChoiceError::ValidationError)?;

        Choice::repo().save(choice);

        Ok(())
    }
}
