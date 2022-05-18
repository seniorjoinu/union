use crate::client::UnionWalletClient;
use crate::controller::nested_voting::api::CastMyNestedVoteRequest;
use crate::controller::voting::api::CastMyVoteRequest;
use crate::repository::choice::model::Choice;
use crate::repository::nested_voting::model::NestedVoting;
use crate::repository::nested_voting::types::{NestedVotingId, RemoteVotingId};
use crate::repository::nested_voting_config::types::NestedVoteCalculation;
use crate::repository::token::model::Token;
use crate::repository::voting_config::types::Fraction;
use crate::service::choice::types::ChoiceService;
use crate::service::nested_voting::types::{NestedVotingError, NestedVotingService};
use crate::service::nested_voting_config::types::NestedVotingConfigService;
use crate::service::voting::types::{MultiChoiceVote, Vote};
use bigdecimal::{BigDecimal, One};
use candid::{Nat, Principal};
use shared::mvc::{HasRepository, Repository};
use shared::types::wallet::{ChoiceId, GroupId, Shares};
use std::collections::BTreeMap;

pub mod crud;
pub mod types;

impl NestedVotingService {
    // TODO: refactor
    pub async fn cast_vote(
        id: &NestedVotingId,
        caller: Principal,
        vote: MultiChoiceVote,
    ) -> Result<(), NestedVotingError> {
        // checking inputs
        if !vote.shares_info.is_signature_valid() {
            return Err(NestedVotingError::SharesInfoInvalidSignature);
        }

        if vote.shares_info.principal_id != caller {
            return Err(NestedVotingError::SharesInfoInvalidOwner);
        }

        let mut voting = NestedVotingService::get_nested_voting(id)?;

        if voting.is_frozen() {
            return Err(NestedVotingError::TheVotingIsFrozen);
        }

        if voting.get_shares_info().timestamp != vote.shares_info.timestamp {
            return Err(NestedVotingError::SharesInfoInvalidTimestamp);
        }

        let vc =
            NestedVotingConfigService::get_nested_voting_config(&voting.get_voting_config_id())
                .map_err(NestedVotingError::NestedVotingConfigError)?;

        vc.get_group_remote_shares_distribution(&vote.shares_info.group_id)
            .ok_or(NestedVotingError::NotAllowedToVote)?;

        let total_fraction: BigDecimal = vote.vote.iter().map(|(_, f)| f.0.abs()).sum();
        if total_fraction > BigDecimal::one() {
            return Err(NestedVotingError::VoteFractionTooBig);
        }

        // removing previous vote
        for choice_id in voting.get_choices() {
            let mut choice =
                ChoiceService::get_choice(choice_id).map_err(NestedVotingError::ChoiceError)?;
            let mut token =
                ChoiceService::get_token_for_group(&mut choice, vote.shares_info.group_id);
            ChoiceService::revert_vote(&mut token, caller);

            Token::repo().save(token);
            Choice::repo().save(choice);
        }

        // casting a new vote
        let votes = vote
            .vote
            .into_iter()
            .map(|(id, f)| {
                let shares: Nat =
                    (Fraction(f.0.abs()) * Fraction::from(vote.shares_info.balance.clone())).into();
                (id, shares)
            })
            .collect::<Vec<_>>();

        let choices: Vec<_> = votes
            .into_iter()
            .map(|(id, shares)| {
                assert!(voting.get_choices().contains(&id));
                let choice = Choice::repo().get(&id).unwrap();

                (choice, shares)
            })
            .collect();

        for (mut choice, shares) in choices {
            let mut token =
                ChoiceService::get_token_for_group(&mut choice, vote.shares_info.group_id);
            ChoiceService::cast_vote(&mut token, caller, shares.clone());

            Token::repo().save(token);
            Choice::repo().save(choice);
        }

        voting.set_total_voting_power_by_group(
            vote.shares_info.group_id,
            vote.shares_info.total_supply.clone(),
        );

        NestedVoting::repo().save(voting);

        // passing the vote to the remote union

        let voting = NestedVotingService::get_nested_voting(id)?;

        // calculating turnout
        let mut turnout_by_group = BTreeMap::<GroupId, Shares>::new();
        for choice_id in voting.get_choices() {
            let choice = ChoiceService::get_choice(choice_id).unwrap();

            for (group_id, token_id) in choice.list_tokens_by_group() {
                let token = Token::repo().get(token_id).unwrap();
                let prev_turnout = turnout_by_group.remove(group_id).unwrap_or_default();
                turnout_by_group.insert(*group_id, prev_turnout + token.total_supply());
            }
        }

        // calculating resulting vote
        let mut result_vote = BTreeMap::<ChoiceId, Fraction>::new();
        for choice_id in voting.get_choices() {
            let choice = ChoiceService::get_choice(choice_id).unwrap();

            let remote_choice_id = voting.get_choices_map().get(choice_id).cloned().unwrap();
            let mut total_fraction = Fraction::default();

            for (group_id, token_id) in choice.list_tokens_by_group() {
                let token = Token::repo().get(token_id).unwrap();

                let total = match vc.get_vote_calculation() {
                    NestedVoteCalculation::Total => {
                        voting.get_total_voting_power_by_group(group_id)
                    }
                    NestedVoteCalculation::Turnout => {
                        turnout_by_group.get(group_id).cloned().unwrap()
                    }
                };
                let voted = token.total_supply();

                let choice_fraction = Fraction::from(voted) / Fraction::from(total);
                let group_distribution = vc
                    .get_group_remote_shares_distribution(&vote.shares_info.group_id)
                    .unwrap();

                total_fraction += choice_fraction * group_distribution;
            }

            result_vote.insert(remote_choice_id, total_fraction);
        }

        let union_id = vc.get_remote_union_id();
        let resp = match voting.get_remote_voting_id() {
            RemoteVotingId::Common(voting_id) => union_id.cast_my_vote(CastMyVoteRequest {
                id: voting_id,
                vote: Vote::Common(MultiChoiceVote {
                    shares_info: voting.get_shares_info().clone(),
                    vote: result_vote,
                }),
            }),
            RemoteVotingId::Nested(voting_id) => {
                union_id.cast_my_nested_vote(CastMyNestedVoteRequest {
                    id: voting_id,
                    vote: MultiChoiceVote {
                        shares_info: voting.get_shares_info().clone(),
                        vote: result_vote,
                    },
                })
            }
        };

        // TODO: revert vote on error
        resp.await
            .map_err(|(c, m)| NestedVotingError::NetworkingError(c, m))
    }
    
    pub fn get_vote_of(id: &NestedVotingId, group_id: GroupId, caller: &Principal) -> Result<BTreeMap<ChoiceId, Shares>, NestedVotingError> {
        let voting = NestedVotingService::get_nested_voting(id)?;
        let mut result = BTreeMap::new();
        
        for choice_id in voting.get_choices() {
            let mut choice =
                ChoiceService::get_choice(choice_id).map_err(NestedVotingError::ChoiceError)?;
            let token =
                ChoiceService::get_token_for_group(&mut choice, group_id);
            
            let votes = token.balance_of(caller);
            if votes > Shares::default() {
                result.insert(*choice_id, votes);
            }
        }
        
        Ok(result)
    }
}
