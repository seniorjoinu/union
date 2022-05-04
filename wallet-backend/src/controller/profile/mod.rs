use crate::controller::profile::api::{
    CreateProfileRequest, DeleteProfileRequest, GetProfileRequest, GetProfileResponse,
    ListProfilesRequest, ListProfilesResponse, UpdateMyProfileRequest, UpdateProfileRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::ProfileService;
use ic_cdk::caller;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn create_profile(req: CreateProfileRequest) {
    only_self();

    ProfileService::create_profile(req.id, req.name, req.description)
        .expect("Unable to create profile");
}

#[update]
fn delete_profile(req: DeleteProfileRequest) {
    only_self();

    ProfileService::delete_profile(req.id).expect("Unable to delete profile");
}

#[update]
fn update_profile(req: UpdateProfileRequest) {
    only_self();

    ProfileService::update_profile(req.id, req.new_name, req.new_description)
        .expect("Unable to update profile");
}

#[query]
fn get_profile(req: GetProfileRequest) -> GetProfileResponse {
    only_self_or_with_access("get_profile");

    let profile = ProfileService::get_profile(req.id).expect("Unable to get profile");

    GetProfileResponse { profile }
}

#[query]
fn list_profiles(req: ListProfilesRequest) -> ListProfilesResponse {
    only_self_or_with_access("list_profiles");

    let page = ProfileService::list_profiles(&req.page_req);

    ListProfilesResponse { page }
}

// ---------------- PERSONAL ------------------

#[update]
fn update_my_profile(req: UpdateMyProfileRequest) {
    ProfileService::update_profile(caller(), req.new_name, req.new_description)
        .expect("Unable to update my profile")
}

#[query]
fn get_my_profile() -> GetProfileResponse {
    let profile = ProfileService::get_profile(caller()).expect("Unable to get my profile");

    GetProfileResponse { profile }
}
