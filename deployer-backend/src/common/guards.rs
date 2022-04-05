use crate::get_state;
use ic_cdk::caller;

pub fn only_binary_controller() -> Result<(), String> {
    if caller() != get_state().binary_controller {
        Err(String::from("Access denied"))
    } else {
        Ok(())
    }
}

pub fn only_spawn_controller() -> Result<(), String> {
    if caller() != get_state().spawn_controller {
        Err(String::from("Access denied"))
    } else {
        Ok(())
    }
}
