use crate::repository::batch::model::Batch;
use crate::repository::batch::types::BatchId;
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use std::collections::HashMap;
use candid::{CandidType, Deserialize};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct BatchRepository {
    batches: HashMap<BatchId, Batch>,
    id_gen: IdGenerator,
}

impl Repository<Batch, BatchId, (), ()> for BatchRepository {
    fn save(&mut self, mut it: Batch) -> BatchId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        self.batches.insert(id, it);
        
        id
    }

    fn delete(&mut self, id: &BatchId) -> Option<Batch> {
        self.batches.remove(id)
    }

    fn get(&self, id: &BatchId) -> Option<Batch> {
        self.batches.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), ()>) -> Page<Batch> {
        let (has_next, iter) = self.batches.iter().get_page(page_req);
        let data = iter.map(|(_, it)| it.clone()).collect();

        Page::new(data, has_next)
    }
}
