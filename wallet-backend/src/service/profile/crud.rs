use crate::repository::access_config::model::AccessConfig;
use crate::repository::profile::model::Profile;
use crate::repository::token::model::Token;
use crate::service::group::types::{GroupService, DEFAULT_GROUP_SHARES};
use crate::service::profile::types::{ProfileError, ProfileService};
use crate::EventsService;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};
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
        Token::repo().add_to_principal_index(id, token.get_id().unwrap());

        Token::repo().save(token);

        EventsService::emit_profile_created_event(id);

        Ok(())
    }

    pub fn update_profile(
        id: ProfileId,
        new_name: Option<String>,
        new_description: Option<String>,
    ) -> Result<(), ProfileError> {
        let mut profile = Profile::repo()
            .get(&id)
            .ok_or(ProfileError::ProfileNotFound(id))?;
        profile
            .update(new_name, new_description)
            .map_err(ProfileError::ValidationError)?;

        Profile::repo().save(profile);

        Ok(())
    }

    pub fn delete_profile(id: ProfileId) -> Result<(), ProfileError> {
        if AccessConfig::repo().profile_has_related_access_configs(&id) {
            return Err(ProfileError::RelatedAccessConfigsExist);
        }

        Profile::repo()
            .delete(&id)
            .ok_or(ProfileError::ProfileNotFound(id))?;

        let has_profile_group = GroupService::get_has_profile_group();
        let mut token = GroupService::get_token(&has_profile_group);

        ProfileService::remove_from_has_profile_group(&mut token, id);
        Token::repo().remove_from_principal_index(&id, &token.get_id().unwrap());
        Token::repo().save(token);

        Ok(())
    }

    #[inline(always)]
    pub fn get_profile(id: ProfileId) -> Result<Profile, ProfileError> {
        Profile::repo()
            .get(&id)
            .ok_or(ProfileError::ProfileNotFound(id))
    }

    #[inline(always)]
    pub fn list_profiles(page_req: &PageRequest<(), ()>) -> Page<Profile> {
        Profile::repo().list(page_req)
    }
}
