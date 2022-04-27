use crate::repository::permission::types::PermissionId;
use bigdecimal::num_bigint::ToBigInt;
use bigdecimal::{BigDecimal, ToPrimitive};
use candid::types::{Serializer, Type};
use candid::{CandidType, Deserialize, Nat};
use serde::Deserializer;
use shared::types::wallet::{GroupId, GroupOrProfile, ProfileId, Shares};
use std::collections::{BTreeMap, BTreeSet};
use std::ops::Div;
use std::str::FromStr;

pub const VOTING_CONFIG_NAME_MIN_LEN: usize = 1;
pub const VOTING_CONFIG_NAME_MAX_LEN: usize = 200;
pub const VOTING_CONFIG_DESCRIPTION_MIN_LEN: usize = 0;
pub const VOTING_CONFIG_DESCRIPTION_MAX_LEN: usize = 2000;

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
            }
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
            }
            ThresholdValue::QuantityOf(q) => voted_shares >= q.quantity,
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

#[derive(CandidType, Deserialize)]
pub struct VotingConfigFilter {
    pub group_or_profile: Option<GroupOrProfile>,
    pub permission: Option<PermissionId>,
}
