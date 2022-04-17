use crate::common::rc_bytes::RcBytes;
use candid::{CandidType, Deserialize, Nat};
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize)]
pub struct Chunk {
    pub batch_id: BatchId,
    pub content: RcBytes,
}

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Batch {
    pub key: Key,
    pub content_type: String,
    pub chunk_ids: BTreeSet<ChunkId>,
    pub locked: bool,
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
