use crate::repository::choice::model::Choice;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::types::wallet::{ChoiceId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};
use shared::pageable::{Page, PageRequest, Pageable};
use crate::repository::choice::types::ChoiceFilter;

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ChoiceRepository {
    choices: HashMap<ChoiceId, Choice>,
    id_gen: IdGenerator,

    choices_by_voting_index: BTreeMap<VotingId, BTreeSet<ChoiceId>>,
}

impl Repository<Choice, ChoiceId, ChoiceFilter, ()> for ChoiceRepository {
    fn save(&mut self, mut it: Choice) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        self.choices_by_voting_index.entry(*it.get_voting_id()).or_default().insert(it.get_id().unwrap());
        self.choices.insert(it.get_id().unwrap(), it);
    }

    fn delete(&mut self, id: &ChoiceId) -> Option<Choice> {
        let it = self.choices.remove(id)?;
        self.choices_by_voting_index.get_mut(it.get_voting_id()).unwrap().remove(id).unwrap();

        Some(it)
    }

    fn get(&self, id: &ChoiceId) -> Option<Choice> {
        self.choices.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<ChoiceFilter, ()>) -> Page<Choice> {
        let ids_opt = self.choices_by_voting_index.get(&page_req.filter.voting_id);
        
        match ids_opt {
            Some(ids) => {
                let (has_next, iter) = ids.iter().get_page(page_req);
                let data = iter.map(|id| self.get(id).unwrap()).collect();
                
                Page::new(data, has_next)
            },
            None => Page::empty()
        }
    }
}
