use crate::repository::shares_move::model::SharesMoveEntry;
use candid::Principal;
use shared::mvc::HasRepository;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{GroupId, Shareholder};

pub struct SharesMoveService;

impl SharesMoveService {
    pub fn shares_info_of_at(group_id: GroupId, of: Principal, at: u64) -> Option<SharesInfo> {
        let entry = SharesMoveEntry::repo().entry_of_at(group_id, of, at)?;

        if let Shareholder::Principal(ps) = entry.get_from() {
            if ps.principal_id == of {
                return Some(SharesInfo {
                    balance: ps.new_balance.clone(),
                    total_supply: entry.get_total_supply().clone(),
                    signature: (),
                });
            }
        }

        if let Shareholder::Principal(ps) = entry.get_to() {
            if ps.principal_id == of {
                return Some(SharesInfo {
                    balance: ps.new_balance.clone(),
                    total_supply: entry.get_total_supply().clone(),
                    signature: (),
                });
            }
        }

        unreachable!();
    }
}
