use crate::common::utils::{validate_f32, validate_str, validate_u16, ValidationError};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

pub type RoleId = u16;

pub const PUBLIC_ROLE_ID: RoleId = 0;

#[derive(Clone, Debug)]
pub enum RolesError {
    RoleNotFound,
    RoleHasNoOwners,
    UnableToCreateAnotherPublicRole,
    UnableToDeletePublicRole,
    UnableToEditPublicRole,
    NotRoleOwner,
    ValidationError(ValidationError),
}

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct RolesState {
    pub roles: HashMap<RoleId, Role>,
    pub role_ids_counter: RoleId,
    pub role_owners_index: HashMap<Principal, HashSet<RoleId>>,
}

impl RolesState {
    pub fn new() -> Result<Self, RolesError> {
        let mut state = RolesState::default();

        // create public role (non-deletable default role with id = 0)
        let public_role_id = state.generate_role_id();
        assert_eq!(public_role_id, PUBLIC_ROLE_ID);

        let public_role = Role {
            id: public_role_id,
            name: String::from("Public"),
            role_type: RoleType::Public,
        };
        state.roles.insert(public_role_id, public_role);

        Ok(state)
    }

    pub fn create_role(&mut self, name: String, role_type: RoleType) -> Result<RoleId, RolesError> {
        let name = validate_str(name, 1, 100, "Role name").map_err(RolesError::ValidationError)?;
        role_type.validate()?;

        let id = self.generate_role_id();
        let role = Role {
            id,
            name,
            role_type: role_type.clone(),
        };

        let role_owners = role_type.get_role_owners()?;

        for role_owner in role_owners {
            self.add_role_to_role_owners_index(id, *role_owner);
        }

        self.roles.insert(id, role);

        Ok(id)
    }

    pub fn remove_role(&mut self, role_id: &RoleId) -> Result<Role, RolesError> {
        if *role_id == PUBLIC_ROLE_ID {
            return Err(RolesError::UnableToDeletePublicRole);
        }

        let role = self.roles.remove(role_id).ok_or(RolesError::RoleNotFound)?;

        let role_owners = role.role_type.get_role_owners()?;

        for role_owner in role_owners {
            self.remove_role_from_role_owners_index(role_id, *role_owner);
        }

        Ok(role)
    }

    pub fn update_role(
        &mut self,
        role_id: &RoleId,
        new_name: Option<String>,
        new_role_type: Option<RoleType>,
    ) -> Result<(), RolesError> {
        if *role_id == PUBLIC_ROLE_ID {
            return Err(RolesError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(role_id)?;

        if let Some(name) = new_name {
            let name =
                validate_str(name, 1, 100, "Role name").map_err(RolesError::ValidationError)?;

            role.name = name
        };

        if let Some(role_type) = new_role_type {
            if matches!(role_type, RoleType::Public) {
                return Err(RolesError::UnableToCreateAnotherPublicRole);
            }
            role_type.validate()?;

            let old_role_owners = role.role_type.get_role_owners()?.clone();
            let new_role_owners = role_type.get_role_owners()?.clone();

            role.role_type = role_type;

            for old_owner in old_role_owners {
                self.remove_role_from_role_owners_index(role_id, old_owner);
            }

            for new_owner in new_role_owners {
                self.add_role_to_role_owners_index(*role_id, new_owner);
            }
        };

        Ok(())
    }

    pub fn add_role_owners(
        &mut self,
        role_id: RoleId,
        new_owners: Vec<Principal>,
    ) -> Result<(), RolesError> {
        if role_id == PUBLIC_ROLE_ID {
            return Err(RolesError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(&role_id)?;
        let role_owners = role.role_type.get_role_owners_mut()?;

        for new_owner in &new_owners {
            role_owners.insert(*new_owner);
        }

        role.role_type.validate()?;

        for new_owner in new_owners {
            self.add_role_to_role_owners_index(role_id, new_owner);
        }

        Ok(())
    }

    pub fn subtract_role_owners(
        &mut self,
        role_id: RoleId,
        owners_to_remove: Vec<Principal>,
    ) -> Result<(), RolesError> {
        if role_id == PUBLIC_ROLE_ID {
            return Err(RolesError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(&role_id)?;
        let role_owners = role.role_type.get_role_owners_mut()?;

        for owner_to_remove in owners_to_remove.iter() {
            role_owners.remove(owner_to_remove);
        }

        role.role_type.validate()?;

        for owner_to_remove in owners_to_remove {
            self.remove_role_from_role_owners_index(&role_id, owner_to_remove);
        }

        Ok(())
    }

    pub fn is_role_owner(&self, owner: &Principal, role_id: &RoleId) -> Result<(), RolesError> {
        let role = self.get_role(role_id)?;
        let owners = role.role_type.get_role_owners()?;

        if !owners.contains(owner) {
            Err(RolesError::NotRoleOwner)
        } else {
            Ok(())
        }
    }

    pub fn get_role_ids_cloned(&self) -> Vec<RoleId> {
        self.roles.keys().cloned().collect()
    }

    pub fn get_role(&self, role_id: &RoleId) -> Result<&Role, RolesError> {
        self.roles.get(role_id).ok_or(RolesError::RoleNotFound)
    }

    pub fn get_role_ids_by_role_owner_cloned(&self, role_owner: &Principal) -> Vec<RoleId> {
        self.role_owners_index
            .get(role_owner)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    fn get_role_mut(&mut self, role_id: &RoleId) -> Result<&mut Role, RolesError> {
        self.roles.get_mut(role_id).ok_or(RolesError::RoleNotFound)
    }

    fn add_role_to_role_owners_index(&mut self, id: RoleId, role_owner: Principal) {
        match self.role_owners_index.entry(role_owner) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![id].into_iter().collect());
            }
        };
    }

    fn remove_role_from_role_owners_index(&mut self, id: &RoleId, role_owner: Principal) {
        match self.role_owners_index.entry(role_owner) {
            Entry::Occupied(mut e) => {
                e.get_mut().remove(id);
            }
            Entry::Vacant(_) => {}
        };
    }

    fn generate_role_id(&mut self) -> RoleId {
        let res = self.role_ids_counter;
        self.role_ids_counter += 1;

        res
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Role {
    pub id: RoleId,
    pub name: String,
    pub role_type: RoleType,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum RoleType {
    PrivateQuantity((u16, HashSet<Principal>)),
    PrivateFraction((f32, HashSet<Principal>)),
    Public,
}

impl RoleType {
    pub fn validate(&self) -> Result<(), RolesError> {
        match self {
            RoleType::Public => Ok(()),
            RoleType::PrivateFraction((fr, o)) => {
                validate_f32(*fr, 0.001, 1.00, "Fraction").map_err(RolesError::ValidationError)
            }
            RoleType::PrivateQuantity((qt, o)) => validate_u16(*qt, 1, o.len() as u16, "Quantity")
                .map_err(RolesError::ValidationError),
        }
    }

    pub fn get_role_owners(&self) -> Result<&HashSet<Principal>, RolesError> {
        match self {
            RoleType::Public => Err(RolesError::RoleHasNoOwners),
            RoleType::PrivateFraction((_, o)) => Ok(o),
            RoleType::PrivateQuantity((_, o)) => Ok(o),
        }
    }

    pub fn get_role_owners_mut(&mut self) -> Result<&mut HashSet<Principal>, RolesError> {
        match self {
            RoleType::Public => Err(RolesError::RoleHasNoOwners),
            RoleType::PrivateFraction((_, o)) => Ok(o),
            RoleType::PrivateQuantity((_, o)) => Ok(o),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::common::roles::{RoleType, RolesState};
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
    fn default_roles_state_is_fine() {
        let roles_state = RolesState::new().expect("Creation should work fine");

        let public_role = roles_state.get_role(&0).expect("Public role should exist");
        assert_eq!(
            public_role.name,
            String::from("Public"),
            "Public role name is invalid"
        );
        assert!(
            matches!(public_role.role_type, RoleType::Public),
            "Public role type is invalid"
        );
    }

    #[test]
    fn default_public_role_is_immutable_and_unique() {
        let mut roles_state = RolesState::new().expect("Roles state should be created");

        roles_state
            .create_role(String::from("Test role 1"), RoleType::Public)
            .expect_err("It should be impossible to create another public role");

        roles_state
            .remove_role(&0)
            .expect_err("It should be impossible to remove default public role");

        roles_state
            .update_role(&0, Some(String::from("Public 1")), None)
            .expect_err("It should be impossible to update default public role");

        roles_state
            .update_role(
                &0,
                None,
                Some(RoleType::PrivateQuantity((
                    1,
                    vec![random_principal_test()].into_iter().collect(),
                ))),
            )
            .expect_err("It should be impossible to update default public role");

        roles_state
            .add_role_owners(0, vec![random_principal_test()])
            .expect_err("It should be impossible to add role owners to default public role");

        roles_state
            .subtract_role_owners(0, vec![random_principal_test()])
            .expect_err("It should be impossible to subtract role owners from default public role");
    }

    #[test]
    fn role_crud_works_fine() {
        let mut roles_state = RolesState::new().expect("Roles state should be created");

        let user1 = random_principal_test();
        let user2 = random_principal_test();
        let user3 = random_principal_test();

        let role_id_1 = roles_state
            .create_role(
                String::from("Role 1"),
                RoleType::PrivateQuantity((2, vec![user1, user2].into_iter().collect())),
            )
            .expect("Role 1 should be created");

        let role_1 = roles_state
            .get_role(&role_id_1)
            .expect("Role 1 should be possible to get");

        roles_state
            .update_role(
                &role_id_1,
                Some(String::from("Role #1")),
                Some(RoleType::PrivateQuantity((
                    3,
                    vec![user1, user2, user3].into_iter().collect(),
                ))),
            )
            .expect("It should be possible to update a role");

        let role_1 = roles_state
            .get_role(&role_id_1)
            .expect("Role 1 should be still possible to get");

        assert_eq!(
            role_1.name,
            String::from("Role #1"),
            "Role 1 name should've changed"
        );

        let user3_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user3);
        assert_eq!(
            user3_role_ids.len(),
            1,
            "Wallet creator should have only two roles"
        );
        assert!(
            user3_role_ids.contains(&role_id_1),
            "Wallet creator should have Role #1"
        );

        let role_1 = roles_state
            .remove_role(&role_id_1)
            .expect("It should be possible to delete a role");

        let user3_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user3);
        assert!(
            user3_role_ids.is_empty(),
            "Wallet creator should have only one role"
        );
    }

    #[test]
    fn role_owners_add_remove_work_fine() {
        let mut roles_state = RolesState::new().expect("Roles state should be created");

        let user1 = random_principal_test();
        let user2 = random_principal_test();
        let user3 = random_principal_test();

        let role_id = roles_state
            .create_role(
                String::from("Role 1"),
                RoleType::PrivateQuantity((1, vec![user3].into_iter().collect())),
            )
            .expect("It should be possible to create a new role");

        roles_state
            .add_role_owners(role_id, vec![user1, user2])
            .expect("It should be possible to add role owners");

        let user1_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user1);
        assert_eq!(
            user1_role_ids.len(),
            1,
            "There should be only a single role for user1"
        );
        assert!(
            user1_role_ids.contains(&role_id),
            "User1 should have the wallet creator role"
        );

        let user2_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user2);
        assert_eq!(
            user2_role_ids.len(),
            1,
            "There should be only a single role for user2"
        );
        assert!(
            user2_role_ids.contains(&role_id),
            "User2 should have the wallet creator role"
        );

        roles_state
            .subtract_role_owners(role_id, vec![user1, user2])
            .expect("It should be possible to subtract role owners");

        let user1_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user1);
        assert!(
            user1_role_ids.is_empty(),
            "There shouldn't be any role for user1"
        );

        let user2_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user2);
        assert!(
            user2_role_ids.is_empty(),
            "There shouldn't be any role for user2"
        );
    }
}
