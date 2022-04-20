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

#[derive(CandidType, Deserialize)]
pub struct Page<T> {
    pub data: Vec<T>,
    pub has_next: bool,
}

#[derive(CandidType, Deserialize)]
pub struct PageRequest<F, S> {
    pub page_index: usize,
    pub page_size: usize,
    pub filter: F,
    pub sort: S,
}

pub trait Pageable {
    type BaseType;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>);
}

impl<'a, K, V> Pageable for HashMapIter<'a, K, V> {
    type BaseType = HashMapIter<'a, K, V>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip(req.page_size * req.page_index)
            .skip(req.page_size)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip(req.page_size * req.page_index)
            .take(req.page_size);

        (has_next, it)
    }
}

impl<'a, T> Pageable for VecIter<'a, T> {
    type BaseType = VecIter<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip(req.page_size * req.page_index)
            .skip(req.page_size)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip(req.page_size * req.page_index)
            .take(req.page_size);

        (has_next, it)
    }
}

impl<'a, T> Pageable for BTreeSetIter<'a, T> {
    type BaseType = BTreeSetIter<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip(req.page_size * req.page_index)
            .skip(req.page_size)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip(req.page_size * req.page_index)
            .take(req.page_size);

        (has_next, it)
    }
}
