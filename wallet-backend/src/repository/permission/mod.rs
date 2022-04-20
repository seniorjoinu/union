use crate::common::utils::{Page, PageRequest, Pageable};
use crate::repository::permission::types::{
    Permission, PermissionFilter, PermissionId, PermissionRepositoryError, PermissionScope,
    PermissionTarget,
};
use ic_cdk::export::candid::{CandidType, Deserialize};
use std::collections::hash_map::Entry;
use std::collections::{BTreeSet, HashMap};

pub mod types;

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct PermissionRepository {
    permissions: HashMap<PermissionId, Permission>,
    permission_ids_counter: PermissionId,

    // this list doesn't take into an account whitelist/blacklist logic
    permissions_by_permission_target_index: HashMap<PermissionTarget, BTreeSet<PermissionId>>,
}

impl PermissionRepository {
    pub fn create_permission(
        &mut self,
        name: String,
        targets: Vec<PermissionTarget>,
        scope: PermissionScope,
    ) -> Result<PermissionId, PermissionRepositoryError> {
        let id = self.generate_permission_id();
        let permission = Permission::new(id, name, targets.clone(), scope)?;

        self.permissions.insert(id, permission);

        for target in targets {
            self.add_permission_to_target_index(id, target);
        }

        Ok(id)
    }

    pub fn update_permission(
        &mut self,
        permission_id: &PermissionId,
        new_name: Option<String>,
        new_targets: Option<Vec<PermissionTarget>>,
        new_scope: Option<PermissionScope>,
    ) -> Result<(), PermissionRepositoryError> {
        let permission = self.get_permission_mut(permission_id)?;
        let old_targets_opt = permission.update(new_name, new_targets.clone(), new_scope)?;

        if let Some(targets) = old_targets_opt {
            for old_target in &targets {
                self.remove_permission_from_target_index(permission_id, old_target);
            }

            for target in new_targets.unwrap() {
                self.add_permission_to_target_index(*permission_id, target);
            }
        }

        Ok(())
    }

    pub fn remove_permission(
        &mut self,
        permission_id: &PermissionId,
    ) -> Result<Permission, PermissionRepositoryError> {
        let permission = self
            .permissions
            .remove(permission_id)
            .ok_or(PermissionRepositoryError::PermissionDoesNotExist)?;

        for target in &permission.targets {
            self.remove_permission_from_target_index(permission_id, target);
        }

        Ok(permission)
    }

    pub fn get_permissions_cloned(
        &self,
        page_req: PageRequest<PermissionFilter, ()>,
    ) -> Page<Permission> {
        if let Some(filter_target) = &page_req.filter.target {
            let ids_opt = self
                .permissions_by_permission_target_index
                .get(filter_target);

            match ids_opt {
                Some(ids) => {
                    let (has_next, iter) = ids.into_iter().get_page(&page_req);

                    let data = iter
                        .map(|id| self.get_permission(id).unwrap().clone())
                        .collect();

                    Page { has_next, data }
                }
                None => Page {
                    data: Vec::new(),
                    has_next: false,
                },
            }
        } else {
            let (has_next, iter) = self.permissions.iter().get_page(&page_req);

            let data = iter.map(|(_, permission)| permission.clone()).collect();

            Page { has_next, data }
        }
    }

    fn get_permission_mut(
        &mut self,
        permission_id: &PermissionId,
    ) -> Result<&mut Permission, PermissionRepositoryError> {
        self.permissions
            .get_mut(permission_id)
            .ok_or(PermissionRepositoryError::PermissionDoesNotExist)
    }

    pub fn get_permission(
        &self,
        permission_id: &PermissionId,
    ) -> Result<&Permission, PermissionRepositoryError> {
        self.permissions
            .get(permission_id)
            .ok_or(PermissionRepositoryError::PermissionDoesNotExist)
    }

    fn add_permission_to_target_index(&mut self, id: PermissionId, target: PermissionTarget) {
        match self.permissions_by_permission_target_index.entry(target) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![id].into_iter().collect());
            }
        };
    }

    fn remove_permission_from_target_index(
        &mut self,
        id: &PermissionId,
        target: &PermissionTarget,
    ) {
        if let Some(permissions) = self.permissions_by_permission_target_index.get_mut(target) {
            permissions.remove(id);
        }
    }

    fn generate_permission_id(&mut self) -> PermissionId {
        let id = self.permission_ids_counter;
        self.permission_ids_counter += 1;

        id
    }
}

#[cfg(test)]
mod tests {
    use crate::repository::permission::types::{PermissionScope, PermissionTarget};
    use crate::repository::permission::PermissionRepository;
    use ic_cdk::export::Principal;
    use shared::remote_call::RemoteCallEndpoint;
}
