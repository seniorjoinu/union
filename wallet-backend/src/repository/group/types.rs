use candid::{CandidType, Deserialize, Principal};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::HashMap;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::{GroupId, ProfileId, Shares, TokenId};

pub const GROUP_NAME_MIN_LEN: usize = 1;
pub const GROUP_NAME_MAX_LEN: usize = 100;
pub const GROUP_DESCRIPTION_MIN_LEN: usize = 0;
pub const GROUP_DESCRIPTION_MAX_LEN: usize = 300;

#[derive(Clone, CandidType, Deserialize)]
pub enum GroupType {
    Everyone,
    Public(TokenId),
    Private(TokenId, TokenId),
}
