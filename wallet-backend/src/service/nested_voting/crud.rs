use crate::client::UnionWalletClient;
use crate::controller::history_ledger::api::GetMySharesInfoAtRequest;
use crate::controller::nested_voting::api::GetNestedVotingRequest;
use crate::controller::nested_voting_config::api::GetNestedVotingConfigRequest;
use crate::controller::voting::api::GetVotingRequest;
use crate::controller::voting_config::api::GetVotingConfigRequest;
use crate::repository::choice::model::Choice;
use crate::repository::nested_voting::model::NestedVoting;
use crate::repository::nested_voting::types::{NestedVotingFilter, NestedVotingId, RemoteVotingId};
use crate::repository::nested_voting_config::types::{NestedVotingConfigId, RemoteVotingConfigId};
use crate::repository::voting::types::VotingStatus;
use crate::service::nested_voting::types::{NestedVotingError, NestedVotingService};
use crate::service::nested_voting_config::types::NestedVotingConfigService;
use crate::EventsService;
use ic_cdk::spawn;
use shared::candid::CandidRejectionCode;
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::Program;
use shared::types::wallet::GroupId;
use std::collections::BTreeSet;

impl NestedVotingService {
    pub async fn create_nested_voting(
        remote_voting_id: RemoteVotingId,
        remote_group_id: GroupId,
        local_nested_voting_config_id: NestedVotingConfigId,
    ) -> Result<NestedVotingId, NestedVotingError> {
        let local_vc =
            NestedVotingConfigService::get_nested_voting_config(&local_nested_voting_config_id)
                .map_err(NestedVotingError::NestedVotingConfigError)?;

        // checking if this union indeed is a member of the provided group
        let (resp,) = local_vc
            .get_remote_union_id()
            .get_my_groups()
            .await
            .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
        resp.groups
            .iter()
            .map(|it| it.get_id().unwrap())
            .find(|it| *it == remote_group_id)
            .ok_or(NestedVotingError::InvalidGroupProvided(remote_group_id))?;

        // other checks
        let (shares_info, choices, frozen) = match remote_voting_id {
            RemoteVotingId::Common(id) => {
                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_voting(GetVotingRequest {
                        id,
                        query_delegation_proof_opt: None,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;

                let remote_voting = resp.voting;

                let frozen = match remote_voting.get_status() {
                    VotingStatus::Round(r) => {
                        if *r == 0 {
                            return Err(NestedVotingError::RemoteVotingInInvalidStatus);
                        }

                        false
                    }
                    VotingStatus::PreRound(_) => true,
                    _ => return Err(NestedVotingError::RemoteVotingInInvalidStatus),
                };

                // check if voting config ids match
                match local_vc.get_remote_voting_config_id() {
                    RemoteVotingConfigId::Common(remote_vc_id) => {
                        if remote_vc_id != *remote_voting.get_voting_config_id() {
                            return Err(NestedVotingError::RemoteVotingConfigMismatch(
                                local_vc.get_remote_voting_config_id(),
                                RemoteVotingConfigId::Common(*remote_voting.get_voting_config_id()),
                            ));
                        }
                    }
                    RemoteVotingConfigId::Nested(remote_vc_id) => {
                        return Err(NestedVotingError::RemoteVotingConfigMismatch(
                            local_vc.get_remote_voting_config_id(),
                            RemoteVotingConfigId::Nested(0),
                        ));
                    }
                };

                // check if the provided group can participate in that voting
                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_voting_config(GetVotingConfigRequest {
                        id: *remote_voting.get_voting_config_id(),
                        query_delegation_proof_opt: None,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
                let remote_vc = resp.voting_config;

                let mut groups = BTreeSet::new();
                groups.extend(remote_vc.get_quorum_threshold().list_groups());
                groups.extend(remote_vc.get_win_threshold().list_groups());
                groups.extend(remote_vc.get_next_round_threshold().list_groups());

                if !groups.contains(&remote_group_id) {
                    return Err(NestedVotingError::InvalidGroupProvided(remote_group_id));
                }

                // get shares info of this union in the remote union
                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_my_shares_info_at(GetMySharesInfoAtRequest {
                        at: remote_voting.get_created_at(),
                        group_id: remote_group_id,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
                let shares_info = resp.shares_info.ok_or(
                    NestedVotingError::ThisUnionHasNoSharesInProvidedGroup(remote_group_id),
                )?;

                let choices = remote_voting.get_choices().clone();

                (shares_info, choices, frozen)
            }
            RemoteVotingId::Nested(id) => {
                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_nested_voting(GetNestedVotingRequest {
                        id,
                        query_delegation_proof_opt: None,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
                let remote_voting = resp.nested_voting;

                let frozen = remote_voting.is_frozen();

                // check if voting config ids match
                match local_vc.get_remote_voting_config_id() {
                    RemoteVotingConfigId::Nested(remote_vc_id) => {
                        if remote_vc_id != remote_voting.get_voting_config_id() {
                            return Err(NestedVotingError::RemoteVotingConfigMismatch(
                                local_vc.get_remote_voting_config_id(),
                                RemoteVotingConfigId::Nested(remote_voting.get_voting_config_id()),
                            ));
                        }
                    }
                    RemoteVotingConfigId::Common(remote_vc_id) => {
                        return Err(NestedVotingError::RemoteVotingConfigMismatch(
                            local_vc.get_remote_voting_config_id(),
                            RemoteVotingConfigId::Common(0),
                        ));
                    }
                };

                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_nested_voting_config(GetNestedVotingConfigRequest {
                        id: remote_voting.get_voting_config_id(),
                        query_delegation_proof_opt: None,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
                let remote_vc = resp.nested_voting_config;

                // check if the provided group can participate in remote nested voting
                remote_vc
                    .get_group_remote_shares_distribution(&remote_group_id)
                    .ok_or(NestedVotingError::InvalidGroupProvided(remote_group_id))?;

                // get shares info of this union in the remote union
                let (resp,) = local_vc
                    .get_remote_union_id()
                    .get_my_shares_info_at(GetMySharesInfoAtRequest {
                        at: remote_voting.get_shares_info().timestamp,
                        group_id: remote_group_id,
                    })
                    .await
                    .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))?;
                let shares_info = resp.shares_info.ok_or(
                    NestedVotingError::ThisUnionHasNoSharesInProvidedGroup(remote_group_id),
                )?;

                let choices = remote_voting.get_choices().clone();

                (shares_info, choices, frozen)
            }
        };

        EventsService::subscribe_to_voting_updates(
            local_vc.get_remote_union_id(),
            remote_voting_id,
        )
        .await
        .map_err(|m| NestedVotingError::NetworkingError(CandidRejectionCode::CanisterError, m))?;

        // create nested voting
        let it = NestedVoting::new(
            remote_voting_id,
            shares_info,
            local_nested_voting_config_id,
            frozen,
        );

        let voting_id = NestedVoting::repo().save(it);
        let mut it = NestedVoting::repo().get(&voting_id).unwrap();

        // create choices and choices map
        let choices_map = choices
            .into_iter()
            .map(|id| {
                let choice = Choice::new(
                    String::from("<auto>"),
                    String::from("<auto>"),
                    Program::Empty,
                    RemoteVotingId::Nested(voting_id),
                )
                .unwrap();

                let choice_id = Choice::repo().save(choice);

                (choice_id, id)
            })
            .collect();

        // set choices map
        it.set_choices_map(choices_map);
        NestedVoting::repo().save(it);

        Ok(voting_id)
    }

    #[inline(always)]
    pub fn get_nested_voting(id: &NestedVotingId) -> Result<NestedVoting, NestedVotingError> {
        NestedVoting::repo()
            .get(id)
            .ok_or(NestedVotingError::NestedVotingNotFound(*id))
    }

    #[inline(always)]
    pub fn delete_nested_voting(id: &NestedVotingId) -> Result<NestedVoting, NestedVotingError> {
        NestedVoting::repo()
            .delete(id)
            .ok_or(NestedVotingError::NestedVotingNotFound(*id))
    }

    #[inline(always)]
    pub fn list_nested_votings(
        page_req: &PageRequest<NestedVotingFilter, ()>,
    ) -> Page<NestedVoting> {
        NestedVoting::repo().list(page_req)
    }
}
