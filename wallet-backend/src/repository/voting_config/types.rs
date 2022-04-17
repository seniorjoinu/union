use crate::repository::group::types::{GroupId, Shares};
use crate::repository::permission::types::PermissionId;
use crate::repository::profile::types::ProfileId;
use candid::{CandidType, Deserialize};
use shared::validation::ValidationError;
use std::collections::BTreeSet;

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
pub enum StartCondition {
    ApprovalDelay(u64),
    ExactDate,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct RoundSettings {
    pub round_duration: u64,
    pub round_delay: u64,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct LenInterval {
    pub min: usize,
    pub max: usize,
}

impl LenInterval {
    pub fn is_valid(&self) -> bool {
        self.min >= 1 && self.min <= self.max
    }
}

#[derive(Clone, CandidType, Deserialize)]
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

    pub start: StartCondition,
    pub round: RoundSettings,

    pub approval: ThresholdValue,
    pub quorum: ThresholdValue,

    pub rejection: ThresholdValue,
    pub win: ThresholdValue,
    pub next_round: ThresholdValue,
}
