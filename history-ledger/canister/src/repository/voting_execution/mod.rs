use crate::repository::voting_execution::types::{
    VotingExecutionRecord, VotingExecutionRecordFilter, VotingExecutionRepositoryError,
};
use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::remote_call::{Program, ProgramExecutionResult, RemoteCallEndpoint};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::types::wallet::{ChoiceExternal, ChoiceId, VotingConfigId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingExecutionRepository {
    pub records: HashMap<VotingId, VotingExecutionRecord>,

    pub records_by_voting_config_index: BTreeMap<VotingConfigId, BTreeSet<VotingId>>,
    pub records_by_canister_id_index: BTreeMap<Principal, BTreeSet<VotingId>>,
    pub records_by_endpoint_index: BTreeMap<RemoteCallEndpoint, BTreeSet<VotingId>>,
    pub records_by_timestamp_index: SortedByTimestamp<VotingId>,
}

impl VotingExecutionRepository {
    pub fn push(
        &mut self,
        voting_id: VotingId,
        voting_config_id: VotingConfigId,
        name: String,
        description: String,
        timestamp: u64,
        winners_count: usize,
    ) -> Result<(), VotingExecutionRepositoryError> {
        self.get(&voting_id)?;

        self.add_to_voting_config_index(voting_config_id, voting_id);
        self.add_to_timestamp_index(timestamp, voting_id);

        self.records.insert(
            voting_id,
            VotingExecutionRecord::new(
                voting_id,
                voting_config_id,
                name,
                description,
                timestamp,
                winners_count,
            ),
        );

        Ok(())
    }

    pub fn add_winner(
        &mut self,
        voting_id: VotingId,
        choice_id: ChoiceId,
        choice: ChoiceExternal,
    ) -> Result<(), VotingExecutionRepositoryError> {
        let voting = self.get_mut(&voting_id)?;

        if voting.has_winner(&choice_id) {
            return Err(VotingExecutionRepositoryError::ChoiceAlreadyExists(
                voting_id, choice_id,
            ));
        }

        if let Program::RemoteCallSequence(seq) = &choice.program {
            let mut endpoints = BTreeSet::new();
            let mut canister_ids = BTreeSet::new();

            for call in seq {
                endpoints.insert(call.endpoint.clone());
                canister_ids.insert(call.endpoint.canister_id);
            }

            for e in endpoints {
                self.add_to_endpoint_index(e, voting_id);
            }

            for c in canister_ids {
                self.add_to_canister_id_index(c, voting_id);
            }
        }

        voting.add_winner(choice_id, choice);

        Ok(())
    }

    pub fn add_result(
        &mut self,
        voting_id: VotingId,
        choice_id: ChoiceId,
        result: ProgramExecutionResult,
    ) -> Result<(), VotingExecutionRepositoryError> {
        let voting = self.get_mut(&voting_id)?;

        if voting.has_result(&choice_id) {
            return Err(VotingExecutionRepositoryError::ResultAlreadyExists(
                voting_id, choice_id,
            ));
        }

        voting.add_result(choice_id, result);

        Ok(())
    }

    pub fn get_records_cloned(&self, page_req: PageRequest<VotingExecutionRecordFilter, ()>) {
        let set_1_opt = if let Some(voting_config_id) = &page_req.filter.voting_config_id {
            self.records_by_voting_config_index.get(voting_config_id)
        } else {
            None
        };

        let set_2_opt = if let Some(canister_id) = &page_req.filter.canister_id {
            self.records_by_canister_id_index.get(canister_id)
        } else {
            None
        };

        let set_3_opt = if let Some(endpoint) = &page_req.filter.endpoint {
            self.records_by_endpoint_index.get(endpoint)
        } else {
            None
        };

        let set_4_opt = if let Some(interval) = &page_req.filter.time_interval {
            self.records_by_timestamp_index
                .get_interval(&interval.from, &interval.to)
        } else {
            Vec::new()
        };

        // TODO: solve this
        // TODO: fix others (they're probably wrong because of how 'has_next' works)
    }

    pub fn get_winners_cloned(
        &self,
        voting_id: &VotingId,
        page_req: PageRequest<(), ()>,
    ) -> Result<Page<(ChoiceId, ChoiceExternal)>, VotingExecutionRepositoryError> {
        let voting = self.get(voting_id)?;

        let (has_next, iter) = voting.winners.iter().get_page(&page_req);
        let data = iter.map(|(id, res)| (*id, res.clone())).collect();

        Ok(Page { has_next, data })
    }

    pub fn get_results_cloned(
        &self,
        voting_id: &VotingId,
        page_req: PageRequest<(), ()>,
    ) -> Result<Page<(ChoiceId, ProgramExecutionResult)>, VotingExecutionRepositoryError> {
        let voting = self.get(voting_id)?;

        let (has_next, iter) = voting.results.iter().get_page(&page_req);
        let data = iter.map(|(id, res)| (*id, res.clone())).collect();

        Ok(Page { has_next, data })
    }

    #[inline(always)]
    fn add_to_voting_config_index(
        &mut self,
        voting_config_id: VotingConfigId,
        voting_id: VotingId,
    ) {
        self.records_by_voting_config_index
            .entry(voting_config_id)
            .or_default()
            .insert(voting_id);
    }

    #[inline(always)]
    fn add_to_canister_id_index(&mut self, canister_id: Principal, voting_id: VotingId) {
        self.records_by_canister_id_index
            .entry(canister_id)
            .or_default()
            .insert(voting_id);
    }

    #[inline(always)]
    fn add_to_endpoint_index(&mut self, endpoint: RemoteCallEndpoint, voting_id: VotingId) {
        self.records_by_endpoint_index
            .entry(endpoint)
            .or_default()
            .insert(voting_id);
    }

    #[inline(always)]
    fn add_to_timestamp_index(&mut self, timestamp: u64, voting_id: VotingId) {
        self.records_by_timestamp_index.push(timestamp, voting_id);
    }

    #[inline(always)]
    fn get(
        &self,
        voting_id: &VotingId,
    ) -> Result<&VotingExecutionRecord, VotingExecutionRepositoryError> {
        self.records
            .get(voting_id)
            .ok_or(VotingExecutionRepositoryError::RecordAlreadyExists(
                *voting_id,
            ))
    }

    #[inline(always)]
    fn get_mut(
        &mut self,
        voting_id: &VotingId,
    ) -> Result<&mut VotingExecutionRecord, VotingExecutionRepositoryError> {
        self.records
            .get_mut(voting_id)
            .ok_or(VotingExecutionRepositoryError::RecordAlreadyExists(
                *voting_id,
            ))
    }
}
