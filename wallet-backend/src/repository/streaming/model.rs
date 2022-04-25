use crate::repository::streaming::types::{BatchId, ChunkId, Key, StreamingError};
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

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Batch {
    id: Option<BatchId>,
    key: Key,
    content_type: String,
    locked: bool,
}

impl Batch {
    pub fn new(key: Key, content_type: String) -> Self {
        Self {
            id: None,
            key,
            content_type,
            locked: false,
        }
    }

    pub fn add_chunk(
        &mut self,
        batch_id: BatchId,
        chunk_id: ChunkId,
    ) -> Result<(), StreamingError> {
        if self.locked {
            return Err(StreamingError::BatchIsAlreadyLocked(batch_id));
        }

        self.chunk_ids.insert(chunk_id);

        Ok(())
    }

    pub fn lock(&mut self, batch_id: BatchId) -> Result<(), StreamingError> {
        if self.locked {
            return Err(StreamingError::BatchIsAlreadyLocked(batch_id));
        }

        self.locked = true;

        Ok(())
    }

    pub fn get_key(&self) -> &Key {
        &self.key
    }

    pub fn content_type(&self) -> &String {
        &self.content_type
    }

    pub fn is_locked(&self) -> bool {
        self.locked
    }
}

impl Model<BatchId> for Batch {
    fn get_id(&self) -> Option<BatchId> {
        self.id
    }

    fn _init_id(&mut self, id: BatchId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
