use crate::repository::chunk::types::{BatchId, ChunkId};
use candid::{CandidType, Deserialize};
use serde_bytes::ByteBuf;
use shared::mvc::Model;
use shared::types::Blob;
use std::collections::BTreeSet;

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Chunk {
    id: Option<ChunkId>,
    batch_id: BatchId,
    content: Blob,
}

impl Chunk {
    pub fn new(batch_id: BatchId, content: ByteBuf) -> Self {
        Chunk {
            id: None,
            batch_id,
            content: RcBytes::from(content),
        }
    }

    pub fn get_batch_id(&self) -> &BatchId {
        &self.batch_id
    }

    pub fn get_content(&self) -> &Blob {
        &self.content
    }
}

impl Model<ChunkId> for Chunk {
    fn get_id(&self) -> Option<ChunkId> {
        self.id
    }

    fn _init_id(&mut self, id: ChunkId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
