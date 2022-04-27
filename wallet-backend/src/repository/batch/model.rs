use crate::repository::batch::types::{BatchId, Key};
use candid::{CandidType, Deserialize};
use shared::mvc::Model;
use shared::validation::ValidationError;

#[derive(Clone, Default, CandidType, Deserialize)]
pub struct Batch {
    id: Option<BatchId>,
    key: Key,
    content_type: String,
    locked: bool,
}

impl Batch {
    pub fn new(key: Key, content_type: String) -> Self {
        Self {
            id: None,
            key,
            content_type,
            locked: false,
        }
    }

    pub fn lock(&mut self) {
        assert!(!self.locked);
        self.locked = true;
    }

    pub fn get_key(&self) -> &Key {
        &self.key
    }

    pub fn content_type(&self) -> &String {
        &self.content_type
    }

    pub fn is_locked(&self) -> bool {
        self.locked
    }
}

impl Model<BatchId> for Batch {
    fn get_id(&self) -> Option<BatchId> {
        self.id
    }

    fn _init_id(&mut self, id: BatchId) {
        assert!(self.is_transient());
        self.id = Some(id);
    }

    fn is_transient(&self) -> bool {
        self.id.is_none()
    }
}
