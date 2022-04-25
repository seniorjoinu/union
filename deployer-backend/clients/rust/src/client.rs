use crate::api::{
    CreateBinaryVersionRequest, DeleteBinaryVersionRequest, DownloadBinaryRequest,
    DownloadBinaryResponse, GetBinaryVersionInfosRequest, GetBinaryVersionInfosResponse,
    GetBinaryVersionsResponse, GetControllerResponse, GetInstanceIdsResponse, GetInstancesRequest,
    GetInstancesResponse, GetLatestVersionResponse, ReleaseBinaryVersionRequest,
    SpawnWalletRequest, SpawnWalletResponse, TransferControlRequest,
    UpdateBinaryVersionDescriptionRequest, UpgradeWalletVersionRequest, UploadBinaryRequest,
};
use async_trait::async_trait;
use candid::Principal;
use ic_cdk::{call, api::call::call_with_payment};
use shared::candid::{CandidCallResult, ToCandidType};

#[async_trait]
pub trait IDeployerBackend {
    async fn transfer_binary_control(&self, req: TransferControlRequest) -> CandidCallResult<()>;
    async fn transfer_spawn_control(&self, req: TransferControlRequest) -> CandidCallResult<()>;
    async fn spawn_wallet(
        &self,
        req: SpawnWalletRequest,
        cycles: u64,
    ) -> CandidCallResult<(SpawnWalletResponse,)>;
    async fn upgrade_wallet_version(
        &self,
        req: UpgradeWalletVersionRequest,
    ) -> CandidCallResult<()>;
    async fn create_binary_version(&self, req: CreateBinaryVersionRequest) -> CandidCallResult<()>;
    async fn update_binary_version_description(
        &self,
        req: UpdateBinaryVersionDescriptionRequest,
    ) -> CandidCallResult<()>;
    async fn release_binary_version(
        &self,
        req: ReleaseBinaryVersionRequest,
    ) -> CandidCallResult<()>;
    async fn delete_binary_version(&self, req: DeleteBinaryVersionRequest) -> CandidCallResult<()>;
    async fn upload_binary(&self, req: UploadBinaryRequest) -> CandidCallResult<()>;
    async fn download_binary(
        &self,
        req: DownloadBinaryRequest,
    ) -> CandidCallResult<(DownloadBinaryResponse,)>;
    async fn get_binary_versions(&self) -> CandidCallResult<(GetBinaryVersionsResponse,)>;
    async fn get_binary_version_infos(
        &self,
        req: GetBinaryVersionInfosRequest,
    ) -> CandidCallResult<(GetBinaryVersionInfosResponse,)>;
    async fn get_instance_ids(&self) -> CandidCallResult<(GetInstanceIdsResponse,)>;
    async fn get_instances(
        &self,
        req: GetInstancesRequest,
    ) -> CandidCallResult<(GetInstancesResponse,)>;
    async fn get_latest_version(&self) -> CandidCallResult<(GetLatestVersionResponse,)>;
    async fn get_binary_controller(&self) -> CandidCallResult<(GetControllerResponse,)>;
    async fn get_spawn_controller(&self) -> CandidCallResult<(GetControllerResponse,)>;
}

#[async_trait]
impl IDeployerBackend for Principal {
    async fn transfer_binary_control(&self, req: TransferControlRequest) -> CandidCallResult<()> {
        call(*self, "transfer_binary_control", (req,))
            .await
            .to_candid_type()
    }

    async fn transfer_spawn_control(&self, req: TransferControlRequest) -> CandidCallResult<()> {
        call(*self, "transfer_spawn_control", (req,))
            .await
            .to_candid_type()
    }

    async fn spawn_wallet(
        &self,
        req: SpawnWalletRequest,
        cycles: u64,
    ) -> CandidCallResult<(SpawnWalletResponse,)> {
        call_with_payment(*self, "spawn_wallet", (req,), cycles).await.to_candid_type()
    }

    async fn upgrade_wallet_version(
        &self,
        req: UpgradeWalletVersionRequest,
    ) -> CandidCallResult<()> {
        call(*self, "upgrade_wallet_version", (req,))
            .await
            .to_candid_type()
    }

    async fn create_binary_version(&self, req: CreateBinaryVersionRequest) -> CandidCallResult<()> {
        call(*self, "create_binary_version", (req,))
            .await
            .to_candid_type()
    }

    async fn update_binary_version_description(
        &self,
        req: UpdateBinaryVersionDescriptionRequest,
    ) -> CandidCallResult<()> {
        call(*self, "update_binary_version_description", (req,))
            .await
            .to_candid_type()
    }

    async fn release_binary_version(
        &self,
        req: ReleaseBinaryVersionRequest,
    ) -> CandidCallResult<()> {
        call(*self, "release_binary_version", (req,))
            .await
            .to_candid_type()
    }

    async fn delete_binary_version(&self, req: DeleteBinaryVersionRequest) -> CandidCallResult<()> {
        call(*self, "delete_binary_version", (req,))
            .await
            .to_candid_type()
    }

    async fn upload_binary(&self, req: UploadBinaryRequest) -> CandidCallResult<()> {
        call(*self, "upload_binary", (req,)).await.to_candid_type()
    }

    async fn download_binary(
        &self,
        req: DownloadBinaryRequest,
    ) -> CandidCallResult<(DownloadBinaryResponse,)> {
        call(*self, "download_binary", (req,))
            .await
            .to_candid_type()
    }

    async fn get_binary_versions(&self) -> CandidCallResult<(GetBinaryVersionsResponse,)> {
        call(*self, "get_binary_versions", ())
            .await
            .to_candid_type()
    }

    async fn get_binary_version_infos(
        &self,
        req: GetBinaryVersionInfosRequest,
    ) -> CandidCallResult<(GetBinaryVersionInfosResponse,)> {
        call(*self, "get_binary_version_infos", (req,))
            .await
            .to_candid_type()
    }
    async fn get_instance_ids(&self) -> CandidCallResult<(GetInstanceIdsResponse,)> {
        call(*self, "get_instance_ids", ()).await.to_candid_type()
    }

    async fn get_instances(
        &self,
        req: GetInstancesRequest,
    ) -> CandidCallResult<(GetInstancesResponse,)> {
        call(*self, "get_instances", (req,)).await.to_candid_type()
    }

    async fn get_latest_version(&self) -> CandidCallResult<(GetLatestVersionResponse,)> {
        call(*self, "get_latest_version", ()).await.to_candid_type()
    }

    async fn get_binary_controller(&self) -> CandidCallResult<(GetControllerResponse,)> {
        call(*self, "get_binary_controller", ())
            .await
            .to_candid_type()
    }

    async fn get_spawn_controller(&self) -> CandidCallResult<(GetControllerResponse,)> {
        call(*self, "get_spawn_controller", ())
            .await
            .to_candid_type()
    }
}
