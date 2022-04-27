use shared::types::wallet::ChoiceId;
use shared::validation::ValidationError;

#[derive(Debug)]
pub enum ChoiceError {
    ValidationError(ValidationError),
    ChoiceNotFound(ChoiceId),
}

pub struct ChoiceService;
