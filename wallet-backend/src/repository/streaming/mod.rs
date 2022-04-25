use crate::repository::streaming::model::{Batch, Chunk};
use crate::repository::streaming::types::{
    BatchId, ChunkFilter, ChunkId, Key, StreamingError,
};
use candid::{CandidType, Deserialize};
use serde_bytes::ByteBuf;
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ChunkRepository {
    chunks: HashMap<ChunkId, Chunk>,
    id_gen: IdGenerator,

    chunks_by_batch_index: BTreeMap<BatchId, BTreeSet<ChunkId>>,
}

impl Repository<Chunk, ChunkId, ChunkFilter, ()> for ChunkRepository {
    fn save(&mut self, mut it: Chunk) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        self.chunks_by_batch_index
            .entry(*it.get_batch_id())
            .or_default()
            .insert(id);
        self.chunks.insert(id, it);
    }

    fn delete(&mut self, id: &ChunkId) -> Option<Chunk> {
        let it = self.chunks.remove(id)?;
        self.chunks_by_batch_index
            .get_mut(it.get_batch_id())
            .unwrap()
            .remove(id);

        Some(it)
    }

    fn get(&self, id: &ChunkId) -> Option<Chunk> {
        self.chunks.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<ChunkFilter, ()>) -> Page<Chunk> {
        if let Some(index) = self.chunks_by_batch_index.get(&page_req.filter.batch_id) {
            let (has_next, iter) = index.iter().get_page(page_req);
            let data = iter.map(|(id)| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        } else {
            Page::empty()
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct BatchRepository {
    batches: HashMap<BatchId, Batch>,
    id_gen: IdGenerator,
}

impl Repository<Batch, BatchId, (), ()> for BatchRepository {
    fn save(&mut self, mut it: Batch) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        self.batches.insert(it.get_id().unwrap(), it);
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
