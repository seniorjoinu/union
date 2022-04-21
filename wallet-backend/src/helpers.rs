use crate::{get_state, HistoryEntry, Program};
use ic_cdk::api::time;
use ic_cdk::spawn;
use shared::candid::CandidCallResult;
use shared::candid::ToDecodedCandidType;

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
                let response = call_payload.do_call_raw().await.to_decoded();

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
