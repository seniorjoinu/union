use candid::{CandidType, Deserialize};

pub type Id = u64;

#[derive(Debug, Default, Copy, Clone, CandidType, Deserialize)]
pub struct IdGenerator {
    cur_id: Id,
}

impl IdGenerator {
    pub fn generate(&mut self) -> Id {
        let id = self.cur_id;
        self.cur_id += 1;

        id
    }
}

pub trait Model<ID> {
    fn get_id(&self) -> Option<ID>;
    fn _init_id(&mut self, id: ID);
    fn is_transient(&self) -> bool;
}

pub trait Repository<T: Model<ID>, ID> {
    fn save(&mut self, it: T);
    fn delete(&mut self, id: &ID) -> Option<T>;
    fn get(&self, id: &ID) -> Option<&T>;
}
