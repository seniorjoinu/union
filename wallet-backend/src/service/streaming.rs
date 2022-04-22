use crate::repository::get_repositories;
use crate::repository::streaming::types::{Batch, BatchId, ChunkId, Key, StreamingRepositoryError};
use serde_bytes::ByteBuf;
use shared::pageable::{Page, PageRequest};

#[derive(Debug)]
pub enum StreamingServiceError {
    RepositoryError(StreamingRepositoryError),
}

#[inline(always)]
pub fn create_batch(key: Key, content_type: String) -> BatchId {
    get_repositories().streaming.create_batch(key, content_type)
}

#[inline(always)]
pub fn create_chunk(batch_id: BatchId, content: ByteBuf) -> Result<ChunkId, StreamingServiceError> {
    get_repositories()
        .streaming
        .create_chunk(batch_id, content)
        .map_err(StreamingServiceError::RepositoryError)
}

#[inline(always)]
pub fn lock_batch(batch_id: BatchId) -> Result<(), StreamingServiceError> {
    get_repositories()
        .streaming
        .lock_batch(batch_id)
        .map_err(StreamingServiceError::RepositoryError)
}

#[inline(always)]
pub fn delete_locked_batch(batch_id: &BatchId) -> Result<(), StreamingServiceError> {
    get_repositories()
        .streaming
        .delete_batch(batch_id, true)
        .map_err(StreamingServiceError::RepositoryError)
}

#[inline(always)]
pub fn delete_unlocked_batch(batch_id: &BatchId) -> Result<(), StreamingServiceError> {
    get_repositories()
        .streaming
        .delete_batch(batch_id, false)
        .map_err(StreamingServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_batches(page_req: PageRequest<(), ()>) -> Page<(BatchId, Batch)> {
    get_repositories().streaming.get_batches_cloned(page_req)
}

#[inline(always)]
pub fn get_chunk_content(chunk_id: &ChunkId) -> Result<ByteBuf, StreamingServiceError> {
    get_repositories()
        .streaming
        .get_chunk(chunk_id)
        .map(|it| ByteBuf::from(it.content.as_ref()))
        .map_err(StreamingServiceError::RepositoryError)
}
