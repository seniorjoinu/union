use crate::common::utils::ToDecodedCandidType;
use crate::{get_state, CandidCallResult, HistoryEntry, Program, ToCandidType};
use ic_cdk::api::call::call_raw;
use ic_cdk::api::time;
use ic_cdk::spawn;

pub fn execute_program_and_log(mut entry: HistoryEntry) {
    spawn(async {
        let result = execute_program(&entry.program).await;
        let state = get_state();
        let timestamp_after = time();

        entry.set_executed(timestamp_after, result);
        state.execution_history.add_executed_entry(entry);
    });
}

pub async fn execute_program(program: &Program) -> Vec<CandidCallResult<String>> {
    let mut result = vec![];

    match &program {
        Program::Empty => {}
        Program::RemoteCallSequence(call_sequence) => {
            let mut should_continue = true;

            for call_payload in call_sequence {
                let response = call_raw(
                    call_payload.endpoint.canister_id,
                    call_payload.endpoint.method_name.as_str(),
                    // TODO: maybe it is safe to throw here, idk
                    call_payload.args.serialize_args().expect("Execution error"),
                    call_payload.cycles,
                )
                .await
                .to_candid_type()
                .to_decoded();

                if response.is_err() {
                    should_continue = false;
                }

                result.push(response);

                if !should_continue {
                    break;
                }
            }
        }
    }

    result
}
