use crate::repository::token::types::BalanceId;
use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Model;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupId, GroupOrProfile, ProfileId, Shares, TokenId, VotingId};
use shared::types::Blob;
use shared::validation::ValidationError;
use std::mem;

#[derive(Clone, CandidType, Deserialize)]
pub struct Balance<T: Copy> {
    id: T,
    value: Shares,
}

impl<T: Copy> Balance<T> {
    pub fn new(id: T) -> Self {
        Self {
            id,
            value: Shares::default(),
        }
    }

    pub fn mint(&mut self, qty: Shares) {
        self.value += qty;
    }

    pub fn burn(&mut self, qty: Shares) -> bool {
        if self.value < qty {
            false
        } else {
            self.value -= qty;
            true
        }
    }

    pub fn set(&mut self, value: Shares) -> Shares {
        mem::replace(&mut self.value, value)
    }

    pub fn get(&self) -> Shares {
        self.value.clone()
    }
}

impl<T: Copy> Model<T> for Balance<T> {
    fn get_id(&self) -> Option<T> {
        Some(self.id)
    }

    fn _init_id(&mut self, id: T) {
        unreachable!();
    }

    fn is_transient(&self) -> bool {
        false
    }
}
