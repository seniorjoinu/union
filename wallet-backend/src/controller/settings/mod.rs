use crate::controller::settings::api::{
    GetSettingsRequest, GetSettingsResponse, UpdateSettingsRequest,
};
use crate::guards::{only_self, only_self_or_with_access};
use crate::settings::Settings;
use ic_cdk_macros::{query, update};

pub mod api;

#[update]
fn update_settings(req: UpdateSettingsRequest) {
    only_self();

    Settings::get()
        .update(req.new_name, req.new_description)
        .expect("Unable to update settings");
}

#[query]
fn get_settings(req: GetSettingsRequest) -> GetSettingsResponse {
    only_self_or_with_access("get_settings", req.query_delegation_proof_opt);

    let settings = Settings::get().clone();
    GetSettingsResponse { settings }
}
