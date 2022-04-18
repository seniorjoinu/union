use crate::repository::group::types::{GroupId, Shares};
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::types::ProfileId;
use candid::{CandidType, Deserialize};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeSet;
use std::mem;

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 200;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 2000;

pub type VotingConfigId = u64;

#[derive(Debug)]
pub enum VotingConfigRepositoryError {
    VotingConfigNotFound(VotingConfigId),
    ValidationError(ValidationError),
}

#[derive(Clone, CandidType, Deserialize)]
pub enum ThresholdValue {
    QuantityOf(QuantityOf),
    FractionOf(FractionOf),
}

impl ThresholdValue {
    pub fn list_groups_and_profiles(&self) -> BTreeSet<&GroupOrProfile> {
        let mut result = BTreeSet::new();

        self._list_groups_and_profiles(&mut result);

        result
    }

    fn _list_groups_and_profiles<'a>(&'a self, list: &'a mut BTreeSet<&'a GroupOrProfile>) {
        match self.get_target() {
            Target::GroupOrProfile(r) => {
                list.insert(r);
            }
            Target::Thresholds(t) => {
                for it in t {
                    it._list_groups_and_profiles(list);
                }
            }
        }
    }

    pub fn get_target(&self) -> &Target {
        match &self {
            ThresholdValue::QuantityOf(q) => &q.target,
            ThresholdValue::FractionOf(f) => &f.target,
        }
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub struct QuantityOf {
    pub quantity: Shares,
    pub target: Target,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct FractionOf {
    pub fraction: f64,
    pub target: Target,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum Target {
    Thresholds(Vec<ThresholdValue>),
    GroupOrProfile(GroupOrProfile),
}

#[derive(Copy, Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum GroupOrProfile {
    Group(GroupId),
    Profile(ProfileId),
}

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum ProposerConstraint {
    Group(GroupCondition),
    Profile(ProfileId),
}

impl ProposerConstraint {
    pub fn to_group_or_profile(&self) -> GroupOrProfile {
        match self {
            ProposerConstraint::Profile(p) => GroupOrProfile::Profile(*p),
            ProposerConstraint::Group(g) => GroupOrProfile::Group(g.id),
        }
    }
}

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum EditorConstraint {
    Proposer,
    Group(GroupCondition),
    Profile(ProfileId),
}

impl EditorConstraint {
    pub fn to_group_or_profile(&self) -> Option<GroupOrProfile> {
        match self {
            EditorConstraint::Profile(p) => Some(GroupOrProfile::Profile(*p)),
            EditorConstraint::Group(g) => Some(GroupOrProfile::Group(g.id)),
            EditorConstraint::Proposer => None,
        }
    }
}

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub struct GroupCondition {
    pub id: GroupId,
    pub min_shares: Shares,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct RoundSettings {
    pub round_duration: u64,
    pub round_delay: u64,
}

#[derive(Debug, Clone, CandidType, Deserialize)]
pub struct LenInterval {
    pub min: usize,
    pub max: usize,
}

impl LenInterval {
    pub fn is_valid(&self) -> bool {
        self.min >= 1 && self.min <= self.max
    }
    pub fn contains(&self, num: usize) -> bool {
        num >= self.min && num <= self.max
    }
}

#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum VotesFormula {
    Common,
    Quadratic,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct VotingConfig {
    pub id: VotingConfigId,
    pub name: String,
    pub description: String,

    pub choices_count: Option<LenInterval>,
    pub winners_count: Option<LenInterval>,
    pub votes_formula: Option<VotesFormula>,

    pub permissions: BTreeSet<PermissionId>,

    pub proposers: BTreeSet<ProposerConstraint>,
    pub editors: BTreeSet<EditorConstraint>,

    pub round: RoundSettings,

    pub approval: ThresholdValue,
    pub quorum: ThresholdValue,

    pub rejection: ThresholdValue,
    pub win: ThresholdValue,
    pub next_round: ThresholdValue,
}

impl VotingConfig {
    pub fn new(
        id: VotingConfigId,
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
    ) -> Result<VotingConfig, VotingConfigRepositoryError> {
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

        let voting_config = VotingConfig {
            id,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
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
        };

        Ok(voting_config)
    }

    pub fn update(
        &mut self,
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
    ) -> Result<(BTreeSet<PermissionId>, BTreeSet<GroupOrProfile>), VotingConfigRepositoryError>
    {
        if let Some(name) = name_opt {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = description_opt {
            self.description = Self::process_description(description)?;
        }

        if let Some(choices_count) = choices_count_opt {
            if let Some(cc) = &choices_count {
                if !cc.is_valid() {
                    return Err(VotingConfigRepositoryError::ValidationError(
                        ValidationError("Invalid choices count interval".to_string()),
                    ));
                }
            }

            self.choices_count = choices_count;
        }

        if let Some(winners_count) = winners_count_opt {
            if let Some(wc) = &winners_count {
                if !wc.is_valid() {
                    return Err(VotingConfigRepositoryError::ValidationError(
                        ValidationError("Invalid winners count interval".to_string()),
                    ));
                }
            }

            self.winners_count = winners_count;
        }

        if let Some(votes_formula) = votes_formula_opt {
            self.votes_formula = votes_formula;
        }

        let old_permissions = if let Some(permissions) = permissions_opt {
            mem::replace(&mut self.permissions, permissions)
        } else {
            BTreeSet::new()
        };

        let mut old_gops = BTreeSet::new();

        if let Some(proposers) = proposers_opt {
            let old_proposers = mem::replace(&mut self.proposers, proposers);

            for proposer in old_proposers {
                old_gops.insert(proposer.to_group_or_profile());
            }
        }

        if let Some(editors) = editors_opt {
            let old_editors = mem::replace(&mut self.editors, editors);

            for editor in old_editors {
                if let Some(gop) = editor.to_group_or_profile() {
                    old_gops.insert(gop);
                }
            }
        }

        if let Some(round) = round_opt {
            self.round = round;
        }

        if let Some(approval) = approval_opt {
            let old_approval = mem::replace(&mut self.approval, approval);

            for gop in old_approval.list_groups_and_profiles() {
                old_gops.insert(*gop);
            }
        }

        if let Some(quorum) = quorum_opt {
            let old_quorum = mem::replace(&mut self.quorum, quorum);

            for gop in old_quorum.list_groups_and_profiles() {
                old_gops.insert(*gop);
            }
        }

        if let Some(rejection) = rejection_opt {
            let old_rejection = mem::replace(&mut self.rejection, rejection);

            for gop in old_rejection.list_groups_and_profiles() {
                old_gops.insert(*gop);
            }
        }

        if let Some(win) = win_opt {
            let old_win = mem::replace(&mut self.win, win);

            for gop in old_win.list_groups_and_profiles() {
                old_gops.insert(*gop);
            }
        }

        if let Some(next_round) = next_round_opt {
            let old_next_round = mem::replace(&mut self.next_round, next_round);

            for gop in old_next_round.list_groups_and_profiles() {
                old_gops.insert(*gop);
            }
        }

        Ok((old_permissions, old_gops))
    }

    pub fn can_create_voting(
        &self,
        choices_len: usize,
        winners_need: usize,
        votes_formula: &VotesFormula,
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

        if let Some(vf) = &self.votes_formula {
            if !matches!(vf, votes_formula) {
                return Err(ValidationError(format!(
                    "Invalid votes formula: expected {:?} actual {:?}",
                    vf, votes_formula
                )));
            }
        }

        Ok(())
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
