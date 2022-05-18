use crate::repository::permission::types::PermissionId;
use bigdecimal::num_bigint::ToBigInt;
use bigdecimal::{BigDecimal, FromPrimitive, ToPrimitive};
use candid::types::{Serializer, Type};
use candid::{CandidType, Deserialize, Nat};
use serde::Deserializer;
use shared::types::wallet::{GroupId, Shares};
use std::collections::{BTreeMap, BTreeSet};
use std::ops::{AddAssign, Div, Mul};
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

impl From<f64> for Fraction {
    fn from(it: f64) -> Self {
        Self(BigDecimal::from_f64(it).unwrap())
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

impl Mul for Fraction {
    type Output = Fraction;

    fn mul(self, rhs: Self) -> Self::Output {
        Fraction(self.0 * rhs.0)
    }
}

impl AddAssign for Fraction {
    fn add_assign(&mut self, rhs: Self) {
        self.0 += rhs.0;
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
    pub fn list_groups(&self) -> BTreeSet<GroupId> {
        let mut result = BTreeSet::new();

        self._list_groups(&mut result);

        result
    }

    pub fn is_reached(
        &self,
        total: &BTreeMap<GroupId, Shares>,
        voted: &BTreeMap<GroupId, Shares>,
    ) -> bool {
        let (voted_shares, total_shares) = match self.get_target() {
            Target::Group(group_id) => {
                let voted_shares = voted.get(group_id).cloned().unwrap_or_default();
                let total_shares = total.get(group_id).cloned().unwrap_or_default();

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
                if total_shares == Shares::default() {
                    return false;
                }

                let voted_fraction = Fraction::from(voted_shares) / Fraction::from(total_shares);

                voted_fraction >= f.fraction
            }
            ThresholdValue::QuantityOf(q) => voted_shares >= q.quantity,
        }
    }

    fn _list_groups(&self, list: &mut BTreeSet<GroupId>) {
        match self.get_target() {
            Target::Group(r) => {
                list.insert(*r);
            }
            Target::Thresholds(t) => {
                for it in t {
                    it._list_groups(list);
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
    Group(GroupId),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct RoundSettings {
    pub round_duration: u64,
    pub round_delay: u64,
}

#[derive(Debug, Clone, Copy, CandidType, Deserialize)]
pub struct LenInterval {
    pub min: u32,
    pub max: u32,
}

impl LenInterval {
    pub fn is_valid(&self) -> bool {
        self.min >= 1 && self.min <= self.max
    }
    pub fn contains(&self, num: u32) -> bool {
        num >= self.min && num <= self.max
    }
}

#[derive(CandidType, Deserialize)]
pub struct VotingConfigFilter {
    pub group: Option<GroupId>,
    pub permission: Option<PermissionId>,
}
