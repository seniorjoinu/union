use crate::repository::batch::types::BatchId;
use crate::repository::chunk::types::ChunkId;

pub struct StreamingService;

#[derive(Debug)]
pub enum StreamingError {
    BatchNotFound(BatchId),
    BatchHasExistingChunks(BatchId),
    BatchIsLocked(BatchId),
    BatchIsNotLocked(BatchId),
    ChunkNotFound(ChunkId),
}
