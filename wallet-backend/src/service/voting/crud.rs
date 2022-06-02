use crate::repository::choice::model::Choice;
use crate::repository::voting::model::Voting;
use crate::repository::voting_config::model::VotingConfig;
use crate::service::choice::types::ChoiceService;
use crate::service::voting::types::{VotingError, VotingService};
use crate::{cron_dequeue, CronService};
use candid::Principal;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::{VotingConfigId, VotingId};

impl VotingService {
    pub fn create_voting(
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        winners_need: u32,
        proposer: Principal,
        timestamp: u64,
    ) -> Result<VotingId, VotingError> {
        let vc = VotingConfig::repo()
            .get(&voting_config_id)
            .ok_or(VotingError::VotingConfigNotFound(voting_config_id))?;

        VotingService::assert_winners_need_is_fine(&vc, winners_need)?;

        let voting = Voting::new(
            voting_config_id,
            name,
            description,
            winners_need,
            proposer,
            timestamp,
        )
        .map_err(VotingError::ValidationError)?;

        let id = Voting::repo().save(voting);
        let mut voting = Voting::repo().get(&id).unwrap();

        let (rejection_choice, approval_choice) =
            ChoiceService::create_rejection_and_approval_choices(id);
        voting.init_rejection_and_approval_choices(rejection_choice, approval_choice);

        CronService::schedule_round_end(&mut voting, &vc, timestamp);

        Ok(Voting::repo().save(voting))
    }

    pub fn update_voting(
        id: &VotingId,
        new_name: Option<String>,
        new_description: Option<String>,
        new_winners_need: Option<u32>,
        timestamp: u64,
    ) -> Result<(), VotingError> {
        let mut voting = VotingService::get_voting(id)?;

        // unwrapping because it should exist if it is listed
        let vc = VotingConfig::repo()
            .get(voting.get_voting_config_id())
            .unwrap();

        if let Some(winners_need) = &new_winners_need {
            VotingService::assert_winners_need_is_fine(&vc, *winners_need)?;
        }

        voting
            .update(new_name, new_description, new_winners_need, timestamp)
            .map_err(VotingError::ValidationError)?;
        Voting::repo().save(voting);

        Ok(())
    }

    pub fn delete_voting(id: &VotingId) -> Result<(), VotingError> {
        let voting = Voting::repo().delete(id).unwrap();

        if let Some(task_id) = voting.get_cron_task() {
            cron_dequeue(task_id);
        }

        Choice::repo()
            .delete(&voting.get_rejection_choice())
            .unwrap();

        Choice::repo()
            .delete(&voting.get_approval_choice())
            .unwrap();

        for result in voting.get_losers() {
            for choice in result.get_choices() {
                Choice::repo().delete(choice).unwrap();
            }
        }

        for result in voting.get_winners() {
            for choice in result.get_choices() {
                Choice::repo().delete(choice).unwrap();
            }
        }

        for choice in voting.get_choices() {
            Choice::repo().delete(choice).unwrap();
        }

        Ok(())
    }

    #[inline(always)]
    pub fn get_voting(id: &VotingId) -> Result<Voting, VotingError> {
        Voting::repo()
            .get(id)
            .ok_or(VotingError::VotingNotFound(*id))
    }

    #[inline(always)]
    pub fn list_votings(page_req: &PageRequest<(), ()>) -> Page<Voting> {
        Voting::repo().list(page_req)
    }
}
