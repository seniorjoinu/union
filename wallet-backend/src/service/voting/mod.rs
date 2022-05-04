use crate::repository::choice::model::Choice;
use crate::repository::token::model::Token;
use crate::repository::voting::model::Voting;
use crate::repository::voting::types::{RoundResult, VotingStatus};
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::Fraction;
use crate::service::choice::types::ChoiceService;
use crate::service::cron::CronService;
use crate::service::voting::types::{Vote, VotingError, VotingService};
use crate::service::voting_config::types::VotingConfigService;
use bigdecimal::{BigDecimal, One};
use candid::{Nat, Principal};
use shared::mvc::{HasRepository, Model, Repository};
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{ChoiceId, GroupId, Shares, VotingId};
use std::collections::BTreeMap;

pub mod crud;
pub mod types;

impl VotingService {
    pub fn cast_vote(
        id: &VotingId,
        vote: Vote,
        caller: Principal,
        timestamp: u64,
    ) -> Result<(), VotingError> {
        let mut voting = VotingService::get_voting(id)?;
        let vc = VotingConfigService::get_voting_config(voting.get_voting_config_id()).unwrap();

        if !matches!(voting.get_status(), VotingStatus::Round(_)) {
            return Err(VotingError::InvalidVote);
        }

        let (choices, shares_info) = match vote {
            Vote::Rejection(s) => {
                VotingService::assert_can_reject(&vc, &s.shares_info.group_id)?;

                let balance = s.shares_info.balance.clone();
                let rejection_choice = Choice::repo().get(&voting.get_rejection_choice()).unwrap();

                (vec![(rejection_choice, balance)], s.shares_info)
            }
            Vote::Approval(s) => {
                VotingService::assert_can_approve(&vc, &s.shares_info.group_id)?;

                let balance = s.shares_info.balance.clone();
                let approval_choice = Choice::repo().get(&voting.get_approval_choice()).unwrap();

                (vec![(approval_choice, balance)], s.shares_info)
            }
            Vote::Common(m) => {
                VotingService::assert_can_vote(&vc, &m.shares_info.group_id)?;

                let total_fraction: BigDecimal = m.vote.iter().map(|(_, f)| f.0.abs()).sum();

                if total_fraction > BigDecimal::one() {
                    return Err(VotingError::InvalidVote);
                }

                let votes = m
                    .vote
                    .into_iter()
                    .map(|(id, f)| {
                        let shares: Nat = (Fraction(f.0.abs())
                            * Fraction::from(m.shares_info.balance.clone()))
                        .into();
                        (id, shares)
                    })
                    .collect::<Vec<_>>();

                let choices = votes
                    .into_iter()
                    .map(|(id, shares)| {
                        assert!(voting.get_choices().contains(&id));
                        let choice = Choice::repo().get(&id).unwrap();

                        (choice, shares)
                    })
                    .collect();

                (choices, m.shares_info)
            }
        };

        VotingService::assert_shares_info_valid(&shares_info, &voting, caller)?;

        VotingService::remove_prev_vote(&voting, shares_info.group_id, shares_info.principal_id);
        VotingService::put_vote(
            &mut voting,
            choices,
            shares_info.total_supply,
            shares_info.group_id,
            shares_info.principal_id,
            timestamp,
        );

        Voting::repo().save(voting);

        Ok(())
    }

    pub fn try_finish_voting(voting: &mut Voting, vc: &VotingConfig, timestamp: u64) {
        match voting.get_status() {
            VotingStatus::Round(r) => {
                let rejection_choice = Choice::repo().get(&voting.get_rejection_choice()).unwrap();
                let rejection_votes_per_group =
                    ChoiceService::list_total_voted_shares_by_group(&rejection_choice);

                if vc.get_rejection_threshold().is_reached(
                    voting.get_total_voting_power_by_group(),
                    &rejection_votes_per_group,
                ) {
                    voting.reject(timestamp);
                    return;
                }

                if *r == 0 {
                    let approval_choice =
                        Choice::repo().get(&voting.get_approval_choice()).unwrap();
                    let approval_votes_per_group =
                        ChoiceService::list_total_voted_shares_by_group(&approval_choice);

                    if vc.get_approval_threshold().is_reached(
                        voting.get_total_voting_power_by_group(),
                        &approval_votes_per_group,
                    ) {
                        voting.next_round(timestamp);
                        CronService::schedule_round_start(voting, vc, timestamp);
                    } else {
                        voting.finish_fail(String::from("Not enough approvals"), timestamp);
                    }

                    return;
                }

                let mut total_used_votes_by_group = BTreeMap::<GroupId, Shares>::new();

                let choices: Vec<_> = voting
                    .get_choices()
                    .into_iter()
                    .map(|id| Choice::repo().get(id).unwrap())
                    .collect();

                for choice in &choices {
                    let common_votes_per_group =
                        ChoiceService::list_total_voted_shares_by_group(choice);

                    // sum total used vp for all gops to understand if the quorum was reached
                    for (group_id, votes) in common_votes_per_group {
                        let prev_votes = total_used_votes_by_group
                            .get(&group_id)
                            .cloned()
                            .unwrap_or_default();
                        total_used_votes_by_group.insert(group_id, prev_votes + votes);
                    }
                }

                if vc.get_quorum_threshold().is_reached(
                    voting.get_total_voting_power_by_group(),
                    &total_used_votes_by_group,
                ) {
                    let mut win = vec![];
                    let mut next_round = vec![];

                    for choice in choices {
                        let mut won = false;
                        let votes_per_group =
                            ChoiceService::list_total_voted_shares_by_group(&choice);

                        if vc
                            .get_win_threshold()
                            .is_reached(voting.get_total_voting_power_by_group(), &votes_per_group)
                        {
                            win.push(choice.get_id().unwrap());
                            won = true;
                        }

                        if !won
                            && vc.get_next_round_threshold().is_reached(
                                voting.get_total_voting_power_by_group(),
                                &votes_per_group,
                            )
                        {
                            next_round.push(choice.get_id().unwrap());
                        }
                    }

                    if win.is_empty() && next_round.is_empty() {
                        voting
                            .finish_fail(String::from("No worthy choices to continue"), timestamp);
                    } else if !win.is_empty() {
                        // TODO: what if we have more winners than we need?

                        let mut new_winners = RoundResult::new(*r);
                        let mut cur_winners_count: usize =
                            voting.get_winners().iter().map(|it| it.len()).sum();

                        for choice_id in win {
                            voting.remove_choice(&choice_id, timestamp);
                            new_winners.add_choice(choice_id);

                            cur_winners_count += 1;

                            if cur_winners_count == voting.get_winners_need() {
                                voting.add_winner(new_winners, timestamp);
                                voting.finish_success(timestamp);
                                CronService::schedule_voting_execution(voting, timestamp);

                                return;
                            }
                        }

                        voting.add_winner(new_winners, timestamp);
                        voting.next_round(timestamp);
                        CronService::schedule_round_start(voting, vc, timestamp);
                    } else {
                        let mut new_losers = RoundResult::new(*r);

                        for choice_id in voting.get_choices().clone() {
                            if !next_round.contains(&choice_id) {
                                voting.remove_choice(&choice_id, timestamp);
                                new_losers.add_choice(choice_id);
                            }
                        }

                        voting.add_loser(new_losers, timestamp);

                        if voting.get_winners().len() + voting.get_choices().len()
                            < voting.get_winners_need()
                        {
                            voting.finish_fail(
                                String::from("Not enough choices to continue"),
                                timestamp,
                            );
                        } else {
                            voting.next_round(timestamp);
                            CronService::schedule_round_start(voting, vc, timestamp);
                        }
                    }
                } else {
                    voting.finish_fail(String::from("Not enough votes"), timestamp);
                }
            }
            _ => unreachable!("CRON BUG DETECTED, REPORT TO SASHA"),
        }
    }

    pub fn reset_approval_choice(voting: &Voting) {
        let approval_choice = Choice::repo().get(&voting.get_approval_choice()).unwrap();
        ChoiceService::reset(&approval_choice);
    }

    pub fn get_vote_of(
        voting_id: &VotingId,
        group_id: GroupId,
        caller: Principal,
    ) -> Result<BTreeMap<ChoiceId, Shares>, VotingError> {
        let voting = VotingService::get_voting(voting_id)?;
        let choices = VotingService::get_voting_choices(&voting);

        let result = choices
            .into_iter()
            .map(|mut it| {
                let token = ChoiceService::get_token_for_group(&mut it, group_id);
                (it.get_id().unwrap(), token.balance_of(&caller))
            })
            .collect();

        Ok(result)
    }

    pub fn get_voting_results(
        voting_id: &VotingId,
    ) -> Result<BTreeMap<ChoiceId, BTreeMap<GroupId, Shares>>, VotingError> {
        let voting = VotingService::get_voting(voting_id)?;
        let choices = VotingService::get_voting_choices(&voting);

        let result = choices
            .into_iter()
            .map(|it| {
                let total_by_gop = it
                    .list_tokens_by_group()
                    .into_iter()
                    .map(|(gop, token_id)| {
                        let token = Token::repo().get(token_id).unwrap();

                        (*gop, token.total_supply())
                    })
                    .collect();

                (it.get_id().unwrap(), total_by_gop)
            })
            .collect();

        Ok(result)
    }

    fn get_voting_choices(voting: &Voting) -> Vec<Choice> {
        let mut choices = Vec::new();
        choices.push(Choice::repo().get(&voting.get_approval_choice()).unwrap());
        choices.push(Choice::repo().get(&voting.get_rejection_choice()).unwrap());

        for id in voting.get_choices() {
            choices.push(Choice::repo().get(id).unwrap());
        }

        for result in voting.get_winners() {
            for id in result.get_choices() {
                choices.push(Choice::repo().get(id).unwrap());
            }
        }

        for result in voting.get_losers() {
            for id in result.get_choices() {
                choices.push(Choice::repo().get(id).unwrap());
            }
        }

        choices
    }

    fn remove_prev_vote(voting: &Voting, group_id: GroupId, principal: Principal) {
        let choices = match voting.get_status() {
            VotingStatus::Round(r) => {
                if *r == 0 {
                    vec![
                        ChoiceService::get_choice(&voting.get_approval_choice()).unwrap(),
                        ChoiceService::get_choice(&voting.get_rejection_choice()).unwrap(),
                    ]
                } else {
                    let mut list: Vec<Choice> = voting
                        .get_choices()
                        .into_iter()
                        .map(|id| ChoiceService::get_choice(id).unwrap())
                        .collect();

                    list.push(ChoiceService::get_choice(&voting.get_rejection_choice()).unwrap());

                    list
                }
            }
            _ => unreachable!(),
        };

        for mut choice in choices {
            let mut token = ChoiceService::get_token_for_group(&mut choice, group_id);
            ChoiceService::revert_vote(&mut token, principal);

            Token::repo().save(token);
            Choice::repo().save(choice);
        }
    }

    fn put_vote(
        voting: &mut Voting,
        choices: Vec<(Choice, Shares)>,
        total_supply: Shares,
        group_id: GroupId,
        principal: Principal,
        timestamp: u64,
    ) {
        for (mut choice, shares) in choices {
            let mut token = ChoiceService::get_token_for_group(&mut choice, group_id);
            ChoiceService::cast_vote(&mut token, principal, shares);

            Token::repo().save(token);
            Choice::repo().save(choice);
        }

        voting.update_total_voting_power_by_group(group_id, total_supply, timestamp);
    }

    fn assert_winners_need_is_fine(
        vc: &VotingConfig,
        winners_need: usize,
    ) -> Result<(), VotingError> {
        if let Some(wc) = vc.get_winners_count() {
            if !wc.contains(winners_need) {
                return Err(VotingError::InvalidWinnersCount(winners_need, *wc));
            }
        }

        Ok(())
    }

    pub fn is_editable(voting: &Voting) -> bool {
        match voting.get_status() {
            VotingStatus::Round(r) => *r == 0,
            _ => false,
        }
    }

    fn assert_can_approve(vc: &VotingConfig, group_id: &GroupId) -> Result<(), VotingError> {
        if vc.get_approval_threshold().list_groups().contains(group_id) {
            Ok(())
        } else {
            Err(VotingError::InvalidVote)
        }
    }

    fn assert_can_reject(vc: &VotingConfig, group_id: &GroupId) -> Result<(), VotingError> {
        if vc
            .get_rejection_threshold()
            .list_groups()
            .contains(group_id)
        {
            Ok(())
        } else {
            Err(VotingError::InvalidVote)
        }
    }

    fn assert_can_vote(vc: &VotingConfig, group_id: &GroupId) -> Result<(), VotingError> {
        let mut list = vc.get_quorum_threshold().list_groups();
        list.extend(vc.get_win_threshold().list_groups());
        list.extend(vc.get_next_round_threshold().list_groups());

        if list.contains(group_id) {
            Ok(())
        } else {
            Err(VotingError::InvalidVote)
        }
    }

    fn assert_shares_info_valid(
        shares_info: &SharesInfo,
        voting: &Voting,
        caller: Principal,
    ) -> Result<(), VotingError> {
        if !shares_info.is_signature_valid() {
            return Err(VotingError::InvalidVote);
        }

        if voting.get_created_at() != shares_info.timestamp {
            return Err(VotingError::InvalidVote);
        }

        if shares_info.balance == Shares::default() {
            return Err(VotingError::InvalidVote);
        }

        if shares_info.principal_id != caller {
            return Err(VotingError::InvalidVote);
        }

        Ok(())
    }
}
