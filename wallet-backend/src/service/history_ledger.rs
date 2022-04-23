use crate::{get_repositories, Principal};
use history_ledger_client::api::GetSharesInfoOfAtRequest;
use history_ledger_client::client::IHistoryLedger;
use shared::candid::CandidRejectionCode;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::GroupId;

#[derive(Debug)]
pub enum HistoryLedgerServiceError {
    NetworkError(CandidRejectionCode, String),
}

pub async fn get_shares_info_of_at(
    group_id: GroupId,
    of: Principal,
    at: u64,
) -> Result<Option<SharesInfo>, HistoryLedgerServiceError> {
    let history_ledger = get_repositories()
        .settings
        .get_most_actual_by_history_ledger(&at);

    let resp = history_ledger
        .get_shares_info_of_at(GetSharesInfoOfAtRequest { group_id, of, at })
        .await
        .map_err(|(code, msg)| HistoryLedgerServiceError::NetworkError(code, msg))?;

    Ok(resp.info_opt)
}
