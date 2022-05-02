use crate::repository::group::model::Group;
use candid::{CandidType, Deserialize, Principal};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::{GroupId, Shares};

#[derive(CandidType, Deserialize)]
pub struct CreateGroupRequest {
    pub name: String,
    pub description: String,
    pub private: bool,
    pub transferable: bool,
}

#[derive(CandidType, Deserialize)]
pub struct CreateGroupResponse {
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct UpdateGroupRequest {
    pub group_id: GroupId,
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct DeleteGroupRequest {
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetGroupRequest {
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetGroupResponse {
    pub group: Group,
}

#[derive(CandidType, Deserialize)]
pub struct ListGroupsRequest {
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListGroupsResponse {
    pub page: Page<Group>,
}

#[derive(CandidType, Deserialize)]
pub struct MintGroupSharesRequest {
    pub group_id: GroupId,
    pub owner: Principal,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct BurnGroupSharesRequest {
    pub group_id: GroupId,
    pub owner: Principal,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct BurnMyGroupSharesRequest {
    pub group_id: GroupId,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct TransferGroupSharesRequest {
    pub group_id: GroupId,
    pub from: Principal,
    pub to: Principal,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct TransferMyGroupSharesRequest {
    pub group_id: GroupId,
    pub to: Principal,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct AcceptMyGroupSharesRequest {
    pub group_id: GroupId,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct DeclineMyGroupSharesRequest {
    pub group_id: GroupId,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct GetGroupSharesBalanceOfRequest {
    pub group_id: GroupId,
    pub owner: Principal,
}

#[derive(CandidType, Deserialize)]
pub struct GetGroupSharesBalanceOfResponse {
    pub balance: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyGroupSharesBalanceRequest {
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetMyGroupSharesBalanceResponse {
    pub balance: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct GetTotalGroupSharesRequest {
    pub group_id: GroupId,
}

#[derive(CandidType, Deserialize)]
pub struct GetTotalGroupSharesResponse {
    pub total: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct ListGroupSharesRequest {
    pub group_id: GroupId,
    pub page_req: PageRequest<(), ()>,
}

#[derive(CandidType, Deserialize)]
pub struct ListGroupSharesResponse {
    pub page: Page<(Principal, Shares)>,
}
