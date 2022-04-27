use crate::repository::profile::model::Profile;
use candid::{CandidType, Deserialize};
use shared::mvc::Repository;
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::ProfileId;
use std::collections::HashMap;

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct ProfileRepository {
    profiles: HashMap<ProfileId, Profile>,
}

impl Repository<Profile, ProfileId, (), ()> for ProfileRepository {
    fn save(&mut self, it: Profile) {
        self.profiles.insert(it.id, it);
    }

    fn delete(&mut self, id: &ProfileId) -> Option<Profile> {
        self.profiles.remove(id)
    }

    fn get(&self, id: &ProfileId) -> Option<Profile> {
        self.profiles.get(id).cloned()
    }

    fn list(&self, page_req: &PageRequest<(), ()>) -> Page<Profile> {
        let (has_next, iter) = self.profiles.iter().get_page(page_req);
        let data = iter.map(|(_, profile)| profile.clone()).collect();

        Page::new(data, has_next)
    }
}
