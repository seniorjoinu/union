use crate::get_state;
use ic_cdk::caller;

pub fn only_controller() -> Result<(), String> {
    if caller() != get_state().controller {
        Err(String::from("Access denied"))
    } else {
        Ok(())
    }
}

