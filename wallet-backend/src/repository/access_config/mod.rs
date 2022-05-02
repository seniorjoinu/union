use crate::repository::access_config::model::AccessConfig;
use crate::repository::access_config::types::{AccessConfigFilter, AccessConfigId};
use crate::repository::permission::types::PermissionId;
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::GroupOrProfile;
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct AccessConfigRepository {
    access_configs: HashMap<AccessConfigId, AccessConfig>,
    id_gen: IdGenerator,

    access_configs_by_permission: BTreeMap<PermissionId, BTreeSet<AccessConfigId>>,
    access_configs_by_group_or_profile: BTreeMap<GroupOrProfile, BTreeSet<AccessConfigId>>,
}

impl Repository<AccessConfig, AccessConfigId, AccessConfigFilter, ()> for AccessConfigRepository {
    fn save(&mut self, mut it: AccessConfig) -> AccessConfigId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        } else {
            let prev_it = self.get(&it.get_id().unwrap()).unwrap();
            self.remove_from_indexes(&prev_it);
        }

        self.add_to_indexes(&it);
        let id = it.get_id().unwrap();
        self.access_configs.insert(id, it);

        id
    }

    fn delete(&mut self, id: &AccessConfigId) -> Option<AccessConfig> {
        let it = self.access_configs.remove(id)?;
        self.remove_from_indexes(&it);

        Some(it)
    }

    fn get(&self, id: &AccessConfigId) -> Option<AccessConfig> {
        self.access_configs.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<AccessConfigFilter, ()>) -> Page<AccessConfig> {
        if page_req.filter.permission.is_none() && page_req.filter.group_or_profile.is_none() {
            let (has_next, iter) = self.access_configs.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page::new(data, has_next);
        }

        let mut index = if let Some(permission_id) = page_req.filter.permission {
            self.access_configs_by_permission
                .get(&permission_id)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::default()
        };

        let mut index2 = if let Some(gop) = page_req.filter.group_or_profile {
            self.access_configs_by_group_or_profile
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

impl AccessConfigRepository {
    pub fn get_access_configs_by_permission(
        &self,
        permission_id: &PermissionId,
    ) -> BTreeSet<AccessConfigId> {
        self.access_configs_by_permission
            .get(permission_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn gop_has_related_access_configs(&self, gop: &GroupOrProfile) -> bool {
        if let Some(index) = self.access_configs_by_group_or_profile.get(gop) {
            !index.is_empty()
        } else {
            false
        }
    }

    pub fn permission_has_related_access_configs(&self, permission_id: &PermissionId) -> bool {
        if let Some(index) = self.access_configs_by_permission.get(permission_id) {
            !index.is_empty()
        } else {
            false
        }
    }

    pub fn count(&self) -> usize {
        self.access_configs.len()
    }

    fn add_to_indexes(&mut self, query_config: &AccessConfig) {
        let id = query_config.get_id().unwrap();

        for permission in query_config.get_permissions() {
            self.access_configs_by_permission
                .entry(*permission)
                .or_default()
                .insert(id);
        }

        for allowee in query_config.get_allowees() {
            if let Some(gop) = allowee.to_group_or_profile() {
                self.access_configs_by_group_or_profile
                    .entry(gop)
                    .or_default()
                    .insert(id);
            }
        }
    }

    fn remove_from_indexes(&mut self, query_config: &AccessConfig) {
        let id = query_config.get_id().unwrap();

        for permission in query_config.get_permissions() {
            self.access_configs_by_permission
                .get_mut(permission)
                .unwrap()
                .remove(&id);
        }

        for allowee in query_config.get_allowees() {
            if let Some(gop) = &allowee.to_group_or_profile() {
                self.access_configs_by_group_or_profile
                    .get_mut(gop)
                    .unwrap()
                    .remove(&id);
            }
        }
    }
}
