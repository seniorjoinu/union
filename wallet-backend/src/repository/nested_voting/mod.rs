use crate::repository::nested_voting::model::NestedVoting;
use crate::repository::nested_voting::types::{NestedVotingFilter, NestedVotingId, RemoteVotingId};
use crate::repository::nested_voting_config::types::NestedVotingConfigId;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct NestedVotingRepository {
    votings: HashMap<NestedVotingId, NestedVoting>,
    id_gen: IdGenerator,

    nested_voting_by_remote_voting_index: BTreeMap<RemoteVotingId, NestedVotingId>,
    nested_votings_by_nested_voting_config_index:
        BTreeMap<NestedVotingConfigId, BTreeSet<NestedVotingId>>,
}

impl Repository<NestedVoting, NestedVotingId, NestedVotingFilter, ()> for NestedVotingRepository {
    fn save(&mut self, mut it: NestedVoting) -> NestedVotingId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
            self.add_to_index(&it);
        }

        let id = it.get_id().unwrap();
        self.votings.insert(id, it);

        id
    }

    fn delete(&mut self, id: &NestedVotingId) -> Option<NestedVoting> {
        let it = self.votings.remove(id)?;
        self.remove_from_index(&it);

        Some(it)
    }

    fn get(&self, id: &NestedVotingId) -> Option<NestedVoting> {
        self.votings.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<NestedVotingFilter, ()>) -> Page<NestedVoting> {
        if let Some(nested_voting_config_id) = page_req.filter.nested_voting_config {
            if let Some(index) = self
                .nested_votings_by_nested_voting_config_index
                .get(&nested_voting_config_id)
            {
                let (has_next, iter) = index.iter().get_page(page_req);
                let data = iter.map(|id| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            } else {
                Page::empty()
            }
        } else {
            let (has_next, iter) = self.votings.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            Page::new(data, has_next)
        }
    }
}

impl NestedVotingRepository {
    pub fn get_by_remote_voting_id(&self, remote_voting_id: &RemoteVotingId) -> Option<NestedVoting> {
        self.nested_voting_by_remote_voting_index.get(remote_voting_id).map(|id| self.get(id).unwrap())
    }
    
    fn add_to_index(&mut self, it: &NestedVoting) {
        let prev = self
            .nested_voting_by_remote_voting_index
            .insert(it.get_remote_voting_id(), it.get_id().unwrap());

        // TODO: this should be an error, not a panic...
        assert!(
            prev.is_none(),
            "Only one nested voting for a unique remote voting allowed"
        );

        self.nested_votings_by_nested_voting_config_index
            .entry(it.get_voting_config_id())
            .or_default()
            .insert(it.get_id().unwrap());
    }

    fn remove_from_index(&mut self, it: &NestedVoting) {
        self.nested_voting_by_remote_voting_index
            .remove(&it.get_remote_voting_id())
            .unwrap();
        self.nested_votings_by_nested_voting_config_index
            .get_mut(&it.get_voting_config_id())
            .unwrap()
            .remove(&it.get_id().unwrap());
    }
}
