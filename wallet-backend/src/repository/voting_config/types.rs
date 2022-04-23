use crate::repository::permission::types::PermissionId;
use crate::repository::voting::types::Voting;
use bigdecimal::num_bigint::ToBigInt;
use bigdecimal::{BigDecimal, ToPrimitive};
use candid::parser::value::IDLValueVisitor;
use candid::types::{Serializer, Type};
use candid::{CandidType, Deserialize, Nat};
use serde::Deserializer;
use shared::types::wallet::{ChoiceId, GroupId, GroupOrProfile, ProfileId, Shares, VotingConfigId};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::mem;
use std::ops::Div;
use std::str::FromStr;

const NAME_MIN_LEN: usize = 1;
const NAME_MAX_LEN: usize = 200;
const DESCRIPTION_MIN_LEN: usize = 0;
const DESCRIPTION_MAX_LEN: usize = 2000;

#[derive(Debug)]
pub enum VotingConfigRepositoryError {
    VotingConfigNotFound(VotingConfigId),
    ValidationError(ValidationError),
}

#[derive(Default, Debug, Clone, Ord, PartialOrd, Eq, PartialEq)]
pub struct Fraction(pub BigDecimal);

impl From<Nat> for Fraction {
    fn from(nat: Nat) -> Self {
        Self(BigDecimal::new(nat.0.to_bigint().unwrap(), 0))
    }
}

impl Into<Nat> for Fraction {
    fn into(self) -> Nat {
        let (b, _) = self.0.with_scale(0).into_bigint_and_exponent();

        Nat(b.to_biguint().unwrap())
    }
}

impl From<usize> for Fraction {
    fn from(it: usize) -> Self {
        Self(BigDecimal::from(it as u64))
    }
}

impl Into<usize> for Fraction {
    fn into(self) -> usize {
        self.0.to_usize().unwrap()
    }
}

impl Div for Fraction {
    type Output = Fraction;

    fn div(self, rhs: Self) -> Self::Output {
        Fraction(self.0 / rhs.0)
    }
}

impl CandidType for Fraction {
    fn _ty() -> Type {
        Type::Text
    }

    fn idl_serialize<S>(&self, serializer: S) -> Result<(), S::Error>
    where
        S: Serializer,
    {
        self.0.to_string().idl_serialize(serializer)
    }
}

impl<'de> Deserialize<'de> for Fraction {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        String::deserialize(deserializer).map(|it| Fraction(BigDecimal::from_str(&it).unwrap()))
    }
}

#[derive(Clone, CandidType, Deserialize)]
pub enum ThresholdValue {
    QuantityOf(QuantityOf),
    FractionOf(FractionOf),
}

impl ThresholdValue {
    pub fn list_groups_and_profiles(&self) -> BTreeSet<GroupOrProfile> {
        let mut result = BTreeSet::new();

        self._list_groups_and_profiles(&mut result);

        result
    }

    pub fn is_reached(
        &self,
        total: &BTreeMap<GroupOrProfile, Shares>,
        voted: &BTreeMap<GroupOrProfile, Shares>,
    ) -> bool {
        let (voted_shares, total_shares) = match self.get_target() {
            Target::GroupOrProfile(gop) => {
                let voted_shares = voted.get(gop).cloned().unwrap_or_default();
                let total_shares = total.get(gop).cloned().unwrap_or_default();

                (voted_shares, total_shares)
            },
            Target::Thresholds(thresholds) => {
                let mut voted_shares_usize = 0usize;
                let total_shares = Shares::from(thresholds.len());

                for th in thresholds {
                    if th.is_reached(total, voted) {
                        voted_shares_usize += 1;
                    }
                }
                let votes_shares = Shares::from(voted_shares_usize);

                (votes_shares, total_shares)
            }
        };
        
        match &self {
            ThresholdValue::FractionOf(f) => {
                let voted_fraction = Fraction::from(voted_shares) / Fraction::from(total_shares);

                voted_fraction >= f.fraction
            },
            ThresholdValue::QuantityOf(q) => {
                voted_shares >= q.quantity
            }
        }
    }

    fn _list_groups_and_profiles(&self, list: &mut BTreeSet<GroupOrProfile>) {
        match self.get_target() {
            Target::GroupOrProfile(r) => {
                list.insert(*r);
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
    pub fraction: Fraction,
    pub target: Target,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum Target {
    Thresholds(Vec<ThresholdValue>),
    GroupOrProfile(GroupOrProfile),
}

#[derive(Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum ActorConstraint {
    Group(GroupCondition),
    Profile(ProfileId),
}

impl ActorConstraint {
    pub fn to_group_or_profile(&self) -> GroupOrProfile {
        match self {
            ActorConstraint::Profile(p) => GroupOrProfile::Profile(*p),
            ActorConstraint::Group(g) => GroupOrProfile::Group(g.id),
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

#[derive(Debug, Clone, Copy, CandidType, Deserialize)]
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

    pub permissions: BTreeSet<PermissionId>,

    pub proposers: BTreeSet<ActorConstraint>,
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
        permissions: BTreeSet<PermissionId>,
        proposers: BTreeSet<ActorConstraint>,
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
                old_gops.insert(gop);
            }
        }

        if let Some(quorum) = quorum_opt {
            let old_quorum = mem::replace(&mut self.quorum, quorum);

            for gop in old_quorum.list_groups_and_profiles() {
                old_gops.insert(gop);
            }
        }

        if let Some(rejection) = rejection_opt {
            let old_rejection = mem::replace(&mut self.rejection, rejection);

            for gop in old_rejection.list_groups_and_profiles() {
                old_gops.insert(gop);
            }
        }

        if let Some(win) = win_opt {
            let old_win = mem::replace(&mut self.win, win);

            for gop in old_win.list_groups_and_profiles() {
                old_gops.insert(gop);
            }
        }

        if let Some(next_round) = next_round_opt {
            let old_next_round = mem::replace(&mut self.next_round, next_round);

            for gop in old_next_round.list_groups_and_profiles() {
                old_gops.insert(gop);
            }
        }

        Ok((old_permissions, old_gops))
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

    pub fn approval_reached(&self, voting: &Voting) -> bool {
        self.approval.is_reached(&voting.total_supplies, &voting.total_non_rejection)
    }

    pub fn quorum_reached(&self, voting: &Voting) -> bool {
        self.quorum.is_reached(&voting.total_supplies, &voting.total_non_rejection)
    }

    pub fn rejection_reached(&self, voting: &Voting) -> bool {
        self.rejection.is_reached(&voting.total_supplies, &voting.rejection_choice.voted_shares_sum)
    }

    pub fn win_reached(&self, voting: &Voting) -> Vec<ChoiceId> {
        let mut result = Vec::new();
        for (id, choice) in &voting.choices {
            if self.win.is_reached(&voting.total_non_rejection, &choice.voted_shares_sum) {
                result.push(*id);
            }
        }
        
        result
    }

    pub fn next_round_reached(&self, voting: &Voting) -> Vec<ChoiceId> {
        let mut result = Vec::new();
        for (id, choice) in &voting.choices {
            if self.next_round.is_reached(&voting.total_non_rejection, &choice.voted_shares_sum) {
                result.push(*id);
            }
        }

        result
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

#[derive(CandidType, Deserialize)]
pub struct VotingConfigFilter {
    pub group_or_profile: Option<GroupOrProfile>,
    pub permission: Option<PermissionId>,
}
