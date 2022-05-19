use crate::controller::group::api::{
    AcceptMyGroupSharesRequest, BurnGroupSharesRequest, BurnMyGroupSharesRequest,
    CreateGroupRequest, CreateGroupResponse, DeclineMyGroupSharesRequest, DeleteGroupRequest,
    GetGroupRequest, GetGroupResponse, GetGroupSharesBalanceOfRequest,
    GetGroupSharesBalanceOfResponse, GetGroupsOfRequest, GetGroupsResponse,
    GetMyGroupSharesBalanceRequest, GetMyGroupSharesBalanceResponse, GetTotalGroupSharesRequest,
    GetTotalGroupSharesResponse, ListGroupSharesRequest, ListGroupSharesResponse,
    ListGroupsRequest, ListGroupsResponse, MintGroupSharesRequest, TransferGroupSharesRequest,
    TransferMyGroupSharesRequest, UpdateGroupRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::service::group::types::GroupService;
use ic_cdk::api::time;
use ic_cdk::caller;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_group(req: CreateGroupRequest) -> CreateGroupResponse {
    only_self();

    let group_id =
        GroupService::create_group(req.name, req.description, req.private, req.transferable)
            .expect("Unable to create group");

    CreateGroupResponse { group_id }
}

#[update]
fn update_group(req: UpdateGroupRequest) {
    only_self();

    GroupService::update_group(req.group_id, req.new_name, req.new_description)
        .expect("Unable to update group");
}

#[update]
fn delete_group(req: DeleteGroupRequest) {
    only_self();

    GroupService::delete_group(req.group_id).expect("Unable to delete group");
}

#[query]
fn get_group(req: GetGroupRequest) -> GetGroupResponse {
    only_self_or_with_access("get_group", req.query_delegation_proof_opt);

    let group = GroupService::get_group(req.group_id).expect("Unable to get group");
    GetGroupResponse { group }
}

#[query]
fn list_groups(req: ListGroupsRequest) -> ListGroupsResponse {
    only_self_or_with_access("list_groups", req.query_delegation_proof_opt);

    let page = GroupService::list_groups(&req.page_req);
    ListGroupsResponse { page }
}

#[update]
fn mint_group_shares(req: MintGroupSharesRequest) {
    only_self();

    GroupService::mint_shares(req.group_id, req.owner, req.qty, time())
        .expect("Unable to mint group shares");
}

#[update]
fn burn_group_shares(req: BurnGroupSharesRequest) {
    only_self();

    GroupService::burn_shares(req.group_id, req.owner, req.qty, time())
        .expect("Unable to burn group shares");
}

#[update]
fn burn_unaccepted_group_shares(req: BurnGroupSharesRequest) {
    only_self();

    GroupService::burn_unaccepted_shares(req.group_id, req.owner, req.qty)
        .expect("Unable to burn unaccepted group shares");
}

#[update]
fn transfer_group_shares(req: TransferGroupSharesRequest) {
    only_self();

    GroupService::transfer_shares(req.group_id, req.from, req.to, req.qty, time())
        .expect("Unable to transfer group shares");
}

#[query]
fn get_group_shares_balance_of(
    req: GetGroupSharesBalanceOfRequest,
) -> GetGroupSharesBalanceOfResponse {
    only_self_or_with_access(
        "get_group_shares_balance_of",
        req.query_delegation_proof_opt,
    );

    let balance = GroupService::get_group_shares_balance_of(req.group_id, &req.owner)
        .expect("Unable to get group shares balance of");

    GetGroupSharesBalanceOfResponse { balance }
}

#[query]
fn get_unaccepted_group_shares_balance_of(
    req: GetGroupSharesBalanceOfRequest,
) -> GetGroupSharesBalanceOfResponse {
    only_self_or_with_access(
        "get_unaccepted_group_shares_balance_of",
        req.query_delegation_proof_opt,
    );

    let balance = GroupService::get_unaccepted_group_shares_balance_of(req.group_id, &req.owner)
        .expect("Unable to get unaccepted group shares balance of");

    GetGroupSharesBalanceOfResponse { balance }
}

#[query]
fn get_total_group_shares(req: GetTotalGroupSharesRequest) -> GetTotalGroupSharesResponse {
    only_self_or_with_access("get_total_group_shares", req.query_delegation_proof_opt);

    let total = GroupService::get_total_group_shares(req.group_id)
        .expect("Unable to get total group shares");

    GetTotalGroupSharesResponse { total }
}

#[query]
fn get_total_unaccepted_group_shares(
    req: GetTotalGroupSharesRequest,
) -> GetTotalGroupSharesResponse {
    only_self_or_with_access(
        "get_total_unaccepted_group_shares",
        req.query_delegation_proof_opt,
    );

    let total = GroupService::get_total_unaccepted_group_shares(req.group_id)
        .expect("Unable to get total unaccepted group shares");

    GetTotalGroupSharesResponse { total }
}

#[query]
fn list_group_shares(req: ListGroupSharesRequest) -> ListGroupSharesResponse {
    only_self_or_with_access("list_group_shares", req.query_delegation_proof_opt);

    let page = GroupService::list_group_shares(req.group_id, &req.page_req)
        .expect("Unable to list group shares");

    ListGroupSharesResponse { page }
}

#[query]
fn list_unaccepted_group_shares(req: ListGroupSharesRequest) -> ListGroupSharesResponse {
    only_self_or_with_access(
        "list_unaccepted_group_shares",
        req.query_delegation_proof_opt,
    );

    let page = GroupService::list_group_unaccepted_shares(req.group_id, &req.page_req)
        .expect("Unable to list unaccepted group shares");

    ListGroupSharesResponse { page }
}

#[query]
fn get_groups_of(req: GetGroupsOfRequest) -> GetGroupsResponse {
    only_self_or_with_access("get_groups_of", req.query_delegation_proof_opt);

    let groups = GroupService::get_groups_of(&req.principal_id);
    GetGroupsResponse { groups }
}

// ------------------ PERSONAL -----------------------

#[update]
fn burn_my_group_shares(req: BurnMyGroupSharesRequest) {
    GroupService::burn_shares(req.group_id, caller(), req.qty, time())
        .expect("Unable to burn my shares");
}

#[update]
fn transfer_my_group_shares(req: TransferMyGroupSharesRequest) {
    GroupService::transfer_shares(req.group_id, caller(), req.to, req.qty, time())
        .expect("Unable to transfer my shares");
}

#[update]
fn accept_my_group_shares(req: AcceptMyGroupSharesRequest) {
    GroupService::accept_shares(req.group_id, caller(), req.qty, time())
        .expect("Unable to accept my group shares");
}

#[update]
fn decline_my_group_shares(req: DeclineMyGroupSharesRequest) {
    GroupService::burn_unaccepted_shares(req.group_id, caller(), req.qty)
        .expect("Unable to decline my group shares");
}

#[query]
fn get_my_group_shares_balance(
    req: GetMyGroupSharesBalanceRequest,
) -> GetMyGroupSharesBalanceResponse {
    let balance = GroupService::get_group_shares_balance_of(req.group_id, &caller())
        .expect("Unable to get my group shares balance");

    GetMyGroupSharesBalanceResponse { balance }
}

#[query]
fn get_my_unaccepted_group_shares_balance(
    req: GetMyGroupSharesBalanceRequest,
) -> GetMyGroupSharesBalanceResponse {
    let balance = GroupService::get_unaccepted_group_shares_balance_of(req.group_id, &caller())
        .expect("Unable to get my unaccepted group shares balance");

    GetMyGroupSharesBalanceResponse { balance }
}

#[query]
fn get_my_groups() -> GetGroupsResponse {
    let groups = GroupService::get_groups_of(&caller());
    GetGroupsResponse { groups }
}
