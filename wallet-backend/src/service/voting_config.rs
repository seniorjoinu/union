use crate::common::utils::{Page, PageRequest};
use crate::repository::get_repositories;
use crate::repository::group::types::Shares;
use crate::repository::permission::types::{PermissionId, PermissionTarget};
use crate::repository::voting::types::{ChoiceCreatePayload, Program, StartCondition, Voting};
use crate::repository::voting_config::types::{
    EditorConstraint, FractionOf, GroupCondition, GroupOrProfile, LenInterval, ProposerConstraint,
    QuantityOf, RoundSettings, Target, ThresholdValue, VotesFormula, VotingConfig,
    VotingConfigFilter, VotingConfigId, VotingConfigRepositoryError,
};
use crate::service::group as GroupService;
use crate::service::group::{GroupServiceError, DEFAULT_SHARES, HAS_PROFILE_GROUP_ID};
use crate::service::permission as PermissionService;
use crate::service::permission::{PermissionServiceError, DEFAULT_PERMISSION_ID};
use crate::service::profile as ProfileService;
use crate::service::profile::ProfileServiceError;
use candid::Principal;
use shared::time::mins;
use shared::validation::ValidationError;
use std::collections::BTreeSet;

const DEFAULT_VOTING_CONFIG_ID: VotingConfigId = 0;
// TODO: set this to at least 1 day
const DEFAULT_VOTING_CONFIG_ROUND_DURATION: u64 = mins(2);

pub fn _init_default_voting_config() {
    let id = get_repositories()
        .voting_config
        .create_voting_config(
            String::from("Default"),
            String::from("This voting config is default and non-deletable. It allows to perform ANY action if 100% of registered profiles are agree with it. Use it in cases, when the union is stuck due to wrong settings."),
            None,
            None,
            Some(VotesFormula::Common),
            vec![DEFAULT_PERMISSION_ID].into_iter().collect(),
            vec![ProposerConstraint::Group(GroupCondition { id: HAS_PROFILE_GROUP_ID, min_shares: Shares::from(DEFAULT_SHARES) })].into_iter().collect(),
            vec![EditorConstraint::Proposer].into_iter().collect(),
            RoundSettings {
                round_delay: 0,
                round_duration: DEFAULT_VOTING_CONFIG_ROUND_DURATION,
            },
            ThresholdValue::FractionOf(FractionOf {
                fraction: 0.1,
                target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID))
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: 1.0,
                target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID))
            }),
            ThresholdValue::QuantityOf(QuantityOf {
                quantity: Shares::from(1),
                target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID))
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: 1.0,
                target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID))
            }),
            ThresholdValue::FractionOf(FractionOf {
                fraction: 1.0,
                target: Target::GroupOrProfile(GroupOrProfile::Group(HAS_PROFILE_GROUP_ID))
            })
        )
        .unwrap();

    assert_eq!(id, DEFAULT_VOTING_CONFIG_ID);
}

#[derive(Debug)]
pub enum VotingConfigServiceError {
    RepositoryError(VotingConfigRepositoryError),
    PermissionServiceError(PermissionServiceError),
    GroupServiceError(GroupServiceError),
    ProfileServiceError(ProfileServiceError),
    UnableToEditDefaultVotingConfig,
    ValidationError(ValidationError),
    ProgramNotAllowed(Program),
    ProposerNotAllowed(Principal),
    EditorNotAllowed(Principal),
}

pub fn create_voting_config(
    name: String,
    description: String,
    choices_count: Option<LenInterval>,
    winners_count: Option<LenInterval>,
    votes_formula: Option<VotesFormula>,
    permissions: BTreeSet<PermissionId>,
    proposers: BTreeSet<ProposerConstraint>,
    editors: BTreeSet<EditorConstraint>,
    round: RoundSettings,
    approval: ThresholdValue,
    quorum: ThresholdValue,
    rejection: ThresholdValue,
    win: ThresholdValue,
    next_round: ThresholdValue,
) -> Result<VotingConfigId, VotingConfigServiceError> {
    for permission_id in &permissions {
        PermissionService::assert_permission_exists(permission_id)
            .map_err(VotingConfigServiceError::PermissionServiceError)?;
    }

    for gop in proposers.iter().map(|it| it.to_group_or_profile()) {
        assert_gop_exists(&gop)?;
    }

    for gop in editors.iter().filter_map(|it| it.to_group_or_profile()) {
        assert_gop_exists(&gop)?;
    }

    for gop in approval.list_groups_and_profiles() {
        assert_gop_exists(&gop)?;
    }

    for gop in quorum.list_groups_and_profiles() {
        assert_gop_exists(&gop)?;
    }

    for gop in rejection.list_groups_and_profiles() {
        assert_gop_exists(&gop)?;
    }

    for gop in win.list_groups_and_profiles() {
        assert_gop_exists(&gop)?;
    }

    for gop in next_round.list_groups_and_profiles() {
        assert_gop_exists(&gop)?;
    }

    get_repositories()
        .voting_config
        .create_voting_config(
            name,
            description,
            choices_count,
            winners_count,
            votes_formula,
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
        .map_err(VotingConfigServiceError::RepositoryError)
}

pub fn update_voting_config(
    id: VotingConfigId,
    name_opt: Option<String>,
    description_opt: Option<String>,
    choices_count_opt: Option<Option<LenInterval>>,
    winners_count_opt: Option<Option<LenInterval>>,
    votes_formula_opt: Option<Option<VotesFormula>>,
    permissions_opt: Option<BTreeSet<PermissionId>>,
    proposers_opt: Option<BTreeSet<ProposerConstraint>>,
    editors_opt: Option<BTreeSet<EditorConstraint>>,
    round_opt: Option<RoundSettings>,
    approval_opt: Option<ThresholdValue>,
    quorum_opt: Option<ThresholdValue>,
    rejection_opt: Option<ThresholdValue>,
    win_opt: Option<ThresholdValue>,
    next_round_opt: Option<ThresholdValue>,
) -> Result<(), VotingConfigServiceError> {
    assert_voting_config_id(id)?;

    if let Some(permissions) = &permissions_opt {
        for permission_id in permissions {
            PermissionService::assert_permission_exists(permission_id)
                .map_err(VotingConfigServiceError::PermissionServiceError)?;
        }
    }

    if let Some(proposers) = &proposers_opt {
        for gop in proposers.iter().map(|it| it.to_group_or_profile()) {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(editors) = &editors_opt {
        for gop in editors.iter().filter_map(|it| it.to_group_or_profile()) {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(approval) = &approval_opt {
        for gop in approval.list_groups_and_profiles() {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(quorum) = &quorum_opt {
        for gop in quorum.list_groups_and_profiles() {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(rejection) = &rejection_opt {
        for gop in rejection.list_groups_and_profiles() {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(win) = &win_opt {
        for gop in win.list_groups_and_profiles() {
            assert_gop_exists(&gop)?;
        }
    }

    if let Some(next_round) = &next_round_opt {
        for gop in next_round.list_groups_and_profiles() {
            assert_gop_exists(&gop)?;
        }
    }

    get_repositories()
        .voting_config
        .update_voting_config(
            id,
            name_opt,
            description_opt,
            choices_count_opt,
            winners_count_opt,
            votes_formula_opt,
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
        .map_err(VotingConfigServiceError::RepositoryError)
}

pub fn delete_voting_config(id: VotingConfigId) -> Result<VotingConfig, VotingConfigServiceError> {
    assert_voting_config_id(id)?;

    // TODO: check for ongoing votings

    get_repositories()
        .voting_config
        .delete_voting_config(&id)
        .map_err(VotingConfigServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_voting_configs(page_req: PageRequest<VotingConfigFilter, ()>) -> Page<VotingConfig> {
    get_repositories()
        .voting_config
        .get_voting_configs_cloned(page_req)
}

#[inline(always)]
pub fn get_voting_config(id: &VotingConfigId) -> Result<VotingConfig, VotingConfigServiceError> {
    get_repositories()
        .voting_config
        .get_voting_config_cloned(id)
        .map_err(VotingConfigServiceError::RepositoryError)
}

pub fn assert_can_create_voting(
    voting_config_id: &VotingConfigId,
    votes_formula: &VotesFormula,
    winners_need: usize,
    custom_choices: &Vec<ChoiceCreatePayload>,
    proposer: Principal,
) -> Result<(), VotingConfigServiceError> {
    let voting_config = get_voting_config(voting_config_id)?;

    voting_config
        .voting_params_valid(custom_choices.len(), winners_need, votes_formula)
        .map_err(VotingConfigServiceError::ValidationError)?;

    // checking if all listed programs are valid

    let mut programs = custom_choices
        .iter()
        .map(|it| (&it.program, false))
        .collect::<Vec<_>>();

    for id in &voting_config.permissions {
        let permission = PermissionService::get_permission(id)
            .map_err(VotingConfigServiceError::PermissionServiceError)?;

        for it in programs.iter_mut() {
            if permission.is_program_allowed(it.0) {
                it.1 = true;
            }
        }
    }

    if let Some(failed) = programs.iter().find(|&it| !it.1) {
        return Err(VotingConfigServiceError::ProgramNotAllowed(
            failed.0.clone(),
        ));
    }

    // checking if the proposer has a right to propose a voting
    let mut proposer_valid = false;

    // TODO: move to a separate function
    for constraint in &voting_config.proposers {
        match constraint {
            ProposerConstraint::Profile(p) => {
                if *p == proposer {
                    proposer_valid = true;
                    break;
                }
            }
            ProposerConstraint::Group(g) => {
                let balance = GroupService::balance_of(g.id, &proposer).unwrap();

                if balance >= g.min_shares {
                    proposer_valid = true;
                    break;
                }
            }
        };
    }

    if !proposer_valid {
        Err(VotingConfigServiceError::ProposerNotAllowed(proposer))
    } else {
        Ok(())
    }
}

pub fn assert_can_update_voting(
    voting: &Voting,
    new_votes_formula: &Option<VotesFormula>,
    new_winners_need: Option<usize>,
    new_custom_choices: &Option<Vec<ChoiceCreatePayload>>,
    editor: Principal,
) -> Result<(), VotingConfigServiceError> {
    let voting_config = get_voting_config(&voting.voting_config_id)?;

    let choices_len = if let Some(custom_choices) = new_custom_choices {
        custom_choices.len()
    } else {
        voting.custom_choices.len()
    };

    let winners_len = if let Some(winners_need) = new_winners_need {
        winners_need
    } else {
        voting.winners_need
    };

    let formula = if let Some(votes_formula) = new_votes_formula {
        votes_formula
    } else {
        &voting.votes_formula
    };

    voting_config
        .voting_params_valid(choices_len, winners_len, formula)
        .map_err(VotingConfigServiceError::ValidationError)?;

    if let Some(custom_choices) = new_custom_choices {
        // checking if all listed programs are valid

        let mut programs = custom_choices
            .iter()
            .map(|it| (&it.program, false))
            .collect::<Vec<_>>();

        for id in &voting_config.permissions {
            let permission = PermissionService::get_permission(id)
                .map_err(VotingConfigServiceError::PermissionServiceError)?;

            for it in programs.iter_mut() {
                if permission.is_program_allowed(it.0) {
                    it.1 = true;
                }
            }
        }

        if let Some(failed) = programs.iter().find(|&it| !it.1) {
            return Err(VotingConfigServiceError::ProgramNotAllowed(
                failed.0.clone(),
            ));
        }
    }

    // checking if the editor has a right to edit the voting
    let mut editor_valid = false;

    // TODO: move to a separate function
    for constraint in &voting_config.editors {
        match constraint {
            EditorConstraint::Proposer => {
                if editor == voting.proposer {
                    editor_valid = true;
                    break;
                }
            }
            EditorConstraint::Profile(p) => {
                if *p == editor {
                    editor_valid = true;
                    break;
                }
            }
            EditorConstraint::Group(g) => {
                let balance = GroupService::balance_of(g.id, &editor).unwrap();

                if balance >= g.min_shares {
                    editor_valid = true;
                    break;
                }
            }
        };
    }

    if !editor_valid {
        Err(VotingConfigServiceError::EditorNotAllowed(editor))
    } else {
        Ok(())
    }
}

fn assert_voting_config_id(id: VotingConfigId) -> Result<(), VotingConfigServiceError> {
    if id == DEFAULT_VOTING_CONFIG_ID {
        Err(VotingConfigServiceError::UnableToEditDefaultVotingConfig)
    } else {
        Ok(())
    }
}

fn assert_gop_exists(gop: &GroupOrProfile) -> Result<(), VotingConfigServiceError> {
    match gop {
        GroupOrProfile::Profile(p) => ProfileService::assert_profile_exists(p)
            .map_err(VotingConfigServiceError::ProfileServiceError),
        GroupOrProfile::Group(g) => GroupService::assert_group_exists(g)
            .map_err(VotingConfigServiceError::GroupServiceError),
    }
}
