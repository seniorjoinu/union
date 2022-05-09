use crate::repository::batch::types::BatchId;
use candid::{CandidType, Deserialize};
use shared::mvc::Id;

pub type ChunkId = Id;

#[derive(CandidType, Deserialize)]
pub struct ChunkFilter {
    pub batch_id: BatchId,
}
