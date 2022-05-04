use crate::settings::Settings;
use candid::{Principal, CandidType, Deserialize};
use history_ledger_client::api::{GetSharesInfoOfAtRequest, ListProgramExecutionEntryIdsRequest, ProgramExecutionFilter};
use history_ledger_client::client::IHistoryLedger;
use shared::candid::CandidRejectionCode;
use shared::pageable::{Page, PageRequest};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::GroupId;

#[derive(Debug)]
pub enum HistoryLedgerError {
    NetworkError(CandidRejectionCode, String),
}

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
    
    pub async fn list_program_execution_entry_ids(page_req: PageRequest<ProgramExecutionFilter, ()>) -> Result<(Page<u64>, Principal), HistoryLedgerError> {
        // TODO: make it efficiently search through ledgers
        let history_ledger = **Settings::get().get_history_ledgers().first().unwrap();
        
        let resp = history_ledger
            .list_program_execution_entry_ids(ListProgramExecutionEntryIdsRequest { page_req })
            .await
            .map_err(|(code, msg)| HistoryLedgerError::NetworkError(code, msg))?;
        
        Ok((resp.page, history_ledger))
    }
}

