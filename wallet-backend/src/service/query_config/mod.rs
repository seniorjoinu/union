use crate::repository::group::model::Group;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::model::Profile;
use crate::repository::query_config::types::AlloweeConstraint;
use crate::repository::voting_config::types::GroupCondition;
use crate::service::group::types::HAS_PROFILE_GROUP_ID;
use crate::service::permission::types::ALLOW_ALL_PERMISSION_ID;
use crate::service::query_config::types::{QueryConfigError, QueryConfigService};
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{GroupOrProfile, Shares};
use std::collections::BTreeSet;

pub mod crud;
pub mod types;

impl QueryConfigService {
    pub fn init_default_query_config() {
        QueryConfigService::create_query_config(
            String::from("Default"),
            String::from("Default query config. It allows all users with profiles to query any method of any canister through this union. You can delete or edit it, but be careful - you can lose access to your data."),
            vec![ALLOW_ALL_PERMISSION_ID].into_iter().collect(),
            vec![AlloweeConstraint::Group(GroupCondition { min_shares: Shares::from(1), id: HAS_PROFILE_GROUP_ID })].into_iter().collect(),
        ).unwrap();
    }

    fn assert_permissions_exist(
        permissions: &BTreeSet<PermissionId>,
    ) -> Result<(), QueryConfigError> {
        for permission in permissions {
            Permission::repo()
                .get(permission)
                .ok_or(QueryConfigError::PermissionNotFound(*permission))?;
        }

        Ok(())
    }

    fn assert_allowees_exist(
        allowees: &BTreeSet<AlloweeConstraint>,
    ) -> Result<(), QueryConfigError> {
        for allowee in allowees {
            if let Some(gop) = allowee.to_group_or_profile() {
                match gop {
                    GroupOrProfile::Group(g) => {
                        Group::repo()
                            .get(&g)
                            .ok_or(QueryConfigError::GroupNotFound(g))?;
                    }
                    GroupOrProfile::Profile(p) => {
                        Profile::repo()
                            .get(&p)
                            .ok_or(QueryConfigError::ProfileNotFound(p))?;
                    }
                };
            }
        }

        Ok(())
    }
}
