use crate::repository::permission::types::PermissionId;
use candid::Principal;
use shared::mvc::ZERO_ID;
use shared::remote_call::RemoteCallEndpoint;
use shared::validation::ValidationError;

pub const ALLOW_WRITE_PERMISSION_ID: PermissionId = ZERO_ID;
pub const ALLOW_READ_PERMISSION_ID: PermissionId = 1;
pub const ALLOW_SEND_FEEDBACK_PERMISSION_ID: PermissionId = 2;
pub const ALLOW_VOTE_PERMISSION_ID: PermissionId = 3;

pub struct PermissionService;

#[derive(Debug)]
pub enum PermissionError {
    ValidationError(ValidationError),
    PermissionNotFound(PermissionId),
    UnableToEditDefaultPermission,
    RelatedVotingConfigsExist,
    RelatedAccessConfigsExist,
}

pub fn _get_all_write_endpoints(union_canister_id: Principal) -> Vec<RemoteCallEndpoint> {
    vec![
        // ACCESS CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "create_access_config"),
        RemoteCallEndpoint::new(union_canister_id, "update_access_config"),
        RemoteCallEndpoint::new(union_canister_id, "delete_access_config"),
        // GROUPS
        RemoteCallEndpoint::new(union_canister_id, "create_group"),
        RemoteCallEndpoint::new(union_canister_id, "update_group"),
        RemoteCallEndpoint::new(union_canister_id, "delete_group"),
        RemoteCallEndpoint::new(union_canister_id, "delete_group"),
        RemoteCallEndpoint::new(union_canister_id, "mint_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "burn_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "burn_unaccepted_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "transfer_group_shares"),
        // PERMISSIONS
        RemoteCallEndpoint::new(union_canister_id, "create_permission"),
        RemoteCallEndpoint::new(union_canister_id, "update_permission"),
        RemoteCallEndpoint::new(union_canister_id, "delete_permission"),
        // PROFILE
        RemoteCallEndpoint::new(union_canister_id, "create_profile"),
        RemoteCallEndpoint::new(union_canister_id, "delete_profile"),
        RemoteCallEndpoint::new(union_canister_id, "update_profile"),
        // SETTINGS
        RemoteCallEndpoint::new(union_canister_id, "update_settings"),
        // STREAMING
        RemoteCallEndpoint::new(union_canister_id, "create_batch"),
        RemoteCallEndpoint::new(union_canister_id, "delete_unlocked_batches"),
        RemoteCallEndpoint::new(union_canister_id, "delete_batches"),
        RemoteCallEndpoint::new(union_canister_id, "lock_batches"),
        RemoteCallEndpoint::new(union_canister_id, "send_batch"),
        RemoteCallEndpoint::new(union_canister_id, "create_chunk"),
        // VOTINGS
        RemoteCallEndpoint::new(union_canister_id, "create_voting"),
        RemoteCallEndpoint::new(union_canister_id, "update_voting"),
        RemoteCallEndpoint::new(union_canister_id, "create_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "update_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "delete_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "delete_voting"),
        // VOTING CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "create_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "update_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "delete_voting_config"),
        // NESTED VOTINGS
        RemoteCallEndpoint::new(union_canister_id, "create_nested_voting"),
        RemoteCallEndpoint::new(union_canister_id, "delete_nested_voting"),
        // NESTED VOTING CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "create_nested_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "update_nested_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "delete_nested_voting_config"),
    ]
}

pub fn _get_all_read_endpoints(union_canister_id: Principal) -> Vec<RemoteCallEndpoint> {
    vec![
        // ACCESS CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "get_access_config"),
        RemoteCallEndpoint::new(union_canister_id, "list_access_configs"),
        // GROUPS
        RemoteCallEndpoint::new(union_canister_id, "get_group"),
        RemoteCallEndpoint::new(union_canister_id, "list_groups"),
        RemoteCallEndpoint::new(union_canister_id, "get_group_shares_balance_of"),
        RemoteCallEndpoint::new(union_canister_id, "get_unaccepted_group_shares_balance_of"),
        RemoteCallEndpoint::new(union_canister_id, "get_total_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "get_total_unaccepted_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "list_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "list_unaccepted_group_shares"),
        RemoteCallEndpoint::new(union_canister_id, "get_groups_of"),
        // HISTORY LEDGER
        RemoteCallEndpoint::new(union_canister_id, "get_shares_info_of_at"),
        RemoteCallEndpoint::new(union_canister_id, "list_program_execution_entry_ids"),
        // PERMISSIONS
        RemoteCallEndpoint::new(union_canister_id, "get_permission"),
        RemoteCallEndpoint::new(union_canister_id, "list_permissions"),
        // PROFILE
        RemoteCallEndpoint::new(union_canister_id, "get_profile"),
        RemoteCallEndpoint::new(union_canister_id, "list_profiles"),
        // SETTINGS
        RemoteCallEndpoint::new(union_canister_id, "get_settings"),
        // STREAMING
        RemoteCallEndpoint::new(union_canister_id, "get_batch"),
        RemoteCallEndpoint::new(union_canister_id, "list_batches"),
        RemoteCallEndpoint::new(union_canister_id, "get_chunk"),
        RemoteCallEndpoint::new(union_canister_id, "list_chunks"),
        // VOTINGS
        RemoteCallEndpoint::new(union_canister_id, "get_voting"),
        RemoteCallEndpoint::new(union_canister_id, "list_votings"),
        RemoteCallEndpoint::new(union_canister_id, "get_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "list_voting_choices"),
        RemoteCallEndpoint::new(union_canister_id, "get_voting_results"),
        // VOTING CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "get_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "list_voting_configs"),
        // NESTED VOTINGS
        RemoteCallEndpoint::new(union_canister_id, "get_nested_voting"),
        RemoteCallEndpoint::new(union_canister_id, "list_nested_votings"),
        // NESTED VOTING CONFIGS
        RemoteCallEndpoint::new(union_canister_id, "get_nested_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "list_nested_voting_configs"),
    ]
}

pub fn _get_voting_endpoints(union_canister_id: Principal) -> Vec<RemoteCallEndpoint> {
    vec![
        // VOTINGS UPDATE
        RemoteCallEndpoint::new(union_canister_id, "create_voting"),
        RemoteCallEndpoint::new(union_canister_id, "update_voting"),
        RemoteCallEndpoint::new(union_canister_id, "create_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "update_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "delete_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "delete_voting"),
        // VOTINGS QUERY
        RemoteCallEndpoint::new(union_canister_id, "get_voting"),
        RemoteCallEndpoint::new(union_canister_id, "list_votings"),
        RemoteCallEndpoint::new(union_canister_id, "get_voting_choice"),
        RemoteCallEndpoint::new(union_canister_id, "list_voting_choices"),
        RemoteCallEndpoint::new(union_canister_id, "get_voting_results"),
        // VOTING CONFIGS QUERY
        RemoteCallEndpoint::new(union_canister_id, "get_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "list_voting_configs"),
        // NESTED VOTINGS UPDATE
        RemoteCallEndpoint::new(union_canister_id, "create_nested_voting"),
        RemoteCallEndpoint::new(union_canister_id, "delete_nested_voting"),
        // NESTED VOTINGS QUERY
        RemoteCallEndpoint::new(union_canister_id, "get_nested_voting"),
        RemoteCallEndpoint::new(union_canister_id, "list_nested_votings"),
        // NESTED VOTING CONFIGS QUERY
        RemoteCallEndpoint::new(union_canister_id, "get_nested_voting_config"),
        RemoteCallEndpoint::new(union_canister_id, "list_nested_voting_configs"),
    ]
}
