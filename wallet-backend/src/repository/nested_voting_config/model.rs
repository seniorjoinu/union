use crate::repository::nested_voting_config::types::{
    NestedVoteCalculation, NestedVotingConfigId, RemoteVotingConfigId,
    NESTED_VOTING_CONFIG_DESCRIPTION_MAX_LEN, NESTED_VOTING_CONFIG_DESCRIPTION_MIN_LEN,
    NESTED_VOTING_CONFIG_NAME_MAX_LEN, NESTED_VOTING_CONFIG_NAME_MIN_LEN,
};
use crate::repository::voting_config::types::Fraction;
use candid::{CandidType, Deserialize, Principal};
use shared::mvc::Model;
use shared::types::wallet::GroupId;
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeMap;

#[derive(Clone, CandidType, Deserialize)]
pub struct NestedVotingConfig {
    id: Option<NestedVotingConfigId>,
    name: String,
    description: String,

    remote_union_id: Principal,
    remote_voting_config_id: RemoteVotingConfigId,

    vote_calculation: NestedVoteCalculation,
    allowee_groups: BTreeMap<GroupId, Fraction>,
}

impl NestedVotingConfig {
    pub fn new(
        mut name: String,
        mut description: String,
        remote_union_id: Principal,
        remote_voting_config_id: RemoteVotingConfigId,
        vote_calculation: NestedVoteCalculation,
        allowee_groups: BTreeMap<GroupId, Fraction>,
    ) -> Result<Self, ValidationError> {
        name = Self::process_name(name)?;
        description = Self::process_description(description)?;
        Self::validate_allowee_groups(&allowee_groups)?;

        Ok(Self {
            id: None,
            name,
            description,
            remote_union_id,
            remote_voting_config_id,
            vote_calculation,
            allowee_groups,
        })
    }

    pub fn update(
        &mut self,
        name_opt: Option<String>,
        description_opt: Option<String>,
        vote_calculation_opt: Option<NestedVoteCalculation>,
        allowee_groups_opt: Option<BTreeMap<GroupId, Fraction>>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = name_opt {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = description_opt {
            self.description = Self::process_description(description)?;
        }

        if let Some(allowee_groups) = allowee_groups_opt {
            Self::validate_allowee_groups(&allowee_groups)?;
            self.allowee_groups = allowee_groups;
        }

        if let Some(vote_calculation) = vote_calculation_opt {
            self.vote_calculation = vote_calculation;
        }

        Ok(())
    }

    pub fn get_remote_union_id(&self) -> Principal {
        self.remote_union_id
    }

    pub fn get_remote_voting_config_id(&self) -> RemoteVotingConfigId {
        self.remote_voting_config_id
    }

    pub fn get_vote_calculation(&self) -> NestedVoteCalculation {
        self.vote_calculation
    }

    pub fn get_group_remote_shares_distribution(&self, group_id: &GroupId) -> Option<Fraction> {
        self.allowee_groups.get(group_id).cloned()
    }

    fn validate_allowee_groups(
        allowee_groups: &BTreeMap<GroupId, Fraction>,
    ) -> Result<(), ValidationError> {
        let zero = Fraction::default();
        let mut total_fraction = zero.clone();

        for (_, fraction) in allowee_groups {
            let fr = fraction.clone();
            if fr < zero {
                return Err(ValidationError(String::from(
                    "Allowee group remote shares distribution is negative",
                )));
            }

            total_fraction += fr;
        }

        if total_fraction > Fraction::from(1) {
            return Err(ValidationError(format!(
                "Allowee groups distribute more than 100% of the available remote shares ({:?})",
                total_fraction
            )));
        } else {
            Ok(())
        }
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            NESTED_VOTING_CONFIG_NAME_MIN_LEN,
            NESTED_VOTING_CONFIG_NAME_MAX_LEN,
            "Nested voting config name",
        )
    }

    fn process_description(desc: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            desc,
            NESTED_VOTING_CONFIG_DESCRIPTION_MIN_LEN,
            NESTED_VOTING_CONFIG_DESCRIPTION_MAX_LEN,
            "Nested voting config description",
        )
    }
}

impl Model<NestedVotingConfigId> for NestedVotingConfig {
    fn get_id(&self) -> Option<NestedVotingConfigId> {
        self.id
    }

    fn _init_id(&mut self, id: NestedVotingConfigId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
