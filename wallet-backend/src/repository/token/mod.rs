use crate::repository::token::model::Balance;
use crate::repository::token::types::{BalanceFilter, BalanceId, GroupSharesType, TotalSupplyId};
use crate::Principal;
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupId, VotingId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct BalanceRepository {
    balances: HashMap<BalanceId, Balance<BalanceId>>,

    shares_by_group_index: BTreeMap<GroupId, BTreeSet<BalanceId>>,
    unaccepted_shares_by_group_index: BTreeMap<GroupId, BTreeSet<BalanceId>>,
    shares_by_principal_index: BTreeMap<Principal, BTreeSet<BalanceId>>,
    unaccepted_shares_by_principal_index: BTreeMap<Principal, BTreeSet<BalanceId>>,

    voter_voting_power_by_principal_index: BTreeMap<Principal, BTreeSet<BalanceId>>,
}

impl Repository<Balance<BalanceId>, BalanceId, BalanceFilter, ()> for BalanceRepository {
    fn save(&mut self, it: Balance<BalanceId>) {
        let id = it.get_id().unwrap();

        self.add_to_index(&id);
        self.balances.insert(id, it);
    }

    fn delete(&mut self, id: &BalanceId) -> Option<Balance<BalanceId>> {
        self.remove_from_index(id);
        self.balances.remove(id)
    }

    fn get(&self, id: &BalanceId) -> Option<Balance<BalanceId>> {
        self.balances.get(it).cloned()
    }

    fn list(&self, page_req: &PageRequest<BalanceFilter, ()>) -> Page<Balance<BalanceId>> {
        let index_opt = match &page_req.filter {
            BalanceFilter::SharesByGroup(g, t) => match t {
                GroupSharesType::Accepted => self.shares_by_group_index.get(g),
                GroupSharesType::Unaccepted => self.unaccepted_shares_by_group_index.get(g),
            },
            BalanceFilter::SharesByPrincipal(p, t) => match t {
                GroupSharesType::Accepted => self.shares_by_principal_index.get(p),
                GroupSharesType::Unaccepted => self.unaccepted_shares_by_principal_index.get(p),
            },
            BalanceFilter::VotingPowerByPrincipal(p) => {
                self.voter_voting_power_by_principal_index.get(p)
            }
        };

        if let Some(index) = index_opt {
            let (has_next, iter) = index.iter().get_page(page_req);
            let data = iter.map(|id| self.get(id).unwrap()).collect();

            Page::new(data, has_next)
        } else {
            Page::empty()
        }
    }
}

impl BalanceRepository {
    fn add_to_index(&mut self, id: &BalanceId) {
        match id {
            BalanceId::PrivateGroupShares(g, t, p) => match t {
                GroupSharesType::Accepted => {
                    self.shares_by_group_index
                        .entry(*g)
                        .or_default()
                        .insert(*id);
                    self.shares_by_principal_index
                        .entry(*p)
                        .or_default()
                        .insert(*id);
                }
                GroupSharesType::Unaccepted => {
                    self.unaccepted_shares_by_group_index
                        .entry(*g)
                        .or_default()
                        .insert(*id);
                    self.unaccepted_shares_by_principal_index
                        .entry(*p)
                        .or_default()
                        .insert(*id)
                }
            },
            BalanceId::PublicGroupShares(g, p) => {
                self.shares_by_group_index
                    .entry(*g)
                    .or_default()
                    .insert(*id);
                self.shares_by_principal_index
                    .entry(*p)
                    .or_default()
                    .insert(*id);
            }
            BalanceId::ChoiceVotingPower(_, _, p) => {
                self.voter_voting_power_by_principal_index
                    .entry(*p)
                    .or_default()
                    .insert(*id);
            }
        }
    }

    fn remove_from_index(&mut self, id: &BalanceId) {
        match id {
            BalanceId::PrivateGroupShares(g, t, p) => match t {
                GroupSharesType::Accepted => {
                    self.shares_by_group_index.get_mut(g).unwrap().remove(id);
                    self.shares_by_principal_index
                        .get_mut(p)
                        .unwrap()
                        .remove(id);
                }
                GroupSharesType::Unaccepted => {
                    self.unaccepted_shares_by_group_index
                        .get_mut(g)
                        .unwrap()
                        .remove(id);
                    self.unaccepted_shares_by_principal_index
                        .get_mut(p)
                        .unwrap()
                        .remove(id);
                }
            },
            BalanceId::PublicGroupShares(g, p) => {
                self.shares_by_group_index.get_mut(g).unwrap().remove(id);
                self.shares_by_principal_index
                    .get_mut(p)
                    .unwrap()
                    .remove(id);
            }
            BalanceId::ChoiceVotingPower(_, _, p) => {
                self.voter_voting_power_by_principal_index
                    .get_mut(p)
                    .unwrap()
                    .remove(id);
            }
        }
    }
}

#[derive(Default, CandidType, Deserialize)]
pub struct TotalSupplyRepository {
    total_supplies: HashMap<TotalSupplyId, Balance<TotalSupplyId>>,
}

impl Repository<Balance<TotalSupplyId>, TotalSupplyId, (), ()> for TotalSupplyRepository {
    fn save(&mut self, it: Balance<TotalSupplyId>) {
        self.total_supplies.insert(it.get_id().unwrap(), it);
    }

    fn delete(&mut self, id: &TotalSupplyId) -> Option<Balance<TotalSupplyId>> {
        self.total_supplies.remove(id)
    }

    fn get(&self, id: &TotalSupplyId) -> Option<Balance<TotalSupplyId>> {
        self.total_supplies.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), ()>) -> Page<Balance<TotalSupplyId>> {
        let (has_next, iter) = self.total_supplies.iter().get_page(page_req);
        let data = iter.map(|(_, it)| it.clone()).collect();

        Page::new(data, has_next)
    }
}
