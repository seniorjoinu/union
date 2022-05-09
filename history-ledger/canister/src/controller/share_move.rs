use crate::service::shares_move::SharesMoveService;
use history_ledger_client::api::{GetSharesInfoOfAtRequest, GetSharesInfoOfAtResponse};
use ic_cdk_macros::query;

#[query]
pub fn get_shares_info_of_at(req: GetSharesInfoOfAtRequest) -> GetSharesInfoOfAtResponse {
    let info_opt = SharesMoveService::shares_info_of_at(req.group_id, req.of, req.at);

    GetSharesInfoOfAtResponse { 
        info_opt,
    }
}
