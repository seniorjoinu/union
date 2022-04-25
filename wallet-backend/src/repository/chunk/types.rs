use crate::repository::batch::types::BatchId;
use candid::{CandidType, Deserialize, Nat};
use serde_bytes::ByteBuf;
use shared::mvc::Id;
use std::collections::BTreeSet;

pub type ChunkId = Id;

#[derive(CandidType, Deserialize)]
pub struct ChunkFilter {
    pub batch_id: BatchId,
}
