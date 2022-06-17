import type { Principal } from '@dfinity/principal';
export interface AcceptMyGroupSharesRequest {
  'qty' : Shares,
  'group_id' : GroupId,
}
export interface AccessConfig {
  'id' : [] | [AccessConfigId],
  'permissions' : Array<PermissionId>,
  'name' : string,
  'description' : string,
  'allowees' : Array<AlloweeConstraint>,
}
export interface AccessConfigFilter {
  'permission' : [] | [PermissionId],
  'group' : [] | [GroupId],
  'profile' : [] | [ProfileId],
}
export type AccessConfigId = Id;
export type AlloweeConstraint = { 'Group' : GroupCondition } |
  { 'Profile' : ProfileId } |
  { 'Everyone' : null };
export interface Batch {
  'id' : [] | [BatchId],
  'key' : Key,
  'content_type' : string,
  'locked' : boolean,
}
export type BatchId = Id;
export interface BurnGroupSharesRequest {
  'qty' : Shares,
  'owner' : Principal,
  'group_id' : GroupId,
}
export interface BurnMyGroupSharesRequest {
  'qty' : Shares,
  'group_id' : GroupId,
}
export type CandidRejectionCode = { 'NoError' : null } |
  { 'CanisterError' : null } |
  { 'SysTransient' : null } |
  { 'DestinationInvalid' : null } |
  { 'Unknown' : null } |
  { 'SysFatal' : null } |
  { 'CanisterReject' : null };
export interface CastMyNestedVoteRequest {
  'id' : NestedVotingId,
  'vote' : MultiChoiceVote,
}
export interface CastMyVoteRequest { 'id' : VotingId, 'vote' : Vote }
export interface Choice {
  'id' : [] | [ChoiceId],
  'name' : string,
  'description' : string,
  'voting_id' : RemoteVotingId,
  'voting_power_by_group' : Array<[GroupId, TokenId]>,
  'program' : Program,
}
export interface ChoiceFilter { 'voting_id' : RemoteVotingId }
export type ChoiceId = Id;
export interface Chunk {
  'id' : [] | [ChunkId],
  'content' : Array<number>,
  'batch_id' : BatchId,
}
export interface ChunkFilter { 'batch_id' : BatchId }
export type ChunkId = Id;
export interface CreateAccessConfigRequest {
  'permissions' : Array<PermissionId>,
  'name' : string,
  'description' : string,
  'allowees' : Array<AlloweeConstraint>,
}
export interface CreateAccessConfigResponse { 'id' : AccessConfigId }
export interface CreateBatchRequest { 'key' : Key, 'content_type' : string }
export interface CreateBatchResponse { 'batch_id' : BatchId }
export interface CreateChunkRequest {
  'content' : Array<number>,
  'batch_id' : BatchId,
}
export interface CreateChunkResponse { 'chunk_id' : ChunkId }
export interface CreateGroupRequest {
  'transferable' : boolean,
  'name' : string,
  'description' : string,
  'private' : boolean,
}
export interface CreateGroupResponse { 'group_id' : GroupId }
export interface CreateNestedVotingConfigRequest {
  'remote_union_id' : Principal,
  'remote_voting_config_id' : RemoteVotingConfigId,
  'name' : string,
  'description' : string,
  'allowee_groups' : Array<[GroupId, Fraction]>,
  'vote_calculation' : NestedVoteCalculation,
}
export interface CreateNestedVotingConfigResponse {
  'id' : NestedVotingConfigId,
}
export interface CreateNestedVotingRequest {
  'remote_voting_id' : RemoteVotingId,
  'local_nested_voting_config_id' : NestedVotingConfigId,
  'remote_group_id' : GroupId,
}
export interface CreateNestedVotingResponse { 'id' : NestedVotingId }
export interface CreatePermissionRequest {
  'name' : string,
  'description' : string,
  'targets' : Array<PermissionTarget>,
}
export interface CreatePermissionResponse { 'id' : PermissionId }
export interface CreateProfileRequest {
  'id' : ProfileId,
  'name' : string,
  'description' : string,
}
export interface CreateVotingChoiceRequest {
  'name' : string,
  'description' : string,
  'voting_id' : RemoteVotingId,
  'program' : Program,
}
export interface CreateVotingChoiceResponse { 'choice_id' : ChoiceId }
export interface CreateVotingConfigRequest {
  'win' : ThresholdValue,
  'winners_count' : [] | [LenInterval],
  'permissions' : Array<PermissionId>,
  'name' : string,
  'description' : string,
  'rejection' : ThresholdValue,
  'next_round' : ThresholdValue,
  'choices_count' : [] | [LenInterval],
  'approval' : ThresholdValue,
  'quorum' : ThresholdValue,
  'round' : RoundSettings,
}
export interface CreateVotingConfigResponse { 'id' : VotingConfigId }
export interface CreateVotingRequest {
  'name' : string,
  'description' : string,
  'voting_config_id' : VotingConfigId,
  'winners_need' : number,
}
export interface CreateVotingResponse { 'id' : VotingId }
export interface DeclineMyGroupSharesRequest {
  'qty' : Shares,
  'group_id' : GroupId,
}
export interface DeleteAccessConfigRequest { 'id' : AccessConfigId }
export interface DeleteBatchesRequest { 'ids' : Array<BatchId> }
export interface DeleteGroupRequest { 'group_id' : GroupId }
export interface DeleteNestedVotingConfigRequest { 'id' : NestedVotingConfigId }
export interface DeleteNestedVotingRequest { 'id' : NestedVotingId }
export interface DeletePermissionRequest { 'id' : PermissionId }
export interface DeleteProfileRequest { 'id' : ProfileId }
export interface DeleteVotingChoiceRequest {
  'choice_id' : ChoiceId,
  'voting_id' : RemoteVotingId,
}
export interface DeleteVotingConfigRequest { 'id' : VotingConfigId }
export interface DeleteVotingRequest { 'id' : VotingId }
export interface ExecuteRequest {
  'access_config_id' : AccessConfigId,
  'program' : Program,
}
export interface ExecuteResponse { 'result' : ProgramExecutionResult }
export type Fraction = string;
export interface FractionOf { 'fraction' : Fraction, 'target' : Target }
export interface GetAccessConfigRequest {
  'id' : AccessConfigId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetAccessConfigResponse { 'access_config' : AccessConfig }
export interface GetBatchRequest {
  'id' : BatchId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetBatchResponse { 'batch' : Batch }
export interface GetChunkRequest {
  'chunk_id' : ChunkId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetChunkResponse { 'chunk' : Chunk }
export interface GetGroupRequest {
  'group_id' : GroupId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetGroupResponse { 'group' : GroupExt }
export interface GetGroupSharesBalanceOfRequest {
  'owner' : Principal,
  'group_id' : GroupId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetGroupSharesBalanceOfResponse { 'balance' : Shares }
export interface GetGroupsOfRequest {
  'principal_id' : Principal,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetGroupsResponse { 'groups' : Array<GroupExt> }
export interface GetMyGroupSharesBalanceRequest { 'group_id' : GroupId }
export interface GetMyGroupSharesBalanceResponse { 'balance' : Shares }
export interface GetMyNestedVoteRequest {
  'id' : NestedVotingId,
  'group_id' : GroupId,
}
export interface GetMyNestedVoteResponse {
  'my_vote' : Array<[ChoiceId, Shares]>,
}
export interface GetMyQueryDelegationProofRequest {
  'requested_targets' : Array<PermissionTarget>,
}
export interface GetMyQueryDelegationProofResponse {
  'proof' : QueryDelegationProof,
}
export interface GetMySharesInfoAtRequest {
  'at' : bigint,
  'group_id' : GroupId,
}
export interface GetMyVoteRequest {
  'voting_id' : VotingId,
  'group_id' : GroupId,
}
export interface GetMyVoteResponse { 'vote' : Array<[ChoiceId, Shares]> }
export interface GetNestedVotingConfigRequest {
  'id' : NestedVotingConfigId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetNestedVotingConfigResponse {
  'nested_voting_config' : NestedVotingConfig,
}
export interface GetNestedVotingRequest {
  'id' : NestedVotingId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetNestedVotingResponse { 'nested_voting' : NestedVoting }
export interface GetPermissionRequest {
  'id' : PermissionId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetPermissionResponse { 'permission' : Permission }
export interface GetProfileRequest {
  'id' : ProfileId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetProfileResponse { 'profile' : Profile }
export interface GetSettingsRequest {
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetSettingsResponse { 'settings' : Settings }
export interface GetSharesInfoOfAtRequest {
  'at' : bigint,
  'of' : Principal,
  'group_id' : GroupId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetSharesInfoOfAtResponse { 'shares_info' : [] | [SharesInfo] }
export interface GetTotalGroupSharesRequest {
  'group_id' : GroupId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetTotalGroupSharesResponse { 'total' : Shares }
export interface GetVotingChoiceRequest {
  'choice_id' : ChoiceId,
  'voting_id' : RemoteVotingId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetVotingChoiceResponse { 'choice' : Choice }
export interface GetVotingConfigRequest {
  'id' : VotingConfigId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetVotingConfigResponse { 'voting_config' : VotingConfig }
export interface GetVotingRequest {
  'id' : VotingId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetVotingResponse { 'voting' : Voting }
export interface GetVotingResultsRequest {
  'voting_id' : VotingId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface GetVotingResultsResponse {
  'results' : Array<[ChoiceId, Array<[GroupId, Shares]>]>,
}
export interface Group {
  'id' : [] | [GroupId],
  'token' : [] | [TokenId],
  'name' : string,
  'description' : string,
  'private' : boolean,
}
export interface GroupCondition { 'id' : GroupId, 'min_shares' : Shares }
export interface GroupExt { 'it' : Group, 'transferable' : boolean }
export type GroupId = Id;
export type Id = bigint;
export interface InitRequest {
  'union_description' : string,
  'wallet_creator' : Principal,
  'union_name' : string,
  'history_ledger' : Principal,
}
export type Key = string;
export interface LenInterval { 'max' : number, 'min' : number }
export interface ListAccessConfigsPage {
  'data' : Array<AccessConfig>,
  'has_next' : boolean,
}
export interface ListAccessConfigsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : AccessConfigFilter,
}
export interface ListAccessConfigsRequest {
  'page_req' : ListAccessConfigsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListAccessConfigsResponse { 'page' : ListAccessConfigsPage }
export interface ListBatchesPage { 'data' : Array<Batch>, 'has_next' : boolean }
export interface ListBatchesRequest {
  'page_req' : PageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListBatchesResponse { 'page' : ListBatchesPage }
export interface ListChunksPage { 'data' : Array<Chunk>, 'has_next' : boolean }
export interface ListChunksPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : ChunkFilter,
}
export interface ListChunksRequest {
  'page_req' : ListChunksPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListChunksResponse { 'page' : ListChunksPage }
export interface ListGroupSharesPage {
  'data' : Array<[Principal, Shares]>,
  'has_next' : boolean,
}
export interface ListGroupSharesRequest {
  'page_req' : PageRequest,
  'group_id' : GroupId,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListGroupSharesResponse { 'page' : ListGroupSharesPage }
export interface ListGroupsPage {
  'data' : Array<GroupExt>,
  'has_next' : boolean,
}
export interface ListGroupsRequest {
  'page_req' : PageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListGroupsResponse { 'page' : ListGroupsPage }
export interface ListNestedVotingConfigsPage {
  'data' : Array<NestedVotingConfig>,
  'has_next' : boolean,
}
export interface ListNestedVotingConfigsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : NestedVotingConfigFilter,
}
export interface ListNestedVotingConfigsRequest {
  'page_req' : ListNestedVotingConfigsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListNestedVotingConfigsResponse {
  'page' : ListNestedVotingConfigsPage,
}
export interface ListNestedVotingsPage {
  'data' : Array<NestedVoting>,
  'has_next' : boolean,
}
export interface ListNestedVotingsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : NestedVotingFilter,
}
export interface ListNestedVotingsRequest {
  'page_req' : ListNestedVotingsPageRequest,
}
export interface ListNestedVotingsResponse { 'page' : ListNestedVotingsPage }
export interface ListPermissionsPage {
  'data' : Array<Permission>,
  'has_next' : boolean,
}
export interface ListPermissionsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : PermissionFilter,
}
export interface ListPermissionsRequest {
  'page_req' : ListPermissionsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListPermissionsResponse { 'page' : ListPermissionsPage }
export interface ListProfilesPage {
  'data' : Array<Profile>,
  'has_next' : boolean,
}
export interface ListProfilesRequest {
  'page_req' : PageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListProfilesResponse { 'page' : ListProfilesPage }
export interface ListProgramExecutionEntryIdsPage {
  'data' : Array<bigint>,
  'has_next' : boolean,
}
export interface ListProgramExecutionEntryIdsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : ProgramExecutionFilter,
}
export interface ListProgramExecutionEntryIdsRequest {
  'page_req' : ListProgramExecutionEntryIdsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListProgramExecutionEntryIdsResponse {
  'page' : ListProgramExecutionEntryIdsPage,
  'history_ledger_canister_id' : Principal,
}
export interface ListVotingChoicesPage {
  'data' : Array<Choice>,
  'has_next' : boolean,
}
export interface ListVotingChoicesPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : ChoiceFilter,
}
export interface ListVotingChoicesRequest {
  'page_req' : ListVotingChoicesPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListVotingChoicesResponse { 'page' : ListVotingChoicesPage }
export interface ListVotingConfigsPage {
  'data' : Array<VotingConfig>,
  'has_next' : boolean,
}
export interface ListVotingConfigsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : VotingConfigFilter,
}
export interface ListVotingConfigsRequest {
  'page_req' : ListVotingConfigsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListVotingConfigsResponse { 'page' : ListVotingConfigsPage }
export interface ListVotingsPage {
  'data' : Array<Voting>,
  'has_next' : boolean,
}
export interface ListVotingsPageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : VotingSort,
  'filter' : null,
}
export interface ListVotingsRequest {
  'page_req' : ListVotingsPageRequest,
  'query_delegation_proof_opt' : [] | [QueryDelegationProof],
}
export interface ListVotingsResponse { 'page' : ListVotingsPage }
export interface LockBatchesRequest { 'ids' : Array<BatchId> }
export interface MintGroupSharesRequest {
  'qty' : Shares,
  'owner' : Principal,
  'group_id' : GroupId,
}
export interface MultiChoiceVote {
  'vote' : Array<[ChoiceId, Fraction]>,
  'shares_info' : SharesInfo,
}
export type NestedVoteCalculation = { 'Turnout' : null } |
  { 'Total' : null };
export interface NestedVoting {
  'id' : [] | [NestedVotingId],
  'remote_voting_id' : RemoteVotingId,
  'losers' : Array<RoundResult>,
  'voting_config_id' : NestedVotingConfigId,
  'frozen' : boolean,
  'shares_info' : SharesInfo,
  'choices_map' : Array<[ChoiceId, ChoiceId]>,
  'choices' : Array<ChoiceId>,
  'winners' : Array<RoundResult>,
  'total_voting_power_by_group' : Array<[GroupId, Shares]>,
}
export interface NestedVotingConfig {
  'id' : [] | [NestedVotingConfigId],
  'remote_union_id' : Principal,
  'remote_voting_config_id' : RemoteVotingConfigId,
  'name' : string,
  'description' : string,
  'allowee_groups' : Array<[GroupId, Fraction]>,
  'vote_calculation' : NestedVoteCalculation,
}
export interface NestedVotingConfigFilter {
  'remote_voting_config' : [] | [[Principal, VotingConfigId]],
  'remote_nested_voting_config' : [] | [[Principal, NestedVotingConfigId]],
}
export type NestedVotingConfigId = Id;
export interface NestedVotingFilter {
  'nested_voting_config' : [] | [NestedVotingConfigId],
}
export type NestedVotingId = Id;
export interface PageRequest {
  'page_size' : number,
  'page_index' : number,
  'sort' : null,
  'filter' : null,
}
export interface Permission {
  'id' : [] | [PermissionId],
  'name' : string,
  'description' : string,
  'targets' : Array<PermissionTarget>,
}
export interface PermissionFilter { 'target' : [] | [PermissionTarget] }
export type PermissionId = Id;
export type PermissionTarget = { 'Endpoint' : RemoteCallEndpoint } |
  { 'SelfEmptyProgram' : null };
export interface Profile {
  'id' : ProfileId,
  'name' : string,
  'description' : string,
}
export type ProfileId = Principal;
export type Program = { 'Empty' : null } |
  { 'RemoteCallSequence' : Array<RemoteCallPayload> };
export interface ProgramExecutionFilter {
  'from_timestamp' : [] | [bigint],
  'endpoint' : [] | [RemoteCallEndpoint],
  'to_timestamp' : [] | [bigint],
}
export type ProgramExecutionResult = { 'Empty' : null } |
  { 'RemoteCallSequence' : Array<RawCandidCallResult> };
export interface QuantityOf { 'target' : Target, 'quantity' : Shares }
export interface QueryDelegationProof {
  'signature' : null,
  'union_id' : Principal,
  'delegate_id' : Principal,
  'allowed_query_targets' : Array<PermissionTarget>,
  'expires_at' : bigint,
}
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
export type RemoteVotingConfigId = { 'Nested' : NestedVotingConfigId } |
  { 'Common' : VotingConfigId };
export type RemoteVotingId = { 'Nested' : NestedVotingId } |
  { 'Common' : VotingId };
export type RoundId = number;
export interface RoundResult { 'choices' : Array<ChoiceId>, 'round' : RoundId }
export interface RoundSettings {
  'round_delay' : bigint,
  'round_duration' : bigint,
}
export interface SendBatchRequest {
  'batch_id' : BatchId,
  'target_canister' : Principal,
}
export interface Settings {
  'name' : string,
  'description' : string,
  'history_ledgers' : Array<TimestampedRecord>,
}
export type Shares = bigint;
export interface SharesInfo {
  'signature' : null,
  'balance' : Shares,
  'group_id' : GroupId,
  'timestamp' : bigint,
  'principal_id' : Principal,
  'total_supply' : Shares,
}
export interface SingleChoiceVote { 'shares_info' : SharesInfo }
export type Target = { 'Group' : GroupId } |
  { 'Thresholds' : Array<ThresholdValue> };
export type TaskId = Id;
export type ThresholdValue = { 'FractionOf' : FractionOf } |
  { 'QuantityOf' : QuantityOf };
export interface TimestampedRecord {
  'records' : Array<Principal>,
  'timestamp' : bigint,
}
export type TokenId = Id;
export interface TransferGroupSharesRequest {
  'to' : Principal,
  'qty' : Shares,
  'from' : Principal,
  'group_id' : GroupId,
}
export interface TransferMyGroupSharesRequest {
  'to' : Principal,
  'qty' : Shares,
  'group_id' : GroupId,
}
export interface UpdateAccessConfigRequest {
  'id' : AccessConfigId,
  'new_description' : [] | [string],
  'new_allowees' : [] | [Array<AlloweeConstraint>],
  'new_name' : [] | [string],
  'new_permissions' : [] | [Array<PermissionId>],
}
export interface UpdateGroupRequest {
  'new_description' : [] | [string],
  'new_name' : [] | [string],
  'group_id' : GroupId,
}
export interface UpdateMyProfileRequest {
  'new_description' : [] | [string],
  'new_name' : [] | [string],
}
export interface UpdateNestedVotingConfigRequest {
  'id' : NestedVotingConfigId,
  'description_opt' : [] | [string],
  'name_opt' : [] | [string],
  'vote_calculation_opt' : [] | [NestedVoteCalculation],
  'allowee_groups_opt' : [] | [Array<[GroupId, Fraction]>],
}
export interface UpdatePermissionRequest {
  'id' : PermissionId,
  'new_description' : [] | [string],
  'new_targets' : [] | [Array<PermissionTarget>],
  'new_name' : [] | [string],
}
export interface UpdateProfileRequest {
  'id' : ProfileId,
  'new_description' : [] | [string],
  'new_name' : [] | [string],
}
export interface UpdateSettingsRequest {
  'new_description' : [] | [string],
  'new_name' : [] | [string],
}
export interface UpdateVotingChoiceRequest {
  'new_description' : [] | [string],
  'choice_id' : ChoiceId,
  'new_program' : [] | [Program],
  'new_name' : [] | [string],
}
export interface UpdateVotingConfigRequest {
  'id' : VotingConfigId,
  'description_opt' : [] | [string],
  'next_round_opt' : [] | [ThresholdValue],
  'name_opt' : [] | [string],
  'quorum_opt' : [] | [ThresholdValue],
  'approval_opt' : [] | [ThresholdValue],
  'round_opt' : [] | [RoundSettings],
  'choices_count_opt' : [] | [[] | [LenInterval]],
  'winners_count_opt' : [] | [[] | [LenInterval]],
  'rejection_opt' : [] | [ThresholdValue],
  'win_opt' : [] | [ThresholdValue],
  'permissions_opt' : [] | [Array<PermissionId>],
}
export interface UpdateVotingRequest {
  'id' : VotingId,
  'new_description' : [] | [string],
  'new_winners_need' : [] | [number],
  'new_name' : [] | [string],
}
export type Vote = { 'Rejection' : SingleChoiceVote } |
  { 'Approval' : SingleChoiceVote } |
  { 'Common' : MultiChoiceVote };
export interface Voting {
  'id' : [] | [VotingId],
  'status' : VotingStatus,
  'updated_at' : bigint,
  'task_id' : [] | [TaskId],
  'approval_choice' : [] | [ChoiceId],
  'name' : string,
  'description' : string,
  'losers' : Array<RoundResult>,
  'created_at' : bigint,
  'voting_config_id' : VotingConfigId,
  'rejection_choice' : [] | [ChoiceId],
  'proposer' : Principal,
  'winners_need' : number,
  'choices' : Array<ChoiceId>,
  'winners' : Array<RoundResult>,
  'total_voting_power_by_group' : Array<[GroupId, Shares]>,
}
export interface VotingConfig {
  'id' : [] | [VotingConfigId],
  'win' : ThresholdValue,
  'winners_count' : [] | [LenInterval],
  'permissions' : Array<PermissionId>,
  'name' : string,
  'description' : string,
  'rejection' : ThresholdValue,
  'next_round' : ThresholdValue,
  'choices_count' : [] | [LenInterval],
  'approval' : ThresholdValue,
  'quorum' : ThresholdValue,
  'round' : RoundSettings,
}
export interface VotingConfigFilter {
  'permission' : [] | [PermissionId],
  'group' : [] | [GroupId],
}
export type VotingConfigId = Id;
export type VotingId = Id;
export type VotingSort = { 'UpdatedAt' : boolean } |
  { 'None' : null } |
  { 'CreatedAt' : boolean };
export type VotingStatus = { 'Fail' : string } |
  { 'PreRound' : RoundId } |
  { 'Round' : RoundId } |
  { 'Rejected' : null } |
  { 'Success' : null };
export interface _SERVICE {
  'accept_my_group_shares' : (arg_0: AcceptMyGroupSharesRequest) => Promise<
      undefined
    >,
  'burn_group_shares' : (arg_0: BurnGroupSharesRequest) => Promise<undefined>,
  'burn_my_group_shares' : (arg_0: BurnMyGroupSharesRequest) => Promise<
      undefined
    >,
  'burn_unaccepted_group_shares' : (arg_0: BurnGroupSharesRequest) => Promise<
      undefined
    >,
  'cast_my_nested_vote' : (arg_0: CastMyNestedVoteRequest) => Promise<
      undefined
    >,
  'cast_my_vote' : (arg_0: CastMyVoteRequest) => Promise<undefined>,
  'create_access_config' : (arg_0: CreateAccessConfigRequest) => Promise<
      CreateAccessConfigResponse
    >,
  'create_batch' : (arg_0: CreateBatchRequest) => Promise<CreateBatchResponse>,
  'create_chunk' : (arg_0: CreateChunkRequest) => Promise<CreateChunkResponse>,
  'create_group' : (arg_0: CreateGroupRequest) => Promise<CreateGroupResponse>,
  'create_nested_voting' : (arg_0: CreateNestedVotingRequest) => Promise<
      CreateNestedVotingResponse
    >,
  'create_nested_voting_config' : (
      arg_0: CreateNestedVotingConfigRequest,
    ) => Promise<CreateNestedVotingConfigResponse>,
  'create_permission' : (arg_0: CreatePermissionRequest) => Promise<
      CreatePermissionResponse
    >,
  'create_profile' : (arg_0: CreateProfileRequest) => Promise<undefined>,
  'create_voting' : (arg_0: CreateVotingRequest) => Promise<
      CreateVotingResponse
    >,
  'create_voting_choice' : (arg_0: CreateVotingChoiceRequest) => Promise<
      CreateVotingChoiceResponse
    >,
  'create_voting_config' : (arg_0: CreateVotingConfigRequest) => Promise<
      CreateVotingConfigResponse
    >,
  'decline_my_group_shares' : (arg_0: DeclineMyGroupSharesRequest) => Promise<
      undefined
    >,
  'delete_access_config' : (arg_0: DeleteAccessConfigRequest) => Promise<
      undefined
    >,
  'delete_batches' : (arg_0: DeleteBatchesRequest) => Promise<undefined>,
  'delete_group' : (arg_0: DeleteGroupRequest) => Promise<undefined>,
  'delete_nested_voting' : (arg_0: DeleteNestedVotingRequest) => Promise<
      undefined
    >,
  'delete_nested_voting_config' : (
      arg_0: DeleteNestedVotingConfigRequest,
    ) => Promise<undefined>,
  'delete_permission' : (arg_0: DeletePermissionRequest) => Promise<undefined>,
  'delete_profile' : (arg_0: DeleteProfileRequest) => Promise<undefined>,
  'delete_unlocked_batches' : (arg_0: DeleteBatchesRequest) => Promise<
      undefined
    >,
  'delete_voting' : (arg_0: DeleteVotingRequest) => Promise<undefined>,
  'delete_voting_choice' : (arg_0: DeleteVotingChoiceRequest) => Promise<
      undefined
    >,
  'delete_voting_config' : (arg_0: DeleteVotingConfigRequest) => Promise<
      undefined
    >,
  'execute' : (arg_0: ExecuteRequest) => Promise<ExecuteResponse>,
  'get_access_config' : (arg_0: GetAccessConfigRequest) => Promise<
      GetAccessConfigResponse
    >,
  'get_batch' : (arg_0: GetBatchRequest) => Promise<GetBatchResponse>,
  'get_chunk' : (arg_0: GetChunkRequest) => Promise<GetChunkResponse>,
  'get_group' : (arg_0: GetGroupRequest) => Promise<GetGroupResponse>,
  'get_group_shares_balance_of' : (
      arg_0: GetGroupSharesBalanceOfRequest,
    ) => Promise<GetGroupSharesBalanceOfResponse>,
  'get_groups_of' : (arg_0: GetGroupsOfRequest) => Promise<GetGroupsResponse>,
  'get_my_group_shares_balance' : (
      arg_0: GetMyGroupSharesBalanceRequest,
    ) => Promise<GetMyGroupSharesBalanceResponse>,
  'get_my_groups' : () => Promise<GetGroupsResponse>,
  'get_my_nested_vote' : (arg_0: GetMyNestedVoteRequest) => Promise<
      GetMyNestedVoteResponse
    >,
  'get_my_profile' : () => Promise<GetProfileResponse>,
  'get_my_query_delegation_proof' : (
      arg_0: GetMyQueryDelegationProofRequest,
    ) => Promise<GetMyQueryDelegationProofResponse>,
  'get_my_shares_info_at' : (arg_0: GetMySharesInfoAtRequest) => Promise<
      GetSharesInfoOfAtResponse
    >,
  'get_my_unaccepted_group_shares_balance' : (
      arg_0: GetMyGroupSharesBalanceRequest,
    ) => Promise<GetMyGroupSharesBalanceResponse>,
  'get_my_vote' : (arg_0: GetMyVoteRequest) => Promise<GetMyVoteResponse>,
  'get_nested_voting' : (arg_0: GetNestedVotingRequest) => Promise<
      GetNestedVotingResponse
    >,
  'get_nested_voting_config' : (arg_0: GetNestedVotingConfigRequest) => Promise<
      GetNestedVotingConfigResponse
    >,
  'get_permission' : (arg_0: GetPermissionRequest) => Promise<
      GetPermissionResponse
    >,
  'get_profile' : (arg_0: GetProfileRequest) => Promise<GetProfileResponse>,
  'get_settings' : (arg_0: GetSettingsRequest) => Promise<GetSettingsResponse>,
  'get_shares_info_of_at' : (arg_0: GetSharesInfoOfAtRequest) => Promise<
      GetSharesInfoOfAtResponse
    >,
  'get_total_group_shares' : (arg_0: GetTotalGroupSharesRequest) => Promise<
      GetTotalGroupSharesResponse
    >,
  'get_total_unaccepted_group_shares' : (
      arg_0: GetTotalGroupSharesRequest,
    ) => Promise<GetTotalGroupSharesResponse>,
  'get_unaccepted_group_shares_balance_of' : (
      arg_0: GetGroupSharesBalanceOfRequest,
    ) => Promise<GetGroupSharesBalanceOfResponse>,
  'get_voting' : (arg_0: GetVotingRequest) => Promise<GetVotingResponse>,
  'get_voting_choice' : (arg_0: GetVotingChoiceRequest) => Promise<
      GetVotingChoiceResponse
    >,
  'get_voting_config' : (arg_0: GetVotingConfigRequest) => Promise<
      GetVotingConfigResponse
    >,
  'get_voting_results' : (arg_0: GetVotingResultsRequest) => Promise<
      GetVotingResultsResponse
    >,
  'list_access_configs' : (arg_0: ListAccessConfigsRequest) => Promise<
      ListAccessConfigsResponse
    >,
  'list_batches' : (arg_0: ListBatchesRequest) => Promise<ListBatchesResponse>,
  'list_chunks' : (arg_0: ListChunksRequest) => Promise<ListChunksResponse>,
  'list_group_shares' : (arg_0: ListGroupSharesRequest) => Promise<
      ListGroupSharesResponse
    >,
  'list_groups' : (arg_0: ListGroupsRequest) => Promise<ListGroupsResponse>,
  'list_nested_voting_configs' : (
      arg_0: ListNestedVotingConfigsRequest,
    ) => Promise<ListNestedVotingConfigsResponse>,
  'list_nested_votings' : (arg_0: ListNestedVotingsRequest) => Promise<
      ListNestedVotingsResponse
    >,
  'list_permissions' : (arg_0: ListPermissionsRequest) => Promise<
      ListPermissionsResponse
    >,
  'list_profiles' : (arg_0: ListProfilesRequest) => Promise<
      ListProfilesResponse
    >,
  'list_program_execution_entry_ids' : (
      arg_0: ListProgramExecutionEntryIdsRequest,
    ) => Promise<ListProgramExecutionEntryIdsResponse>,
  'list_unaccepted_group_shares' : (arg_0: ListGroupSharesRequest) => Promise<
      ListGroupSharesResponse
    >,
  'list_voting_choices' : (arg_0: ListVotingChoicesRequest) => Promise<
      ListVotingChoicesResponse
    >,
  'list_voting_configs' : (arg_0: ListVotingConfigsRequest) => Promise<
      ListVotingConfigsResponse
    >,
  'list_votings' : (arg_0: ListVotingsRequest) => Promise<ListVotingsResponse>,
  'lock_batches' : (arg_0: LockBatchesRequest) => Promise<undefined>,
  'mint_group_shares' : (arg_0: MintGroupSharesRequest) => Promise<undefined>,
  'send_batch' : (arg_0: SendBatchRequest) => Promise<undefined>,
  'transfer_group_shares' : (arg_0: TransferGroupSharesRequest) => Promise<
      undefined
    >,
  'transfer_my_group_shares' : (arg_0: TransferMyGroupSharesRequest) => Promise<
      undefined
    >,
  'update_access_config' : (arg_0: UpdateAccessConfigRequest) => Promise<
      undefined
    >,
  'update_group' : (arg_0: UpdateGroupRequest) => Promise<undefined>,
  'update_my_profile' : (arg_0: UpdateMyProfileRequest) => Promise<undefined>,
  'update_nested_voting_config' : (
      arg_0: UpdateNestedVotingConfigRequest,
    ) => Promise<undefined>,
  'update_permission' : (arg_0: UpdatePermissionRequest) => Promise<undefined>,
  'update_profile' : (arg_0: UpdateProfileRequest) => Promise<undefined>,
  'update_settings' : (arg_0: UpdateSettingsRequest) => Promise<undefined>,
  'update_voting' : (arg_0: UpdateVotingRequest) => Promise<undefined>,
  'update_voting_choice' : (arg_0: UpdateVotingChoiceRequest) => Promise<
      undefined
    >,
  'update_voting_config' : (arg_0: UpdateVotingConfigRequest) => Promise<
      undefined
    >,
}
