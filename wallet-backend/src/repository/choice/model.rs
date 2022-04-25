use crate::repository::choice::types::{
    VOTING_CHOICE_DESCRIPTION_MAX_LEN, VOTING_CHOICE_DESCRIPTION_MIN_LEN,
    VOTING_CHOICE_NAME_MAX_LEN, VOTING_CHOICE_NAME_MIN_LEN,
};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, GroupOrProfile, TokenId, VotingId};
use shared::validation::{validate_and_trim_str, ValidationError};
use std::collections::BTreeMap;

#[derive(Clone, CandidType, Deserialize)]
pub struct Choice {
    id: Option<ChoiceId>,
    voting_id: VotingId,
    name: String,
    description: String,
    program: Program,
    total_shares_by_gop: TokenId,
    shares_by_gop: BTreeMap<GroupOrProfile, TokenId>,
}

impl Choice {
    pub fn new(
        name: String,
        description: String,
        program: Program,
        voting_id: VotingId,
        token_id: TokenId,
    ) -> Result<Self, ValidationError> {
        Ok(Self {
            id: None,
            voting_id,
            name: Self::process_name(name)?,
            description: Self::process_description(description)?,
            program,
            total_shares_by_gop: token_id,
            shares_by_gop: BTreeMap::new(),
        })
    }

    pub fn new_rejection(voting_id: VotingId, token_id: TokenId) -> Self {
        Self::new(
            String::from("Reject"),
            String::from("I don't support this voting at all."),
            Program::Empty,
            voting_id,
            token_id,
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

    pub fn set_shares_by_gop_token(&mut self, gop: GroupOrProfile, token_id: TokenId) {
        assert!(!self.shares_by_gop.contains_key(&gop));
        self.shares_by_gop.insert(gop, token_id);
    }

    pub fn get_shares_by_gop_token(&self, gop: &GroupOrProfile) -> Option<&TokenId> {
        self.shares_by_gop.get(gop)
    }

    pub fn get_total_shares_by_gop_token(&self) -> &TokenId {
        &self.total_shares_by_gop
    }

    pub fn get_voting_id(&self) -> &VotingId {
        &self.voting_id
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
