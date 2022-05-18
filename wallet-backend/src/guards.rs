use crate::repository::permission::types::PermissionTarget;
use crate::service::access_config::types::{AccessConfigService, QueryDelegationProof};
use ic_cdk::api::time;
use ic_cdk::{caller, id, trap};
use shared::remote_call::RemoteCallEndpoint;

pub fn only_self() {
    if caller() != id() {
        trap("Access denied");
    }
}

pub fn only_self_or_with_access(method_name: &str, proof_opt: Option<QueryDelegationProof>) {
    let caller = caller();
    let this_union_id = id();

    if caller == this_union_id {
        return;
    }

    if AccessConfigService::caller_has_access_to_method(this_union_id, method_name, caller) {
        return;
    }

    if let Some(proof) = proof_opt {
        if AccessConfigService::caller_has_access_to_method(
            this_union_id,
            method_name,
            proof.union_id,
        ) {
            // FIXME: same targets created twice here and inside the method above
            let target_exact =
                PermissionTarget::Endpoint(RemoteCallEndpoint::new(this_union_id, method_name));
            let target_wide =
                PermissionTarget::Endpoint(RemoteCallEndpoint::new(this_union_id, "*"));
            let targets = vec![target_exact, target_wide];

            proof
                .validate(caller, time(), &targets)
                .expect("Access denied");

            return;
        } else {
            trap(
                format!(
                    "Access denied: {} has no access to {}",
                    proof.union_id, method_name
                )
                .as_str(),
            );
        }
    }

    trap("Access denied");
}
