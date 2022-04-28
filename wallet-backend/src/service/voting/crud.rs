use crate::repository::choice::model::Choice;
use crate::repository::group::model::Group;
use crate::repository::profile::model::Profile;
use crate::repository::voting::model::Voting;
use crate::repository::voting::types::{StartCondition, VotingStatus};
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{EditorConstraint, ProposerConstraint};
use crate::service::choice::types::ChoiceService;
use crate::service::group::types::GroupService;
use crate::service::voting::types::{VotingError, VotingService};
use candid::Principal;
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::wallet::{VotingConfigId, VotingId};

impl VotingService {
    pub fn create_voting(
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        start_condition: StartCondition,
        winners_need: usize,
        proposer: Principal,
        timestamp: u64,
    ) -> Result<VotingId, VotingError> {
        let vc = VotingConfig::repo()
            .get(&voting_config_id)
            .ok_or(VotingError::VotingConfigNotFound(voting_config_id))?;

        VotingService::assert_winners_need_is_fine(&vc, winners_need)?;
        VotingService::assert_proposer_can_propose(&vc, proposer)?;

        let mut voting = Voting::new(
            voting_config_id,
            name,
            description,
            start_condition,
            winners_need,
            proposer,
            timestamp,
        )
        .map_err(VotingError::ValidationError)?;

        let (rejection_choice, approval_choice) =
            ChoiceService::create_rejection_and_approval_choices(voting.get_id().unwrap());
        voting.init_rejection_and_approval_choices(rejection_choice, approval_choice);

        Ok(Voting::repo().save(voting))
    }

    pub fn update_voting(
        voting: &mut Voting,
        new_name: Option<String>,
        new_description: Option<String>,
        new_start_condition: Option<StartCondition>,
        new_winners_need: Option<usize>,
        editor: Principal,
        timestamp: u64,
    ) -> Result<(), VotingError> {
        // unwrapping because it should exist if it is listed
        let vc = VotingConfig::repo()
            .get(&voting.get_voting_config_id())
            .unwrap();

        if let Some(winners_need) = &new_winners_need {
            VotingService::assert_winners_need_is_fine(&vc, *winners_need)?;
        }

        VotingService::assert_editor_can_edit(&vc, editor, voting.get_proposer())?;

        voting
            .update(
                new_name,
                new_description,
                new_start_condition,
                new_winners_need,
                timestamp,
            )
            .map_err(VotingError::ValidationError)
    }

    pub fn delete_voting(id: &VotingId, deleter: Principal) -> Result<(), VotingError> {
        let voting = Voting::repo()
            .get(id)
            .ok_or(VotingError::VotingNotFound(*id))?;
        if !matches!(voting.get_status(), VotingStatus::Created) {
            return Err(VotingError::VotingInInvalidStatus(*id));
        }
        let vc = VotingConfig::repo()
            .get(voting.get_voting_config_id())
            .unwrap();
        VotingService::assert_editor_can_edit(&vc, deleter, voting.get_proposer())?;

        let voting = Voting::repo().delete(id).unwrap();

        Choice::repo()
            .delete(voting.get_rejection_choice())
            .unwrap();
        Choice::repo().delete(voting.get_approval_choice()).unwrap();

        for choice in voting.get_losers() {
            Choice::repo().delete(choice).unwrap();
        }

        for choice in voting.get_winners() {
            Choice::repo().delete(choice).unwrap();
        }

        for choice in voting.get_choices() {
            Choice::repo().delete(choice).unwrap();
        }

        Ok(())
    }
}
