use candid::{CandidType, Deserialize, Principal};
use shared::types::wallet::{ChoiceId, GroupId, GroupOrProfile, ProfileId, Shares, VotingId};

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum GroupSharesType {
    Accepted,
    Unaccepted,
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum BalanceId {
    PrivateGroupShares(GroupId, GroupSharesType, ProfileId),
    PublicGroupShares(GroupId, Principal),

    ChoiceVotingPower(ChoiceId, GroupOrProfile, Principal),
}

impl BalanceId {
    pub fn to_total_supply_id(self) -> TotalSupplyId {
        match self {
            BalanceId::PrivateGroupShares(g, t, _) => TotalSupplyId::PrivateGroupShares(g, t),
            BalanceId::PublicGroupShares(g, _) => TotalSupplyId::PublicGroupShares(g),
            BalanceId::ChoiceVotingPower(c, gop, _) => TotalSupplyId::ChoiceVotingPower(c, gop),
        }
    }
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum TotalSupplyId {
    PrivateGroupShares(GroupId, GroupSharesType),
    PublicGroupShares(GroupId),

    TotalVotingPower(VotingId, GroupOrProfile),
    UsedVotingPower(VotingId, GroupOrProfile),

    ChoiceVotingPower(ChoiceId, GroupOrProfile),
}

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum BalanceFilter {
    SharesByGroup(GroupId, GroupSharesType),
    SharesByPrincipal(Principal, GroupSharesType),

    VotingPowerByPrincipal(Principal),
}
