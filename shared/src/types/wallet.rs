use crate::mvc::Id;
use crate::remote_call::ProgramExecutionResult;
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_event_hub_macros::Event;

pub type VotingConfigId = Id;
pub type VotingId = Id;
pub type ChoiceId = Id;
pub type GroupId = Id;
pub type ProfileId = Principal;
pub type Shares = Nat;

#[derive(Hash, Copy, Clone, CandidType, Deserialize, Eq, PartialEq, Ord, PartialOrd)]
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

/*#[derive(Event)]
pub struct VotingExecutedWinnerEvent {
    pub voting_id: VotingId,
    pub choice_id: ChoiceId,
    pub choice: Choice,
}
*/
#[derive(Event)]
pub struct VotingExecutedResultEvent {
    pub voting_id: VotingId,
    pub choice_id: ChoiceId,
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

#[derive(Event, Deserialize, CandidType, Clone)]
pub struct SharesMoveEvent {
    pub timestamp: u64,
    pub group_id: GroupId,
    pub from: Shareholder,
    pub to: Shareholder,
    pub qty: Shares,
    pub total_supply: Shares,
}
