use crate::mvc::Id;
use crate::remote_call::{Program, ProgramExecutionResult};
use candid::{CandidType, Deserialize, Nat, Principal};
use ic_event_hub_macros::Event;

pub type AccessConfigId = Id;
pub type VotingConfigId = Id;
pub type VotingId = Id;
pub type ChoiceId = Id;
pub type GroupId = Id;
pub type ProfileId = Principal;
pub type Shares = Nat;

#[derive(Copy, Clone, CandidType, Deserialize)]
pub enum ProgramExecutedWith {
    WithAccessConfig(AccessConfigId),
    WithVotingConfig(VotingConfigId),
}

#[derive(Event)]
pub struct ProgramExecutedEvent_0 {
    pub timestamp: u64,
    pub with: ProgramExecutedWith,
    pub initiator: Principal,
}

#[derive(Event)]
pub struct ProgramExecutedEvent_1 {
    pub timestamp: u64,
    pub program: Program,
}

#[derive(Event)]
pub struct ProgramExecutedEvent_2 {
    pub timestamp: u64,
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

#[derive(Event, Clone)]
pub struct SharesMoveEvent {
    pub timestamp: u64,
    pub group_id: GroupId,
    pub from: Shareholder,
    pub to: Shareholder,
    pub qty: Shares,
    pub total_supply: Shares,
}

#[derive(Event)]
pub struct ProfileCreatedEvent {
    #[topic]
    pub profile_owner: Principal,
}

#[derive(Event)]
pub struct ProfileActivatedEvent {
    #[topic]
    pub profile_owner: Principal,
}
