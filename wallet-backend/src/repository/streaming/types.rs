use crate::common::rc_bytes::RcBytes;
use candid::{CandidType, Deserialize, Nat};
use std::collections::BTreeSet;
use serde_bytes::ByteBuf;

#[derive(CandidType, Deserialize)]
pub struct Chunk {
    pub batch_id: BatchId,
    pub content: RcBytes,
}

impl Chunk {
    pub fn new(batch_id: BatchId, content: ByteBuf) -> Self {
        Chunk {
            batch_id,
            content: RcBytes::from(content),
        }
    }
}

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Batch {
    pub key: Key,
    pub content_type: String,
    pub chunk_ids: BTreeSet<ChunkId>,
    pub locked: bool,
}

impl Batch {
    pub fn new(key: Key, content_type: String) -> Self {
        Self {
            key,
            content_type,
            chunk_ids: BTreeSet::new(),
            locked: false,
        }
    }
    
    pub fn add_chunk(&mut self, batch_id: BatchId, chunk_id: ChunkId) -> Result<(), StreamingRepositoryError> {
        if self.locked {
            return Err(StreamingRepositoryError::BatchIsAlreadyLocked(batch_id));
        }

        self.chunk_ids.insert(chunk_id);
        
        Ok(())
    }

    pub fn lock(&mut self, batch_id: BatchId) -> Result<(), StreamingRepositoryError> {
        if self.locked {
            return Err(StreamingRepositoryError::BatchIsAlreadyLocked(batch_id));
        }

        self.locked = true;

        Ok(())
    }
}

pub type BatchId = Nat;
pub type ChunkId = Nat;
pub type Key = String;

#[derive(Debug)]
pub enum StreamingRepositoryError {
    BatchNotFound(BatchId),
    BatchIsAlreadyLocked(BatchId),
    ChunkNotFound(ChunkId),
}
