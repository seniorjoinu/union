use crate::repository::voting::types::{
    StartCondition, Vote, Voting, VotingRepositoryError, VotingStatus,
};
use crate::repository::voting_config::types::VotesFormula;
use candid::{CandidType, Deserialize, Principal};
use shared::types::wallet::{ChoiceExternal, ChoiceId, Shares, VotingConfigId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::mem;

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingRepository {
    votings: HashMap<VotingId, Voting>,

    voting_id_counter: VotingId,
}

impl VotingRepository {
    pub fn create_voting(
        &mut self,
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        start_condition: StartCondition,
        winners_need: usize,
        custom_choices: Vec<ChoiceExternal>,
        proposer: Principal,
        timestamp: u64,
    ) -> Result<VotingId, VotingRepositoryError> {
        let id = self.generate_voting_id();

        let voting = Voting::new(
            id,
            voting_config_id,
            name,
            description,
            start_condition,
            winners_need,
            custom_choices,
            proposer,
            timestamp,
        )?;

        self.votings.insert(id, voting);

        Ok(id)
    }

    pub fn update_voting(
        &mut self,
        voting_id: &VotingId,
        new_name: Option<String>,
        new_description: Option<String>,
        new_start_condition: Option<StartCondition>,
        new_winners_need: Option<usize>,
        new_custom_choices: Option<Vec<ChoiceExternal>>,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.update(
            new_name,
            new_description,
            new_start_condition,
            new_winners_need,
            new_custom_choices,
            timestamp,
        )?;

        Ok(())
    }

    #[inline(always)]
    pub fn delete_voting(&mut self, voting_id: &VotingId) -> Result<Voting, VotingRepositoryError> {
        self.votings
            .remove(voting_id)
            .ok_or(VotingRepositoryError::VotingNotFound(*voting_id))
    }

    #[inline(always)]
    pub fn cast_vote(
        &mut self,
        voting_id: &VotingId,
        vote: Vote,
        gop_total_supply: Shares,
        timestamp: u64,
    ) -> Result<&mut Voting, VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.cast_vote(vote, gop_total_supply, timestamp)?;

        Ok(voting)
    }

    #[inline(always)]
    pub fn approve_voting(
        &mut self,
        voting_id: &VotingId,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.approve(timestamp)
    }

    #[inline(always)]
    pub fn reject_voting(
        &mut self,
        voting_id: &VotingId,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.reject(timestamp)
    }

    #[inline(always)]
    pub fn start_round(
        &mut self,
        voting_id: &VotingId,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.start_round(timestamp)
    }

    #[inline(always)]
    pub fn try_finish_by_vote_casting(
        &mut self,
        voting_id: &VotingId,
        winners_opt: Option<Vec<ChoiceId>>,
        next_round_opt: Option<Vec<ChoiceId>>,
        timestamp: u64,
    ) -> Result<bool, VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        assert_ne!(winners_opt.is_some(), next_round_opt.is_some());
        assert!(matches!(voting.status, VotingStatus::Round(_)));

        if let Some(winners) = winners_opt {
            for choice_id in winners {
                let choice = voting.choices.remove(&choice_id).unwrap();

                // un-account voted shares
                for (gop, voted_shares) in &choice.voted_shares_sum {
                    let total_shares = voting.total_non_rejection.remove(gop).unwrap();
                    voting
                        .total_non_rejection
                        .insert(*gop, total_shares - voted_shares.clone());
                }

                voting.winners.insert(choice_id, choice);

                if voting.winners.len() == voting.winners_need {
                    let rest_choices = mem::replace(&mut voting.choices, BTreeMap::new());
                    voting.losers.extend(rest_choices);

                    voting.finish_success(timestamp)?;
                    // TODO: what if we have more winners than we need?
                    return Ok(false);
                }
            }

            voting.next_round(timestamp)?;
            return Ok(true);
        }

        if let Some(next_round) = next_round_opt {
            let choices = mem::replace(&mut voting.choices, BTreeMap::new());

            for (id, choice) in choices {
                if next_round.contains(&id) {
                    voting.choices.insert(id, choice);
                } else {
                    // un-account voted shares
                    for (gop, voted_shares) in &choice.voted_shares_sum {
                        let total_shares = voting.total_non_rejection.remove(gop).unwrap();
                        voting
                            .total_non_rejection
                            .insert(*gop, total_shares - voted_shares.clone());
                    }

                    voting.losers.insert(id, choice);
                }
            }

            return if voting.choices.len() + voting.winners.len() < voting.winners_need {
                voting.finish_fail(String::from("Not enough choices to continue"), timestamp)?;

                Ok(false)
            } else {
                voting.next_round(timestamp)?;

                Ok(true)
            };
        }

        unreachable!();
    }

    #[inline(always)]
    pub fn finish_voting_success(
        &mut self,
        voting_id: &VotingId,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.finish_success(timestamp)
    }

    #[inline(always)]
    pub fn finish_voting_fail(
        &mut self,
        voting_id: &VotingId,
        reason_msg: String,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.finish_fail(reason_msg, timestamp)
    }

    #[inline(always)]
    pub fn get_voting(&mut self, id: &VotingId) -> Result<&Voting, VotingRepositoryError> {
        self.votings
            .get(id)
            .ok_or(VotingRepositoryError::VotingNotFound(*id))
    }

    #[inline(always)]
    pub fn get_voting_mut(&mut self, id: &VotingId) -> Result<&mut Voting, VotingRepositoryError> {
        self.votings
            .get_mut(id)
            .ok_or(VotingRepositoryError::VotingNotFound(*id))
    }

    #[inline(always)]
    fn generate_voting_id(&mut self) -> VotingId {
        let id = self.voting_id_counter;
        self.voting_id_counter += 1;

        id
    }
}
