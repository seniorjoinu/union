use crate::repository::choice::model::Choice;
use crate::repository::group::model::Group;
use crate::repository::profile::model::Profile;
use crate::repository::token::model::Token;
use crate::repository::voting::model::Voting;
use crate::repository::voting::types::VotingStatus;
use crate::repository::voting_config::model::VotingConfig;
use crate::repository::voting_config::types::{EditorConstraint, Fraction, ProposerConstraint};
use crate::service::choice::types::ChoiceService;
use crate::service::cron::CronService;
use crate::service::group::types::{GroupService, DEFAULT_GROUP_SHARES};
use crate::service::voting::types::{
    MultiChoiceVote, SingleChoiceVote, Vote, VotingError, VotingService,
};
use bigdecimal::{BigDecimal, One};
use candid::{Nat, Principal};
use shared::mvc::{HasRepository, Model, Repository};
use shared::remote_call::Program;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{GroupOrProfile, Shares};
use std::collections::BTreeMap;

pub mod crud;
pub mod types;

impl VotingService {
    pub fn add_choice(
        voting: &mut Voting,
        vc: &VotingConfig,
        name: String,
        description: String,
        program: Program,
    ) -> Result<(), VotingError> {
        // TODO
    }

    pub fn cast_vote(
        voting: &mut Voting,
        vc: &VotingConfig,
        vote: Vote,
        caller: Principal,
        timestamp: u64,
    ) -> Result<(), VotingError> {
        if !matches!(voting.get_status(), VotingStatus::Round(_)) {
            return Err(VotingError::InvalidVote);
        }

        match vote {
            Vote::Rejection(s) => {
                let (gop, principal, shares, total_shares) = match s {
                    SingleChoiceVote::AsGroupMember(shares_info) => {
                        VotingService::assert_shares_info_valid(&shares_info, voting, caller)?;
                        VotingService::assert_can_reject(
                            vc,
                            &GroupOrProfile::Group(shares_info.group_id),
                        )?;

                        (
                            GroupOrProfile::Group(shares_info.group_id),
                            caller,
                            shares_info.balance,
                            shares_info.total_supply,
                        )
                    }
                    SingleChoiceVote::AsProfileOwner => {
                        Profile::repo()
                            .get(&caller)
                            .ok_or(VotingError::ProfileNotExists(caller))?;
                        VotingService::assert_can_reject(vc, &GroupOrProfile::Profile(caller))?;

                        (
                            GroupOrProfile::Profile(caller),
                            caller,
                            Shares::from(DEFAULT_GROUP_SHARES),
                            Shares::from(DEFAULT_GROUP_SHARES),
                        )
                    }
                };

                VotingService::remove_prev_vote(voting, gop, principal);
                let rejection_choice = Choice::repo().get(voting.get_rejection_choice()).unwrap();
                VotingService::put_vote(
                    voting,
                    vec![(rejection_choice, shares)],
                    total_shares,
                    gop,
                    principal,
                    timestamp,
                );
            }
            Vote::Approval(s) => {
                let (gop, principal, shares, total_shares) = match s {
                    SingleChoiceVote::AsGroupMember(shares_info) => {
                        VotingService::assert_shares_info_valid(&shares_info, voting, caller)?;
                        VotingService::assert_can_approve(
                            vc,
                            &GroupOrProfile::Group(shares_info.group_id),
                        )?;

                        (
                            GroupOrProfile::Group(shares_info.group_id),
                            caller,
                            shares_info.balance,
                            shares_info.total_supply,
                        )
                    }
                    SingleChoiceVote::AsProfileOwner => {
                        Profile::repo()
                            .get(&caller)
                            .ok_or(VotingError::ProfileNotExists(caller))?;
                        VotingService::assert_can_approve(vc, &GroupOrProfile::Profile(caller))?;

                        (
                            GroupOrProfile::Profile(caller),
                            caller,
                            Shares::from(DEFAULT_GROUP_SHARES),
                            Shares::from(DEFAULT_GROUP_SHARES),
                        )
                    }
                };

                VotingService::remove_prev_vote(voting, gop, principal);
                let approval_choice = Choice::repo().get(voting.get_approval_choice()).unwrap();
                VotingService::put_vote(
                    voting,
                    vec![(approval_choice, shares)],
                    total_shares,
                    gop,
                    principal,
                    timestamp,
                );
            }
            Vote::Common(m) => {
                let (gop, principal, total_shares, votes) = match m {
                    MultiChoiceVote::AsGroupMember(v) => {
                        VotingService::assert_shares_info_valid(&v.shares_info, voting, caller)?;
                        VotingService::assert_can_vote(
                            vc,
                            &GroupOrProfile::Group(v.shares_info.group_id),
                        )?;

                        let total_fraction: BigDecimal =
                            v.vote.iter().map(|(_, f)| f.0.abs()).sum();
                        if total_fraction > BigDecimal::one() {
                            return Err(VotingError::InvalidVote);
                        }

                        let votes = v
                            .vote
                            .into_iter()
                            .map(|(id, f)| {
                                let shares: Nat = (Fraction(f.0.abs())
                                    * Fraction::from(v.shares_info.balance.clone()))
                                .into();
                                (id, shares)
                            })
                            .collect::<Vec<_>>();

                        (
                            GroupOrProfile::Group(v.shares_info.group_id),
                            caller,
                            v.shares_info.total_supply,
                            votes,
                        )
                    }
                    MultiChoiceVote::AsProfileOwner(v) => {
                        Profile::repo()
                            .get(&caller)
                            .ok_or(VotingError::ProfileNotExists(caller))?;
                        VotingService::assert_can_vote(vc, &GroupOrProfile::Profile(caller))?;

                        let total_fraction: BigDecimal =
                            v.vote.iter().map(|(_, f)| f.0.abs()).sum();

                        if total_fraction > BigDecimal::one() {
                            return Err(VotingError::InvalidVote);
                        }

                        let votes = v
                            .vote
                            .into_iter()
                            .map(|(id, f)| {
                                let shares: Nat = (Fraction(f.0.abs())
                                    * Fraction::from(Shares::from(DEFAULT_GROUP_SHARES)))
                                .into();
                                (id, shares)
                            })
                            .collect::<Vec<_>>();

                        (
                            GroupOrProfile::Profile(caller),
                            caller,
                            Shares::from(DEFAULT_GROUP_SHARES),
                            votes,
                        )
                    }
                };

                let choices = votes
                    .into_iter()
                    .map(|(id, shares)| {
                        assert!(voting.get_choices().contains(&id));
                        let choice = Choice::repo().get(&id).unwrap();

                        (choice, shares)
                    })
                    .collect();

                VotingService::remove_prev_vote(voting, gop, principal);
                VotingService::put_vote(voting, choices, total_shares, gop, principal, timestamp);
            }
        };

        Ok(())
    }

    pub fn try_finish_voting(voting: &mut Voting, vc: &VotingConfig, timestamp: u64) {
        match voting.get_status() {
            VotingStatus::Round(r) => {
                let rejection_choice = Choice::repo().get(voting.get_rejection_choice()).unwrap();
                let votes_per_gop =
                    ChoiceService::list_total_voted_shares_by_gop(&rejection_choice);

                if vc
                    .get_rejection_threshold()
                    .is_reached(voting.get_total_voting_power(), &votes_per_gop)
                {
                    voting.reject(timestamp);
                    return;
                }

                if *r == 0 {
                    let approval_choice = Choice::repo().get(voting.get_approval_choice()).unwrap();
                    let votes_per_gop =
                        ChoiceService::list_total_voted_shares_by_gop(&approval_choice);

                    if vc
                        .get_approval_threshold()
                        .is_reached(voting.get_total_voting_power(), &votes_per_gop)
                    {
                        voting.next_round(timestamp);
                        CronService::schedule_round_start(voting, vc, timestamp);
                    } else {
                        voting.finish_fail(String::from("Not enough approvals"), timestamp);
                    }

                    return;
                }

                let mut total_used_votes_by_gop = BTreeMap::<GroupOrProfile, Shares>::new();

                let choices: Vec<_> = voting
                    .get_choices()
                    .into_iter()
                    .map(|id| Choice::repo().get(id).unwrap())
                    .collect();

                for choice in &choices {
                    let votes_per_gop = ChoiceService::list_total_voted_shares_by_gop(choice);

                    // sum total used vp for all gops to understand if the quorum was reached
                    for (gop, votes) in votes_per_gop {
                        let prev_votes = total_used_votes_by_gop
                            .get(&gop)
                            .cloned()
                            .unwrap_or_default();
                        total_used_votes_by_gop.insert(gop, prev_votes + votes);
                    }
                }

                if vc
                    .get_quorum_threshold()
                    .is_reached(voting.get_total_voting_power(), &total_used_votes_by_gop)
                {
                    let mut win = vec![];
                    let mut next_round = vec![];

                    for choice in choices {
                        let mut won = false;
                        let votes_per_gop = ChoiceService::list_total_voted_shares_by_gop(&choice);

                        if vc
                            .get_win_threshold()
                            .is_reached(voting.get_total_voting_power(), &votes_per_gop)
                        {
                            win.push(choice.get_id().unwrap());
                            won = true;
                        }

                        if !won
                            && vc
                                .get_next_round_threshold()
                                .is_reached(voting.get_total_voting_power(), &votes_per_gop)
                        {
                            next_round.push(choice.get_id().unwrap());
                        }
                    }

                    if win.is_empty() && next_round.is_empty() {
                        voting
                            .finish_fail(String::from("No worthy choices to continue"), timestamp);
                    } else if !win.is_empty() {
                        // TODO: what if we have more winners than we need?

                        let mut cur_winners_count = voting.get_winners().len();
                        for choice_id in win {
                            voting.remove_choice(&choice_id, timestamp);
                            voting.add_winner(choice_id, timestamp);
                            cur_winners_count += 1;

                            if cur_winners_count == voting.get_winners_need() {
                                voting.finish_success(timestamp);
                                CronService::schedule_voting_execution(voting, timestamp);

                                return;
                            }
                        }

                        voting.next_round(timestamp);
                        CronService::schedule_round_start(voting, vc, timestamp);
                    } else {
                        for choice_id in voting.get_choices().clone() {
                            if !next_round.contains(&choice_id) {
                                voting.remove_choice(&choice_id, timestamp);
                                voting.add_loser(choice_id, timestamp);
                            }
                        }

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

    fn remove_prev_vote(voting: &Voting, gop: GroupOrProfile, principal: Principal) {
        let mut choices = match voting.get_status() {
            VotingStatus::Round(r) => {
                if *r == 0 {
                    vec![
                        Choice::repo().get(voting.get_approval_choice()).unwrap(),
                        Choice::repo().get(voting.get_rejection_choice()).unwrap(),
                    ]
                } else {
                    let mut list: Vec<Choice> = voting
                        .get_choices()
                        .into_iter()
                        .map(|id| Choice::repo().get(id).unwrap())
                        .collect();
                    list.push(Choice::repo().get(voting.get_rejection_choice()).unwrap());

                    list
                }
            }
            _ => unreachable!(),
        };

        for mut choice in choices {
            let mut token = ChoiceService::get_token_for_gop(&mut choice, gop);
            ChoiceService::revert_vote(&mut token, principal);

            Token::repo().save(token);
            Choice::repo().save(choice);
        }
    }

    fn put_vote(
        voting: &mut Voting,
        choices: Vec<(Choice, Shares)>,
        total_supply: Shares,
        gop: GroupOrProfile,
        principal: Principal,
        timestamp: u64,
    ) {
        for (mut choice, shares) in choices {
            let mut token = ChoiceService::get_token_for_gop(&mut choice, gop);
            ChoiceService::cast_vote(&mut token, principal, shares);

            Token::repo().save(token);
            Choice::repo().save(choice);
        }

        voting.update_total_voting_power(gop, total_supply, timestamp);
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

    fn assert_proposer_can_propose(
        vc: &VotingConfig,
        proposer: Principal,
    ) -> Result<(), VotingError> {
        for proposer_constraint in vc.get_proposer_constraints() {
            match proposer_constraint {
                ProposerConstraint::Profile(p) => {
                    if *p == proposer {
                        // unwrapping, because profile should exist if it is listed
                        Profile::repo().get(p).unwrap();
                        return Ok(());
                    }
                }
                ProposerConstraint::Group(group_condition) => {
                    // unwrapping, because profile should exist if it is listed
                    let group = Group::repo().get(&group_condition.id).unwrap();
                    let token = GroupService::get_token(&group);

                    if token.balance_of(&proposer) >= group_condition.min_shares.clone() {
                        return Ok(());
                    }
                }
            }
        }

        Err(VotingError::ProposerNotFoundInVotingConfig(proposer))
    }

    fn assert_editor_can_edit(
        vc: &VotingConfig,
        editor: Principal,
        proposer: Principal,
    ) -> Result<(), VotingError> {
        for editor_constraint in vc.get_editor_constraints() {
            match editor_constraint {
                EditorConstraint::Profile(p) => {
                    if *p == editor {
                        // unwrapping, because profile should exist if it is listed
                        Profile::repo().get(p).unwrap();
                        return Ok(());
                    }
                }
                EditorConstraint::Group(group_condition) => {
                    // unwrapping, because profile should exist if it is listed
                    let group = Group::repo().get(&group_condition.id).unwrap();
                    let token = GroupService::get_token(&group);

                    if token.balance_of(&editor) >= group_condition.min_shares.clone() {
                        return Ok(());
                    }
                }
                EditorConstraint::Proposer => {
                    if editor == proposer {
                        return Ok(());
                    }
                }
            }
        }

        Err(VotingError::EditorNotFoundInVotingConfig(editor))
    }

    fn assert_can_approve(vc: &VotingConfig, gop: &GroupOrProfile) -> Result<(), VotingError> {
        if vc
            .get_approval_threshold()
            .list_groups_and_profiles()
            .contains(gop)
        {
            Ok(())
        } else {
            Err(VotingError::InvalidVote)
        }
    }

    fn assert_can_reject(vc: &VotingConfig, gop: &GroupOrProfile) -> Result<(), VotingError> {
        if vc
            .get_rejection_threshold()
            .list_groups_and_profiles()
            .contains(gop)
        {
            Ok(())
        } else {
            Err(VotingError::InvalidVote)
        }
    }

    fn assert_can_vote(vc: &VotingConfig, gop: &GroupOrProfile) -> Result<(), VotingError> {
        let mut list = vc.get_quorum_threshold().list_groups_and_profiles();
        list.extend(vc.get_win_threshold().list_groups_and_profiles());
        list.extend(vc.get_next_round_threshold().list_groups_and_profiles());

        if list.contains(gop) {
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
