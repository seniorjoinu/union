use crate::common::types::{Bill, BillStatus, GatewayError, RoleId};
use crate::{BillId, BillType};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

pub type NotificationId = u64;

#[derive(Clone, CandidType, Deserialize)]
pub struct ProfileCreatedNotification {
    pub id: NotificationId,
    pub receiver: Principal,
    pub union_wallet_id: Principal,
    pub role_id: RoleId,
}

#[derive(CandidType, Deserialize)]
pub struct State {
    pub controller: Principal,
    pub users_by_union_wallet_index: HashMap<Principal, HashSet<Principal>>,
    pub union_wallets_by_user_index: HashMap<Principal, HashSet<Principal>>,

    pub notifications: HashMap<NotificationId, ProfileCreatedNotification>,
    pub notifications_by_user: HashMap<Principal, HashSet<NotificationId>>,
    pub notification_id_counter: NotificationId,

    pub deployer_canister_id: Principal,
    pub bills: HashMap<BillId, Bill>,
}

impl State {
    pub fn new(controller: Principal, deployer_canister_id: Principal) -> Self {
        Self {
            controller,
            users_by_union_wallet_index: HashMap::default(),
            union_wallets_by_user_index: HashMap::default(),

            notifications: HashMap::default(),
            notifications_by_user: HashMap::default(),
            notification_id_counter: 0,

            deployer_canister_id,
            bills: HashMap::default(),
        }
    }

    pub fn create_bill(
        &mut self,
        id: BillId,
        bill_type: BillType,
        to: Principal,
        timestamp: u64,
    ) -> BillId {
        let bill = Bill {
            id: id.clone(),
            bill_type,
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

    pub fn is_mentioned_union_wallet(&self, wallet_canister_id: &Principal) -> bool {
        self.users_by_union_wallet_index
            .contains_key(wallet_canister_id)
    }

    // TODO: NOTIFICATIONS CAN OVERFLOW THE STORAGE
    pub fn create_notification(
        &mut self,
        receiver: Principal,
        union_wallet_id: Principal,
        role_id: RoleId,
    ) -> NotificationId {
        let id = self.generate_notification_id();

        let notification = ProfileCreatedNotification {
            id,
            receiver,
            union_wallet_id,
            role_id,
        };

        match self.notifications_by_user.entry(notification.receiver) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![id].into_iter().collect());
            }
        }

        self.notifications.insert(id, notification);

        id
    }

    pub fn get_notifications_by_user_cloned(
        &self,
        user_id: &Principal,
    ) -> Vec<ProfileCreatedNotification> {
        match self.notifications_by_user.get(user_id) {
            None => Vec::new(),
            Some(ids) => {
                let mut result = Vec::new();

                for id in ids {
                    let notification = self.notifications.get(id).unwrap();

                    result.push(notification.clone());
                }

                result
            }
        }
    }

    pub fn remove_notification(&mut self, notification_id: &NotificationId, caller: &Principal) {
        let notification_ids = self
            .notifications_by_user
            .get_mut(caller)
            .expect("Access denied");

        assert!(notification_ids.contains(notification_id), "Access denied");
        notification_ids.remove(notification_id);

        self.notifications.remove(notification_id).unwrap();
    }

    fn generate_notification_id(&mut self) -> NotificationId {
        let id = self.notification_id_counter;
        self.notification_id_counter += 1;

        id
    }
}
