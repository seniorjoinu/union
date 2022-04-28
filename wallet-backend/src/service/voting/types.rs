use candid::Principal;
use shared::types::wallet::{ProfileId, VotingConfigId, VotingId};
use shared::validation::ValidationError;
use crate::repository::voting_config::types::LenInterval;

pub struct VotingService;

#[derive(Debug)]
pub enum VotingError {
    ValidationError(ValidationError),
    VotingConfigNotFound(VotingConfigId),
    InvalidWinnersCount(usize, LenInterval),
    ProfileNotExists(ProfileId),
    ProposerNotFoundInVotingConfig(Principal),
    EditorNotFoundInVotingConfig(Principal),
    VotingNotFound(VotingId),
    VotingInInvalidStatus(VotingId),
}