use candid::{CandidType, Deserialize};
use shared::types::wallet::ProfileId;
use shared::validation::{validate_and_trim_str, ValidationError};

pub const PROFILE_NAME_MIN_LEN: usize = 1;
pub const PROFILE_NAME_MAX_LEN: usize = 100;
pub const PROFILE_DESCRIPTION_MIN_LEN: usize = 0;
pub const PROFILE_DESCRIPTION_MAX_LEN: usize = 300;