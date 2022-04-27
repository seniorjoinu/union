use crate::repository::voting::model::Voting;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::VotingId;
use std::collections::HashMap;

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingRepository {
    votings: HashMap<VotingId, Voting>,
    id_gen: IdGenerator,
}

impl Repository<Voting, VotingId, (), ()> for VotingRepository {
    fn save(&mut self, mut it: Voting) -> VotingId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        self.votings.insert(id, it);
        
        id
    }

    fn delete(&mut self, id: &VotingId) -> Option<Voting> {
        self.votings.remove(id)
    }

    fn get(&self, id: &VotingId) -> Option<Voting> {
        self.votings.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), ()>) -> Page<Voting> {
        let (has_next, iter) = self.votings.iter().get_page(page_req);
        let data = iter.map(|(_, it)| it.clone()).collect();

        Page::new(data, has_next)
    }
}
