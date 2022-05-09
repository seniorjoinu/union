use candid::{CandidType, Deserialize};
use crate::settings::Settings;

#[derive(CandidType, Deserialize)]
pub struct UpdateSettingsRequest {
    pub new_name: Option<String>,
    pub new_description: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetSettingsResponse {
    pub settings: Settings,
}