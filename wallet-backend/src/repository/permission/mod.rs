use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionFilter, PermissionId, PermissionTarget};
use candid::{CandidType, Deserialize};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use std::collections::{BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct PermissionRepository {
    permissions: HashMap<PermissionId, Permission>,
    id_gen: IdGenerator,

    permissions_by_permission_target_index: HashMap<PermissionTarget, BTreeSet<PermissionId>>,
}

impl Repository<Permission, PermissionId, PermissionFilter, ()> for PermissionRepository {
    fn save(&mut self, mut it: Permission) -> PermissionId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        } else {
            let id = it.get_id().unwrap();
            let prev_it = self.get(&id).unwrap();
            for target in prev_it.get_targets() {
                self.remove_from_target_index(&id, target);
            }
        }

        let id = it.get_id().unwrap();
        for target in it.get_targets() {
            self.add_to_target_index(id, target.clone());
        }

        self.permissions.insert(id, it);

        id
    }

    fn delete(&mut self, id: &PermissionId) -> Option<Permission> {
        let it = self.permissions.remove(id)?;
        for target in it.get_targets() {
            self.remove_from_target_index(id, target);
        }

        Some(it)
    }

    fn get(&self, id: &PermissionId) -> Option<Permission> {
        self.permissions.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<PermissionFilter, ()>) -> Page<Permission> {
        if let Some(target) = &page_req.filter.target {
            let ids_opt = self.permissions_by_permission_target_index.get(target);
            let ids_wide_opt = if let PermissionTarget::Endpoint(e) = target {
                if e.is_wildcard() {
                    None
                } else {
                    self.permissions_by_permission_target_index
                        .get(&PermissionTarget::Endpoint(e.to_wildcard()))
                }
            } else {
                None
            };

            if let Some(ids) = ids_opt {
                if let Some(ids_wide) = ids_wide_opt {
                    let (has_next, iter) = ids.union(ids_wide).get_page(page_req);
                    let data = iter.map(|id| self.get(id).unwrap()).collect();

                    Page::new(data, has_next)
                } else {
                    let (has_next, iter) = ids.iter().get_page(page_req);
                    let data = iter.map(|id| self.get(id).unwrap()).collect();

                    Page::new(data, has_next)
                }
            } else if let Some(ids_wide) = ids_wide_opt {
                let (has_next, iter) = ids_wide.iter().get_page(page_req);
                let data = iter.map(|id| self.get(id).unwrap()).collect();

                Page::new(data, has_next)
            } else {
                Page::empty()
            }
        } else {
            let (has_next, iter) = self.permissions.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            Page::new(data, has_next)
        }
    }
}

impl PermissionRepository {
    pub fn get_permissions_by_target(&self, target: &PermissionTarget) -> BTreeSet<PermissionId> {
        self.permissions_by_permission_target_index
            .get(target)
            .cloned()
            .unwrap_or_default()
    }

    fn add_to_target_index(&mut self, id: PermissionId, target: PermissionTarget) {
        self.permissions_by_permission_target_index
            .entry(target)
            .or_default()
            .insert(id);
    }

    fn remove_from_target_index(&mut self, id: &PermissionId, target: &PermissionTarget) {
        if let Some(permissions) = self.permissions_by_permission_target_index.get_mut(target) {
            permissions.remove(id);
        }
    }
}
