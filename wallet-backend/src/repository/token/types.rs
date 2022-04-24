use crate::repository::token;
use candid::{CandidType, Deserialize};
use shared::mvc::Id;
use shared::types::wallet::Shares;
use shared::types::Blob;
use std::collections::hash_map::Iter;
use std::collections::HashMap;

#[derive(Debug)]
pub enum TokenError<K> {
    InsufficientBalance(K),
}

#[derive(Default, Debug, CandidType, Deserialize)]
pub struct Balances(HashMap<Blob, Shares>);

impl Balances {
    pub fn mint<K: Into<Blob>>(&mut self, k: K, qty: Shares) {
        let new_balance = self.take_balance_of(&k) + qty;
        self.0.insert(k.into(), new_balance);
    }

    pub fn burn<K: Into<Blob>>(&mut self, k: K, qty: Shares) -> bool {
        let old_balance = self.take_balance_of(&k);
        if old_balance < qty {
            self.0.insert(k.into(), old_balance);
            false
        } else {
            self.0.insert(k.into(), old_balance - qty);
            true
        }
    }

    fn take_balance_of<K: Into<Blob>>(&mut self, k: &K) -> Shares {
        self.0.remove(k.into()).unwrap_or_default()
    }

    pub fn balance_of<K: Into<Blob>>(&self, k: &K) -> Shares {
        self.0.get(k.into()).cloned().unwrap_or_default()
    }

    pub fn iter(&self) -> Iter<Blob, Shares> {
        self.0.iter()
    }
}
