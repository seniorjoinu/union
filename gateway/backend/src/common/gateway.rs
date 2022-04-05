use crate::common::api::{Bill, BillId, BillStatus, BillType, GatewayError};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

#[derive(CandidType, Deserialize)]
pub struct State {
    pub controller: Principal,
    pub users_by_union_wallet_index: HashMap<Principal, HashSet<Principal>>,
    pub union_wallets_by_user_index: HashMap<Principal, HashSet<Principal>>,

    pub deployer_canister_id: Principal,
    pub bills: HashMap<BillId, Bill>,
}

impl State {
    pub fn new(controller: Principal, deployer_canister_id: Principal) -> Self {
        Self {
            controller,
            users_by_union_wallet_index: HashMap::default(),
            union_wallets_by_user_index: HashMap::default(),

            deployer_canister_id,
            bills: HashMap::default(),
        }
    }

    pub fn create_bill(
        &mut self,
        id: BillId,
        invoice_type: BillType,
        to: Principal,
        timestamp: u64,
    ) -> BillId {
        let bill = Bill {
            id: id.clone(),
            bill_type: invoice_type,
            to,
            status: BillStatus::Created,
            created_at: timestamp,
        };

        self.bills.insert(id.clone(), bill);

        id
    }

    pub fn set_bill_paid(&mut self, id: BillId) -> Result<(), GatewayError> {
        let bill = self.bills.get_mut(&id).ok_or(GatewayError::BillNotFound)?;

        match bill.status {
            BillStatus::Paid => Err(GatewayError::BillAlreadyPaid),
            BillStatus::Created => {
                bill.status = BillStatus::Paid;

                Ok(())
            }
        }
    }

    pub fn remove_bill(&mut self, id: BillId) {
        self.bills.remove(&id);
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
