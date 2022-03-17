use crate::types::{SpawnRequest, UpdateCodeRequest};
use async_trait::async_trait;
use ic_cdk::api::call::{call, CallResult};
use ic_cdk::export::candid::Principal;

#[async_trait]
pub trait IUnionDeployerClient {
    async fn spawn(&self, req: SpawnRequest) -> CallResult<(Principal,)>;
    async fn update_code(&self, req: UpdateCodeRequest) -> CallResult<(Principal,)>;
    async fn get_spawned_instances(&self) -> CallResult<(Vec<Principal>,)>;
}

#[async_trait]
impl IUnionDeployerClient for Principal {
    async fn spawn(&self, req: SpawnRequest) -> CallResult<(Principal,)> {
        call(*self, "spawn", (req,)).await
    }

    async fn update_code(&self, req: UpdateCodeRequest) -> CallResult<(Principal,)> {
        call(*self, "update_code", (req,)).await
    }

    async fn get_spawned_instances(&self) -> CallResult<(Vec<Principal>,)> {
        call(*self, "get_spawned_instances", ()).await
    }
}
