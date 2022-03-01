use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

pub type RoleId = u16;

pub const PUBLIC_ROLE_ID: RoleId = 0;

#[derive(Clone, Copy, Debug)]
pub enum RoleError {
    RoleNotFound,
    RoleHasNoOwners,
    UnableToCreateAnotherPublicRole,
    UnableToDeletePublicRole,
    UnableToEditPublicRole,
}

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct RolesState {
    pub roles: HashMap<RoleId, Role>,
    pub role_ids_counter: RoleId,
    pub role_owners_index: HashMap<Principal, HashSet<RoleId>>,
}

impl RolesState {
    pub fn new(caller: Principal) -> Result<Self, RoleError> {
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

        // TODO: move to higher abstraction level
        state.create_role(
            String::from("Wallet creator"),
            RoleType::PrivateQuantity((1, vec![caller].into_iter().collect())),
        )?;

        Ok(state)
    }

    pub fn create_role(&mut self, name: String, role_type: RoleType) -> Result<RoleId, RoleError> {
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

    pub fn remove_role(&mut self, role_id: &RoleId) -> Result<Role, RoleError> {
        if *role_id == PUBLIC_ROLE_ID {
            return Err(RoleError::UnableToDeletePublicRole);
        }

        let role = self.roles.remove(role_id).ok_or(RoleError::RoleNotFound)?;

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
    ) -> Result<(), RoleError> {
        if *role_id == PUBLIC_ROLE_ID {
            return Err(RoleError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(role_id)?;

        if let Some(name) = new_name {
            role.name = name
        };

        if let Some(role_type) = new_role_type {
            if matches!(role_type, RoleType::Public) {
                return Err(RoleError::UnableToCreateAnotherPublicRole);
            }

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
    ) -> Result<(), RoleError> {
        if role_id == PUBLIC_ROLE_ID {
            return Err(RoleError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(&role_id)?;
        let role_owners = role.role_type.get_role_owners_mut()?;

        for new_owner in &new_owners {
            role_owners.insert(*new_owner);
        }

        for new_owner in new_owners {
            self.add_role_to_role_owners_index(role_id, new_owner);
        }

        Ok(())
    }

    pub fn subtract_role_owners(
        &mut self,
        role_id: RoleId,
        owners_to_remove: Vec<Principal>,
    ) -> Result<(), RoleError> {
        if role_id == PUBLIC_ROLE_ID {
            return Err(RoleError::UnableToEditPublicRole);
        }

        let role = self.get_role_mut(&role_id)?;
        let role_owners = role.role_type.get_role_owners_mut()?;

        for owner_to_remove in owners_to_remove.iter() {
            role_owners.remove(owner_to_remove);
        }

        for owner_to_remove in owners_to_remove {
            self.remove_role_from_role_owners_index(&role_id, owner_to_remove);
        }

        Ok(())
    }

    pub fn get_role_ids_cloned(&self) -> Vec<RoleId> {
        self.roles.keys().cloned().collect()
    }
    
    pub fn get_role(&self, role_id: &RoleId) -> Result<&Role, RoleError> {
        self.roles.get(role_id).ok_or(RoleError::RoleNotFound)
    }

    pub fn get_role_ids_by_role_owner_cloned(&self, role_owner: &Principal) -> Vec<RoleId> {
        self.role_owners_index
            .get(role_owner)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    fn get_role_mut(&mut self, role_id: &RoleId) -> Result<&mut Role, RoleError> {
        self.roles.get_mut(role_id).ok_or(RoleError::RoleNotFound)
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
    pub fn get_role_owners(&self) -> Result<&HashSet<Principal>, RoleError> {
        match self {
            RoleType::Public => Err(RoleError::RoleHasNoOwners),
            RoleType::PrivateFraction((_, o)) => Ok(o),
            RoleType::PrivateQuantity((_, o)) => Ok(o),
        }
    }

    pub fn get_role_owners_mut(&mut self) -> Result<&mut HashSet<Principal>, RoleError> {
        match self {
            RoleType::Public => Err(RoleError::RoleHasNoOwners),
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
        let wallet_creator = random_principal_test();

        let roles_state = RolesState::new(wallet_creator).expect("Creation should work fine");
        assert_eq!(roles_state.role_ids_counter, 2, "Role ids counter is wrong");

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

        let wallet_creator_role = roles_state
            .get_role(&1)
            .expect("Wallet creator role should exist");
        assert_eq!(
            wallet_creator_role.name,
            String::from("Wallet creator"),
            "Wallet creator role name is invalid"
        );

        match &wallet_creator_role.role_type {
            RoleType::PrivateQuantity((qty, owners)) => {
                assert_eq!(
                    *qty, 1,
                    "There should be only one wallet creator to activate the role"
                );
                assert!(
                    owners.contains(&wallet_creator),
                    "Wallet creator should be in the list"
                );
            }
            _ => unreachable!("Wallet creator role type should be PrivateQuantity"),
        }

        let wallet_creator_roles = roles_state.get_role_ids_by_role_owner_cloned(&wallet_creator);
        assert_eq!(
            wallet_creator_roles.len(),
            1,
            "Wallet creator should only have a single role"
        );
        let wallet_creator_role_id = wallet_creator_roles[0];
        assert_eq!(
            wallet_creator_role_id, 1,
            "Wallet creator should have a role with correct id"
        );
    }

    #[test]
    fn default_public_role_is_immutable_and_unique() {
        let wallet_creator = random_principal_test();
        let mut roles_state =
            RolesState::new(wallet_creator).expect("Roles state should be created");

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
                    vec![wallet_creator].into_iter().collect(),
                ))),
            )
            .expect_err("It should be impossible to update default public role");

        roles_state
            .add_role_owners(0, vec![wallet_creator])
            .expect_err("It should be impossible to add role owners to default public role");

        roles_state
            .subtract_role_owners(0, vec![wallet_creator])
            .expect_err("It should be impossible to subtract role owners from default public role");
    }

    #[test]
    fn role_crud_works_fine() {
        let wallet_creator = random_principal_test();
        let mut roles_state =
            RolesState::new(wallet_creator).expect("Roles state should be created");

        let user1 = random_principal_test();
        let user2 = random_principal_test();

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
                    vec![user1, user2, wallet_creator].into_iter().collect(),
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

        let wallet_creator_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&wallet_creator);
        assert_eq!(
            wallet_creator_role_ids.len(),
            2,
            "Wallet creator should have only two roles"
        );
        assert!(
            wallet_creator_role_ids.contains(&1),
            "Wallet creator should have wallet creator role"
        );
        assert!(
            wallet_creator_role_ids.contains(&role_id_1),
            "Wallet creator should have Role #1"
        );

        let role_1 = roles_state
            .remove_role(&role_id_1)
            .expect("It should be possible to delete a role");

        let wallet_creator_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&wallet_creator);
        assert_eq!(
            wallet_creator_role_ids.len(),
            1,
            "Wallet creator should have only one role"
        );
        assert!(
            wallet_creator_role_ids.contains(&1),
            "Wallet creator should have wallet creator role"
        );

        let wallet_creator_role = roles_state
            .remove_role(&1)
            .expect("It should be possible to delete the wallet creator role");

        let wallet_creator_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&wallet_creator);
        assert!(
            wallet_creator_role_ids.is_empty(),
            "Wallet creator shouldn't have any role"
        );
    }

    #[test]
    fn role_owners_add_remove_work_fine() {
        let wallet_creator = random_principal_test();
        let mut roles_state =
            RolesState::new(wallet_creator).expect("Roles state should be created");

        let user1 = random_principal_test();
        let user2 = random_principal_test();

        roles_state
            .add_role_owners(1, vec![user1, user2])
            .expect("It should be possible to add role owners");

        let user1_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user1);
        assert_eq!(
            user1_role_ids.len(),
            1,
            "There should be only a single role for user1"
        );
        assert!(
            user1_role_ids.contains(&1),
            "User1 should have the wallet creator role"
        );

        let user2_role_ids = roles_state.get_role_ids_by_role_owner_cloned(&user2);
        assert_eq!(
            user2_role_ids.len(),
            1,
            "There should be only a single role for user2"
        );
        assert!(
            user2_role_ids.contains(&1),
            "User2 should have the wallet creator role"
        );

        roles_state
            .subtract_role_owners(1, vec![user1, user2])
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
