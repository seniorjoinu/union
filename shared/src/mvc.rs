use crate::pageable::{Page, PageRequest};
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

pub trait Repository<T: Model<ID>, ID, F, S> {
    fn save(&mut self, it: T) -> ID;
    fn delete(&mut self, id: &ID) -> Option<T>;
    fn get(&self, id: &ID) -> Option<T>;
    fn list(&self, page_req: &PageRequest<F, S>) -> Page<T>;
}

pub trait HasRepository<T: Model<ID>, ID, F, S, R: Repository<T, ID, F, S>> {
    fn repo() -> &'static mut R;
}