use crate::service::access_config::types::AccessConfigService;
use crate::settings::Settings;
use ic_cdk::{caller, id, trap};

pub fn only_self() {
    if caller() != id() {
        trap("Access denied");
    }
}

pub fn only_self_or_with_access(method_name: &str) {
    if !(caller() == id() || AccessConfigService::caller_has_access(id(), method_name, caller())) {
        trap("Access denied");
    }
}

pub fn only_gateway() -> Result<(), String> {
    if caller() != *Settings::get().get_gateway() {
        return Err(String::from("Access denied"));
    }

    Ok(())
}
