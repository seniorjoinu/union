use crate::repository::access_config::model::AccessConfig;
use crate::repository::access_config::types::{AlloweeConstraint, GroupCondition};
use crate::repository::group::model::Group;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::{PermissionId, PermissionTarget};
use crate::repository::profile::model::Profile;
use crate::service::access_config::types::{AccessConfigError, AccessConfigService};
use crate::service::group::types::{GroupService, HAS_PROFILE_GROUP_ID};
use crate::service::permission::types::ALLOW_ALL_PERMISSION_ID;
use crate::EventsService;
use candid::Principal;
use shared::mvc::{HasRepository, Repository};
use shared::remote_call::{Program, ProgramExecutionResult, RemoteCallEndpoint};
use shared::types::wallet::{AccessConfigId, ProgramExecutedWith, Shares};
use std::collections::BTreeSet;

pub mod crud;
pub mod types;

impl AccessConfigService {
    pub fn init_default_access_config() {
        AccessConfigService::create_access_config(
            String::from("Default"),
            String::from("Default access config. It allows all users with profiles to call any method (including query methods) of any canister through this union. You can delete or edit it, but be careful - you can lose access to your data."),
            vec![ALLOW_ALL_PERMISSION_ID].into_iter().collect(),
            vec![AlloweeConstraint::Group(GroupCondition { min_shares: Shares::from(1), id: HAS_PROFILE_GROUP_ID })].into_iter().collect(),
        ).unwrap();
    }

    pub async fn execute(
        id: &AccessConfigId,
        program: Program,
        caller: Principal,
        timestamp: u64,
    ) -> Result<ProgramExecutionResult, AccessConfigError> {
        let ac = AccessConfigService::get_access_config(id)?;
        AccessConfigService::assert_program_fits(&ac, &program)?;
        AccessConfigService::assert_caller_allowed(&ac, caller)?;

        let result = program.execute().await;

        EventsService::emit_program_executed_event(
            caller,
            ProgramExecutedWith::WithAccessConfig(*id),
            program,
            result.clone(),
            timestamp,
        );

        Ok(result)
    }

    fn assert_caller_allowed(
        ac: &AccessConfig,
        caller: Principal,
    ) -> Result<(), AccessConfigError> {
        for allowee in ac.get_allowees() {
            match allowee {
                AlloweeConstraint::Everyone => return Ok(()),
                AlloweeConstraint::Profile(p) => {
                    if *p == caller {
                        // unwrapping, because it should exist if it is listed
                        Profile::repo().get(&p).unwrap();

                        return Ok(());
                    }
                }
                AlloweeConstraint::Group(group_condition) => {
                    // unwrapping, because it should exist if it is listed
                    let group = Group::repo().get(&group_condition.id).unwrap();
                    let token = GroupService::get_token(&group);

                    if token.balance_of(&caller) >= group_condition.min_shares.clone() {
                        return Ok(());
                    }
                }
            }
        }

        Err(AccessConfigError::CallerNotAllowed)
    }

    fn assert_program_fits(ac: &AccessConfig, program: &Program) -> Result<(), AccessConfigError> {
        for id in ac.get_permissions() {
            let permission = Permission::repo().get(id).unwrap();

            if permission.is_program_allowed(program) {
                return Ok(());
            }
        }

        Err(AccessConfigError::InvalidProgram)
    }

    pub fn caller_has_access(canister_id: Principal, method_name: &str, caller: Principal) -> bool {
        let target_exact = PermissionTarget::Endpoint(RemoteCallEndpoint {
            canister_id,
            method_name: method_name.to_string(),
        });
        let target_wide = PermissionTarget::Endpoint(RemoteCallEndpoint::wildcard(canister_id));

        let mut permission_ids = Permission::repo().get_permissions_by_target(&target_exact);
        permission_ids.extend(Permission::repo().get_permissions_by_target(&target_wide));

        for permission_id in permission_ids {
            for config_id in AccessConfig::repo().get_access_configs_by_permission(&permission_id) {
                // unwrapping, because it should exist if it is listed
                let ac = AccessConfig::repo().get(&config_id).unwrap();

                if AccessConfigService::assert_caller_allowed(&ac, caller).is_ok() {
                    return true;
                }
            }
        }

        false
    }

    fn assert_permissions_exist(
        permissions: &BTreeSet<PermissionId>,
    ) -> Result<(), AccessConfigError> {
        for permission in permissions {
            Permission::repo()
                .get(permission)
                .ok_or(AccessConfigError::PermissionNotFound(*permission))?;
        }

        Ok(())
    }

    fn assert_allowees_exist(
        allowees: &BTreeSet<AlloweeConstraint>,
    ) -> Result<(), AccessConfigError> {
        for allowee in allowees {
            match allowee {
                AlloweeConstraint::Group(g) => {
                    Group::repo()
                        .get(&g.id)
                        .ok_or(AccessConfigError::GroupNotFound(g.id))?;
                }
                AlloweeConstraint::Profile(p) => {
                    Profile::repo()
                        .get(p)
                        .ok_or(AccessConfigError::ProfileNotFound(*p))?;
                }
                _ => {}
            }
        }

        Ok(())
    }
}
