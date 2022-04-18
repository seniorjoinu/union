use crate::repository::group::types::GroupId;
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::types::ProfileId;
use crate::repository::voting_config::types::{
    EditorConstraint, GroupOrProfile, LenInterval, ProposerConstraint, RoundSettings,
    StartConstraint, ThresholdValue, VotesFormula, VotingConfig, VotingConfigId,
    VotingConfigRepositoryError,
};
use candid::{CandidType, Deserialize};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct VotingConfigRepository {
    voting_configs: HashMap<VotingConfigId, VotingConfig>,
    voting_config_id_counter: VotingConfigId,

    voting_configs_by_group_or_profile_index: BTreeMap<GroupOrProfile, BTreeSet<VotingConfigId>>,
    voting_configs_by_permission_index: BTreeMap<PermissionId, BTreeSet<VotingConfigId>>,
}

impl VotingConfigRepository {
    pub fn create_voting_config(
        &mut self,
        mut name: String,
        mut description: String,
        choices_count: Option<LenInterval>,
        winners_count: Option<LenInterval>,
        votes_formula: Option<VotesFormula>,
        permissions: BTreeSet<PermissionId>,
        proposers: BTreeSet<ProposerConstraint>,
        editors: BTreeSet<EditorConstraint>,
        start: StartConstraint,
        round: RoundSettings,
        approval: ThresholdValue,
        quorum: ThresholdValue,
        rejection: ThresholdValue,
        win: ThresholdValue,
        next_round: ThresholdValue,
    ) -> Result<VotingConfigId, VotingConfigRepositoryError> {
        let id = self.generate_voting_config_id();

        // ------------------ VALIDATION ----------------------

        name = Self::process_name(name)?;
        description = Self::process_description(description)?;

        if let Some(cc) = &choices_count {
            if !cc.is_valid() {
                return Err(VotingConfigRepositoryError::ValidationError(
                    ValidationError("Invalid choices count interval".to_string()),
                ));
            }
        }

        if let Some(wc) = &winners_count {
            if !wc.is_valid() {
                return Err(VotingConfigRepositoryError::ValidationError(
                    ValidationError("Invalid winners count interval".to_string()),
                ));
            }
        }

        // ---------------------- INDEXING ----------------------

        for permission_id in &permissions {
            self.add_to_permissions_index(id, *permission_id);
        }

        for proposer in &proposers {
            self.add_to_group_or_profile_index(id, proposer.to_group_or_profile());
        }

        for editor in &editors {
            if let Some(gop) = editor.to_group_or_profile() {
                self.add_to_group_or_profile_index(id, gop);
            }
        }

        for gop in approval.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, *gop);
        }

        for gop in quorum.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, *gop);
        }

        for gop in rejection.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, *gop);
        }

        for gop in win.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, *gop);
        }

        for gop in next_round.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, *gop);
        }

        // ---------------------- SAVING --------------------

        let voting_config = VotingConfig {
            id,
            name,
            description,
            choices_count,
            winners_count,
            votes_formula,
            permissions,
            proposers,
            editors,
            start,
            round,
            approval,
            quorum,
            rejection,
            win,
            next_round,
        };

        self.voting_configs.insert(id, voting_config);

        Ok(id)
    }

    pub fn update_voting_config(
        &mut self,
        id: VotingConfigId,
        name_opt: Option<String>,
        description_opt: Option<String>,
        choices_count_opt: Option<Option<LenInterval>>,
        winners_count_opt: Option<Option<LenInterval>>,
        votes_formula_opt: Option<Option<VotesFormula>>,
        permissions_opt: Option<BTreeSet<PermissionId>>,
        proposers_opt: Option<BTreeSet<ProposerConstraint>>,
        editors_opt: Option<BTreeSet<EditorConstraint>>,
        start_opt: Option<StartConstraint>,
        round_opt: Option<RoundSettings>,
        approval_opt: Option<ThresholdValue>,
        quorum_opt: Option<ThresholdValue>,
        rejection_opt: Option<ThresholdValue>,
        win_opt: Option<ThresholdValue>,
        next_round_opt: Option<ThresholdValue>,
    ) -> Result<(), VotingConfigRepositoryError> {
        let voting_config = self.get_voting_config_mut(&id)?;

        // ------------------ VALIDATION -------------------

        if let Some(name) = name_opt {
            voting_config.name = Self::process_name(name)?;
        }

        if let Some(description) = description_opt {
            voting_config.description = Self::process_description(description)?;
        }

        if let Some(choices_count) = choices_count_opt {
            if let Some(cc) = &choices_count {
                if !cc.is_valid() {
                    return Err(VotingConfigRepositoryError::ValidationError(
                        ValidationError("Invalid choices count interval".to_string()),
                    ));
                }
            }

            voting_config.choices_count = choices_count;
        }

        if let Some(winners_count) = winners_count_opt {
            if let Some(wc) = &winners_count {
                if !wc.is_valid() {
                    return Err(VotingConfigRepositoryError::ValidationError(
                        ValidationError("Invalid winners count interval".to_string()),
                    ));
                }
            }

            voting_config.winners_count = winners_count;
        }

        if let Some(votes_formula) = votes_formula_opt {
            voting_config.votes_formula = votes_formula;
        }

        // ------------------------ INDEXING --------------------------

        if let Some(permissions) = permissions_opt {
            for old_permission in &voting_config.permissions {
                self.remove_from_permissions_index(&id, old_permission);
            }

            voting_config.permissions = permissions;

            for new_permission in &voting_config.permissions {
                self.add_to_permissions_index(id, *new_permission);
            }
        }

        if let Some(proposers) = proposers_opt {
            for old_proposer in &voting_config.proposers {
                self.remove_from_group_or_profile_index(&id, &old_proposer.to_group_or_profile());
            }

            voting_config.proposers = proposers;

            for new_proposer in &voting_config.proposers {
                self.add_to_group_or_profile_index(id, new_proposer.to_group_or_profile());
            }
        }

        if let Some(editors) = editors_opt {
            for old_editor in &voting_config.editors {
                if let Some(gop) = &old_editor.to_group_or_profile() {
                    self.remove_from_group_or_profile_index(&id, gop);
                }
            }

            voting_config.editors = editors;

            for new_editor in &voting_config.editors {
                if let Some(gop) = new_editor.to_group_or_profile() {
                    self.add_to_group_or_profile_index(id, gop);
                }
            }
        }

        if let Some(start) = start_opt {
            voting_config.start = start;
        }

        if let Some(round) = round_opt {
            voting_config.round = round;
        }

        if let Some(approval) = approval_opt {
            for gop in voting_config.approval.list_groups_and_profiles() {
                self.remove_from_group_or_profile_index(&id, gop);
            }

            voting_config.approval = approval;

            for gop in voting_config.approval.list_groups_and_profiles() {
                self.add_to_group_or_profile_index(id, *gop);
            }
        }

        if let Some(quorum) = quorum_opt {
            for gop in voting_config.quorum.list_groups_and_profiles() {
                self.remove_from_group_or_profile_index(&id, gop);
            }

            voting_config.quorum = quorum;

            for gop in voting_config.quorum.list_groups_and_profiles() {
                self.add_to_group_or_profile_index(id, *gop);
            }
        }

        if let Some(rejection) = rejection_opt {
            for gop in voting_config.rejection.list_groups_and_profiles() {
                self.remove_from_group_or_profile_index(&id, gop);
            }

            voting_config.rejection = rejection;

            for gop in voting_config.rejection.list_groups_and_profiles() {
                self.add_to_group_or_profile_index(id, *gop);
            }
        }

        if let Some(win) = win_opt {
            for gop in voting_config.win.list_groups_and_profiles() {
                self.remove_from_group_or_profile_index(&id, gop);
            }

            voting_config.win = win;

            for gop in voting_config.win.list_groups_and_profiles() {
                self.add_to_group_or_profile_index(id, *gop);
            }
        }

        if let Some(next_round) = next_round_opt {
            for gop in voting_config.next_round.list_groups_and_profiles() {
                self.remove_from_group_or_profile_index(&id, gop);
            }

            voting_config.next_round = next_round;

            for gop in voting_config.next_round.list_groups_and_profiles() {
                self.add_to_group_or_profile_index(id, *gop);
            }
        }

        Ok(())
    }

    pub fn delete_voting_config(
        &mut self,
        id: &VotingConfigId,
    ) -> Result<VotingConfig, VotingConfigRepositoryError> {
        let voting_config = self
            .voting_configs
            .remove(id)
            .ok_or(VotingConfigRepositoryError::VotingConfigNotFound(*id))?;

        // ------------------ INDEXING ----------------------

        for permission_id in &voting_config.permissions {
            self.remove_from_permissions_index(id, permission_id);
        }

        for proposer in &voting_config.proposers {
            self.remove_from_group_or_profile_index(id, &proposer.to_group_or_profile());
        }

        for editor in &voting_config.editors {
            if let Some(gop) = &editor.to_group_or_profile() {
                self.remove_from_group_or_profile_index(id, gop);
            }
        }

        for gop in voting_config.approval.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, gop);
        }

        for gop in voting_config.quorum.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, gop);
        }

        for gop in voting_config.rejection.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, gop);
        }

        for gop in voting_config.win.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, gop);
        }

        for gop in voting_config.next_round.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, gop);
        }

        Ok(voting_config)
    }

    pub fn get_voting_config_cloned(
        &self,
        id: &VotingConfigId,
    ) -> Result<VotingConfig, VotingConfigRepositoryError> {
        self.get_voting_config(id).cloned()
    }

    pub fn get_voting_config_ids_by_permission_id(
        &self,
        permission_id: &PermissionId,
    ) -> Vec<VotingConfigId> {
        self.voting_configs_by_permission_index
            .get(permission_id)
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_voting_config_ids_by_profile_id(
        &self,
        profile_id: ProfileId,
    ) -> Vec<VotingConfigId> {
        self.voting_configs_by_group_or_profile_index
            .get(&GroupOrProfile::Profile(profile_id))
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    pub fn get_voting_config_ids_by_group_id(&self, group_id: GroupId) -> Vec<VotingConfigId> {
        self.voting_configs_by_group_or_profile_index
            .get(&GroupOrProfile::Group(group_id))
            .cloned()
            .unwrap_or_default()
            .into_iter()
            .collect()
    }

    // ------------------- PRIVATE ----------------------

    fn get_voting_config(
        &self,
        id: &VotingConfigId,
    ) -> Result<&VotingConfig, VotingConfigRepositoryError> {
        self.voting_configs
            .get(id)
            .ok_or(VotingConfigRepositoryError::VotingConfigNotFound(*id))
    }

    fn get_voting_config_mut(
        &mut self,
        id: &VotingConfigId,
    ) -> Result<&mut VotingConfig, VotingConfigRepositoryError> {
        self.voting_configs
            .get_mut(id)
            .ok_or(VotingConfigRepositoryError::VotingConfigNotFound(*id))
    }

    fn add_to_permissions_index(
        &mut self,
        voting_config_id: VotingConfigId,
        permission_id: PermissionId,
    ) {
        self.voting_configs_by_permission_index
            .entry(permission_id)
            .or_default()
            .insert(voting_config_id);
    }

    fn remove_from_permissions_index(
        &mut self,
        voting_config_id: &VotingConfigId,
        permission_id: &PermissionId,
    ) {
        self.voting_configs_by_permission_index
            .get_mut(permission_id)
            .unwrap()
            .remove(voting_config_id);
    }

    fn add_to_group_or_profile_index(
        &mut self,
        voting_config_id: VotingConfigId,
        gop: GroupOrProfile,
    ) {
        self.voting_configs_by_group_or_profile_index
            .entry(gop)
            .or_default()
            .insert(voting_config_id);
    }

    fn remove_from_group_or_profile_index(
        &mut self,
        voting_config_id: &VotingConfigId,
        gop: &GroupOrProfile,
    ) {
        self.voting_configs_by_group_or_profile_index
            .get_mut(&gop)
            .unwrap()
            .remove(voting_config_id);
    }

    fn generate_voting_config_id(&mut self) -> VotingConfigId {
        let id = self.voting_config_id_counter;
        self.voting_config_id_counter += 1;

        id
    }

    fn process_name(name: String) -> Result<String, VotingConfigRepositoryError> {
        validate_and_trim_str(name, 1, 100, "Name")
            .map_err(VotingConfigRepositoryError::ValidationError)
    }

    fn process_description(description: String) -> Result<String, VotingConfigRepositoryError> {
        validate_and_trim_str(description, 0, 500, "Description")
            .map_err(VotingConfigRepositoryError::ValidationError)
    }
}
