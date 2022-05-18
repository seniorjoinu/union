use crate::repository::nested_voting::types::{NestedVotingId, RemoteVotingId};
use crate::repository::nested_voting_config::types::NestedVotingConfigId;
use crate::repository::voting::types::RoundResult;
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::types::history_ledger::SharesInfo;
use shared::types::wallet::{ChoiceId, GroupId, Shares};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, CandidType, Deserialize)]
pub struct NestedVoting {
    id: Option<NestedVotingId>,
    remote_voting_id: RemoteVotingId,
    voting_config_id: NestedVotingConfigId,

    shares_info: SharesInfo,
    total_voting_power_by_group: BTreeMap<GroupId, Shares>,

    frozen: bool,

    winners: Vec<RoundResult>,
    losers: Vec<RoundResult>,
    choices: BTreeSet<ChoiceId>,

    choices_map: BTreeMap<ChoiceId, ChoiceId>,
}

impl NestedVoting {
    pub fn new(
        remote_voting_id: RemoteVotingId,
        shares_info: SharesInfo,
        voting_config_id: NestedVotingConfigId,
        frozen: bool,
    ) -> Self {
        Self {
            id: None,
            remote_voting_id,
            shares_info,
            voting_config_id,
            frozen,
            total_voting_power_by_group: BTreeMap::new(),
            winners: Vec::new(),
            losers: Vec::new(),
            choices: BTreeSet::new(),
            choices_map: BTreeMap::new(),
        }
    }

    pub fn set_choices_map(&mut self, choices_map: BTreeMap<ChoiceId, ChoiceId>) {
        assert!(self.choices.is_empty());
        assert!(self.choices_map.is_empty());

        let choices = choices_map.iter().map(|(id, _)| *id).collect();

        self.choices = choices;
        self.choices_map = choices_map;
    }

    pub fn set_total_voting_power_by_group(&mut self, group_id: GroupId, vp: Shares) {
        self.total_voting_power_by_group.insert(group_id, vp);
    }

    pub fn remove_choice(&mut self, choice_id: &ChoiceId) {
        assert!(self.choices.remove(&choice_id));
    }

    pub fn freeze(&mut self) {
        self.frozen = true;
    }

    pub fn unfreeze(&mut self) {
        self.frozen = false;
    }

    pub fn add_winner(&mut self, result: RoundResult) {
        self.winners.push(result);
    }

    pub fn add_loser(&mut self, result: RoundResult) {
        self.losers.push(result);
    }

    pub fn is_frozen(&self) -> bool {
        self.frozen
    }

    pub fn get_shares_info(&self) -> &SharesInfo {
        &self.shares_info
    }

    pub fn get_choices(&self) -> &BTreeSet<ChoiceId> {
        &self.choices
    }

    pub fn get_remote_voting_id(&self) -> RemoteVotingId {
        self.remote_voting_id
    }

    pub fn get_voting_config_id(&self) -> NestedVotingConfigId {
        self.voting_config_id
    }

    pub fn get_winners(&self) -> &Vec<RoundResult> {
        &self.winners
    }

    pub fn get_losers(&self) -> &Vec<RoundResult> {
        &self.losers
    }

    pub fn get_choices_map(&self) -> &BTreeMap<ChoiceId, ChoiceId> {
        &self.choices_map
    }

    pub fn get_total_voting_power_by_group(&self, group_id: &GroupId) -> Shares {
        self.total_voting_power_by_group
            .get(group_id)
            .cloned()
            .unwrap_or_default()
    }
}

impl Model<NestedVotingId> for NestedVoting {
    fn get_id(&self) -> Option<NestedVotingId> {
        self.id
    }

    fn _init_id(&mut self, id: NestedVotingId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
