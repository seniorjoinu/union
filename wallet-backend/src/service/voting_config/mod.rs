use crate::repository::group::model::Group;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::model::Profile;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{
    Fraction, FractionOf, QuantityOf, RoundSettings, Target, ThresholdValue,
};
use crate::service::group::types::HAS_PROFILE_GROUP_ID;
use crate::service::permission::types::ALLOW_ALL_PERMISSION_ID;
use crate::service::voting_config::types::{
    VotingConfigError, VotingConfigService, DEFAULT_VOTING_CONFIG_ID,
};
use shared::mvc::{HasRepository, Repository};
use shared::remote_call::Program;
use shared::time::hours;
use shared::types::wallet::{GroupOrProfile, Shares, VotingConfigId};
use std::collections::BTreeSet;

pub mod crud;
pub mod types;

impl VotingConfigService {
    pub fn init_default_voting_config() {
        let id = VotingConfigService::create_voting_config(
            String::from("Default"),
            String::from("Non-deletable voting config. Allows to call ANY method of this union if 100% of 'Has Profile' group wants it."),
            None,
            None,
            vec![ALLOW_ALL_PERMISSION_ID].into_iter().collect(),
            RoundSettings { round_duration: hours(1), round_delay: 0 },
            ThresholdValue::QuantityOf(QuantityOf { quantity: Shares::from(0), target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID)) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID)) }),
            ThresholdValue::QuantityOf(QuantityOf { quantity: Shares::from(1), target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID)) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID)) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID)) }),
        ).unwrap();

        assert_eq!(id, DEFAULT_VOTING_CONFIG_ID);
    }

    pub fn does_program_fit(vc: &VotingConfig, program: &Program) -> bool {
        for id in vc.get_permissions() {
            let permission = Permission::repo().get(id).unwrap();

            if permission.is_program_allowed(program) {
                return true;
            }
        }

        false
    }

    fn assert_not_default(id: VotingConfigId) -> Result<(), VotingConfigError> {
        if id == DEFAULT_VOTING_CONFIG_ID {
            Err(VotingConfigError::UnableToEditDefaultVotingConfig)
        } else {
            Ok(())
        }
    }

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
