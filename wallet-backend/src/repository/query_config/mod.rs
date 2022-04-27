use crate::repository::permission::types::PermissionId;
use crate::repository::query_config::model::QueryConfig;
use crate::repository::query_config::types::{QueryConfigFilter, QueryConfigId};
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::GroupOrProfile;
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct QueryConfigRepository {
    query_configs: HashMap<QueryConfigId, QueryConfig>,
    id_gen: IdGenerator,

    query_configs_by_permission: BTreeMap<PermissionId, BTreeSet<QueryConfigId>>,
    query_configs_by_group_or_profile: BTreeMap<GroupOrProfile, BTreeSet<QueryConfigId>>,
}

impl Repository<QueryConfig, QueryConfigId, QueryConfigFilter, ()> for QueryConfigRepository {
    fn save(&mut self, mut it: QueryConfig) -> QueryConfigId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        } else {
            let prev_it = self.get(&it.get_id().unwrap()).unwrap();
            self.remove_from_indexes(&prev_it);
        }

        self.add_to_indexes(&it);
        let id = it.get_id().unwrap();
        self.query_configs.insert(id, it);
        
        id
    }

    fn delete(&mut self, id: &QueryConfigId) -> Option<QueryConfig> {
        let it = self.query_configs.remove(id)?;
        self.remove_from_indexes(&it);

        Some(it)
    }

    fn get(&self, id: &QueryConfigId) -> Option<QueryConfig> {
        self.query_configs.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<QueryConfigFilter, ()>) -> Page<QueryConfig> {
        if page_req.filter.permission.is_none() && page_req.filter.group_or_profile.is_none() {
            let (has_next, iter) = self.query_configs.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page::new(data, has_next);
        }

        let mut index = if let Some(permission_id) = page_req.filter.permission {
            self.query_configs_by_permission
                .get(&permission_id)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::default()
        };

        let mut index2 = if let Some(gop) = page_req.filter.group_or_profile {
            self.query_configs_by_group_or_profile
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

impl QueryConfigRepository {
    pub fn count(&self) -> usize {
        self.query_configs.len()
    }
    
    fn add_to_indexes(&mut self, query_config: &QueryConfig) {
        let id = query_config.get_id().unwrap();

        for permission in query_config.get_permissions() {
            self.query_configs_by_permission
                .entry(*permission)
                .or_default()
                .insert(id);
        }

        for allowee in query_config.get_allowees() {
            if let Some(gop) = allowee.to_group_or_profile() {
                self.query_configs_by_group_or_profile
                    .entry(gop)
                    .or_default()
                    .insert(id);
            }
        }
    }

    fn remove_from_indexes(&mut self, query_config: &QueryConfig) {
        let id = query_config.get_id().unwrap();

        for permission in query_config.get_permissions() {
            self.query_configs_by_permission
                .get_mut(permission)
                .unwrap()
                .remove(&id);
        }

        for allowee in query_config.get_allowees() {
            if let Some(gop) = &allowee.to_group_or_profile() {
                self.query_configs_by_group_or_profile
                    .get_mut(gop)
                    .unwrap()
                    .remove(&id);
            }
        }
    }
}
