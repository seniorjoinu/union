use crate::common::execution_history::RemoteCallEndpoint;
use crate::Program;
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

pub type PermissionId = u16;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum PermissionsError {
    PermissionDoesNotExist,
    NotPermissionTarget,
    ThereShouldBeAtLeastOnePermission,
}

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct PermissionsState {
    pub permissions: HashMap<PermissionId, Permission>,
    pub permission_ids_counter: PermissionId,
    // this list doesn't take into an account whitelist/blacklist logic
    pub permissions_by_permission_target_index: HashMap<PermissionTarget, HashSet<PermissionId>>,
}

impl PermissionsState {
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
    ) -> Result<(), PermissionsError> {
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
    ) -> Result<Permission, PermissionsError> {
        if self.permissions.len() == 1 {
            return Err(PermissionsError::ThereShouldBeAtLeastOnePermission);
        }

        let permission = self
            .permissions
            .remove(permission_id)
            .ok_or(PermissionsError::PermissionDoesNotExist)?;

        for target in &permission.targets {
            self.remove_permission_from_target_index(permission_id, target);
        }

        Ok(permission)
    }

    pub fn is_program_allowed_by_permission(
        &self,
        program: &Program,
        permission_id: &PermissionId,
    ) -> Result<(), PermissionsError> {
        match program {
            Program::RemoteCallSequence(sequence) => {
                for call in sequence {
                    self.is_permission_target(Some(call.endpoint.clone()), permission_id)?;
                }
            }
            Program::Empty => {
                self.is_permission_target(None, permission_id)?;
            }
        };

        Ok(())
    }

    pub fn is_permission_target(
        &self,
        endpoint_opt: Option<RemoteCallEndpoint>,
        permission_id: &PermissionId,
    ) -> Result<(), PermissionsError> {
        let permission = self.get_permission(permission_id)?;

        match endpoint_opt {
            Some(endpoint) => {
                let target = PermissionTarget::Endpoint(endpoint);

                if permission.targets.contains(&target) {
                    return Ok(());
                }

                let canister_target = target.to_canister().unwrap();

                if permission.targets.contains(&canister_target) {
                    return Ok(());
                }

                Err(PermissionsError::NotPermissionTarget)
            }
            None => {
                if permission
                    .targets
                    .contains(&PermissionTarget::SelfEmptyProgram)
                {
                    Ok(())
                } else {
                    Err(PermissionsError::NotPermissionTarget)
                }
            }
        }
    }

    fn get_permission_ids_cloned(&self) -> Vec<PermissionId> {
        self.permissions.keys().cloned().collect()
    }

    fn get_permission_ids_by_permission_target_cloned(
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

    fn get_permission_mut(
        &mut self,
        permission_id: &PermissionId,
    ) -> Result<&mut Permission, PermissionsError> {
        self.permissions
            .get_mut(permission_id)
            .ok_or(PermissionsError::PermissionDoesNotExist)
    }

    pub fn get_permission(
        &self,
        permission_id: &PermissionId,
    ) -> Result<&Permission, PermissionsError> {
        self.permissions
            .get(permission_id)
            .ok_or(PermissionsError::PermissionDoesNotExist)
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

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Permission {
    pub id: PermissionId,
    pub name: String,
    pub targets: HashSet<PermissionTarget>,
    pub scope: PermissionScope,
}

#[derive(CandidType, Deserialize, Copy, Clone, Debug)]
pub enum PermissionScope {
    Whitelist,
    Blacklist,
}

#[derive(CandidType, Deserialize, Clone, PartialEq, Eq, Hash, Debug)]
pub enum PermissionTarget {
    SelfEmptyProgram,
    Canister(Principal),
    Endpoint(RemoteCallEndpoint),
}

impl PermissionTarget {
    pub fn to_canister(self) -> Option<PermissionTarget> {
        match &self {
            PermissionTarget::SelfEmptyProgram => None,
            PermissionTarget::Canister(_) => Some(self),
            PermissionTarget::Endpoint(e) => Some(PermissionTarget::Canister(e.canister_id)),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::common::execution_history::RemoteCallEndpoint;
    use crate::common::permissions::{PermissionScope, PermissionTarget, PermissionsState};
    use ic_cdk::export::Principal;
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
        let mut permissions_state = PermissionsState::default();
        let target_1 = PermissionTarget::Endpoint(RemoteCallEndpoint {
            canister_id: random_principal_test(),
            method_name: String::from("test_method"),
        });
        let target_2 = PermissionTarget::Canister(random_principal_test());

        let permission_id_1 = permissions_state.create_permission(
            String::from("Permission 1"),
            vec![target_1.clone(), target_2.clone()],
            PermissionScope::Whitelist,
        );

        let permission_1 = permissions_state
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

        let permission_id_2 = permissions_state.create_permission(
            String::from("Permission 2"),
            vec![target_2.clone()],
            PermissionScope::Whitelist,
        );

        let canister_2_related_permissions =
            permissions_state.get_permission_ids_by_permission_target_cloned(&target_2);
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

        permissions_state
            .update_permission(&permission_id_1, None, Some(vec![target_1]), None)
            .expect("It should be possible to update permission 1");

        let canister_2_related_permissions =
            permissions_state.get_permission_ids_by_permission_target_cloned(&target_2);
        assert_eq!(
            canister_2_related_permissions.len(),
            1,
            "There should be 1 permission about this target"
        );
        assert!(
            canister_2_related_permissions.contains(&permission_id_2),
            "Permission 2 should be in the list"
        );

        permissions_state
            .remove_permission(&permission_id_2)
            .expect("It should be possible to remove permission 2");

        let canister_2_related_permissions =
            permissions_state.get_permission_ids_by_permission_target_cloned(&target_2);

        assert!(
            canister_2_related_permissions.is_empty(),
            "There shouldn't be any permission about this target"
        );
    }
}
