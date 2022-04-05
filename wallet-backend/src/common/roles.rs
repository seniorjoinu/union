use crate::common::utils::{validate_and_trim_str, validate_f64, validate_u32, ValidationError};
use ic_cdk::export::candid::{CandidType, Deserialize, Principal};
use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};

pub type RoleId = u32;

pub const EVERYONE_ROLE_ID: RoleId = 0;
pub const HAS_PROFILE_ROLE_ID: RoleId = 1;

#[derive(Clone, Debug)]
pub enum RolesError {
    RoleNotFound(RoleId),
    UnableToCreateAnotherDefaultRole,
    UnableToEditDefaultRole,
    NotRoleOwner,
    ProfileAlreadyExists,
    InvalidRoleType,
    RelatedRoleExists(Vec<RoleId>),
    ValidationError(ValidationError),
}

#[derive(CandidType, Deserialize, Clone, Default, Debug)]
pub struct RolesState {
    pub roles: HashMap<RoleId, Role>,
    pub role_ids_counter: RoleId,
    pub role_owners_index: HashMap<Principal, HashSet<RoleId>>,
    pub profiles_index: HashMap<Principal, RoleId>,
    pub related_roles_index: HashMap<RoleId, HashSet<RoleId>>,
}

impl RolesState {
    pub fn new() -> Result<Self, RolesError> {
        let mut state = RolesState::default();

        // create public role (non-deletable default role with id = 0)
        let everyone_role_id = state.generate_role_id();
        assert_eq!(everyone_role_id, EVERYONE_ROLE_ID);

        let public_role = Role {
            id: everyone_role_id,
            role_type: RoleType::Everyone,
        };
        state.roles.insert(everyone_role_id, public_role);

        // create has_profile role (non-deletable default role with id = 1)
        let has_profile_role_id = state.generate_role_id();
        assert_eq!(has_profile_role_id, HAS_PROFILE_ROLE_ID);

        let has_profile_role = Role {
            id: has_profile_role_id,
            role_type: RoleType::QuantityOf(QuantityOf {
                name: String::from("Has profile"),
                description: String::from("[Default] Defines a user, who has an active profile. In case of attaching this role to any permission, this permission could be used by any user with a profile."),
                quantity: 1,
                enumerated: HashSet::new(),
            }),
        };
        state.roles.insert(has_profile_role_id, has_profile_role);

        Ok(state)
    }

    pub fn create_role(&mut self, role_type: RoleType) -> Result<RoleId, RolesError> {
        let id = self.generate_role_id();

        self._create_role(id, role_type)?;

        Ok(id)
    }

    fn _create_role(&mut self, id: RoleId, mut role_type: RoleType) -> Result<(), RolesError> {
        role_type.validate()?;

        match &role_type {
            RoleType::Everyone => Err(RolesError::UnableToCreateAnotherDefaultRole),
            RoleType::Profile(profile) => {
                if self.profiles_index.contains_key(&profile.principal_id) {
                    return Err(RolesError::ProfileAlreadyExists);
                }

                self.role_owners_index.insert(
                    profile.principal_id,
                    vec![id, HAS_PROFILE_ROLE_ID].into_iter().collect(),
                );

                self.profiles_index.insert(profile.principal_id, id);
                self.get_has_profile_role_mut()?.enumerated.insert(id);

                let role = Role { id, role_type };
                self.roles.insert(id, role);

                Ok(())
            }
            _ => {
                let enumerated_roles = role_type.get_enumerated_role_ids()?;
                let mut role_owners = vec![];

                for role_id in enumerated_roles {
                    if !self.roles.contains_key(role_id) {
                        return Err(RolesError::RoleNotFound(*role_id));
                    }
                }

                for role_id in enumerated_roles {
                    self.relate_role(*role_id, id);
                    self.retrace_role_owners(role_id, &mut role_owners);
                }

                for role_owner in role_owners {
                    self.role_owners_index
                        .get_mut(&role_owner)
                        .unwrap()
                        .insert(id);
                }

                let role = Role { id, role_type };
                self.roles.insert(id, role);

                Ok(())
            }
        }
    }

    pub fn remove_role(&mut self, role_id: &RoleId) -> Result<Role, RolesError> {
        if *role_id == EVERYONE_ROLE_ID || *role_id == HAS_PROFILE_ROLE_ID {
            return Err(RolesError::UnableToEditDefaultRole);
        }

        self.has_no_related_roles(role_id)?;

        let role = self
            .roles
            .remove(role_id)
            .ok_or(RolesError::RoleNotFound(*role_id))?;

        match &role.role_type {
            RoleType::Everyone => unreachable!("Impossible to delete public role"),
            RoleType::Profile(profile) => {
                self.role_owners_index
                    .remove(&profile.principal_id)
                    .unwrap();

                self.profiles_index.remove(&profile.principal_id).unwrap();

                self.get_has_profile_role_mut()?.enumerated.remove(role_id);
            }
            _ => {
                let enumerated_roles = role.role_type.get_enumerated_role_ids()?;
                let mut role_owners = vec![];

                for enumerated_role_id in enumerated_roles {
                    self.unrelate_role(*enumerated_role_id, role_id);
                    self.retrace_role_owners(enumerated_role_id, &mut role_owners);
                }

                for role_owner in role_owners {
                    self.role_owners_index
                        .get_mut(&role_owner)
                        .unwrap()
                        .remove(role_id);
                }
            }
        };

        Ok(role)
    }

    pub fn update_role(
        &mut self,
        role_id: &RoleId,
        new_role_type: RoleType,
    ) -> Result<Role, RolesError> {
        let role = self.remove_role(role_id)?;
        self._create_role(*role_id, new_role_type)?;

        Ok(role)
    }

    pub fn edit_profile(
        &mut self,
        role_id: &RoleId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), RolesError> {
        let role = self.get_role_mut(role_id)?;
        let profile = role.role_type.get_profile_mut()?;

        if let Some(name) = new_name {
            profile.name = name;
        }

        if let Some(desc) = new_description {
            profile.description = desc;
        }

        role.role_type.validate()
    }

    pub fn add_enumerated_roles(
        &mut self,
        role_id: &RoleId,
        role_ids_to_add: Vec<RoleId>,
    ) -> Result<(), RolesError> {
        for role_id_to_add in &role_ids_to_add {
            if !self.roles.contains_key(role_id_to_add) {
                return Err(RolesError::RoleNotFound(*role_id_to_add));
            }
        }

        let role = self.get_role_mut(role_id)?;
        let enumerated_roles = role.role_type.get_enumerated_role_ids_mut()?;

        for role_id_to_add in &role_ids_to_add {
            enumerated_roles.insert(*role_id_to_add);
        }

        for role_id_to_add in role_ids_to_add {
            self.relate_role(role_id_to_add, *role_id);
        }

        Ok(())
    }

    pub fn subtract_enumerated_roles(
        &mut self,
        role_id: &RoleId,
        role_ids_to_subtract: Vec<RoleId>,
    ) -> Result<(), RolesError> {
        for role_id_to_subtract in &role_ids_to_subtract {
            if !self.roles.contains_key(role_id_to_subtract) {
                return Err(RolesError::RoleNotFound(*role_id_to_subtract));
            }
        }

        let role = self.get_role_mut(role_id)?;
        let enumerated_roles = role.role_type.get_enumerated_role_ids_mut()?;

        for role_id_to_subtract in &role_ids_to_subtract {
            enumerated_roles.remove(role_id_to_subtract);
        }

        for role_id_to_subtract in role_ids_to_subtract {
            self.unrelate_role(role_id_to_subtract, role_id);
        }

        Ok(())
    }

    pub fn is_role_fulfilled(&self, role_id: &RoleId, authorized_by: &[Principal]) -> bool {
        let role = self.get_role(role_id);

        if role.is_err() {
            return false;
        }

        let role = role.unwrap();

        match &role.role_type {
            RoleType::Everyone => true,
            RoleType::Profile(p) => authorized_by.contains(&p.principal_id),
            RoleType::QuantityOf(qty_of_params) => {
                let mut counter = 0u32;

                for required_role_id in &qty_of_params.enumerated {
                    let res = self.is_role_fulfilled(required_role_id, authorized_by);

                    if res {
                        counter += 1;
                    }
                }

                counter >= qty_of_params.quantity
            }
            RoleType::FractionOf(fr_of_params) => {
                let mut counter = 0f64;

                for required_role_id in &fr_of_params.enumerated {
                    let res = self.is_role_fulfilled(required_role_id, authorized_by);

                    if res {
                        counter += 1.0;
                    }
                }

                counter / (fr_of_params.enumerated.len() as f64) >= fr_of_params.fraction
            }
        }
    }

    pub fn is_role_owner(&self, owner: &Principal, role_id: &RoleId) -> Result<(), RolesError> {
        let is_role_owner = self
            .role_owners_index
            .get(owner)
            .ok_or(RolesError::NotRoleOwner)?
            .contains(role_id);

        if is_role_owner {
            Ok(())
        } else {
            Err(RolesError::NotRoleOwner)
        }
    }

    pub fn get_role_ids_cloned(&self) -> Vec<RoleId> {
        self.roles.keys().cloned().collect()
    }

    pub fn get_role_ids_by_role_owner_cloned(&self, role_owner: &Principal) -> Vec<RoleId> {
        let mut roles: Vec<_> = self
            .role_owners_index
            .get(role_owner)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect();

        roles.push(EVERYONE_ROLE_ID);

        roles
    }

    pub fn get_role(&self, role_id: &RoleId) -> Result<&Role, RolesError> {
        self.roles
            .get(role_id)
            .ok_or(RolesError::RoleNotFound(*role_id))
    }

    fn get_role_mut(&mut self, role_id: &RoleId) -> Result<&mut Role, RolesError> {
        self.roles
            .get_mut(role_id)
            .ok_or(RolesError::RoleNotFound(*role_id))
    }

    fn relate_role(&mut self, role_id: RoleId, related_role_id: RoleId) {
        match self.related_roles_index.entry(role_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().insert(related_role_id);
            }
            Entry::Vacant(e) => {
                e.insert(vec![related_role_id].into_iter().collect());
            }
        };
    }

    fn unrelate_role(&mut self, role_id: RoleId, related_role_id: &RoleId) {
        match self.related_roles_index.entry(role_id) {
            Entry::Occupied(mut e) => {
                e.get_mut().remove(related_role_id);
            }
            Entry::Vacant(_) => {}
        };
    }

    fn has_no_related_roles(&mut self, role_id: &RoleId) -> Result<(), RolesError> {
        if let Some(related_roles) = self.related_roles_index.get(role_id) {
            if related_roles.is_empty() {
                Ok(())
            } else {
                Err(RolesError::RelatedRoleExists(
                    related_roles.clone().into_iter().collect(),
                ))
            }
        } else {
            Ok(())
        }
    }

    fn retrace_role_owners(&self, existing_role_id: &RoleId, result: &mut Vec<Principal>) {
        let role = self.roles.get(existing_role_id).unwrap();

        match &role.role_type {
            RoleType::Everyone => {
                // TODO: возможно, здесь стоит бросать ошибку
            }
            RoleType::Profile(p) => {
                result.push(p.principal_id);
            }
            RoleType::QuantityOf(qty_of) => {
                for role_id in &qty_of.enumerated {
                    self.retrace_role_owners(role_id, result);
                }
            }
            RoleType::FractionOf(fr_of) => {
                for role_id in &fr_of.enumerated {
                    self.retrace_role_owners(role_id, result);
                }
            }
        };
    }

    fn get_has_profile_role_mut(&mut self) -> Result<&mut QuantityOf, RolesError> {
        self.get_role_mut(&HAS_PROFILE_ROLE_ID)?
            .role_type
            .get_quantity_of_mut()
    }

    fn generate_role_id(&mut self) -> RoleId {
        let res = self.role_ids_counter;
        self.role_ids_counter += 1;

        res
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Profile {
    pub principal_id: Principal,
    pub name: String,
    pub description: String,
}

impl Profile {
    pub fn new(principal_id: Principal, name: &str, description: &str) -> Self {
        Self {
            principal_id,
            name: String::from(name),
            description: String::from(description),
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct QuantityOf {
    pub name: String,
    pub description: String,
    pub quantity: u32,
    pub enumerated: HashSet<RoleId>,
}

impl QuantityOf {
    pub fn new(
        name: &str,
        description: &str,
        quantity: u32,
        enumerated_opt: Option<Vec<RoleId>>,
    ) -> Self {
        let of = if let Some(of_vec) = enumerated_opt {
            of_vec.into_iter().collect()
        } else {
            HashSet::new()
        };

        Self {
            name: String::from(name),
            description: String::from(description),
            quantity,
            enumerated: of,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FractionOf {
    pub name: String,
    pub description: String,
    pub fraction: f64,
    pub enumerated: HashSet<RoleId>,
}

impl FractionOf {
    pub fn new(
        name: &str,
        description: &str,
        fraction: f64,
        enumerated_opt: Option<Vec<RoleId>>,
    ) -> Self {
        let of = if let Some(of_vec) = enumerated_opt {
            of_vec.into_iter().collect()
        } else {
            HashSet::new()
        };

        Self {
            name: String::from(name),
            description: String::from(description),
            fraction,
            enumerated: of,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Role {
    pub id: RoleId,
    pub role_type: RoleType,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum RoleType {
    Everyone,
    Profile(Profile),
    QuantityOf(QuantityOf),
    FractionOf(FractionOf),
}

impl RoleType {
    pub fn validate(&mut self) -> Result<(), RolesError> {
        match self {
            RoleType::Everyone => Ok(()),
            RoleType::Profile(profile) => {
                let name = validate_and_trim_str(profile.name.clone(), 1, 100, "Name")
                    .map_err(RolesError::ValidationError)?;

                let description =
                    validate_and_trim_str(profile.description.clone(), 0, 300, "Description")
                        .map_err(RolesError::ValidationError)?;

                profile.name = name;
                profile.description = description;

                Ok(())
            }
            RoleType::FractionOf(fraction_of) => {
                validate_f64(fraction_of.fraction, 0.0001, 1.00, "Fraction")
                    .map_err(RolesError::ValidationError)
            }
            RoleType::QuantityOf(quantity_of) => validate_u32(
                quantity_of.quantity,
                1,
                quantity_of.enumerated.len() as u32,
                "Quantity",
            )
            .map_err(RolesError::ValidationError),
        }
    }

    pub fn get_profile_mut(&mut self) -> Result<&mut Profile, RolesError> {
        match self {
            RoleType::Profile(p) => Ok(p),
            _ => Err(RolesError::InvalidRoleType),
        }
    }

    pub fn get_fraction_of_mut(&mut self) -> Result<&mut FractionOf, RolesError> {
        match self {
            RoleType::FractionOf(fr) => Ok(fr),
            _ => Err(RolesError::InvalidRoleType),
        }
    }

    pub fn get_quantity_of_mut(&mut self) -> Result<&mut QuantityOf, RolesError> {
        match self {
            RoleType::QuantityOf(qty) => Ok(qty),
            _ => Err(RolesError::InvalidRoleType),
        }
    }

    pub fn get_enumerated_role_ids(&self) -> Result<&HashSet<RoleId>, RolesError> {
        match self {
            RoleType::QuantityOf(qty_of) => Ok(&qty_of.enumerated),
            RoleType::FractionOf(fr_of) => Ok(&fr_of.enumerated),
            _ => Err(RolesError::InvalidRoleType),
        }
    }

    pub fn get_enumerated_role_ids_mut(&mut self) -> Result<&mut HashSet<RoleId>, RolesError> {
        match self {
            RoleType::QuantityOf(qty_of) => Ok(&mut qty_of.enumerated),
            RoleType::FractionOf(fr_of) => Ok(&mut fr_of.enumerated),
            _ => Err(RolesError::InvalidRoleType),
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::common::roles::{
        FractionOf, Profile, QuantityOf, RoleType, RolesState, EVERYONE_ROLE_ID,
        HAS_PROFILE_ROLE_ID,
    };
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

        let everyone_role = roles_state
            .get_role(&EVERYONE_ROLE_ID)
            .expect("Public role should exist");
        assert!(
            matches!(everyone_role.role_type, RoleType::Everyone),
            "Everyone role has invalid type"
        );

        let has_profile_role = roles_state
            .get_role(&HAS_PROFILE_ROLE_ID)
            .expect("Has profile role should exist");
        match &has_profile_role.role_type {
            RoleType::QuantityOf(qty_of_params) => {
                assert_eq!(qty_of_params.quantity, 1);
                assert_eq!(qty_of_params.name, "Has profile");
            }
            _ => unreachable!("Has profile role has invalid type"),
        };
    }

    #[test]
    fn default_roles_are_immutable_and_unique() {
        let mut roles_state = RolesState::new().expect("Roles state should be created");

        roles_state
            .create_role(RoleType::Everyone)
            .expect_err("It should be impossible to create another Everyone role");

        roles_state
            .remove_role(&EVERYONE_ROLE_ID)
            .expect_err("It should be impossible to remove Everyone role");

        roles_state
            .remove_role(&HAS_PROFILE_ROLE_ID)
            .expect_err("It should be impossible to remove Has profile role");

        let new_profile = Profile::new(random_principal_test(), "Test", "Test");

        roles_state
            .update_role(&EVERYONE_ROLE_ID, RoleType::Profile(new_profile.clone()))
            .expect_err("It should be impossible to update Everyone role");

        roles_state
            .update_role(&HAS_PROFILE_ROLE_ID, RoleType::Profile(new_profile))
            .expect_err("It should be impossible to update Has profile role");
    }

    #[test]
    fn role_crud_works_fine() {
        let mut roles_state = RolesState::new().expect("Roles state should be created");

        let user1 = random_principal_test();
        let user2 = random_principal_test();
        let user3 = random_principal_test();

        let user_1_role_id = roles_state
            .create_role(RoleType::Profile(Profile::new(
                user1,
                "User1",
                "User1 desc",
            )))
            .expect("Unable to create user1 role");
        let user_2_role_id = roles_state
            .create_role(RoleType::Profile(Profile::new(
                user2,
                "User2",
                "User2 desc",
            )))
            .expect("Unable to create user1 role");
        let user_3_role_id = roles_state
            .create_role(RoleType::Profile(Profile::new(
                user3,
                "User3",
                "User3 desc",
            )))
            .expect("Unable to create user1 role");

        let role_id_a = roles_state
            .create_role(RoleType::FractionOf(FractionOf::new(
                "A",
                "100% of User1 + User2",
                1.00,
                Some(vec![user_1_role_id, user_2_role_id]),
            )))
            .expect("Unable to create A role");

        let role_id_b = roles_state
            .create_role(RoleType::QuantityOf(QuantityOf::new(
                "B",
                "1 of A or User3",
                1,
                Some(vec![role_id_a, user_3_role_id]),
            )))
            .expect("Unable to create B role");

        roles_state.remove_role(&user_1_role_id).expect_err(
            "It should be impossible to remove User1 profile, until there are related roles exist",
        );

        roles_state.remove_role(&user_3_role_id).expect_err(
            "It should be impossible to remove User3 profile, until there are related roles exist",
        );

        roles_state.remove_role(&role_id_a).expect_err(
            "It should be impossible to remove A role, until there are related roles exist",
        );

        let has_profile_role = roles_state.get_has_profile_role_mut().unwrap();
        assert_eq!(has_profile_role.enumerated.len(), 3);
        assert!(has_profile_role.enumerated.contains(&user_1_role_id));
        assert!(has_profile_role.enumerated.contains(&user_2_role_id));
        assert!(has_profile_role.enumerated.contains(&user_3_role_id));

        roles_state
            .subtract_enumerated_roles(&role_id_b, vec![role_id_a])
            .expect("It should be possible to subtract role A from role B");

        roles_state
            .remove_role(&role_id_a)
            .expect("It should be possible to remove role A now");

        roles_state
            .update_role(
                &role_id_b,
                RoleType::QuantityOf(QuantityOf::new(
                    "B",
                    "2 of User1, User2 or User3",
                    2,
                    Some(vec![user_1_role_id, user_2_role_id, user_3_role_id]),
                )),
            )
            .expect("It should be possible to update role B now");

        roles_state
            .remove_role(&role_id_b)
            .expect("It should be possible to remove role B now");

        roles_state
            .remove_role(&user_1_role_id)
            .expect("It should be possible to remove User1 role now");

        roles_state
            .remove_role(&user_2_role_id)
            .expect("It should be possible to remove User2 role now");

        roles_state
            .remove_role(&user_3_role_id)
            .expect("It should be possible to remove User3 role now");

        let has_profile_role = roles_state.get_has_profile_role_mut().unwrap();
        assert!(has_profile_role.enumerated.is_empty());
    }
}
