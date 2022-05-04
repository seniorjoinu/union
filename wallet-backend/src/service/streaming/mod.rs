use crate::common::utils::{
    BatchOperation, CommitBatchArguments, CreateAssetArguments, CreateChunkRequest,
    DeleteAssetArguments, IAssetCanister, SetAssetContentArguments,
};
use crate::repository::batch::model::Batch;
use crate::repository::batch::types::BatchId;
use crate::repository::chunk::model::Chunk;
use crate::service::streaming::types::{StreamingError, StreamingService};
use candid::Principal;
use shared::candid::CandidRejectionCode;
use shared::mvc::{HasRepository, Model, Repository};

pub mod crud;
pub mod types;

impl StreamingService {
    // TODO: rewrite this method - it may be unsafe
    pub async fn send_batch(
        batch_id: &BatchId,
        target_canister_id: Principal,
    ) -> Result<(), StreamingError> {
        let batch = StreamingService::get_batch(batch_id)?;
        StreamingService::assert_batch_locked(&batch)?;

        let (resp,) = target_canister_id
            .create_batch()
            .await
            .map_err(|(code, msg)| {
                StreamingError::NetworkError(CandidRejectionCode::from_common(code), msg)
            })?;

        let mut target_chunk_ids = vec![];

        let chunk_ids = Chunk::repo().get_all_by_batch(batch_id);

        for chunk_id in &chunk_ids {
            let chunk = Chunk::repo().get(chunk_id).unwrap();

            let res = target_canister_id
                .create_chunk(CreateChunkRequest {
                    batch_id: resp.batch_id.clone(),
                    content: chunk.get_content().clone(),
                })
                .await;

            match res {
                Err((code, msg)) => {
                    target_canister_id
                        .commit_batch(CommitBatchArguments {
                            batch_id: resp.batch_id.clone(),
                            operations: vec![
                                BatchOperation::CreateAsset(CreateAssetArguments {
                                    key: String::from("$$$.failed"),
                                    content_type: String::from("text/plain"),
                                }),
                                BatchOperation::SetAssetContent(SetAssetContentArguments {
                                    key: String::from("$$$.failed"),
                                    content_encoding: String::from("identity"),
                                    chunk_ids: target_chunk_ids,
                                    sha256: None,
                                }),
                                BatchOperation::DeleteAsset(DeleteAssetArguments {
                                    key: String::from("$$$.failed"),
                                }),
                            ],
                        })
                        .await
                        .unwrap_or_else(|_| {
                            panic!(
                                "[FATAL] Unable to cleanup after chunk creation error {:?} {}",
                                CandidRejectionCode::from_common(code),
                                msg
                            )
                        });

                    panic!(
                        "Unable to create chunk: {:?} {}",
                        CandidRejectionCode::from_common(code),
                        msg
                    );
                }
                Ok((response,)) => target_chunk_ids.push(response.chunk_id),
            }
        }

        target_canister_id
            .commit_batch(CommitBatchArguments {
                batch_id: resp.batch_id,
                operations: vec![
                    BatchOperation::CreateAsset(CreateAssetArguments {
                        key: batch.get_key().clone(),
                        content_type: batch.get_content_type().clone(),
                    }),
                    BatchOperation::SetAssetContent(SetAssetContentArguments {
                        key: batch.get_key().clone(),
                        content_encoding: String::from("identity"),
                        chunk_ids: target_chunk_ids,
                        sha256: None,
                    }),
                ],
            })
            .await
            .map_err(|(code, msg)| {
                StreamingError::NetworkError(CandidRejectionCode::from_common(code), msg)
            })
    }

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
