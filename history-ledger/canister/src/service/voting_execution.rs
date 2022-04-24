use crate::repository::get_repositories;
use crate::repository::voting_execution::types::{
    VotingExecutionRecordExternal, VotingExecutionRecordFilter, VotingExecutionRepositoryError,
};
use shared::pageable::{Page, PageRequest};
use shared::remote_call::ProgramExecutionResult;
use shared::types::wallet::{ChoiceId, ChoiceView, VotingId};

#[derive(Debug)]
pub enum VotingExecutionServiceError {
    RepositoryError(VotingExecutionRepositoryError),
}

#[inline(always)]
pub fn get_records(
    page_req: PageRequest<VotingExecutionRecordFilter, ()>,
) -> Page<VotingExecutionRecordExternal> {
    get_repositories()
        .voting_execution
        .get_records_cloned(page_req)
}

#[inline(always)]
pub fn get_winners_of_record(
    voting_id: VotingId,
    page_req: PageRequest<(), ()>,
) -> Result<Page<(ChoiceId, ChoiceView)>, VotingExecutionServiceError> {
    get_repositories()
        .voting_execution
        .get_winners_cloned(&voting_id, page_req)
        .map_err(VotingExecutionServiceError::RepositoryError)
}

#[inline(always)]
pub fn get_results_of_record(
    voting_id: VotingId,
    page_req: PageRequest<(), ()>,
) -> Result<Page<(ChoiceId, ProgramExecutionResult)>, VotingExecutionServiceError> {
    get_repositories()
        .voting_execution
        .get_results_cloned(&voting_id, page_req)
        .map_err(VotingExecutionServiceError::RepositoryError)
}
