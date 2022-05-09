use crate::repository::group::model::Group;
use crate::repository::permission::model::Permission;
use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{
    Fraction, FractionOf, QuantityOf, RoundSettings, Target, ThresholdValue,
};
use crate::service::group::types::HAS_PROFILE_GROUP_ID;
use crate::service::permission::types::{
    ALLOW_SEND_FEEDBACK_PERMISSION_ID, ALLOW_WRITE_PERMISSION_ID,
};
use crate::service::voting_config::types::{
    VotingConfigError, VotingConfigService, EMERGENCY_VOTING_CONFIG_ID, FEEDBACK_VOTING_CONFIG_ID,
};
use shared::mvc::{HasRepository, Repository};
use shared::remote_call::Program;
use shared::time::{hours, mins};
use shared::types::wallet::{GroupId, Shares, VotingConfigId};
use std::collections::BTreeSet;

pub mod crud;
pub mod types;

impl VotingConfigService {
    pub fn init_default_voting_configs() {
        let emergency_voting_config_id = VotingConfigService::create_voting_config(
            String::from("Emergency"),
            String::from("Non-deletable voting config. Allows to call ANY method of this union if 100% of 'Has Profile' group wants it."),
            None,
            None,
            vec![ALLOW_WRITE_PERMISSION_ID].into_iter().collect(),
            RoundSettings { round_duration: mins(1), round_delay: 0 },
            ThresholdValue::QuantityOf(QuantityOf { quantity: Shares::from(0), target: Target::Group(HAS_PROFILE_GROUP_ID) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::Group(HAS_PROFILE_GROUP_ID) }),
            ThresholdValue::QuantityOf(QuantityOf { quantity: Shares::from(1), target: Target::Group(HAS_PROFILE_GROUP_ID) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::Group(HAS_PROFILE_GROUP_ID) }),
            ThresholdValue::FractionOf(FractionOf { fraction: Fraction::from(1), target: Target::Group(HAS_PROFILE_GROUP_ID) }),
        ).unwrap();

        assert_eq!(emergency_voting_config_id, EMERGENCY_VOTING_CONFIG_ID);

        let feedback_voting_config_id = VotingConfigService::create_voting_config(
            String::from("Feedback"),
            String::from(
                "Default non-deletable voting config. Allows anyone from the 'Has profile' group to create votings with empty programs.",
            ),
            None,
            None,
            vec![ALLOW_SEND_FEEDBACK_PERMISSION_ID]
                .into_iter()
                .collect(),
            RoundSettings {
                round_duration: mins(1),
                round_delay: 0,
            },
            ThresholdValue::FractionOf(FractionOf {
                fraction: Fraction::from(0.1),
                target: Target::Group(HAS_PROFILE_GROUP_ID),
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: Fraction::from(0.3),
                target: Target::Group(HAS_PROFILE_GROUP_ID),
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: Fraction::from(0.2),
                target: Target::Group(HAS_PROFILE_GROUP_ID),
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: Fraction::from(0.66667),
                target: Target::Group(HAS_PROFILE_GROUP_ID),
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: Fraction::from(0.2),
                target: Target::Group(HAS_PROFILE_GROUP_ID),
            }),
        )
        .unwrap();

        assert_eq!(feedback_voting_config_id, FEEDBACK_VOTING_CONFIG_ID);
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
        if id == EMERGENCY_VOTING_CONFIG_ID || id == FEEDBACK_VOTING_CONFIG_ID {
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
                .ok_or(VotingConfigError::PermissionDoesntExist(*id))?;
        }

        Ok(())
    }

    fn assert_group_exists(group_id: &GroupId) -> Result<(), VotingConfigError> {
        Group::repo()
            .get(group_id)
            .map(|_| ())
            .ok_or(VotingConfigError::GroupDoesntExist(*group_id))
    }
}
