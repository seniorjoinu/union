use crate::common::rc_bytes::RcBytes;
use candid::{CandidType, Deserialize, Nat};
use serde_bytes::ByteBuf;
use std::collections::{HashMap, HashSet};

#[derive(CandidType, Deserialize)]
pub struct Chunk {
    pub batch_id: BatchId,
    pub content: RcBytes,
}

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Batch {
    pub key: Key,
    pub content_type: String,
    pub chunk_ids: HashSet<ChunkId>,
    pub locked: bool,
}

pub type BatchId = Nat;
pub type ChunkId = Nat;
pub type Key = String;

#[derive(Debug)]
pub enum StreamingError {
    BatchNotFound(BatchId),
    BatchIsAlreadyLocked(BatchId),
    ChunkNotFound(ChunkId),
}

#[derive(Default, CandidType, Deserialize)]
pub struct StreamingState {
    pub chunks: HashMap<ChunkId, Chunk>,
    pub batches: HashMap<BatchId, Batch>,

    pub chunk_id_counter: ChunkId,
    pub batch_id_counter: BatchId,
}

impl StreamingState {
    pub fn create_batch(&mut self, key: Key, content_type: String) -> BatchId {
        let id = self.generate_batch_id();
        self.batches.insert(id.clone(), Batch {
            key,
            content_type,
            chunk_ids: HashSet::new(),
            locked: false,
        });

        id
    }

    pub fn create_chunk(
        &mut self,
        batch_id: BatchId,
        content: ByteBuf,
    ) -> Result<ChunkId, StreamingError> {
        let id = self.generate_chunk_id();

        let batch = self
            .batches
            .get_mut(&batch_id)
            .ok_or_else(|| StreamingError::BatchNotFound(batch_id.clone()))?;

        if batch.locked {
            return Err(StreamingError::BatchIsAlreadyLocked(batch_id.clone()));
        }

        batch.chunk_ids.insert(id.clone());

        let chunk = Chunk {
            batch_id,
            content: RcBytes::from(content),
        };

        self.chunks.insert(id.clone(), chunk);

        Ok(id)
    }

    pub fn lock_batch(
        &mut self,
        batch_id: &BatchId,
    ) -> Result<(), StreamingError> {
        let batch = self
            .batches
            .get_mut(batch_id)
            .ok_or_else(|| StreamingError::BatchNotFound(batch_id.clone()))?;

        if batch.locked {
            return Err(StreamingError::BatchIsAlreadyLocked(batch_id.clone()));
        }

        batch.locked = true;

        Ok(())
    }

    pub fn delete_batch(
        &mut self,
        batch_id: &BatchId,
        lock_assertion: bool,
    ) -> Result<(), StreamingError> {
        let batch = self.get_batch(batch_id)?;
        assert_eq!(
            batch.locked, lock_assertion,
            "Invalid batch lock state"
        );

        let batch = self.batches.remove(batch_id).unwrap();

        for chunk_id in &batch.chunk_ids {
            self.chunks.remove(chunk_id).unwrap();
        }

        Ok(())
    }

    pub fn get_batch(&self, batch_id: &BatchId) -> Result<&Batch, StreamingError> {
        self.batches
            .get(batch_id)
            .ok_or_else(|| StreamingError::BatchNotFound(batch_id.clone()))
    }

    pub fn get_batches(&self) -> Result<Vec<(BatchId, Batch)>, StreamingError> {
        let mut result: Vec<(BatchId, Batch)> = vec![];

        for (key, val) in self.batches.iter() {
            result.push((key.clone(), val.clone()));
        }

        Ok(result)
    }

    pub fn get_chunk(&self, chunk_id: &ChunkId) -> Result<&Chunk, StreamingError> {
        self.chunks
            .get(chunk_id)
            .ok_or_else(|| StreamingError::ChunkNotFound(chunk_id.clone()))
    }

    fn generate_chunk_id(&mut self) -> ChunkId {
        let id = self.chunk_id_counter.clone();
        self.chunk_id_counter += 1;

        id
    }

    fn generate_batch_id(&mut self) -> BatchId {
        let id = self.batch_id_counter.clone();
        self.batch_id_counter += 1;

        id
    }
}
