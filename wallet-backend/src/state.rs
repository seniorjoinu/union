use crate::common::execution_history::{ExecutionHistoryError, ExecutionHistoryState};
use crate::common::permissions::{Permission, PermissionScope, PermissionsError, PermissionsState};
use crate::common::roles::{Profile, Role, RoleType, RolesError, RolesState, HAS_PROFILE_ROLE_ID};
use crate::common::utils::ValidationError;
use crate::{HistoryEntry, PermissionId, Program, RemoteCallEndpoint, RoleId};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

#[derive(Debug)]
pub enum Error {
    RolesError(RolesError),
    PermissionsError(PermissionsError),
    ValidationError(ValidationError),
    ExecutionHistoryError(ExecutionHistoryError),
    RoleIsNotAttachedToPermission,
}

pub struct State {
    pub execution_history: ExecutionHistoryState,
    pub roles: RolesState,
    pub permissions: PermissionsState,

    pub roles_by_permission: HashMap<PermissionId, HashSet<RoleId>>,
    pub permissions_by_role: HashMap<RoleId, HashSet<PermissionId>>,
}

impl State {
    pub fn new(caller: Principal) -> Result<Self, Error> {
        let mut roles_state = RolesState::new().map_err(Error::RolesError)?;
        roles_state
            .create_role(RoleType::Profile(Profile::new(
                caller,
                "Wallet creator",
                "The person who created the wallet",
            )))
            .map_err(Error::RolesError)?;

        let mut permissions_state = PermissionsState::default();

        let default_permission_id = permissions_state.create_permission(
            String::from("Default"),
            vec![],
            PermissionScope::Blacklist,
        );

        let mut state = State {
            execution_history: ExecutionHistoryState::default(),
            roles: roles_state,
            permissions: permissions_state,

            roles_by_permission: HashMap::default(),
            permissions_by_role: HashMap::default(),
        };

        state.attach_role_to_permission(HAS_PROFILE_ROLE_ID, default_permission_id)?;

        Ok(state)
    }

    pub fn validate_authorized_request(
        &self,
        caller: &Principal,
        role_id: &RoleId,
        permission_id: &PermissionId,
        program: &Program,
    ) -> Result<(), Error> {
        // validate program
        program.validate().map_err(Error::ExecutionHistoryError)?;

        // if the caller has the provided role
        self.roles
            .is_role_owner(caller, role_id)
            .map_err(Error::RolesError)?;

        // if the role has the permission
        self.is_role_attached_to_permission(role_id, permission_id)?;

        // if the program is a call sequence and each call in the sequence is compliant with the provided permission
        self.permissions
            .is_program_allowed_by_permission(program, permission_id)
            .map_err(Error::PermissionsError)?;

        Ok(())
    }

    pub fn attach_role_to_permission(
        &mut self,
        role_id: RoleId,
        permission_id: PermissionId,
    ) -> Result<(), Error> {
        self.roles.get_role(&role_id).map_err(Error::RolesError)?;
        self.permissions
            .get_permission(&permission_id)
            .map_err(Error::PermissionsError)?;

        match self.permissions_by_role.entry(role_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(permission_id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![permission_id].into_iter().collect());
            }
        };

        match self.roles_by_permission.entry(permission_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(role_id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![role_id].into_iter().collect());
            }
        };

        Ok(())
    }

    pub fn detach_role_from_permission(
        &mut self,
        role_id: RoleId,
        permission_id: PermissionId,
    ) -> Result<(), Error> {
        self.roles.get_role(&role_id).map_err(Error::RolesError)?;
        self.permissions
            .get_permission(&permission_id)
            .map_err(Error::PermissionsError)?;

        if let Entry::Occupied(mut e) = self.permissions_by_role.entry(role_id) {
            e.get_mut().remove(&permission_id);
        };

        if let Entry::Occupied(mut e) = self.roles_by_permission.entry(permission_id) {
            e.get_mut().remove(&role_id);
        };

        Ok(())
    }

    pub fn get_role_ids_of_permission_cloned(&self, permission_id: &PermissionId) -> Vec<RoleId> {
        self.roles_by_permission
            .get(permission_id)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_permission_ids_of_role_cloned(&self, role_id: &RoleId) -> Vec<PermissionId> {
        self.permissions_by_role
            .get(role_id)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_permission_ids_of_cloned(&self, caller: &Principal) -> Vec<PermissionId> {
        let role_ids = self.roles.get_role_ids_by_role_owner_cloned(caller);
        let mut permission_ids = HashSet::new();

        for role_id in &role_ids {
            let some_permission_ids = self.get_permission_ids_of_role_cloned(role_id);
            permission_ids.extend(some_permission_ids.into_iter());
        }

        permission_ids.into_iter().collect()
    }

    pub fn is_query_caller_authorized(&self, caller: &Principal, method_name: &str) -> bool {
        let callers_permissions = self.get_permission_ids_of_cloned(&caller);
        let mut result = false;

        for perm in &callers_permissions {
            let res = self
                .permissions
                .is_permission_target(Some(RemoteCallEndpoint::this(method_name)), perm);
            if res.is_ok() {
                result = true;
                break;
            }
        }

        result
    }

    pub fn remove_role(&mut self, role_id: &RoleId) -> Result<Role, Error> {
        let role = self.roles.remove_role(role_id).map_err(Error::RolesError)?;
        let permission_ids_opt = self.permissions_by_role.remove(role_id);

        if let Some(permission_ids) = permission_ids_opt {
            for permission_id in &permission_ids {
                let roles_of_permission = self.roles_by_permission.get_mut(permission_id).unwrap();
                roles_of_permission.remove(role_id);
            }
        }

        Ok(role)
    }

    pub fn remove_permission(&mut self, permission_id: &PermissionId) -> Result<Permission, Error> {
        let permission = self
            .permissions
            .remove_permission(permission_id)
            .map_err(Error::PermissionsError)?;
        let role_ids_opt = self.roles_by_permission.remove(permission_id);

        if let Some(role_ids) = role_ids_opt {
            for role_id in &role_ids {
                let permissions_of_role = self.permissions_by_role.get_mut(role_id).unwrap();
                permissions_of_role.remove(permission_id);
            }
        }

        Ok(permission)
    }

    pub fn is_role_attached_to_permission(
        &self,
        role_id: &RoleId,
        permission_id: &PermissionId,
    ) -> Result<(), Error> {
        let roles = self
            .roles_by_permission
            .get(permission_id)
            .ok_or(Error::RoleIsNotAttachedToPermission)?;

        if !roles.contains(role_id) {
            Err(Error::RoleIsNotAttachedToPermission)
        } else {
            Ok(())
        }
    }
}

#[derive(CandidType, Deserialize)]
pub enum TaskType {
    CallAuthorization(HistoryEntry),
}
