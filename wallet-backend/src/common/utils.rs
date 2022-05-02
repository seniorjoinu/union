use crate::repository::batch::types::Key;
use async_trait::async_trait;
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use shared::types::Blob;

pub type ExternalChunkId = Nat;
pub type ExternalBatchId = Nat;

#[derive(CandidType, Deserialize)]
pub struct CreateAssetArguments {
    pub key: Key,
    pub content_type: String,
}

#[derive(CandidType, Deserialize)]
pub struct SetAssetContentArguments {
    pub key: Key,
    pub content_encoding: String,
    pub chunk_ids: Vec<ExternalChunkId>,
    pub sha256: Option<Blob>,
}

#[derive(CandidType, Deserialize)]
pub struct UnsetAssetContentArguments {
    pub key: Key,
    pub content_encoding: String,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteAssetArguments {
    pub key: Key,
}

#[derive(CandidType, Deserialize)]
pub struct ClearArguments {}

#[derive(CandidType, Deserialize)]
pub enum BatchOperation {
    CreateAsset(CreateAssetArguments),
    SetAssetContent(SetAssetContentArguments),
    UnsetAssetContent(UnsetAssetContentArguments),
    DeleteAsset(DeleteAssetArguments),
    Clear(ClearArguments),
}

#[derive(CandidType, Deserialize)]
pub struct CommitBatchArguments {
    pub batch_id: ExternalBatchId,
    pub operations: Vec<BatchOperation>,
}

#[derive(CandidType, Deserialize)]
pub struct CreateBatchRequest {
    pub key: Key,
    pub content_type: String,
}

#[derive(CandidType, Deserialize)]
pub struct CreateBatchResponse {
    pub batch_id: ExternalBatchId,
}

#[derive(CandidType, Deserialize)]
pub struct CreateChunkRequest {
    pub batch_id: ExternalBatchId,
    pub content: Blob,
}

#[derive(CandidType, Deserialize)]
pub struct CreateChunkResponse {
    pub chunk_id: ExternalChunkId,
}

#[async_trait]
pub trait IAssetCanister {
    async fn create_batch(&self) -> CallResult<(CreateBatchResponse,)>;
    async fn create_chunk(&self, req: CreateChunkRequest) -> CallResult<(CreateChunkResponse,)>;
    async fn commit_batch(&self, req: CommitBatchArguments) -> CallResult<()>;
}

#[async_trait]
impl IAssetCanister for Principal {
    async fn create_batch(&self) -> CallResult<(CreateBatchResponse,)> {
        call(*self, "create_batch", ()).await
    }

    async fn create_chunk(&self, req: CreateChunkRequest) -> CallResult<(CreateChunkResponse,)> {
        call(*self, "create_chunk", (req,)).await
    }

    async fn commit_batch(&self, req: CommitBatchArguments) -> CallResult<()> {
        call(*self, "commit_batch", (req,)).await
    }
}
