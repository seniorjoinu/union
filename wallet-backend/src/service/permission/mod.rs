use crate::repository::permission::types::{PermissionId, PermissionTarget};
use crate::service::permission::types::{
    PermissionError, PermissionService, _get_all_read_endpoints, _get_all_write_endpoints,
    _get_voting_endpoints, ALLOW_READ_PERMISSION_ID, ALLOW_SEND_FEEDBACK_PERMISSION_ID,
    ALLOW_VOTE_PERMISSION_ID, ALLOW_WRITE_PERMISSION_ID,
};
use candid::Principal;

pub mod crud;
pub mod types;

impl PermissionService {
    pub fn init_allow_write_permissions(this_canister_id: Principal) {
        let allow_write_permission_id = PermissionService::create_permission(
            String::from("Allow write all"),
            String::from(
                "Non-deletable default permission. Allows update calls to ANY non-personal method of this union.",
            ),
            _get_all_write_endpoints(this_canister_id).into_iter().map(PermissionTarget::Endpoint).collect(),
        )
        .unwrap();

        assert_eq!(allow_write_permission_id, ALLOW_WRITE_PERMISSION_ID);

        let allow_read_permission_id = PermissionService::create_permission(
            String::from("Allow read all"),
            String::from(
                "Non-deletable default permission. Allows query calls to ANY non-personal method of this union.",
            ),
            _get_all_read_endpoints(this_canister_id).into_iter().map(PermissionTarget::Endpoint).collect(),
        )
            .unwrap();

        assert_eq!(allow_read_permission_id, ALLOW_READ_PERMISSION_ID);

        let feedback_permission_id = PermissionService::create_permission(
            String::from("Feedback"),
            String::from("Non-deletable default permission. Allows execution of empty programs."),
            vec![PermissionTarget::SelfEmptyProgram],
        )
        .unwrap();

        assert_eq!(feedback_permission_id, ALLOW_SEND_FEEDBACK_PERMISSION_ID);

        let voting_participation_permission_id = PermissionService::create_permission(
            String::from("Voting participation"),
            String::from(
                "Non-deletable default permission. Allows to call voting-related methods.",
            ),
            _get_voting_endpoints(this_canister_id)
                .into_iter()
                .map(PermissionTarget::Endpoint)
                .collect(),
        )
        .unwrap();

        assert_eq!(voting_participation_permission_id, ALLOW_VOTE_PERMISSION_ID);
    }

    pub fn assert_not_default(id: PermissionId) -> Result<(), PermissionError> {
        if id == ALLOW_WRITE_PERMISSION_ID
            || id == ALLOW_READ_PERMISSION_ID
            || id == ALLOW_SEND_FEEDBACK_PERMISSION_ID
            || id == ALLOW_VOTE_PERMISSION_ID
        {
            Err(PermissionError::UnableToEditDefaultPermission)
        } else {
            Ok(())
        }
    }
}
