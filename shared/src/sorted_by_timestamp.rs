use candid::{CandidType, Deserialize};
use ic_cdk::print;
use std::collections::vec_deque::Iter;
use std::collections::BTreeSet;

#[derive(CandidType, Deserialize, Clone)]
pub struct TimestampedRecords<T: Ord> {
    pub timestamp: u64,
    pub records: BTreeSet<T>,
}

impl<T: Ord> TimestampedRecords<T> {
    pub fn new(timestamp: u64, data: T) -> Self {
        let mut records = BTreeSet::new();
        records.insert(data);

        Self { timestamp, records }
    }
}

// TODO: not efficient enough for big data because of reallocations
#[derive(CandidType, Deserialize, Clone)]
pub struct SortedByTimestamp<T: Ord>(Vec<TimestampedRecords<T>>);

impl<T: Ord> Default for SortedByTimestamp<T> {
    fn default() -> Self {
        Self(vec![])
    }
}

impl<T: Ord> SortedByTimestamp<T> {
    pub fn push(&mut self, timestamp: u64, data: T) {
        match self.0.binary_search_by(|it| it.timestamp.cmp(&timestamp)) {
            Ok(idx) => {
                self.0[idx].records.insert(data);
            }
            Err(idx) => self
                .0
                .insert(idx, TimestampedRecords::<T>::new(timestamp, data)),
        }
    }

    pub fn most_actual_by(&self, timestamp: &u64) -> Option<&BTreeSet<T>> {
        match self.0.binary_search_by(|it| it.timestamp.cmp(timestamp)) {
            Ok(idx) => Some(&self.0[idx].records),
            Err(idx) => {
                if idx == 0 {
                    None
                } else {
                    Some(&self.0[idx - 1].records)
                }
            }
        }
    }

    pub fn get_all(&self) -> Vec<&T> {
        let mut result = vec![];

        for entry in &self.0 {
            for record in &entry.records {
                result.push(record);
            }
        }

        result
    }

    pub fn get_by_interval(&self, from: &u64, to: &u64) -> Vec<&T> {
        if from > to {
            print(format!(
                "'From' timestamp ({}) is bigger than 'To' timestamp ({}), returning empty list...",
                from, to
            ));
            return Vec::new();
        }

        let from_idx = match self.0.binary_search_by(|it| it.timestamp.cmp(from)) {
            Ok(idx) => idx,
            Err(idx) => idx,
        };

        let to_idx = match self.0.binary_search_by(|it| it.timestamp.cmp(to)) {
            Ok(idx) => idx,
            Err(idx) => idx,
        };

        let mut result = vec![];

        for i in from_idx..to_idx {
            if let Some(entry) = self.0.get(i) {
                for record in &entry.records {
                    result.push(record);
                }
            }
        }

        result
    }

    pub fn get_last_timestamp(&self) -> u64 {
        self.0.last().map(|it| it.timestamp).unwrap_or(u64::MAX)
    }

    pub fn get_first_timestamp(&self) -> u64 {
        self.0.first().map(|it| it.timestamp).unwrap_or_default()
    }

    #[inline(always)]
    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    #[inline(always)]
    pub fn len(&self) -> usize {
        self.0.len()
    }
}
