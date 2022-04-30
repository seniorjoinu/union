use crate::emit;
use candid::Principal;
use shared::remote_call::{Program, ProgramExecutionResult};
use shared::types::wallet::{
    GroupId, PrincipalShareholder, ProgramExecutedEvent_1, ProgramExecutedEvent_2, Shareholder,
    Shares, SharesMoveEvent,
};

pub struct EventsService;

impl EventsService {
    pub fn emit_program_executed_event(
        program: Program,
        result: ProgramExecutionResult,
        timestamp: u64,
    ) {
        emit(ProgramExecutedEvent_1 { timestamp, program });
        emit(ProgramExecutedEvent_2 { timestamp, result })
    }

    pub fn emit_shares_mint_event(
        group_id: GroupId,
        to: Principal,
        qty: Shares,
        to_new_balance: Shares,
        total_supply: Shares,
        timestamp: u64,
    ) {
        emit(SharesMoveEvent {
            group_id,
            total_supply,
            qty,
            timestamp,
            to: Shareholder::Principal(PrincipalShareholder {
                principal_id: to,
                new_balance: to_new_balance,
            }),
            from: Shareholder::Void,
        })
    }

    pub fn emit_shares_burn_event(
        group_id: GroupId,
        from: Principal,
        qty: Shares,
        from_new_balance: Shares,
        total_supply: Shares,
        timestamp: u64,
    ) {
        emit(SharesMoveEvent {
            group_id,
            total_supply,
            qty,
            timestamp,
            from: Shareholder::Principal(PrincipalShareholder {
                principal_id: from,
                new_balance: from_new_balance,
            }),
            to: Shareholder::Void,
        })
    }

    pub fn emit_shares_transfer_event(
        group_id: GroupId,
        from: Principal,
        to: Principal,
        qty: Shares,
        from_new_balance: Shares,
        to_new_balance: Shares,
        total_supply: Shares,
        timestamp: u64,
    ) {
        emit(SharesMoveEvent {
            group_id,
            total_supply,
            qty,
            timestamp,
            to: Shareholder::Principal(PrincipalShareholder {
                principal_id: to,
                new_balance: to_new_balance,
            }),
            from: Shareholder::Principal(PrincipalShareholder {
                principal_id: from,
                new_balance: from_new_balance
            }),
        })
    }
}
