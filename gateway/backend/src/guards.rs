use crate::get_state;
use ic_cdk::caller;

pub fn only_controller() -> Result<(), String> {
    if caller() != get_state().controller {
        Err(String::from("Access denied"))
    } else {
        Ok(())
    }
}

const ANONYMOUS_SUFFIX: u8 = 4;
pub fn not_anonymous() -> Result<(), String> {
    let principal = caller();
    let bytes = &principal.as_ref();

    match bytes.len() {
        1 if bytes[0] == ANONYMOUS_SUFFIX => Err("Anonymous principal not allowed".to_string()),
        _ => Ok(()),
    }
}
