use candid::{CandidType, Deserialize, Principal};
use crate::types::wallet::{GroupId, Shares};

#[derive(Clone, CandidType, Deserialize)]
pub struct SharesInfo {
    pub balance: Shares,
    pub total_supply: Shares,
    pub timestamp: u64,
    pub group_id: GroupId,
    pub principal_id: Principal,
    // TODO: implement subnet signature
    pub signature: (),
}

impl SharesInfo {
    pub fn is_signature_valid(&self) -> bool {
        // TODO: implement subnet signature
        true
    }
}