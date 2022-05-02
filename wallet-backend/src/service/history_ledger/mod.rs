use crate::settings::Settings;
use candid::Principal;
use history_ledger_client::api::GetSharesInfoOfAtRequest;
use history_ledger_client::client::IHistoryLedger;
use shared::candid::CandidRejectionCode;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::GroupId;

#[derive(Debug)]
pub enum HistoryLedgerError {
    NetworkError(CandidRejectionCode, String),
}

// TODO: add calls made with access_configs

pub struct HistoryLedgerService;

impl HistoryLedgerService {
    pub async fn get_shares_info_of_at(
        group_id: GroupId,
        of: Principal,
        at: u64,
    ) -> Result<Option<SharesInfo>, HistoryLedgerError> {
        let history_ledger = Settings::get().get_most_actual_by_history_ledger(&at);

        let resp = history_ledger
            .get_shares_info_of_at(GetSharesInfoOfAtRequest { group_id, of, at })
            .await
            .map_err(|(code, msg)| HistoryLedgerError::NetworkError(code, msg))?;

        Ok(resp.info_opt)
    }
}

