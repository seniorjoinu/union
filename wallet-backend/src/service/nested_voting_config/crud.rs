use crate::repository::nested_voting_config::model::NestedVotingConfig;
use crate::repository::nested_voting_config::types::{
    NestedVoteCalculation, NestedVotingConfigFilter, NestedVotingConfigId, RemoteVotingConfigId,
};
use crate::repository::voting_config::types::Fraction;
use crate::service::nested_voting_config::types::{
    NestedVotingConfigError, NestedVotingConfigService,
};
use crate::GroupService;
use candid::Principal;
use shared::mvc::{HasRepository, Repository};
use shared::pageable::{Page, PageRequest};
use shared::types::wallet::GroupId;
use std::collections::BTreeMap;

impl NestedVotingConfigService {
    pub fn create_nested_voting_config(
        name: String,
        description: String,
        remote_union_id: Principal,
        remote_voting_config_id: RemoteVotingConfigId,
        vote_calculation: NestedVoteCalculation,
        allowee_groups: BTreeMap<GroupId, Fraction>,
    ) -> Result<NestedVotingConfigId, NestedVotingConfigError> {
        for (group_id, _) in &allowee_groups {
            GroupService::get_group(*group_id).map_err(NestedVotingConfigError::GroupError)?;
        }

        let it = NestedVotingConfig::new(
            name,
            description,
            remote_union_id,
            remote_voting_config_id,
            vote_calculation,
            allowee_groups,
        )
        .map_err(NestedVotingConfigError::ValidationError)?;

        Ok(NestedVotingConfig::repo().save(it))
    }

    pub fn update_nested_voting_config(
        id: &NestedVotingConfigId,
        name_opt: Option<String>,
        description_opt: Option<String>,
        vote_calculation_opt: Option<NestedVoteCalculation>,
        allowee_groups_opt: Option<BTreeMap<GroupId, Fraction>>,
    ) -> Result<(), NestedVotingConfigError> {
        let mut it = NestedVotingConfig::repo()
            .get(id)
            .ok_or(NestedVotingConfigError::NestedVotingConfigNotFound(*id))?;

        if let Some(allowee_groups) = &allowee_groups_opt {
            for (group_id, _) in allowee_groups {
                GroupService::get_group(*group_id).map_err(NestedVotingConfigError::GroupError)?;
            }
        }

        it.update(
            name_opt,
            description_opt,
            vote_calculation_opt,
            allowee_groups_opt,
        )
        .map_err(NestedVotingConfigError::ValidationError)?;

        NestedVotingConfig::repo().save(it);

        Ok(())
    }

    #[inline(always)]
    pub fn delete_nested_voting_config(
        id: &NestedVotingConfigId,
    ) -> Result<NestedVotingConfig, NestedVotingConfigError> {
        NestedVotingConfig::repo()
            .delete(id)
            .ok_or(NestedVotingConfigError::NestedVotingConfigNotFound(*id))
    }

    #[inline(always)]
    pub fn get_nested_voting_config(
        id: &NestedVotingConfigId,
    ) -> Result<NestedVotingConfig, NestedVotingConfigError> {
        NestedVotingConfig::repo()
            .get(id)
            .ok_or(NestedVotingConfigError::NestedVotingConfigNotFound(*id))
    }

    #[inline(always)]
    pub fn list_nested_voting_configs(
        page_req: &PageRequest<NestedVotingConfigFilter, ()>,
    ) -> Page<NestedVotingConfig> {
        NestedVotingConfig::repo().list(page_req)
    }
}
