use crate::repository::voting::model::Voting;
use crate::repository::voting::types::VotingSort;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{VotingConfigId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingRepository {
    votings: HashMap<VotingId, Voting>,
    id_gen: IdGenerator,

    votings_by_voting_config_index: BTreeMap<VotingConfigId, BTreeSet<VotingId>>,

    votings_sorted_by_created_at_index: Vec<(u64, VotingId)>,
    votings_sorted_by_updated_at_index: Vec<(u64, VotingId)>,
}

impl Repository<Voting, VotingId, (), VotingSort> for VotingRepository {
    fn save(&mut self, mut it: Voting) -> VotingId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
            self.add_to_index(&it);
        } else {
            self.remove_from_updated_at_index(&it);
        }

        self.add_to_updated_at_index(&it);

        let id = it.get_id().unwrap();
        self.votings.insert(id, it);

        id
    }

    fn delete(&mut self, id: &VotingId) -> Option<Voting> {
        let it = self.votings.remove(id)?;
        self.remove_from_index(&it);
        self.remove_from_updated_at_index(&it);

        Some(it)
    }

    fn get(&self, id: &VotingId) -> Option<Voting> {
        self.votings.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), VotingSort>) -> Page<Voting> {
        match page_req.sort {
            VotingSort::None => {
                let (has_next, iter) = self.votings.iter().get_page(page_req);
                let data = iter.map(|(_, it)| it.clone()).collect();

                Page::new(data, has_next)
            }
            VotingSort::CreatedAt => {
                let (has_next, iter) = self
                    .votings_sorted_by_created_at_index
                    .iter()
                    .get_page(page_req);
                let data = iter.map(|(_, id)| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            }
            VotingSort::UpdatedAt => {
                let (has_next, iter) = self
                    .votings_sorted_by_updated_at_index
                    .iter()
                    .get_page(page_req);
                let data = iter.map(|(_, id)| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            }
        }
    }
}

impl VotingRepository {
    pub fn voting_config_has_related_votings(&self, voting_config_id: &VotingConfigId) -> bool {
        if let Some(index) = self.votings_by_voting_config_index.get(voting_config_id) {
            !index.is_empty()
        } else {
            false
        }
    }

    fn add_to_index(&mut self, voting: &Voting) {
        self.votings_by_voting_config_index
            .entry(*voting.get_voting_config_id())
            .or_default()
            .insert(voting.get_id().unwrap());

        let idx = match self
            .votings_sorted_by_created_at_index
            .binary_search_by(|(created_at, _)| created_at.cmp(&voting.get_created_at()))
        {
            Ok(idx) => idx,
            Err(idx) => idx,
        };

        self.votings_sorted_by_created_at_index
            .insert(idx, (voting.get_created_at(), voting.get_id().unwrap()))
    }

    fn remove_from_index(&mut self, voting: &Voting) {
        self.votings_by_voting_config_index
            .get_mut(voting.get_voting_config_id())
            .unwrap()
            .remove(&voting.get_id().unwrap());

        let (idx, _) = self
            .votings_sorted_by_created_at_index
            .iter()
            .enumerate()
            .find(|(_, (_, id))| *id == voting.get_id().unwrap())
            .unwrap();

        self.votings_sorted_by_created_at_index.remove(idx);
    }

    fn add_to_updated_at_index(&mut self, voting: &Voting) {
        let idx = match self
            .votings_sorted_by_updated_at_index
            .binary_search_by(|(updated_at, _)| updated_at.cmp(&voting.get_updated_at()))
        {
            Ok(idx) => idx,
            Err(idx) => idx,
        };

        self.votings_sorted_by_updated_at_index
            .insert(idx, (voting.get_updated_at(), voting.get_id().unwrap()))
    }

    fn remove_from_updated_at_index(&mut self, voting: &Voting) {
        let (idx, _) = self
            .votings_sorted_by_updated_at_index
            .iter()
            .enumerate()
            .find(|(_, (_, id))| *id == voting.get_id().unwrap())
            .unwrap();

        self.votings_sorted_by_updated_at_index.remove(idx);
    }
}
