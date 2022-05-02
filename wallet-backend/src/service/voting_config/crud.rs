use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{EditorConstraint, LenInterval, ProposerConstraint, RoundSettings, ThresholdValue, VotingConfigFilter};
use crate::repository::voting::model::Voting;
use crate::service::voting_config::types::{VotingConfigError, VotingConfigService};
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::wallet::VotingConfigId;
use std::collections::BTreeSet;
use shared::pageable::{Page, PageRequest};

impl VotingConfigService {
    pub fn create_voting_config(
        name: String,
        description: String,
        choices_count: Option<LenInterval>,
        winners_count: Option<LenInterval>,
        permissions: BTreeSet<PermissionId>,
        proposers: BTreeSet<ProposerConstraint>,
        editors: BTreeSet<EditorConstraint>,
        round: RoundSettings,
        approval: ThresholdValue,
        quorum: ThresholdValue,
        rejection: ThresholdValue,
        win: ThresholdValue,
        next_round: ThresholdValue,
    ) -> Result<VotingConfigId, VotingConfigError> {
        VotingConfigService::assert_permissions_exist(&permissions)?;

        for proposer in &proposers {
            VotingConfigService::assert_gop_exists(&proposer.to_group_or_profile())?;
        }

        for editor in &editors {
            if let Some(gop) = editor.to_group_or_profile() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }

        for gop in approval.list_groups_and_profiles() {
            VotingConfigService::assert_gop_exists(&gop)?;
        }

        for gop in rejection.list_groups_and_profiles() {
            VotingConfigService::assert_gop_exists(&gop)?;
        }

        for gop in quorum.list_groups_and_profiles() {
            VotingConfigService::assert_gop_exists(&gop)?;
        }

        for gop in win.list_groups_and_profiles() {
            VotingConfigService::assert_gop_exists(&gop)?;
        }

        for gop in next_round.list_groups_and_profiles() {
            VotingConfigService::assert_gop_exists(&gop)?;
        }

        let vc = VotingConfig::new(
            name,
            description,
            choices_count,
            winners_count,
            permissions,
            proposers,
            editors,
            round,
            approval,
            quorum,
            rejection,
            win,
            next_round,
        )
        .map_err(VotingConfigError::ValidationError)?;

        Ok(VotingConfig::repo().save(vc))
    }

    pub fn update_voting_config(
        id: VotingConfigId,
        name_opt: Option<String>,
        description_opt: Option<String>,
        choices_count_opt: Option<Option<LenInterval>>,
        winners_count_opt: Option<Option<LenInterval>>,
        permissions_opt: Option<BTreeSet<PermissionId>>,
        proposers_opt: Option<BTreeSet<ProposerConstraint>>,
        editors_opt: Option<BTreeSet<EditorConstraint>>,
        round_opt: Option<RoundSettings>,
        approval_opt: Option<ThresholdValue>,
        quorum_opt: Option<ThresholdValue>,
        rejection_opt: Option<ThresholdValue>,
        win_opt: Option<ThresholdValue>,
        next_round_opt: Option<ThresholdValue>,
    ) -> Result<(), VotingConfigError> {
        VotingConfigService::assert_not_default(id)?;
        
        if let Some(permissions) = &permissions_opt {
            VotingConfigService::assert_permissions_exist(permissions)?;
        }

        if let Some(proposers) = &proposers_opt {
            for proposer in proposers {
                VotingConfigService::assert_gop_exists(&proposer.to_group_or_profile())?;
            }
        }

        if let Some(editors) = &editors_opt {
            for editor in editors {
                if let Some(gop) = editor.to_group_or_profile() {
                    VotingConfigService::assert_gop_exists(&gop)?;
                }
            }
        }

        if let Some(approval) = &approval_opt {
            for gop in approval.list_groups_and_profiles() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }

        if let Some(rejection) = &rejection_opt {
            for gop in rejection.list_groups_and_profiles() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }

        if let Some(quorum) = &quorum_opt {
            for gop in quorum.list_groups_and_profiles() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }

        if let Some(win) = &win_opt {
            for gop in win.list_groups_and_profiles() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }

        if let Some(next_round) = &next_round_opt {
            for gop in next_round.list_groups_and_profiles() {
                VotingConfigService::assert_gop_exists(&gop)?;
            }
        }
        
        let mut vc = VotingConfigService::get_voting_config(&id)?;

        vc.update(
            name_opt,
            description_opt,
            choices_count_opt,
            winners_count_opt,
            permissions_opt,
            proposers_opt,
            editors_opt,
            round_opt,
            approval_opt,
            quorum_opt,
            rejection_opt,
            win_opt,
            next_round_opt,
        )
        .map_err(VotingConfigError::ValidationError);
        VotingConfig::repo().save(vc);
        
        Ok(())
    }

    pub fn delete_voting_config(id: VotingConfigId) -> Result<VotingConfig, VotingConfigError> {
        VotingConfigService::assert_not_default(id)?;
        
        if Voting::repo().voting_config_has_related_votings(&id) {
            return Err(VotingConfigError::HasRelatedVotings);
        }
        
        VotingConfig::repo().delete(&id).ok_or(VotingConfigError::VotingConfigNotFound(id))
    }
    
    #[inline(always)]
    pub fn get_voting_config(id: &VotingConfigId) -> Result<VotingConfig, VotingConfigError> {
        VotingConfig::repo().get(id).ok_or(VotingConfigError::VotingConfigNotFound(*id))
    }
    
    #[inline(always)]
    pub fn list_voting_configs(page_req: &PageRequest<VotingConfigFilter, ()>) -> Page<VotingConfig> {
        VotingConfig::repo().list(page_req)
    }
}
