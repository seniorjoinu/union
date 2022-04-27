use candid::Principal;
use shared::types::wallet::GroupId;
use shared::validation::ValidationError;

pub const HAS_PROFILE_GROUP_ID: GroupId = GroupId::default();
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
}
