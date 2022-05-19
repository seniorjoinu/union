use crate::repository::nested_voting::types::RemoteVotingId;
use crate::repository::voting::types::RoundResult;
use ic_event_hub_macros::Event;

#[derive(Event)]
pub struct VotingRoundStartEvent {
    #[topic]
    pub voting_id: RemoteVotingId,
}

#[derive(Event)]
pub struct VotingRoundEndEvent {
    #[topic]
    pub voting_id: RemoteVotingId,
    pub winners: Option<RoundResult>,
    pub losers: Option<RoundResult>,
}

// TODO: add nested voting status
// TODO: improve voting updated events with this status
// TODO: refactor everything (make nested votings into normal ones, move shared/wallet to wallet client
