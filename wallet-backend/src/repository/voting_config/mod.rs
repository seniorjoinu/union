use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::VotingConfigFilter;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupId, VotingConfigId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingConfigRepository {
    voting_configs: HashMap<VotingConfigId, VotingConfig>,
    id_gen: IdGenerator,

    voting_configs_by_group_index: BTreeMap<GroupId, BTreeSet<VotingConfigId>>,
    voting_configs_by_permission_index: BTreeMap<PermissionId, BTreeSet<VotingConfigId>>,
}

impl Repository<VotingConfig, VotingConfigId, VotingConfigFilter, ()> for VotingConfigRepository {
    fn save(&mut self, mut it: VotingConfig) -> VotingConfigId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        } else {
            let prev_it = self.get(&it.get_id().unwrap()).unwrap();
            self.remove_from_indexes(&prev_it);
        }

        self.add_to_indexes(&it);
        let id = it.get_id().unwrap();
        self.voting_configs.insert(id, it);

        id
    }

    fn delete(&mut self, id: &VotingConfigId) -> Option<VotingConfig> {
        let it = self.voting_configs.remove(id)?;
        self.remove_from_indexes(&it);

        Some(it)
    }

    fn get(&self, id: &VotingConfigId) -> Option<VotingConfig> {
        self.voting_configs.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<VotingConfigFilter, ()>) -> Page<VotingConfig> {
        let index = if let Some(permission_id) = page_req.filter.permission {
            let mut index = self
                .voting_configs_by_permission_index
                .get(&permission_id)
                .cloned()
                .unwrap_or_default();

            if let Some(group_id) = page_req.filter.group {
                if let Some(index1) = self.voting_configs_by_group_index.get(&group_id) {
                    index = index.intersection(index1).cloned().collect()
                }
            }

            index
        } else if let Some(group_id) = page_req.filter.group {
            self.voting_configs_by_group_index
                .get(&group_id)
                .cloned()
                .unwrap_or_default()
        } else {
            // if no filter set - return all
            let (has_next, iter) = self.voting_configs.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page::new(data, has_next);
        };

        let (has_next, iter) = index.iter().get_page(page_req);
        let data = iter.map(|id| self.get(id).unwrap()).collect();

        Page::new(data, has_next)
    }
}

impl VotingConfigRepository {
    pub fn group_has_related_voting_configs(&self, group_id: &GroupId) -> bool {
        if let Some(index) = self.voting_configs_by_group_index.get(group_id) {
            !index.is_empty()
        } else {
            false
        }
    }

    pub fn permission_has_related_voting_configs(&self, permission_id: &PermissionId) -> bool {
        if let Some(index) = self.voting_configs_by_permission_index.get(permission_id) {
            !index.is_empty()
        } else {
            false
        }
    }

    fn add_to_indexes(&mut self, voting_config: &VotingConfig) {
        let id = voting_config.get_id().unwrap();

        for permission_id in voting_config.get_permissions() {
            self.add_to_permissions_index(id, *permission_id);
        }

        for gop in voting_config.get_approval_threshold().list_groups() {
            self.add_to_group_index(id, gop);
        }

        for gop in voting_config.get_rejection_threshold().list_groups() {
            self.add_to_group_index(id, gop);
        }

        for gop in voting_config.get_quorum_threshold().list_groups() {
            self.add_to_group_index(id, gop);
        }

        for gop in voting_config.get_win_threshold().list_groups() {
            self.add_to_group_index(id, gop);
        }

        for gop in voting_config.get_next_round_threshold().list_groups() {
            self.add_to_group_index(id, gop);
        }
    }

    fn remove_from_indexes(&mut self, voting_config: &VotingConfig) {
        let id = voting_config.get_id().unwrap();

        for permission_id in voting_config.get_permissions() {
            self.remove_from_permissions_index(&id, permission_id);
        }

        for gop in voting_config.get_approval_threshold().list_groups() {
            self.remove_from_group_index(&id, &gop);
        }

        for gop in voting_config.get_rejection_threshold().list_groups() {
            self.remove_from_group_index(&id, &gop);
        }

        for gop in voting_config.get_quorum_threshold().list_groups() {
            self.remove_from_group_index(&id, &gop);
        }

        for gop in voting_config.get_win_threshold().list_groups() {
            self.remove_from_group_index(&id, &gop);
        }

        for gop in voting_config.get_next_round_threshold().list_groups() {
            self.remove_from_group_index(&id, &gop);
        }
    }

    fn add_to_permissions_index(
        &mut self,
        voting_config_id: VotingConfigId,
        permission_id: PermissionId,
    ) {
        self.voting_configs_by_permission_index
            .entry(permission_id)
            .or_default()
            .insert(voting_config_id);
    }

    fn remove_from_permissions_index(
        &mut self,
        voting_config_id: &VotingConfigId,
        permission_id: &PermissionId,
    ) {
        self.voting_configs_by_permission_index
            .get_mut(permission_id)
            .unwrap()
            .remove(voting_config_id);
    }

    fn add_to_group_index(&mut self, voting_config_id: VotingConfigId, group_id: GroupId) {
        self.voting_configs_by_group_index
            .entry(group_id)
            .or_default()
            .insert(voting_config_id);
    }

    fn remove_from_group_index(&mut self, voting_config_id: &VotingConfigId, group_id: &GroupId) {
        self.voting_configs_by_group_index
            .get_mut(&group_id)
            .unwrap()
            .remove(voting_config_id);
    }
}
