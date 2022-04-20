/*use crate::get_state;
use ic_cdk::{caller, id};

pub fn only_self_guard() -> Result<(), String> {
    if caller() != id() {
        return Err(String::from("Access denied"));
    }

    Ok(())
}

pub fn only_gateway() -> Result<(), String> {
    if caller() != get_state().gateway {
        return Err(String::from("Access denied"));
    }

    Ok(())
}
*/
