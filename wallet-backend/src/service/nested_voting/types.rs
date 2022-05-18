use crate::repository::nested_voting::types::NestedVotingId;
use crate::repository::nested_voting_config::types::RemoteVotingConfigId;
use crate::service::choice::types::ChoiceError;
use crate::service::nested_voting_config::types::NestedVotingConfigError;
use shared::candid::CandidRejectionCode;
use shared::types::wallet::GroupId;
use shared::validation::ValidationError;

pub struct NestedVotingService;

#[derive(Debug)]
pub enum NestedVotingError {
    ValidationError(ValidationError),
    NestedVotingNotFound(NestedVotingId),
    NetworkingError(CandidRejectionCode, String),
    NestedVotingConfigError(NestedVotingConfigError),
    RemoteVotingConfigMismatch(RemoteVotingConfigId, RemoteVotingConfigId),
    InvalidGroupProvided(GroupId),
    ThisUnionHasNoSharesInProvidedGroup(GroupId),
    SharesInfoInvalidSignature,
    SharesInfoInvalidOwner,
    SharesInfoInvalidTimestamp,
    NotAllowedToVote,
    VoteFractionTooBig,
    ChoiceError(ChoiceError),
    TheVotingIsFrozen,
    RemoteVotingInInvalidStatus,
}
