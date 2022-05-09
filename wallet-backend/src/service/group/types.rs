use candid::Principal;
use shared::mvc::ZERO_ID;
use shared::types::wallet::GroupId;
use shared::validation::ValidationError;

pub const HAS_PROFILE_GROUP_ID: GroupId = ZERO_ID;
pub const DEFAULT_GROUP_SHARES: u64 = 100;

pub struct GroupService;

#[derive(Debug)]
pub enum GroupError {
    ValidationError(ValidationError),
    GroupNotFound(GroupId),
    GroupIsPrivate(GroupId),
    GroupIsPublic(GroupId),
    ProfileDoesNotExist(Principal),
    GroupSharesAreNotTransferable(GroupId),
    GroupSharesAreNotAcceptable(GroupId),
    UnableToEditHasProfileGroup,
    RelatedAccessConfigsExist,
    RelatedVotingConfigsExist,
}
