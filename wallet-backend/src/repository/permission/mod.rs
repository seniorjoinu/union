use crate::repository::permission::types::{
    Permission, PermissionId, PermissionRepositoryError, PermissionScope, PermissionTarget,
};
use crate::Program;
use ic_cdk::export::candid::{CandidType, Deserialize};
use shared::remote_call::RemoteCallEndpoint;
use std::collections::hash_map::Entry;
use std::collections::{BTreeSet, HashMap};
use crate::repository::voting::types::Program;

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
    ) -> PermissionId {
        let id = self.generate_permission_id();
        let permission = Permission {
            id,
            name,
            targets: targets.clone().into_iter().collect(),
            scope,
        };

        self.permissions.insert(id, permission);

        for target in targets {
            self.add_permission_to_target_index(id, target);
        }

        id
    }

    pub fn update_permission(
        &mut self,
        permission_id: &PermissionId,
        new_name: Option<String>,
        new_targets: Option<Vec<PermissionTarget>>,
        new_scope: Option<PermissionScope>,
    ) -> Result<(), PermissionRepositoryError> {
        let permission = self.get_permission_mut(permission_id)?;

        if let Some(name) = new_name {
            permission.name = name;
        }

        if let Some(scope) = new_scope {
            permission.scope = scope;
        }

        if let Some(targets) = new_targets {
            let old_permission_targets =
                std::mem::replace(&mut permission.targets, targets.into_iter().collect());

            for old_target in &old_permission_targets {
                self.remove_permission_from_target_index(permission_id, old_target);
            }

            let permission = self.get_permission_mut(permission_id)?;

            for target in permission.targets.clone() {
                self.add_permission_to_target_index(*permission_id, target);
            }
        }

        Ok(())
    }

    pub fn remove_permission(
        &mut self,
        permission_id: &PermissionId,
    ) -> Result<Permission, PermissionRepositoryError> {
        if self.permissions.len() == 1 {
            return Err(PermissionRepositoryError::ThereShouldBeAtLeastOnePermission);
        }

        let permission = self
            .permissions
            .remove(permission_id)
            .ok_or(PermissionRepositoryError::PermissionDoesNotExist)?;

        for target in &permission.targets {
            self.remove_permission_from_target_index(permission_id, target);
        }

        Ok(permission)
    }

    pub fn get_permission_ids_cloned(&self) -> Vec<PermissionId> {
        self.permissions.keys().cloned().collect()
    }

    pub fn get_permission_ids_by_permission_target_cloned(
        &self,
        permission_target: &PermissionTarget,
    ) -> Vec<PermissionId> {
        self.permissions_by_permission_target_index
            .get(permission_target)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_permission_ids_by_permission_target(
        &self,
        permission_target: &PermissionTarget,
    ) -> Option<&BTreeSet<PermissionId>> {
        self.permissions_by_permission_target_index
            .get(permission_target)
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
    use std::time::{SystemTime, UNIX_EPOCH};

    pub fn random_principal_test() -> Principal {
        Principal::from_slice(
            &SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
                .to_be_bytes(),
        )
    }

    #[test]
    pub fn permission_crud_works_fine() {
        let mut repository = PermissionRepository::default();
        let target_1 = PermissionTarget::Endpoint(RemoteCallEndpoint {
            canister_id: random_principal_test(),
            method_name: String::from("test_method"),
        });
        let target_2 = PermissionTarget::Canister(random_principal_test());

        let permission_id_1 = repository.create_permission(
            String::from("Permission 1"),
            vec![target_1.clone(), target_2.clone()],
            PermissionScope::Whitelist,
        );

        let permission_1 = repository
            .get_permission(&permission_id_1)
            .expect("Permission 1 should be possible to obtain");
        assert!(
            matches!(permission_1.scope, PermissionScope::Whitelist),
            "Permission 1 scope should equal to Whitelist"
        );
        assert_eq!(
            permission_1.name, "Permission 1",
            "Permission 1 name is wrong"
        );
        assert_eq!(
            permission_1.targets.len(),
            2,
            "There should be 2 targets in Permission 1"
        );

        let permission_id_2 = repository.create_permission(
            String::from("Permission 2"),
            vec![target_2.clone()],
            PermissionScope::Whitelist,
        );

        let canister_2_related_permissions =
            repository.get_permission_ids_by_permission_target_cloned(&target_2);
        assert_eq!(
            canister_2_related_permissions.len(),
            2,
            "There should be 2 permissions about this target"
        );
        assert!(
            canister_2_related_permissions.contains(&permission_id_1),
            "Permission 1 should be in the list"
        );
        assert!(
            canister_2_related_permissions.contains(&permission_id_2),
            "Permission 2 should be in the list"
        );

        repository
            .update_permission(&permission_id_1, None, Some(vec![target_1]), None)
            .expect("It should be possible to update permission 1");

        let canister_2_related_permissions =
            repository.get_permission_ids_by_permission_target_cloned(&target_2);
        assert_eq!(
            canister_2_related_permissions.len(),
            1,
            "There should be 1 permission about this target"
        );
        assert!(
            canister_2_related_permissions.contains(&permission_id_2),
            "Permission 2 should be in the list"
        );

        repository
            .remove_permission(&permission_id_2)
            .expect("It should be possible to remove permission 2");

        let canister_2_related_permissions =
            repository.get_permission_ids_by_permission_target_cloned(&target_2);

        assert!(
            canister_2_related_permissions.is_empty(),
            "There shouldn't be any permission about this target"
        );
    }
}
