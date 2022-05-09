use crate::controller::streaming::api::{
    CreateBatchRequest, CreateBatchResponse, CreateChunkRequest, CreateChunkResponse,
    DeleteBatchesRequest, GetBatchRequest, GetBatchResponse, GetChunkRequest, GetChunkResponse,
    ListBatchesRequest, ListBatchesResponse, ListChunksRequest, ListChunksResponse,
    LockBatchesRequest, SendBatchRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::streaming::types::StreamingService;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_batch(req: CreateBatchRequest) -> CreateBatchResponse {
    only_self();

    let batch_id = StreamingService::create_batch(req.key, req.content_type);
    CreateBatchResponse { batch_id }
}

#[update]
fn delete_unlocked_batches(req: DeleteBatchesRequest) {
    only_self();

    for id in req.ids {
        StreamingService::delete_batch(&id, false).expect("Unable to delete unlocked batches");
    }
}

#[update]
fn delete_batches(req: DeleteBatchesRequest) {
    only_self();

    for id in req.ids {
        StreamingService::delete_batch(&id, true).expect("Unable to delete batches");
    }
}

#[update]
fn lock_batches(req: LockBatchesRequest) {
    only_self();

    for id in req.ids {
        StreamingService::lock_batch(&id).expect("Unable to lock batches");
    }
}

#[update]
async fn send_batch(req: SendBatchRequest) {
    only_self();

    StreamingService::send_batch(&req.batch_id, req.target_canister)
        .await
        .expect("Unable to send batch");
}

#[query]
fn get_batch(req: GetBatchRequest) -> GetBatchResponse {
    only_self_or_with_access("get_batch");

    let batch = StreamingService::get_batch(&req.id).expect("Unable to get batch");
    GetBatchResponse { batch }
}

#[query]
fn list_batches(req: ListBatchesRequest) -> ListBatchesResponse {
    only_self_or_with_access("list_batches");

    let page = StreamingService::list_batches(&req.page_req);
    ListBatchesResponse { page }
}

#[update]
fn create_chunk(req: CreateChunkRequest) -> CreateChunkResponse {
    only_self();

    let chunk_id =
        StreamingService::create_chunk(req.batch_id, req.content).expect("Unable to create chunk");
    CreateChunkResponse { chunk_id }
}

#[query]
fn get_chunk(req: GetChunkRequest) -> GetChunkResponse {
    only_self_or_with_access("get_chunk");

    let chunk = StreamingService::get_chunk(&req.chunk_id).expect("Unable to get chunk");
    GetChunkResponse { chunk }
}

#[query]
fn list_chunks(req: ListChunksRequest) -> ListChunksResponse {
    only_self_or_with_access("list_chunks");

    let page = StreamingService::list_chunks(&req.page_req);
    ListChunksResponse { page }
}
