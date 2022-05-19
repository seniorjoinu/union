use crate::repository::choice::types::{
    VOTING_CHOICE_DESCRIPTION_MAX_LEN, VOTING_CHOICE_DESCRIPTION_MIN_LEN,
    VOTING_CHOICE_NAME_MAX_LEN, VOTING_CHOICE_NAME_MIN_LEN,
};
use crate::repository::token::types::TokenId;
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, GroupId, VotingId};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeMap;
use crate::repository::nested_voting::types::RemoteVotingId;

#[derive(Clone, CandidType, Deserialize)]
pub struct Choice {
    id: Option<ChoiceId>,
    voting_id: RemoteVotingId,
    name: String,
    description: String,
    program: Program,
    voting_power_by_group: BTreeMap<GroupId, TokenId>,
}

impl Choice {
    pub fn new(
        name: String,
        description: String,
        program: Program,
        voting_id: RemoteVotingId,
    ) -> Result<Self, ValidationError> {
        Ok(Self {
            id: None,
            voting_id,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
            program,
            voting_power_by_group: BTreeMap::new(),
        })
    }

    pub fn new_rejection(voting_id: VotingId) -> Self {
        Self::new(
            String::from("Reject"),
            String::from("I don't support this voting"),
            Program::Empty,
            RemoteVotingId::Common(voting_id),
        )
        .unwrap()
    }

    pub fn new_approval(voting_id: VotingId) -> Self {
        Self::new(
            String::from("Approve"),
            String::from("This voting makes sense to me"),
            Program::Empty,
            RemoteVotingId::Common(voting_id),
        )
        .unwrap()
    }

    pub fn update(
        &mut self,
        new_name: Option<String>,
        new_description: Option<String>,
        new_program: Option<Program>,
    ) -> Result<(), ValidationError> {
        if let Some(name) = new_name {
            self.name = Self::process_name(name)?;
        }

        if let Some(description) = new_description {
            self.description = Self::process_description(description)?;
        }

        if let Some(program) = new_program {
            self.program = program;
        }

        Ok(())
    }

    pub fn set_shares_by_group_token(&mut self, group_id: GroupId, token_id: TokenId) {
        assert!(!self.voting_power_by_group.contains_key(&group_id));
        self.voting_power_by_group.insert(group_id, token_id);
    }

    pub fn get_shares_by_group_token(&self, group_id: &GroupId) -> Option<&TokenId> {
        self.voting_power_by_group.get(group_id)
    }

    pub fn list_tokens_by_group(&self) -> &BTreeMap<GroupId, TokenId> {
        &self.voting_power_by_group
    }

    pub fn get_voting_id(&self) -> RemoteVotingId {
        self.voting_id
    }

    pub fn get_program(&self) -> &Program {
        &self.program
    }

    fn process_name(name: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            name,
            VOTING_CHOICE_NAME_MIN_LEN,
            VOTING_CHOICE_NAME_MAX_LEN,
            "Choice name",
        )
    }

    fn process_description(description: String) -> Result<String, ValidationError> {
        validate_and_trim_str(
            description,
            VOTING_CHOICE_DESCRIPTION_MIN_LEN,
            VOTING_CHOICE_DESCRIPTION_MAX_LEN,
            "Choice description",
        )
    }
}

impl Model<ChoiceId> for Choice {
    fn get_id(&self) -> Option<ChoiceId> {
        self.id
    }

    fn _init_id(&mut self, id: ChoiceId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
