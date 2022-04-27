use crate::repository::profile::model::Profile;
use crate::repository::token::model::Token;
use crate::service::group::types::{GroupService, DEFAULT_GROUP_SHARES};
use crate::service::profile::types::{ProfileError, ProfileService};
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{ProfileId, Shares};

impl ProfileService {
    pub fn create_profile(
        id: ProfileId,
        name: String,
        description: String,
    ) -> Result<(), ProfileError> {
        let has_profile_group = GroupService::get_has_profile_group();
        let mut token = GroupService::get_token(&has_profile_group);
        if ProfileService::is_profile_listed_in_has_profile_group(&token, &id) {
            return Err(ProfileError::ProfileAlreadyExists(id));
        }

        let profile = Profile::new(id, name, description).map_err(ProfileError::ValidationError)?;
        Profile::repo().save(profile);

        token.mint_unaccepted(id, Shares::from(DEFAULT_GROUP_SHARES));
        Token::repo().save(token);

        Ok(())
    }

    pub fn delete_profile(id: ProfileId) -> Result<(), ProfileError> {
        let profile = Profile::repo()
            .delete(&id)
            .ok_or(ProfileError::ProfileNotFound(id))?;

        let has_profile_group = GroupService::get_has_profile_group();
        let mut token = GroupService::get_token(&has_profile_group);

        ProfileService::remove_from_has_profile_group(&mut token, id);
        Token::repo().save(token);

        Ok(())
    }
}
