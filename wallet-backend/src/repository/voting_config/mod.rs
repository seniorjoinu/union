use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::VotingConfigFilter;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupOrProfile, VotingConfigId};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingConfigRepository {
    voting_configs: HashMap<VotingConfigId, VotingConfig>,
    id_gen: IdGenerator,

    voting_configs_by_group_or_profile_index: BTreeMap<GroupOrProfile, BTreeSet<VotingConfigId>>,
    voting_configs_by_permission_index: BTreeMap<PermissionId, BTreeSet<VotingConfigId>>,
}

impl Repository<VotingConfig, VotingConfigId, VotingConfigFilter, ()> for VotingConfigRepository {
    fn save(&mut self, mut it: VotingConfig) {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        } else {
            let prev_it = self.get(&it.get_id().unwrap()).unwrap();
            self.remove_from_indexes(&prev_it);
        }

        self.add_to_indexes(&it);
        self.voting_configs.insert(it.get_id().unwrap(), it);
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
        if page_req.filter.permission.is_none() && page_req.filter.group_or_profile.is_none() {
            let (has_next, iter) = self.voting_configs.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page::new(data, has_next);
        }

        let mut index = if let Some(permission_id) = page_req.filter.permission {
            self.voting_configs_by_permission_index
                .get(&permission_id)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::default()
        };

        let mut index2 = if let Some(gop) = page_req.filter.group_or_profile {
            self.voting_configs_by_group_or_profile_index
                .get(&gop)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::default()
        };

        if !index.is_empty() {
            index.append(&mut index2);
        } else {
            index = index.intersection(&index2).cloned().collect();
        }

        let (has_next, iter) = index.iter().get_page(page_req);
        let data = iter.map(|id| self.get(id).unwrap()).collect();

        Page::new(data, has_next)
    }
}

impl VotingConfigRepository {
    fn add_to_indexes(&mut self, voting_config: &VotingConfig) {
        let id = voting_config.get_id().unwrap();

        for permission_id in voting_config.get_permissions() {
            self.add_to_permissions_index(id, *permission_id);
        }

        for proposer in voting_config.get_proposers() {
            self.add_to_group_or_profile_index(id, proposer.to_group_or_profile());
        }

        for editor in voting_config.get_editors() {
            if let Some(gop) = editor.to_group_or_profile() {
                self.add_to_group_or_profile_index(id, gop);
            }
        }

        for gop in voting_config.get_approval().list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in voting_config.get_rejection().list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in voting_config.get_quorum().list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in voting_config.get_win().list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in voting_config.get_next_round().list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }
    }

    fn remove_from_indexes(&mut self, voting_config: &VotingConfig) {
        let id = voting_config.get_id().unwrap();

        for permission_id in voting_config.get_permissions() {
            self.remove_from_permissions_index(&id, permission_id);
        }

        for proposer in voting_config.get_proposers() {
            self.remove_from_group_or_profile_index(&id, &proposer.to_group_or_profile());
        }

        for editor in voting_config.get_editors() {
            if let Some(gop) = editor.to_group_or_profile() {
                self.remove_from_group_or_profile_index(&id, &gop);
            }
        }

        for gop in voting_config.get_approval().list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(&id, &gop);
        }

        for gop in voting_config.get_rejection().list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(&id, &gop);
        }

        for gop in voting_config.get_quorum().list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(&id, &gop);
        }

        for gop in voting_config.get_win().list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(&id, &gop);
        }

        for gop in voting_config.get_next_round().list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(&id, &gop);
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

    fn add_to_group_or_profile_index(
        &mut self,
        voting_config_id: VotingConfigId,
        gop: GroupOrProfile,
    ) {
        self.voting_configs_by_group_or_profile_index
            .entry(gop)
            .or_default()
            .insert(voting_config_id);
    }

    fn remove_from_group_or_profile_index(
        &mut self,
        voting_config_id: &VotingConfigId,
        gop: &GroupOrProfile,
    ) {
        self.voting_configs_by_group_or_profile_index
            .get_mut(&gop)
            .unwrap()
            .remove(voting_config_id);
    }
}
