mod deployer;

use ic_cdk::export::candid::{encode_args, export_service};
use ic_cdk::export::Principal;
use ic_cdk::{caller, id};
use ic_cdk_macros::{query, update};
use deployer::deploy_canister_install_code_update_settings;
use union_deployer_client::types::{SpawnRequest, UpdateCodeRequest};

const ANONYMOUS_SUFFIX: u8 = 4;
pub fn not_anonymous() -> Result<(), String> {
  let principal = caller();
  let bytes = &principal.as_ref();

  match bytes.len() {
    1 if bytes[0] == ANONYMOUS_SUFFIX => {
      Err("Anonymous principal not allowed".to_string())
    }
    _ => Ok(()),
  }
}

#[update(guard = "not_anonymous")]
async fn spawn(req: SpawnRequest) -> Principal {
    // TODO implement guard: caller will pay for deloy
    let caller = caller();

    let instance = deploy_canister_install_code_update_settings(
        id(),
        encode_args((caller,)).unwrap(),
        req.wasm_module,
    )
    .await;

    get_state().push(instance);

    instance
}

#[update(guard = "not_anonymous")]
async fn update_code(_: UpdateCodeRequest) -> Principal {
    // TODO add guard "is_caller_self"
    // TODO make update code
    caller()
}

#[query]
async fn get_spawned_instances() -> Vec<Principal> {
    get_state().clone()
}

export_service!();

#[query]
fn export_candid() -> String {
    __export_service()
}

static mut STATE: Option<Vec<Principal>> = None;

pub fn get_state() -> &'static mut Vec<Principal> {
    unsafe {
        match STATE.as_mut() {
            Some(s) => s,
            None => {
                STATE = Some(vec![]);

                get_state()
            }
        }
    }
}
