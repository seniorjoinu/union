use shared::mvc::Model;
use crate::repository::batch::model::Batch;
use crate::service::streaming::types::{StreamingError, StreamingService};

pub mod crud;
pub mod types;

impl StreamingService {
    pub fn lock_batch(batch: &mut Batch) -> Result<(), StreamingError> {
        StreamingService::assert_batch_locked(batch)?;
        batch.lock();

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