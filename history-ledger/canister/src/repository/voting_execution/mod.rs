use crate::repository::voting_execution::types::{
    VotingExecutionRecord, VotingExecutionRecordExternal, VotingExecutionRecordFilter,
    VotingExecutionRepositoryError,
};
use candid::{CandidType, Deserialize, Principal};
use history_ledger_client::api::{VotingExecutionRecordExternal, VotingExecutionRecordFilter};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::remote_call::{Program, ProgramExecutionResult, RemoteCallEndpoint};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::types::wallet::{ChoiceId, ChoiceView, VotingConfigId, VotingId};
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
        choice: ChoiceView,
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

    pub fn get_records_cloned(
        &self,
        page_req: PageRequest<VotingExecutionRecordFilter, ()>,
    ) -> Page<VotingExecutionRecordExternal> {
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
            Some(
                self.records_by_timestamp_index
                    .get_by_interval(&interval.from, &interval.to)
                    .into_iter()
                    .map(|it| it.clone())
                    .collect::<BTreeSet<_>>(),
            )
        } else {
            None
        };

        if set_1_opt.is_none() && set_2_opt.is_none() && set_3_opt.is_none() && set_4_opt.is_none()
        {
            let (has_next, iter) = self.records.iter().get_page(&page_req);
            let data = iter.map(|(_, it)| it.to_external_cloned()).collect();

            return Page { has_next, data };
        }

        let mut total_set = BTreeSet::new();

        if let Some(set_1) = set_1_opt {
            if !set_1.is_empty() {
                total_set.extend(set_1);
            }
        }

        if let Some(set_2) = set_2_opt {
            if total_set.is_empty() {
                if !set_2.is_empty() {
                    total_set.extend(set_2);
                }
            } else if !set_2.is_empty() {
                total_set = total_set.intersection(set_2).map(|it| *it).collect();
            }
        }

        if let Some(set_3) = set_3_opt {
            if total_set.is_empty() {
                if !set_3.is_empty() {
                    total_set.extend(set_3);
                }
            } else if !set_3.is_empty() {
                total_set = total_set.intersection(set_3).map(|it| *it).collect();
            }
        }

        if let Some(set_4) = set_4_opt {
            if total_set.is_empty() {
                if !set_4.is_empty() {
                    total_set.extend(&set_4);
                }
            } else if !set_4.is_empty() {
                total_set = total_set.intersection(&set_4).map(|it| *it).collect();
            }
        }

        let (has_next, iter) = total_set.iter().get_page(&page_req);
        let data = iter
            .map(|id| self.get(id).unwrap().to_external_cloned())
            .collect();

        Page { has_next, data }
    }

    pub fn get_winners_cloned(
        &self,
        voting_id: &VotingId,
        page_req: PageRequest<(), ()>,
    ) -> Result<Page<(ChoiceId, ChoiceView)>, VotingExecutionRepositoryError> {
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
