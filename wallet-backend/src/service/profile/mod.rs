use crate::repository::token::model::Token;
use crate::service::group::types::DEFAULT_GROUP_SHARES;
use crate::service::profile::types::ProfileService;
use shared::types::wallet::{ProfileId, Shares};

pub mod crud;
pub mod types;

impl ProfileService {
    pub fn is_profile_listed_in_has_profile_group(
        has_profile_token: &Token,
        profile_id: &ProfileId,
    ) -> bool {
        has_profile_token.balance_of(profile_id)
            + has_profile_token.unaccepted_balance_of(profile_id)
            == Shares::from(DEFAULT_GROUP_SHARES)
    }

    pub fn remove_from_has_profile_group(has_profile_token: &mut Token, profile_id: ProfileId) {
        assert!(ProfileService::is_profile_listed_in_has_profile_group(
            has_profile_token,
            &profile_id
        ));

        let balance = has_profile_token.balance_of(&profile_id);
        let unaccepted_balance = has_profile_token.unaccepted_balance_of(&profile_id);

        has_profile_token.burn(profile_id, balance).unwrap();
        has_profile_token
            .burn_unaccepted(profile_id, unaccepted_balance)
            .unwrap();
    }
}
