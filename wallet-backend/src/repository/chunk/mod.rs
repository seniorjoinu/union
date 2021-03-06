use crate::repository::batch::types::BatchId;
use crate::repository::chunk::model::Chunk;
use crate::repository::chunk::types::{ChunkFilter, ChunkId};
use candid::{CandidType, Deserialize};
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
    fn save(&mut self, mut it: Chunk) -> ChunkId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        let id = it.get_id().unwrap();
        self.chunks_by_batch_index
            .entry(*it.get_batch_id())
            .or_default()
            .insert(id);
        self.chunks.insert(id, it);

        id
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
            let data = iter.map(|id| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        } else {
            Page::empty()
        }
    }
}

impl ChunkRepository {
    pub fn get_all_by_batch(&self, batch_id: &BatchId) -> BTreeSet<ChunkId> {
        self.chunks_by_batch_index.get(batch_id).cloned().unwrap_or_default()
    }
    
    pub fn delete_all_by_batch(&mut self, batch_id: &BatchId) {
        if let Some(index) = self.chunks_by_batch_index.remove(batch_id) {
            for id in index {
                self.chunks.remove(&id);
            }
        }
    }
}
