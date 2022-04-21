/*use crate::{
    CommitBatchArguments, CreateBatchResponse, CreateChunkRequest, CreateChunkResponse, Principal,
};*/
use async_trait::async_trait;
use candid::{CandidType, Deserialize};
use ic_cdk::api::call::CallResult;
use ic_cdk::call;
use std::collections::btree_set::Iter as BTreeSetIter;
use std::collections::hash_map::Iter as HashMapIter;
use std::collections::vec_deque::Iter as VecIter;
use std::iter::{Skip, Take};

/*#[async_trait]
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
}*/
