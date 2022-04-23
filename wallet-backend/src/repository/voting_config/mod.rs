use crate::repository::permission::types::PermissionId;
use crate::repository::voting_config::types::{
    EditorConstraint, LenInterval, ActorConstraint, RoundSettings,
    ThresholdValue, VotesFormula, VotingConfig, VotingConfigFilter,
    VotingConfigRepositoryError,
};
use candid::{CandidType, Deserialize};
use std::collections::{BTreeMap, BTreeSet, HashMap};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupOrProfile, VotingConfigId};

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
        name: String,
        description: String,
        choices_count: Option<LenInterval>,
        winners_count: Option<LenInterval>,
        permissions: BTreeSet<PermissionId>,
        proposers: BTreeSet<ActorConstraint>,
        editors: BTreeSet<EditorConstraint>,
        round: RoundSettings,
        approval: ThresholdValue,
        quorum: ThresholdValue,
        rejection: ThresholdValue,
        win: ThresholdValue,
        next_round: ThresholdValue,
    ) -> Result<VotingConfigId, VotingConfigRepositoryError> {
        let id = self.generate_voting_config_id();

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
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in quorum.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in rejection.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in win.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        for gop in next_round.list_groups_and_profiles() {
            self.add_to_group_or_profile_index(id, gop);
        }

        let voting_config = VotingConfig::new(
            id,
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
        )?;

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
        permissions_opt: Option<BTreeSet<PermissionId>>,
        proposers_opt: Option<BTreeSet<ActorConstraint>>,
        editors_opt: Option<BTreeSet<EditorConstraint>>,
        round_opt: Option<RoundSettings>,
        approval_opt: Option<ThresholdValue>,
        quorum_opt: Option<ThresholdValue>,
        rejection_opt: Option<ThresholdValue>,
        win_opt: Option<ThresholdValue>,
        next_round_opt: Option<ThresholdValue>,
    ) -> Result<(), VotingConfigRepositoryError> {
        let voting_config = self.get_voting_config_mut(&id)?;

        // gathering new indexing data

        let new_permissions = if let Some(permissions) = &permissions_opt {
            permissions.clone()
        } else {
            BTreeSet::new()
        };

        let mut new_gops = BTreeSet::new();

        if let Some(proposers) = &proposers_opt {
            for proposer in proposers {
                new_gops.insert(proposer.to_group_or_profile());
            }
        }

        if let Some(editors) = &editors_opt {
            for editor in editors {
                if let Some(gop) = editor.to_group_or_profile() {
                    new_gops.insert(gop);
                }
            }
        }

        if let Some(approval) = &approval_opt {
            for gop in approval.list_groups_and_profiles() {
                new_gops.insert(gop);
            }
        }

        if let Some(quorum) = &quorum_opt {
            for gop in quorum.list_groups_and_profiles() {
                new_gops.insert(gop);
            }
        }

        if let Some(rejection) = &rejection_opt {
            for gop in rejection.list_groups_and_profiles() {
                new_gops.insert(gop);
            }
        }

        if let Some(win) = &win_opt {
            for gop in win.list_groups_and_profiles() {
                new_gops.insert(gop);
            }
        }

        if let Some(next_round) = &next_round_opt {
            for gop in next_round.list_groups_and_profiles() {
                new_gops.insert(gop);
            }
        }

        // updating and gathering old indexing data

        let (old_permissions, old_gops) = voting_config.update(
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
        )?;

        // re-indexing

        for permission in old_permissions {
            self.remove_from_permissions_index(&id, &permission);
        }

        for permission in new_permissions {
            self.add_to_permissions_index(id, permission);
        }

        for gop in old_gops {
            self.remove_from_group_or_profile_index(&id, &gop);
        }

        for gop in new_gops {
            self.add_to_group_or_profile_index(id, gop);
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
            self.remove_from_group_or_profile_index(id, &gop);
        }

        for gop in voting_config.quorum.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, &gop);
        }

        for gop in voting_config.rejection.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, &gop);
        }

        for gop in voting_config.win.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, &gop);
        }

        for gop in voting_config.next_round.list_groups_and_profiles() {
            self.remove_from_group_or_profile_index(id, &gop);
        }

        Ok(voting_config)
    }

    pub fn get_voting_configs_cloned(
        &self,
        page_req: PageRequest<VotingConfigFilter, ()>,
    ) -> Page<VotingConfig> {
        if page_req.filter.permission.is_none() && page_req.filter.group_or_profile.is_none() {
            let (has_next, iter) = self.voting_configs.iter().get_page(&page_req);

            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page { has_next, data };
        }

        let ids_by_permission = if let Some(permission_id) = &page_req.filter.permission {
            self.voting_configs_by_permission_index
                .get(permission_id)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::new()
        };

        let ids_by_gop = if let Some(gop) = &page_req.filter.group_or_profile {
            self.voting_configs_by_group_or_profile_index
                .get(gop)
                .cloned()
                .unwrap_or_default()
        } else {
            BTreeSet::new()
        };

        let ids = if !ids_by_permission.is_empty() && !ids_by_gop.is_empty() {
            ids_by_gop
                .intersection(&ids_by_permission)
                .cloned()
                .collect()
        } else if !ids_by_permission.is_empty() {
            ids_by_permission
        } else {
            ids_by_gop
        };

        let (has_next, iter) = ids.iter().get_page(&page_req);
        let data = iter
            .map(|id| self.get_voting_config_cloned(id).unwrap())
            .collect();

        Page { has_next, data }
    }

    pub fn get_voting_config_cloned(
        &self,
        id: &VotingConfigId,
    ) -> Result<VotingConfig, VotingConfigRepositoryError> {
        self.get_voting_config(id).cloned()
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
}
