use crate::repository::batch::model::Batch;
use crate::repository::batch::types::BatchId;
use crate::service::streaming::types::{StreamingError, StreamingService};
use shared::mvc::{HasRepository, Model, Repository};

pub mod crud;
pub mod types;

impl StreamingService {
    pub fn lock_batch(batch_id: &BatchId) -> Result<(), StreamingError> {
        let mut batch = StreamingService::get_batch(batch_id)?;
        StreamingService::assert_batch_locked(&batch)?;
        batch.lock();

        Batch::repo().save(batch);

        Ok(())
    }

    pub fn assert_batch_locked(batch: &Batch) -> Result<(), StreamingError> {
        if batch.is_locked() {
            Err(StreamingError::BatchIsLocked(batch.get_id().unwrap()))
        } else {
            Ok(())
        }
    }

    pub fn assert_batch_unlocked(batch: &Batch) -> Result<(), StreamingError> {
        if !batch.is_locked() {
            Err(StreamingError::BatchIsNotLocked(batch.get_id().unwrap()))
        } else {
            Ok(())
        }
    }
}
