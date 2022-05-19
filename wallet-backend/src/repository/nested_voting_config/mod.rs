use crate::repository::nested_voting_config::model::NestedVotingConfig;
use crate::repository::nested_voting_config::types::{
    NestedVotingConfigFilter, NestedVotingConfigId, RemoteVotingConfigId,
};
use candid::{CandidType, Deserialize, Principal};
use shared::mvc::{IdGenerator, Model, Repository};
use shared::pageable::{Page, PageRequest, Pageable};
use shared::types::wallet::VotingConfigId;
use std::collections::{BTreeMap, BTreeSet, HashMap};

pub mod model;
pub mod types;

#[derive(Default, CandidType, Deserialize)]
pub struct NestedVotingConfigRepository {
    configs: HashMap<NestedVotingConfigId, NestedVotingConfig>,
    id_gen: IdGenerator,

    // TODO: index by groups and make sure to prevent group deletion when related configs exist
    nested_voting_configs_by_remote_voting_config_index:
        BTreeMap<(Principal, VotingConfigId), BTreeSet<NestedVotingConfigId>>,

    nested_voting_configs_by_remote_nested_voting_config_index:
        BTreeMap<(Principal, NestedVotingConfigId), BTreeSet<NestedVotingConfigId>>,
}

impl Repository<NestedVotingConfig, NestedVotingConfigId, NestedVotingConfigFilter, ()>
    for NestedVotingConfigRepository
{
    fn save(&mut self, mut it: NestedVotingConfig) -> NestedVotingConfigId {
        if it.is_transient() {
            it._init_id(self.id_gen.generate());
        }

        self.add_to_index(&it);
        let id = it.get_id().unwrap();
        self.configs.insert(id, it);

        id
    }

    fn delete(&mut self, id: &NestedVotingConfigId) -> Option<NestedVotingConfig> {
        let it = self.configs.remove(id)?;

        self.remote_from_index(&it);

        Some(it)
    }

    fn get(&self, id: &NestedVotingConfigId) -> Option<NestedVotingConfig> {
        self.configs.get(id).cloned()
    }

    fn list(
        &self,
        page_req: &PageRequest<NestedVotingConfigFilter, ()>,
    ) -> Page<NestedVotingConfig> {
        let index = if let Some(id) = page_req.filter.remote_voting_config {
            let mut index = self
                .nested_voting_configs_by_remote_voting_config_index
                .get(&id)
                .cloned()
                .unwrap_or_default();

            if let Some(id) = page_req.filter.remote_nested_voting_config {
                if let Some(index1) = self
                    .nested_voting_configs_by_remote_nested_voting_config_index
                    .get(&id)
                {
                    index = index.intersection(&index1).cloned().collect();
                }
            }

            index
        } else if let Some(id) = page_req.filter.remote_nested_voting_config {
            self.nested_voting_configs_by_remote_nested_voting_config_index
                .get(&id)
                .cloned()
                .unwrap_or_default()
        } else {
            // if no filter set - return all
            let (has_next, iter) = self.configs.iter().get_page(page_req);
            let data = iter.map(|(_, it)| it.clone()).collect();

            return Page::new(data, has_next);
        };

        let (has_next, iter) = index.iter().get_page(page_req);
        let data = iter.map(|id| self.get(id).unwrap()).collect();

        Page::new(data, has_next)
    }
}

impl NestedVotingConfigRepository {
    fn add_to_index(&mut self, it: &NestedVotingConfig) {
        let union_id = it.get_remote_union_id();

        match it.get_remote_voting_config_id() {
            RemoteVotingConfigId::Common(id) => {
                self.nested_voting_configs_by_remote_voting_config_index
                    .entry((union_id, id))
                    .or_default()
                    .insert(it.get_id().unwrap());
            }
            RemoteVotingConfigId::Nested(id) => {
                self.nested_voting_configs_by_remote_nested_voting_config_index
                    .entry((union_id, id))
                    .or_default()
                    .insert(it.get_id().unwrap());
            }
        }
    }

    fn remote_from_index(&mut self, it: &NestedVotingConfig) {
        let union_id = it.get_remote_union_id();

        match it.get_remote_voting_config_id() {
            RemoteVotingConfigId::Common(id) => {
                self.nested_voting_configs_by_remote_voting_config_index
                    .get_mut(&(union_id, id))
                    .unwrap()
                    .remove(&it.get_id().unwrap());
            }
            RemoteVotingConfigId::Nested(id) => {
                self.nested_voting_configs_by_remote_nested_voting_config_index
                    .get_mut(&(union_id, id))
                    .unwrap()
                    .remove(&it.get_id().unwrap());
            }
        }
    }
}
