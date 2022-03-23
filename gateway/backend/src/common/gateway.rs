use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct State {
    pub controller: Principal,
    pub users_by_union_wallet_index: HashMap<Principal, HashSet<Principal>>,
    pub union_wallets_by_user_index: HashMap<Principal, HashSet<Principal>>,
}

impl State {
    pub fn new(controller: Principal) -> Self {
        Self {
            controller,
            users_by_union_wallet_index: HashMap::default(),
            union_wallets_by_user_index: HashMap::default(),
        }
    }

    pub fn update_controller(&mut self, new_controller: Principal) {
        self.controller = new_controller;
    }

    pub fn attach_user_to_union_wallet(&mut self, user_id: Principal, wallet_id: Principal) {
        match self.users_by_union_wallet_index.entry(wallet_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(user_id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![user_id].into_iter().collect());
            }
        };

        match self.union_wallets_by_user_index.entry(user_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(wallet_id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![wallet_id].into_iter().collect());
            }
        };
    }

    pub fn detach_user_from_union_wallet(&mut self, user_id: Principal, wallet_id: Principal) {
        if let Entry::Occupied(mut e) = self.users_by_union_wallet_index.entry(wallet_id) {
            e.get_mut().remove(&user_id);
        }

        if let Entry::Occupied(mut e) = self.union_wallets_by_user_index.entry(user_id) {
            e.get_mut().remove(&wallet_id);
        }
    }

    pub fn get_union_wallets_attached_to_user(&self, user_id: &Principal) -> Vec<Principal> {
        self.union_wallets_by_user_index
            .get(user_id)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_users_attached_to_union_wallet(&self, wallet_id: &Principal) -> Vec<Principal> {
        self.users_by_union_wallet_index
            .get(wallet_id)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }
}
