use crate::repository::group::model::Group;
use crate::repository::profile::model::Profile;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{EditorConstraint, ProposerConstraint};
use crate::service::group::types::GroupService;
use crate::service::voting::types::{VotingError, VotingService};
use candid::Principal;
use shared::mvc::{HasRepository, Repository};

pub mod crud;
pub mod types;

impl VotingService {
    pub fn cast_rejection_vote()
    
    fn assert_winners_need_is_fine(
        vc: &VotingConfig,
        winners_need: usize,
    ) -> Result<(), VotingError> {
        if let Some(wc) = vc.get_winners_count() {
            if !wc.contains(winners_need) {
                return Err(VotingError::InvalidWinnersCount(winners_need, *wc));
            }
        }

        Ok(())
    }

    fn assert_proposer_can_propose(
        vc: &VotingConfig,
        proposer: Principal,
    ) -> Result<(), VotingError> {
        for proposer_constraint in vc.get_proposer_constraints() {
            match proposer_constraint {
                ProposerConstraint::Profile(p) => {
                    if *p == proposer {
                        // unwrapping, because profile should exist if it is listed
                        Profile::repo().get(p).unwrap();
                        return Ok(());
                    }
                }
                ProposerConstraint::Group(group_condition) => {
                    // unwrapping, because profile should exist if it is listed
                    let group = Group::repo().get(&group_condition.id).unwrap();
                    let token = GroupService::get_token(&group);

                    if token.balance_of(&proposer) >= group_condition.min_shares.clone() {
                        return Ok(());
                    }
                }
            }
        }

        Err(VotingError::ProposerNotFoundInVotingConfig(proposer))
    }

    fn assert_editor_can_edit(
        vc: &VotingConfig,
        editor: Principal,
        proposer: Principal,
    ) -> Result<(), VotingError> {
        for editor_constraint in vc.get_editor_constraints() {
            match editor_constraint {
                EditorConstraint::Profile(p) => {
                    if *p == editor {
                        // unwrapping, because profile should exist if it is listed
                        Profile::repo().get(p).unwrap();
                        return Ok(());
                    }
                }
                EditorConstraint::Group(group_condition) => {
                    // unwrapping, because profile should exist if it is listed
                    let group = Group::repo().get(&group_condition.id).unwrap();
                    let token = GroupService::get_token(&group);

                    if token.balance_of(&editor) >= group_condition.min_shares.clone() {
                        return Ok(());
                    }
                }
                EditorConstraint::Proposer => {
                    if editor == proposer {
                        return Ok(());
                    }
                }
            }
        }

        Err(VotingError::EditorNotFoundInVotingConfig(editor))
    }
}
