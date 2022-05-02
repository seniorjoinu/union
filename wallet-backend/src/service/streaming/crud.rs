use crate::repository::batch::model::Batch;
use crate::repository::batch::types::{BatchId, Key};
use crate::repository::chunk::model::Chunk;
use crate::repository::chunk::types::{ChunkFilter, ChunkId};
use crate::service::streaming::types::StreamingError;
use crate::service::streaming::types::StreamingService;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::Blob;

impl StreamingService {
    #[inline(always)]
    pub fn create_batch(key: Key, content_type: String) -> BatchId {
        let batch = Batch::new(key, content_type);
        Batch::repo().save(batch)
    }

    #[inline(always)]
    pub fn get_batch(id: &BatchId) -> Result<Batch, StreamingError> {
        Batch::repo()
            .get(id)
            .ok_or(StreamingError::BatchNotFound(*id))
    }

    pub fn delete_batch(id: &BatchId, lock_assertion: bool) -> Result<Batch, StreamingError> {
        let batch = Batch::repo()
            .delete(id)
            .ok_or(StreamingError::BatchNotFound(*id))?;

        if batch.is_locked() && !lock_assertion {
            return Err(StreamingError::BatchIsLocked(*id));
        }
        if !batch.is_locked() && lock_assertion {
            return Err(StreamingError::BatchIsNotLocked(*id));
        }

        Chunk::repo().delete_all_by_batch(&batch.get_id().unwrap());

        Ok(batch)
    }

    #[inline(always)]
    pub fn list_batches(page_req: &PageRequest<(), ()>) -> Page<Batch> {
        Batch::repo().list(page_req)
    }

    pub fn create_chunk(batch_id: BatchId, content: Blob) -> Result<ChunkId, StreamingError> {
        StreamingService::get_batch(&batch_id)?;

        let chunk = Chunk::new(batch_id, content);
        Ok(Chunk::repo().save(chunk))
    }

    #[inline(always)]
    pub fn get_chunk(id: &ChunkId) -> Result<Chunk, StreamingError> {
        Chunk::repo()
            .get(id)
            .ok_or(StreamingError::ChunkNotFound(*id))
    }

    #[inline(always)]
    pub fn delete_chunk(id: &ChunkId) -> Result<Chunk, StreamingError> {
        Chunk::repo()
            .delete(id)
            .ok_or(StreamingError::ChunkNotFound(*id))
    }

    #[inline(always)]
    pub fn list_chunks(page_req: &PageRequest<ChunkFilter, ()>) -> Page<Chunk> {
        Chunk::repo().list(page_req)
    }
}
