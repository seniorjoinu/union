use std::collections::BTreeSet;
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::GroupOrProfile;
use crate::repository::group::model::Group;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::model::Profile;
use crate::service::voting_config::types::{VotingConfigError, VotingConfigService};

pub mod crud;
pub mod types;


impl VotingConfigService {
    // TODO: add default config
    
    fn assert_permissions_exist(
        permissions: &BTreeSet<PermissionId>,
    ) -> Result<(), VotingConfigError> {
        for id in permissions {
            Permission::repo()
                .get(id)
                .ok_or(VotingConfigError::PermissionNotExists(*id))?;
        }

        Ok(())
    }

    fn assert_gop_exists(gop: &GroupOrProfile) -> Result<(), VotingConfigError> {
        match gop {
            GroupOrProfile::Group(g) => {
                Group::repo()
                    .get(g)
                    .ok_or(VotingConfigError::GroupNotExists(*g))?;
            }
            GroupOrProfile::Profile(p) => {
                Profile::repo()
                    .get(p)
                    .ok_or(VotingConfigError::ProfileNotExists(*p))?;
            }
        };

        Ok(())
    }
}
