use crate::repository::shares_move::types::{SharesMoveEntry, SharesMoveEntryId};
use candid::{CandidType, Deserialize, Principal};
use shared::sorted_by_timestamp::SortedByTimestamp;
use shared::types::wallet::{GroupId, Shareholder};
use std::collections::HashMap;

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct SharesMoveRepository {
    pub records: HashMap<SharesMoveEntryId, SharesMoveEntry>,
    pub record_id_counter: SharesMoveEntryId,

    pub records_by_timestamp_index:
        HashMap<(GroupId, Principal), SortedByTimestamp<SharesMoveEntryId>>,
}

impl SharesMoveRepository {
    pub fn add_entry(&mut self, entry: SharesMoveEntry) {
        let id = self.generate_entry_id();

        if let Shareholder::Principal(ps) = &entry.from {
            self.add_to_timestamp_index(entry.group_id, ps.principal_id, entry.timestamp, id);
        }

        if let Shareholder::Principal(ps) = &entry.to {
            self.add_to_timestamp_index(entry.group_id, ps.principal_id, entry.timestamp, id);
        }

        self.records.insert(id, entry);
    }

    pub fn entry_of_at(
        &self,
        group_id: GroupId,
        of: Principal,
        timestamp: u64,
    ) -> Option<SharesMoveEntry> {
        let sorted = self.records_by_timestamp_index.get(&(group_id, of))?;
        let entries = sorted.most_actual_by(&timestamp)?;
        assert_eq!(entries.len(), 1);

        let id = entries.iter().next().unwrap();

        self.records.get(id).cloned()
    }

    fn add_to_timestamp_index(
        &mut self,
        group_id: GroupId,
        principal: Principal,
        timestamp: u64,
        id: SharesMoveEntryId,
    ) {
        self.records_by_timestamp_index
            .entry((group_id, principal))
            .or_default()
            .push(timestamp, id);
    }

    fn generate_entry_id(&mut self) -> SharesMoveEntryId {
        let id = self.record_id_counter;
        self.record_id_counter += 1;

        id
    }
}
