use candid::Principal;
use std::time::{SystemTime, UNIX_EPOCH};

pub fn random_principal_test() -> Principal {
    Principal::from_slice(
        &SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos()
            .to_be_bytes(),
    )
}
