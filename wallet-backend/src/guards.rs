use ic_cdk::{caller, id};

pub fn only_self_guard() -> Result<(), String> {
    if caller() != id() {
        return Err(String::from("Access denied"));
    }

    Ok(())
}
