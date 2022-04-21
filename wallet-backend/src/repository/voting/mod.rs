use crate::repository::group::types::Shares;
use crate::repository::voting::types::{
    ChoiceExternal, StartCondition, Vote, Voting, VotingId, VotingRepositoryError,
    VOTING_DESCRIPTION_MAX_LEN, VOTING_DESCRIPTION_MIN_LEN, VOTING_NAME_MAX_LEN,
    VOTING_NAME_MIN_LEN,
};
use crate::repository::voting_config::types::{VotesFormula, VotingConfigId};
use candid::{CandidType, Deserialize, Principal};
use std::borrow::Borrow;
use std::collections::HashMap;

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
        votes_formula: VotesFormula,
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
            votes_formula,
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
        new_votes_formula: Option<VotesFormula>,
        new_winners_need: Option<usize>,
        new_custom_choices: Option<Vec<ChoiceExternal>>,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.update(
            new_name,
            new_description,
            new_start_condition,
            new_votes_formula,
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
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.cast_vote(vote, gop_total_supply, timestamp)?;

        Ok(())
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
    pub fn next_round(
        &mut self,
        voting_id: &VotingId,
        timestamp: u64,
    ) -> Result<(), VotingRepositoryError> {
        let voting = self.get_voting_mut(voting_id)?;

        voting.next_round(timestamp)
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
    fn get_voting_mut(&mut self, id: &VotingId) -> Result<&mut Voting, VotingRepositoryError> {
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
