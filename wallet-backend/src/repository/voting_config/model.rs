use crate::repository::permission::types::PermissionId;
use crate::repository::voting::model::Voting;
use crate::repository::voting_config::types::{
    ActorConstraint, EditorConstraint, LenInterval, RoundSettings, ThresholdValue,
    VOTING_CONFIG_DESCRIPTION_MAX_LEN, VOTING_CONFIG_DESCRIPTION_MIN_LEN,
    VOTING_CONFIG_NAME_MAX_LEN, VOTING_CONFIG_NAME_MIN_LEN,
};
use candid::{CandidType, Deserialize};
use shared::types::wallet::{ChoiceId, VotingConfigId};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeSet;

///
/// VotingStatus { CREATED, PRE_ROUND(), ROUND(), REJECTED, SUCCESS, FAIL }
/// only PROPOSERS can create -> CREATED
/// only EDITORS can update -> CREATED
/// when APPROVAL is reached -> PRE_ROUND()
///     this implies that only APPROVAL listed GOPs can vote when CREATED
/// when PRE_ROUND() wait for cron -> ROUND()
/// when CREATED or ROUND() - REJECTION listed GOPs can vote -> REJECTED
/// when ROUND() - QUORUM, WIN or NEXT_ROUND listed GOPs can vote -> PRE_ROUND() | SUCCESS | FAILD
/// when
///

#[derive(Clone, CandidType, Deserialize)]
pub struct VotingConfig {
    id: Option<VotingConfigId>,
    name: String,
    description: String,

    choices_count: Option<LenInterval>,
    winners_count: Option<LenInterval>,

    permissions: BTreeSet<PermissionId>,

    proposers: BTreeSet<ActorConstraint>,
    editors: BTreeSet<EditorConstraint>,
    approval: ThresholdValue,
    rejection: ThresholdValue,

    round: RoundSettings,

    quorum: ThresholdValue,
    win: ThresholdValue,
    next_round: ThresholdValue,
}

impl VotingConfig {
    pub fn new(
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
    ) -> Result<VotingConfig, ValidationError> {
        if let Some(cc) = &choices_count {
            if !cc.is_valid() {
                return Err(ValidationError(
                    "Invalid choices count interval".to_string(),
                ));
            }
        }

        if let Some(wc) = &winners_count {
            if !wc.is_valid() {
                return Err(ValidationError(
                    "Invalid winners count interval".to_string(),
                ));
            }
        }

        let voting_config = VotingConfig {
            id: None,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
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
        };

        Ok(voting_config)
    }

    pub fn update(
        &mut self,
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
    ) -> Result<(), ValidationError> {
        if let Some(name) = name_opt {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = description_opt {
            self.description = Self::process_description(description)?;
        }

        if let Some(choices_count) = choices_count_opt {
            if let Some(cc) = &choices_count {
                if !cc.is_valid() {
                    return Err(ValidationError(
                        "Invalid choices count interval".to_string(),
                    ));
                }
            }

            self.choices_count = choices_count;
        }

        if let Some(winners_count) = winners_count_opt {
            if let Some(wc) = &winners_count {
                if !wc.is_valid() {
                    return Err(ValidationError(
                        "Invalid winners count interval".to_string(),
                    ));
                }
            }

            self.winners_count = winners_count;
        }

        if let Some(permissions) = permissions_opt {
            self.permissions = permissions;
        }

        if let Some(proposers) = proposers_opt {
            self.proposers = proposers;
        }

        if let Some(editors) = editors_opt {
            self.editors = editors;
        }

        if let Some(round) = round_opt {
            self.round = round;
        }

        if let Some(approval) = approval_opt {
            self.approval = approval;
        }

        if let Some(quorum) = quorum_opt {
            self.quorum = quorum;
        }

        if let Some(rejection) = rejection_opt {
            self.rejection = rejection;
        }

        if let Some(win) = win_opt {
            self.win = win;
        }

        if let Some(next_round) = next_round_opt {
            self.next_round = next_round;
        }

        Ok(())
    }

    pub fn assert_voting_params_valid(
        &self,
        choices_len: usize,
        winners_need: usize,
    ) -> Result<(), ValidationError> {
        if choices_len < winners_need {
            return Err(ValidationError(format!(
                "Not enough choices (winners need: {}, choices: {})",
                winners_need, choices_len
            )));
        }

        if let Some(cc) = &self.choices_count {
            if !cc.contains(choices_len) {
                return Err(ValidationError(format!(
                    "Invalid choices count: expected {:?} actual {}",
                    cc, choices_len
                )));
            }
        }

        if let Some(wc) = &self.winners_count {
            if !wc.contains(winners_need) {
                return Err(ValidationError(format!(
                    "Invalid winners count: expected {:?} actual {}",
                    wc, winners_need
                )));
            }
        }

        Ok(())
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            VOTING_CONFIG_NAME_MIN_LEN,
            VOTING_CONFIG_NAME_MAX_LEN,
            "Voting config name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            VOTING_CONFIG_DESCRIPTION_MIN_LEN,
            VOTING_CONFIG_DESCRIPTION_MAX_LEN,
            "Voting config description",
        )
    }
}
