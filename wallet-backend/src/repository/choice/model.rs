use crate::repository::choice::types::{
    ChoiceError, VOTING_CHOICE_DESCRIPTION_MAX_LEN, VOTING_CHOICE_DESCRIPTION_MIN_LEN,
    VOTING_CHOICE_NAME_MAX_LEN, VOTING_CHOICE_NAME_MIN_LEN,
};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::remote_call::Program;
use shared::types::wallet::{ChoiceId, GroupOrProfile, TokenId, VotingId};
use shared::validation::validate_and_trim_str;
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
    fn new(
        mut name: String,
        mut description: String,
        program: Program,
        voting_id: VotingId,
        token_id: TokenId,
    ) -> Result<Self, ChoiceError> {
        name = validate_and_trim_str(
            name,
            VOTING_CHOICE_NAME_MIN_LEN,
            VOTING_CHOICE_NAME_MAX_LEN,
            "Choice name",
        )
        .map_err(ChoiceError::ValidationError)?;

        description = validate_and_trim_str(
            description,
            VOTING_CHOICE_DESCRIPTION_MIN_LEN,
            VOTING_CHOICE_DESCRIPTION_MAX_LEN,
            "Choice description",
        )
        .map_err(ChoiceError::ValidationError)?;

        Ok(Self {
            id: None,
            voting_id,
            name,
            description,
            program,
            total_shares_by_gop: token_id,
            shares_by_gop: BTreeMap::new(),
        })
    }

    pub fn new_rejection(voting_id: VotingId, token_id: TokenId) -> Self {
        Self::new(
            String::from("Reject"),
            String::from("Against all. I don't support this voting at all."),
            Program::Empty,
            voting_id,
            token_id,
        )
        .unwrap()
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
}

impl Model<ChoiceId> for Choice {
    fn get_id(&self) -> Option<ChoiceId> {
        self.id
    }

    fn _init_id(&mut self, id: ChoiceId) {
        assert!(self.id.is_none());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
