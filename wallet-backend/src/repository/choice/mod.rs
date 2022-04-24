use crate::repository::choice::model::Choice;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::types::wallet::{ChoiceId, ChoiceView};
use std::collections::HashMap;

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ChoiceRepository {
    choices: HashMap<ChoiceId, Choice>,
    id_gen: IdGenerator,
}

impl Repository<Choice, ChoiceId> for ChoiceRepository {
    fn save(&mut self, mut it: Choice) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }
        
        self.choices.insert(it.get_id().unwrap(), it);
    }

    fn delete(&mut self, id: &ChoiceId) -> Option<Choice> {
        self.choices.remove(id)
    }

    fn get(&self, id: &ChoiceId) -> Option<Choice> {
        self.choices.get(id).cloned()
    }
}
