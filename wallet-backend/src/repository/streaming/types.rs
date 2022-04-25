use crate::common::rc_bytes::RcBytes;
use candid::{CandidType, Deserialize, Nat};
use serde_bytes::ByteBuf;
use shared::mvc::Id;
use std::collections::BTreeSet;

pub type BatchId = Id;
pub type ChunkId = Id;
pub type Key = String;

#[derive(Debug)]
pub enum StreamingError {
    BatchIsAlreadyLocked(BatchId),
}

#[derive(CandidType, Deserialize)]
pub struct ChunkFilter {
    pub batch_id: BatchId,
}
