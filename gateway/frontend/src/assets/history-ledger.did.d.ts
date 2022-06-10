import type { Principal } from '@dfinity/principal';
export type AccessConfigId = Id;
export type CandidRejectionCode = { 'NoError' : null } |
  { 'CanisterError' : null } |
  { 'SysTransient' : null } |
  { 'DestinationInvalid' : null } |
  { 'Unknown' : null } |
  { 'SysFatal' : null } |
  { 'CanisterReject' : null };
export interface GetProgramExecutionEntryMetaRequest { 'id' : bigint }
export interface GetProgramExecutionEntryMetaResponse {
  'initiator' : Principal,
  'program_executed_with' : ProgramExecutedWith,
}
export interface GetProgramExecutionEntryProgramRequest { 'id' : bigint }
export interface GetProgramExecutionEntryProgramResponse {
  'program' : [] | [Program],
}
export interface GetProgramExecutionEntryResultRequest { 'id' : bigint }
export interface GetProgramExecutionEntryResultResponse {
  'result' : [] | [ProgramExecutionResult],
}
export interface GetSharesInfoOfAtRequest {
  'at' : bigint,
  'of' : Principal,
  'group_id' : GroupId,
}
export interface GetSharesInfoOfAtResponse { 'info_opt' : [] | [SharesInfo] }
export type GroupId = Id;
export type Id = bigint;
export interface ListProgramExecutionEntryIdsRequest {
  'page_req' : PageRequest,
}
export interface ListProgramExecutionEntryIdsResponse { 'page' : Page }
export interface Page { 'data' : Array<bigint>, 'has_next' : boolean }
export interface PageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : never,
  'filter' : ProgramExecutionFilter,
}
export type Program = { 'Empty' : null } |
  { 'RemoteCallSequence' : Array<RemoteCallPayload> };
export type ProgramExecutedWith = { 'WithVotingConfig' : VotingConfigId } |
  { 'WithAccessConfig' : AccessConfigId };
export interface ProgramExecutionFilter {
  'from_timestamp' : [] | [bigint],
  'endpoint' : [] | [RemoteCallEndpoint],
  'to_timestamp' : [] | [bigint],
}
export type ProgramExecutionResult = { 'Empty' : null } |
  { 'RemoteCallSequence' : Array<RawCandidCallResult> };
export type RawCandidCallResult = { 'Ok' : Array<number> } |
  { 'Err' : [CandidRejectionCode, string] };
export type RemoteCallArgs = { 'CandidString' : Array<string> } |
  { 'Encoded' : Array<number> };
export interface RemoteCallEndpoint {
  'canister_id' : Principal,
  'method_name' : string,
}
export interface RemoteCallPayload {
  'endpoint' : RemoteCallEndpoint,
  'args' : RemoteCallArgs,
  'cycles' : bigint,
}
export type Shares = bigint;
export interface SharesInfo {
  'signature' : never,
  'balance' : Shares,
  'group_id' : GroupId,
  'timestamp' : bigint,
  'principal_id' : Principal,
  'total_supply' : Shares,
}
export type VotingConfigId = Id;
export interface _SERVICE {
  'get_program_execution_entry_meta' : (
      arg_0: GetProgramExecutionEntryMetaRequest,
    ) => Promise<GetProgramExecutionEntryMetaResponse>,
  'get_program_execution_entry_program' : (
      arg_0: GetProgramExecutionEntryProgramRequest,
    ) => Promise<GetProgramExecutionEntryProgramResponse>,
  'get_program_execution_entry_result' : (
      arg_0: GetProgramExecutionEntryResultRequest,
    ) => Promise<GetProgramExecutionEntryResultResponse>,
  'get_shares_info_of_at' : (arg_0: GetSharesInfoOfAtRequest) => Promise<
      GetSharesInfoOfAtResponse
    >,
  'list_program_execution_entry_ids' : (
      arg_0: ListProgramExecutionEntryIdsRequest,
    ) => Promise<ListProgramExecutionEntryIdsResponse>,
}
