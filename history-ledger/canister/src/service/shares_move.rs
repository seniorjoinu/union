use crate::repository::get_repositories;
use candid::Principal;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{GroupId, Shareholder};

pub fn shares_info_of_at(group_id: GroupId, of: Principal, at: u64) -> Option<SharesInfo> {
    let entry = get_repositories()
        .shares_move
        .entry_of_at(group_id, of, at)?;

    if let Shareholder::Principal(ps) = entry.from {
        if ps.principal_id == of {
            return Some(SharesInfo {
                balance: ps.new_balance,
                total_supply: entry.total_supply,
            });
        }
    }

    if let Shareholder::Principal(ps) = entry.to {
        if ps.principal_id == of {
            return Some(SharesInfo {
                balance: ps.new_balance,
                total_supply: entry.total_supply,
            });
        }
    }

    unreachable!();
}
