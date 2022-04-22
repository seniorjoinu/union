use candid::{CandidType, Deserialize};
use crate::types::wallet::Shares;

#[derive(CandidType, Deserialize)]
pub struct SharesInfo {
    pub balance: Shares,
    pub total_supply: Shares,
}