use crate::repository::shares_move::types::SharesMoveEntryId;
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::types::wallet::{GroupId, Shareholder, Shares, SharesMoveEvent};

#[derive(Clone, CandidType, Deserialize)]
pub struct SharesMoveEntry {
    id: Option<SharesMoveEntryId>,
    timestamp: u64,
    group_id: GroupId,
    from: Shareholder,
    to: Shareholder,
    qty: Shares,
}

impl SharesMoveEntry {
    pub fn from_event(ev: SharesMoveEvent) -> Self {
        Self {
            id: None,
            timestamp: ev.timestamp,
            group_id: ev.group_id,
            from: ev.from,
            to: ev.to,
            qty: ev.qty,
        }
    }

    pub fn get_timestamp(&self) -> u64 {
        self.timestamp
    }

    pub fn get_from(&self) -> &Shareholder {
        &self.from
    }

    pub fn get_to(&self) -> &Shareholder {
        &self.to
    }

    pub fn get_group_id(&self) -> GroupId {
        self.group_id
    }

    pub fn get_qty(&self) -> &Shares {
        &self.qty
    }
}

impl Model<SharesMoveEntryId> for SharesMoveEntry {
    fn get_id(&self) -> Option<SharesMoveEntryId> {
        self.id
    }

    fn _init_id(&mut self, id: SharesMoveEntryId) {
        assert!(self.is_transient());
        self.id = Some(id)
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
