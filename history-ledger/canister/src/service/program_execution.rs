use crate::repository::program_execution::model::ProgramExecutionEntry;
use crate::repository::program_execution::types::{ProgramExecutionEntryId, ProgramExecutionFilter};
use shared::mvc::{HasRepository, Model, Repository};
use shared::pageable::{Page, PageRequest};

pub struct ProgramExecutionService;

impl ProgramExecutionService {
    pub fn list_program_execution_entry_ids(
        page_req: &PageRequest<ProgramExecutionFilter, ()>,
    ) -> Page<ProgramExecutionEntryId> {
        let _page = ProgramExecutionEntry::repo().list(page_req);

        Page::new(
            _page
                .data
                .into_iter()
                .map(|it| it.get_id().unwrap())
                .collect(),
            _page.has_next,
        )
    }
}
