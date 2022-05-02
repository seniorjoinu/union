use crate::repository::batch::model::Batch;
use crate::repository::batch::types::{BatchId, Key};
use crate::repository::chunk::model::Chunk;
use crate::repository::chunk::types::{ChunkFilter, ChunkId};
use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest};
use shared::types::Blob;

// ---------------- BATCHES ------------------

#[derive(CandidType, Deserialize)]
pub struct CreateBatchRequest {
    pub key: Key,
    pub content_type: String,
}

#[derive(CandidType, Deserialize)]
pub struct CreateBatchResponse {
    pub batch_id: BatchId,
}

#[derive(CandidType, Deserialize)]
pub struct GetBatchRequest {
    pub id: BatchId,
}

#[derive(CandidType, Deserialize)]
pub struct GetBatchResponse {
    pub batch: Batch,
}

#[derive(CandidType, Deserialize)]
pub struct LockBatchesRequest {
    pub ids: Vec<BatchId>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteBatchesRequest {
    pub ids: Vec<BatchId>,
}

#[derive(CandidType, Deserialize)]
pub struct SendBatchRequest {
    pub batch_id: BatchId,
    pub target_canister: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct ListBatchesRequest {
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListBatchesResponse {
    pub page: Page<Batch>,
}

// --------------- CHUNKS ----------------

#[derive(CandidType, Deserialize)]
pub struct CreateChunkRequest {
    pub batch_id: BatchId,
    pub content: Blob,
}

#[derive(CandidType, Deserialize)]
pub struct CreateChunkResponse {
    pub chunk_id: ChunkId,
}

#[derive(CandidType, Deserialize)]
pub struct GetChunkRequest {
    pub chunk_id: ChunkId,
}

#[derive(CandidType, Deserialize)]
pub struct GetChunkResponse {
    pub chunk: Chunk,
}

#[derive(CandidType, Deserialize)]
pub struct ListChunksRequest {
    pub page_req: PageRequest<ChunkFilter, ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListChunksResponse {
    pub page: Page<Chunk>,
}
