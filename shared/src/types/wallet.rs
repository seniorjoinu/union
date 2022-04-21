use crate::remote_call::{Program, ProgramExecutionResult};
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_event_hub_macros::Event;
use std::collections::BTreeMap;

pub type VotingConfigId = u32;
pub type VotingId = u64;
pub type ChoiceId = usize;
pub type GroupId = u32;
pub type ProfileId = Principal;
pub type Shares = Nat;

#[derive(Clone, CandidType, Deserialize)]
pub struct ChoiceExternal {
    pub name: String,
    pub description: String,
    pub program: Program,
}

#[derive(Copy, Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
pub enum GroupOrProfile {
    Group(GroupId),
    Profile(ProfileId),
}

#[derive(Event)]
pub struct VotingExecutedMetaEvent {
    pub voting_id: VotingId,
    pub voting_config_id: VotingConfigId,
    pub name: String,
    pub description: String,
    pub timestamp: u64,
    pub winners_count: usize,
}

#[derive(Event)]
pub struct VotingExecutedWinnerEvent {
    pub voting_id: VotingId,
    pub choice_id: ChoiceId,
    pub choice: ChoiceExternal,
}

#[derive(Event)]
pub struct VotingExecutedResultEvent {
    pub voting_id: VotingId,
    pub choice_id: ChoiceId,
    pub total_supplies: BTreeMap<GroupOrProfile, Shares>,
    pub voted_shares_sum: BTreeMap<GroupOrProfile, Shares>,
    pub result: ProgramExecutionResult,
}

#[derive(Clone, CandidType, Deserialize)]
pub enum Shareholder {
    Void,
    Principal(PrincipalShareholder),
}

#[derive(Clone, CandidType, Deserialize)]
pub struct PrincipalShareholder {
    pub principal_id: Principal,
    pub new_balance: Shares,
}

#[derive(Event)]
pub struct SharesMoveEvent {
    pub timestamp: u64,
    pub group_id: GroupId,
    pub from: Shareholder,
    pub to: Shareholder,
    pub qty: Shares,
    pub total_supply: Shares,
}
