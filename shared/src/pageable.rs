use candid::{CandidType, Deserialize};
use std::collections::btree_map::Iter as BTreeMapIter;
use std::collections::btree_set::Iter as BTreeSetIter;
use std::collections::btree_set::Union as BTreeSetUnion;
use std::collections::hash_map::Iter as HashMapIter;
use std::collections::vec_deque::Iter as VecIter;
use std::iter::{Rev, Skip, Take};
use std::slice::Iter as SliceIter;

#[derive(CandidType, Deserialize)]
pub struct Page<T> {
    pub data: Vec<T>,
    pub has_next: bool,
}

impl<T> Page<T> {
    pub fn new(data: Vec<T>, has_next: bool) -> Self {
        Self { data, has_next }
    }

    pub fn empty() -> Self {
        Self {
            data: Vec::new(),
            has_next: false,
        }
    }
}

#[derive(CandidType, Deserialize)]
pub struct PageRequest<F, S> {
    pub page_index: u32,
    pub page_size: u32,
    pub filter: F,
    pub sort: S,
}

pub trait Pageable {
    type BaseType;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>);
}

impl<'a, K, V> Pageable for HashMapIter<'a, K, V> {
    type BaseType = HashMapIter<'a, K, V>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, K, V> Pageable for BTreeMapIter<'a, K, V> {
    type BaseType = BTreeMapIter<'a, K, V>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T> Pageable for VecIter<'a, T> {
    type BaseType = VecIter<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T> Pageable for Rev<VecIter<'a, T>> {
    type BaseType = Rev<VecIter<'a, T>>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T> Pageable for BTreeSetIter<'a, T> {
    type BaseType = BTreeSetIter<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T> Pageable for SliceIter<'a, T> {
    type BaseType = SliceIter<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T> Pageable for Rev<SliceIter<'a, T>> {
    type BaseType = Rev<SliceIter<'a, T>>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}

impl<'a, T: Ord> Pageable for BTreeSetUnion<'a, T> {
    type BaseType = BTreeSetUnion<'a, T>;

    fn get_page<F, S>(self, req: &PageRequest<F, S>) -> (bool, Take<Skip<Self::BaseType>>) {
        let has_next = self
            .clone()
            .skip((req.page_size * req.page_index + req.page_size) as usize)
            .peekable()
            .peek()
            .is_some();

        let it = self
            .skip((req.page_size * req.page_index) as usize)
            .take(req.page_size as usize);

        (has_next, it)
    }
}
