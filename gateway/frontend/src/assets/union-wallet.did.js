export const idlFactory = ({ IDL }) => {
  const ThresholdValue = IDL.Rec();
  const InitRequest = IDL.Record({
    'union_description' : IDL.Text,
    'wallet_creator' : IDL.Principal,
    'union_name' : IDL.Text,
    'history_ledger' : IDL.Principal,
  });
  const Shares = IDL.Nat;
  const Id = IDL.Nat64;
  const GroupId = Id;
  const AcceptMyGroupSharesRequest = IDL.Record({
    'qty' : Shares,
    'group_id' : GroupId,
  });
  const BurnGroupSharesRequest = IDL.Record({
    'qty' : Shares,
    'owner' : IDL.Principal,
    'group_id' : GroupId,
  });
  const BurnMyGroupSharesRequest = IDL.Record({
    'qty' : Shares,
    'group_id' : GroupId,
  });
  const NestedVotingId = Id;
  const ChoiceId = Id;
  const Fraction = IDL.Text;
  const SharesInfo = IDL.Record({
    'signature' : IDL.Null,
    'balance' : Shares,
    'group_id' : GroupId,
    'timestamp' : IDL.Nat64,
    'principal_id' : IDL.Principal,
    'total_supply' : Shares,
  });
  const MultiChoiceVote = IDL.Record({
    'vote' : IDL.Vec(IDL.Tuple(ChoiceId, Fraction)),
    'shares_info' : SharesInfo,
  });
  const CastMyNestedVoteRequest = IDL.Record({
    'id' : NestedVotingId,
    'vote' : MultiChoiceVote,
  });
  const VotingId = Id;
  const SingleChoiceVote = IDL.Record({ 'shares_info' : SharesInfo });
  const Vote = IDL.Variant({
    'Rejection' : SingleChoiceVote,
    'Approval' : SingleChoiceVote,
    'Common' : MultiChoiceVote,
  });
  const CastMyVoteRequest = IDL.Record({ 'id' : VotingId, 'vote' : Vote });
  const PermissionId = Id;
  const GroupCondition = IDL.Record({ 'id' : GroupId, 'min_shares' : Shares });
  const ProfileId = IDL.Principal;
  const AlloweeConstraint = IDL.Variant({
    'Group' : GroupCondition,
    'Profile' : ProfileId,
    'Everyone' : IDL.Null,
  });
  const CreateAccessConfigRequest = IDL.Record({
    'permissions' : IDL.Vec(PermissionId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'allowees' : IDL.Vec(AlloweeConstraint),
  });
  const AccessConfigId = Id;
  const CreateAccessConfigResponse = IDL.Record({ 'id' : AccessConfigId });
  const Key = IDL.Text;
  const CreateBatchRequest = IDL.Record({
    'key' : Key,
    'content_type' : IDL.Text,
  });
  const BatchId = Id;
  const CreateBatchResponse = IDL.Record({ 'batch_id' : BatchId });
  const CreateChunkRequest = IDL.Record({
    'content' : IDL.Vec(IDL.Nat8),
    'batch_id' : BatchId,
  });
  const ChunkId = Id;
  const CreateChunkResponse = IDL.Record({ 'chunk_id' : ChunkId });
  const CreateGroupRequest = IDL.Record({
    'transferable' : IDL.Bool,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'private' : IDL.Bool,
  });
  const CreateGroupResponse = IDL.Record({ 'group_id' : GroupId });
  const RemoteVotingId = IDL.Variant({
    'Nested' : NestedVotingId,
    'Common' : VotingId,
  });
  const NestedVotingConfigId = Id;
  const CreateNestedVotingRequest = IDL.Record({
    'remote_voting_id' : RemoteVotingId,
    'local_nested_voting_config_id' : NestedVotingConfigId,
    'remote_group_id' : GroupId,
  });
  const CreateNestedVotingResponse = IDL.Record({ 'id' : NestedVotingId });
  const VotingConfigId = Id;
  const RemoteVotingConfigId = IDL.Variant({
    'Nested' : NestedVotingConfigId,
    'Common' : VotingConfigId,
  });
  const NestedVoteCalculation = IDL.Variant({
    'Turnout' : IDL.Null,
    'Total' : IDL.Null,
  });
  const CreateNestedVotingConfigRequest = IDL.Record({
    'remote_union_id' : IDL.Principal,
    'remote_voting_config_id' : RemoteVotingConfigId,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'allowee_groups' : IDL.Vec(IDL.Tuple(GroupId, Fraction)),
    'vote_calculation' : NestedVoteCalculation,
  });
  const CreateNestedVotingConfigResponse = IDL.Record({
    'id' : NestedVotingConfigId,
  });
  const RemoteCallEndpoint = IDL.Record({
    'canister_id' : IDL.Principal,
    'method_name' : IDL.Text,
  });
  const PermissionTarget = IDL.Variant({
    'Endpoint' : RemoteCallEndpoint,
    'SelfEmptyProgram' : IDL.Null,
  });
  const CreatePermissionRequest = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'targets' : IDL.Vec(PermissionTarget),
  });
  const CreatePermissionResponse = IDL.Record({ 'id' : PermissionId });
  const CreateProfileRequest = IDL.Record({
    'id' : ProfileId,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const CreateVotingRequest = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'voting_config_id' : VotingConfigId,
    'winners_need' : IDL.Nat32,
  });
  const CreateVotingResponse = IDL.Record({ 'id' : VotingId });
  const RemoteCallArgs = IDL.Variant({
    'CandidString' : IDL.Vec(IDL.Text),
    'Encoded' : IDL.Vec(IDL.Nat8),
  });
  const RemoteCallPayload = IDL.Record({
    'endpoint' : RemoteCallEndpoint,
    'args' : RemoteCallArgs,
    'cycles' : IDL.Nat64,
  });
  const Program = IDL.Variant({
    'Empty' : IDL.Null,
    'RemoteCallSequence' : IDL.Vec(RemoteCallPayload),
  });
  const CreateVotingChoiceRequest = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'voting_id' : RemoteVotingId,
    'program' : Program,
  });
  const CreateVotingChoiceResponse = IDL.Record({ 'choice_id' : ChoiceId });
  const Target = IDL.Variant({
    'Group' : GroupId,
    'Thresholds' : IDL.Vec(ThresholdValue),
  });
  const FractionOf = IDL.Record({ 'fraction' : Fraction, 'target' : Target });
  const QuantityOf = IDL.Record({ 'target' : Target, 'quantity' : Shares });
  ThresholdValue.fill(
    IDL.Variant({ 'FractionOf' : FractionOf, 'QuantityOf' : QuantityOf })
  );
  const LenInterval = IDL.Record({ 'max' : IDL.Nat32, 'min' : IDL.Nat32 });
  const RoundSettings = IDL.Record({
    'round_delay' : IDL.Nat64,
    'round_duration' : IDL.Nat64,
  });
  const CreateVotingConfigRequest = IDL.Record({
    'win' : ThresholdValue,
    'winners_count' : IDL.Opt(LenInterval),
    'permissions' : IDL.Vec(PermissionId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'rejection' : ThresholdValue,
    'next_round' : ThresholdValue,
    'choices_count' : IDL.Opt(LenInterval),
    'approval' : ThresholdValue,
    'quorum' : ThresholdValue,
    'round' : RoundSettings,
  });
  const CreateVotingConfigResponse = IDL.Record({ 'id' : VotingConfigId });
  const DeclineMyGroupSharesRequest = IDL.Record({
    'qty' : Shares,
    'group_id' : GroupId,
  });
  const DeleteAccessConfigRequest = IDL.Record({ 'id' : AccessConfigId });
  const DeleteBatchesRequest = IDL.Record({ 'ids' : IDL.Vec(BatchId) });
  const DeleteGroupRequest = IDL.Record({ 'group_id' : GroupId });
  const DeleteNestedVotingRequest = IDL.Record({ 'id' : NestedVotingId });
  const DeleteNestedVotingConfigRequest = IDL.Record({
    'id' : NestedVotingConfigId,
  });
  const DeletePermissionRequest = IDL.Record({ 'id' : PermissionId });
  const DeleteProfileRequest = IDL.Record({ 'id' : ProfileId });
  const DeleteVotingRequest = IDL.Record({ 'id' : VotingId });
  const DeleteVotingChoiceRequest = IDL.Record({
    'choice_id' : ChoiceId,
    'voting_id' : RemoteVotingId,
  });
  const DeleteVotingConfigRequest = IDL.Record({ 'id' : VotingConfigId });
  const ExecuteRequest = IDL.Record({
    'access_config_id' : AccessConfigId,
    'program' : Program,
  });
  const CandidRejectionCode = IDL.Variant({
    'NoError' : IDL.Null,
    'CanisterError' : IDL.Null,
    'SysTransient' : IDL.Null,
    'DestinationInvalid' : IDL.Null,
    'Unknown' : IDL.Null,
    'SysFatal' : IDL.Null,
    'CanisterReject' : IDL.Null,
  });
  const RawCandidCallResult = IDL.Variant({
    'Ok' : IDL.Vec(IDL.Nat8),
    'Err' : IDL.Tuple(CandidRejectionCode, IDL.Text),
  });
  const ProgramExecutionResult = IDL.Variant({
    'Empty' : IDL.Null,
    'RemoteCallSequence' : IDL.Vec(RawCandidCallResult),
  });
  const ExecuteResponse = IDL.Record({ 'result' : ProgramExecutionResult });
  const QueryDelegationProof = IDL.Record({
    'signature' : IDL.Null,
    'union_id' : IDL.Principal,
    'delegate_id' : IDL.Principal,
    'allowed_query_targets' : IDL.Vec(PermissionTarget),
    'expires_at' : IDL.Nat64,
  });
  const GetAccessConfigRequest = IDL.Record({
    'id' : AccessConfigId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const AccessConfig = IDL.Record({
    'id' : IDL.Opt(AccessConfigId),
    'permissions' : IDL.Vec(PermissionId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'allowees' : IDL.Vec(AlloweeConstraint),
  });
  const GetAccessConfigResponse = IDL.Record({
    'access_config' : AccessConfig,
  });
  const GetBatchRequest = IDL.Record({
    'id' : BatchId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const Batch = IDL.Record({
    'id' : IDL.Opt(BatchId),
    'key' : Key,
    'content_type' : IDL.Text,
    'locked' : IDL.Bool,
  });
  const GetBatchResponse = IDL.Record({ 'batch' : Batch });
  const GetChunkRequest = IDL.Record({
    'chunk_id' : ChunkId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const Chunk = IDL.Record({
    'id' : IDL.Opt(ChunkId),
    'content' : IDL.Vec(IDL.Nat8),
    'batch_id' : BatchId,
  });
  const GetChunkResponse = IDL.Record({ 'chunk' : Chunk });
  const GetGroupRequest = IDL.Record({
    'group_id' : GroupId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const TokenId = Id;
  const Group = IDL.Record({
    'id' : IDL.Opt(GroupId),
    'token' : IDL.Opt(TokenId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'private' : IDL.Bool,
  });
  const GetGroupResponse = IDL.Record({ 'group' : Group });
  const GetGroupSharesBalanceOfRequest = IDL.Record({
    'owner' : IDL.Principal,
    'group_id' : GroupId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetGroupSharesBalanceOfResponse = IDL.Record({ 'balance' : Shares });
  const GetGroupsOfRequest = IDL.Record({
    'principal_id' : IDL.Principal,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetGroupsResponse = IDL.Record({ 'groups' : IDL.Vec(Group) });
  const GetMyGroupSharesBalanceRequest = IDL.Record({ 'group_id' : GroupId });
  const GetMyGroupSharesBalanceResponse = IDL.Record({ 'balance' : Shares });
  const GetMyNestedVoteRequest = IDL.Record({
    'id' : NestedVotingId,
    'group_id' : GroupId,
  });
  const GetMyNestedVoteResponse = IDL.Record({
    'my_vote' : IDL.Vec(IDL.Tuple(ChoiceId, Shares)),
  });
  const Profile = IDL.Record({
    'id' : ProfileId,
    'name' : IDL.Text,
    'description' : IDL.Text,
  });
  const GetProfileResponse = IDL.Record({ 'profile' : Profile });
  const GetMyQueryDelegationProofRequest = IDL.Record({
    'requested_targets' : IDL.Vec(PermissionTarget),
  });
  const GetMyQueryDelegationProofResponse = IDL.Record({
    'proof' : QueryDelegationProof,
  });
  const GetMySharesInfoAtRequest = IDL.Record({
    'at' : IDL.Nat64,
    'group_id' : GroupId,
  });
  const GetSharesInfoOfAtResponse = IDL.Record({
    'shares_info' : IDL.Opt(SharesInfo),
  });
  const GetMyVoteRequest = IDL.Record({
    'voting_id' : VotingId,
    'group_id' : GroupId,
  });
  const GetMyVoteResponse = IDL.Record({
    'vote' : IDL.Vec(IDL.Tuple(ChoiceId, Shares)),
  });
  const GetNestedVotingRequest = IDL.Record({
    'id' : NestedVotingId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const RoundId = IDL.Nat16;
  const RoundResult = IDL.Record({
    'choices' : IDL.Vec(ChoiceId),
    'round' : RoundId,
  });
  const NestedVoting = IDL.Record({
    'id' : IDL.Opt(NestedVotingId),
    'remote_voting_id' : RemoteVotingId,
    'losers' : IDL.Vec(RoundResult),
    'voting_config_id' : NestedVotingConfigId,
    'frozen' : IDL.Bool,
    'shares_info' : SharesInfo,
    'choices_map' : IDL.Vec(IDL.Tuple(ChoiceId, ChoiceId)),
    'choices' : IDL.Vec(ChoiceId),
    'winners' : IDL.Vec(RoundResult),
    'total_voting_power_by_group' : IDL.Vec(IDL.Tuple(GroupId, Shares)),
  });
  const GetNestedVotingResponse = IDL.Record({
    'nested_voting' : NestedVoting,
  });
  const GetNestedVotingConfigRequest = IDL.Record({
    'id' : NestedVotingConfigId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const NestedVotingConfig = IDL.Record({
    'id' : IDL.Opt(NestedVotingConfigId),
    'remote_union_id' : IDL.Principal,
    'remote_voting_config_id' : RemoteVotingConfigId,
    'name' : IDL.Text,
    'description' : IDL.Text,
    'allowee_groups' : IDL.Vec(IDL.Tuple(GroupId, Fraction)),
    'vote_calculation' : NestedVoteCalculation,
  });
  const GetNestedVotingConfigResponse = IDL.Record({
    'nested_voting_config' : NestedVotingConfig,
  });
  const GetPermissionRequest = IDL.Record({
    'id' : PermissionId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const Permission = IDL.Record({
    'id' : IDL.Opt(PermissionId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'targets' : IDL.Vec(PermissionTarget),
  });
  const GetPermissionResponse = IDL.Record({ 'permission' : Permission });
  const GetProfileRequest = IDL.Record({
    'id' : ProfileId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetSettingsRequest = IDL.Record({
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const TimestampedRecord = IDL.Record({
    'records' : IDL.Vec(IDL.Principal),
    'timestamp' : IDL.Nat64,
  });
  const Settings = IDL.Record({
    'name' : IDL.Text,
    'description' : IDL.Text,
    'history_ledgers' : IDL.Vec(TimestampedRecord),
  });
  const GetSettingsResponse = IDL.Record({ 'settings' : Settings });
  const GetSharesInfoOfAtRequest = IDL.Record({
    'at' : IDL.Nat64,
    'of' : IDL.Principal,
    'group_id' : GroupId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetTotalGroupSharesRequest = IDL.Record({
    'group_id' : GroupId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetTotalGroupSharesResponse = IDL.Record({ 'total' : Shares });
  const GetVotingRequest = IDL.Record({
    'id' : VotingId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const VotingStatus = IDL.Variant({
    'Fail' : IDL.Text,
    'PreRound' : RoundId,
    'Round' : RoundId,
    'Rejected' : IDL.Null,
    'Success' : IDL.Null,
  });
  const TaskId = Id;
  const Voting = IDL.Record({
    'id' : IDL.Opt(VotingId),
    'status' : VotingStatus,
    'updated_at' : IDL.Nat64,
    'task_id' : IDL.Opt(TaskId),
    'approval_choice' : IDL.Opt(ChoiceId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'losers' : IDL.Vec(RoundResult),
    'created_at' : IDL.Nat64,
    'voting_config_id' : VotingConfigId,
    'rejection_choice' : IDL.Opt(ChoiceId),
    'proposer' : IDL.Principal,
    'winners_need' : IDL.Nat32,
    'choices' : IDL.Vec(ChoiceId),
    'winners' : IDL.Vec(RoundResult),
    'total_voting_power_by_group' : IDL.Vec(IDL.Tuple(GroupId, Shares)),
  });
  const GetVotingResponse = IDL.Record({ 'voting' : Voting });
  const GetVotingChoiceRequest = IDL.Record({
    'choice_id' : ChoiceId,
    'voting_id' : RemoteVotingId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const Choice = IDL.Record({
    'id' : IDL.Opt(ChoiceId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'voting_id' : RemoteVotingId,
    'voting_power_by_group' : IDL.Vec(IDL.Tuple(GroupId, TokenId)),
    'program' : Program,
  });
  const GetVotingChoiceResponse = IDL.Record({ 'choice' : Choice });
  const GetVotingConfigRequest = IDL.Record({
    'id' : VotingConfigId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const VotingConfig = IDL.Record({
    'id' : IDL.Opt(VotingConfigId),
    'win' : ThresholdValue,
    'winners_count' : IDL.Opt(LenInterval),
    'permissions' : IDL.Vec(PermissionId),
    'name' : IDL.Text,
    'description' : IDL.Text,
    'rejection' : ThresholdValue,
    'next_round' : ThresholdValue,
    'choices_count' : IDL.Opt(LenInterval),
    'approval' : ThresholdValue,
    'quorum' : ThresholdValue,
    'round' : RoundSettings,
  });
  const GetVotingConfigResponse = IDL.Record({
    'voting_config' : VotingConfig,
  });
  const GetVotingResultsRequest = IDL.Record({
    'voting_id' : VotingId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const GetVotingResultsResponse = IDL.Record({
    'results' : IDL.Vec(
      IDL.Tuple(ChoiceId, IDL.Vec(IDL.Tuple(GroupId, Shares)))
    ),
  });
  const AccessConfigFilter = IDL.Record({
    'permission' : IDL.Opt(PermissionId),
    'group' : IDL.Opt(GroupId),
    'profile' : IDL.Opt(ProfileId),
  });
  const ListAccessConfigsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : AccessConfigFilter,
  });
  const ListAccessConfigsRequest = IDL.Record({
    'page_req' : ListAccessConfigsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListAccessConfigsPage = IDL.Record({
    'data' : IDL.Vec(AccessConfig),
    'has_next' : IDL.Bool,
  });
  const ListAccessConfigsResponse = IDL.Record({
    'page' : ListAccessConfigsPage,
  });
  const PageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : IDL.Null,
  });
  const ListBatchesRequest = IDL.Record({
    'page_req' : PageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListBatchesPage = IDL.Record({
    'data' : IDL.Vec(Batch),
    'has_next' : IDL.Bool,
  });
  const ListBatchesResponse = IDL.Record({ 'page' : ListBatchesPage });
  const ChunkFilter = IDL.Record({ 'batch_id' : BatchId });
  const ListChunksPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : ChunkFilter,
  });
  const ListChunksRequest = IDL.Record({
    'page_req' : ListChunksPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListChunksPage = IDL.Record({
    'data' : IDL.Vec(Chunk),
    'has_next' : IDL.Bool,
  });
  const ListChunksResponse = IDL.Record({ 'page' : ListChunksPage });
  const ListGroupSharesRequest = IDL.Record({
    'page_req' : PageRequest,
    'group_id' : GroupId,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListGroupSharesPage = IDL.Record({
    'data' : IDL.Vec(IDL.Tuple(IDL.Principal, Shares)),
    'has_next' : IDL.Bool,
  });
  const ListGroupSharesResponse = IDL.Record({ 'page' : ListGroupSharesPage });
  const ListGroupsRequest = IDL.Record({
    'page_req' : PageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListGroupsPage = IDL.Record({
    'data' : IDL.Vec(Group),
    'has_next' : IDL.Bool,
  });
  const ListGroupsResponse = IDL.Record({ 'page' : ListGroupsPage });
  const NestedVotingConfigFilter = IDL.Record({
    'remote_voting_config' : IDL.Opt(IDL.Tuple(IDL.Principal, VotingConfigId)),
    'remote_nested_voting_config' : IDL.Opt(
      IDL.Tuple(IDL.Principal, NestedVotingConfigId)
    ),
  });
  const ListNestedVotingConfigsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : NestedVotingConfigFilter,
  });
  const ListNestedVotingConfigsRequest = IDL.Record({
    'page_req' : ListNestedVotingConfigsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListNestedVotingConfigsPage = IDL.Record({
    'data' : IDL.Vec(NestedVotingConfig),
    'has_next' : IDL.Bool,
  });
  const ListNestedVotingConfigsResponse = IDL.Record({
    'page' : ListNestedVotingConfigsPage,
  });
  const NestedVotingFilter = IDL.Record({
    'nested_voting_config' : IDL.Opt(NestedVotingConfigId),
  });
  const ListNestedVotingsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : NestedVotingFilter,
  });
  const ListNestedVotingsRequest = IDL.Record({
    'page_req' : ListNestedVotingsPageRequest,
  });
  const ListNestedVotingsPage = IDL.Record({
    'data' : IDL.Vec(NestedVoting),
    'has_next' : IDL.Bool,
  });
  const ListNestedVotingsResponse = IDL.Record({
    'page' : ListNestedVotingsPage,
  });
  const PermissionFilter = IDL.Record({ 'target' : IDL.Opt(PermissionTarget) });
  const ListPermissionsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : PermissionFilter,
  });
  const ListPermissionsRequest = IDL.Record({
    'page_req' : ListPermissionsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListPermissionsPage = IDL.Record({
    'data' : IDL.Vec(Permission),
    'has_next' : IDL.Bool,
  });
  const ListPermissionsResponse = IDL.Record({ 'page' : ListPermissionsPage });
  const ListProfilesRequest = IDL.Record({
    'page_req' : PageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListProfilesPage = IDL.Record({
    'data' : IDL.Vec(Profile),
    'has_next' : IDL.Bool,
  });
  const ListProfilesResponse = IDL.Record({ 'page' : ListProfilesPage });
  const ProgramExecutionFilter = IDL.Record({
    'from_timestamp' : IDL.Opt(IDL.Nat64),
    'endpoint' : IDL.Opt(RemoteCallEndpoint),
    'to_timestamp' : IDL.Opt(IDL.Nat64),
  });
  const ListProgramExecutionEntryIdsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : ProgramExecutionFilter,
  });
  const ListProgramExecutionEntryIdsRequest = IDL.Record({
    'page_req' : ListProgramExecutionEntryIdsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListProgramExecutionEntryIdsPage = IDL.Record({
    'data' : IDL.Vec(IDL.Nat64),
    'has_next' : IDL.Bool,
  });
  const ListProgramExecutionEntryIdsResponse = IDL.Record({
    'page' : ListProgramExecutionEntryIdsPage,
    'history_ledger_canister_id' : IDL.Principal,
  });
  const ChoiceFilter = IDL.Record({ 'voting_id' : RemoteVotingId });
  const ListVotingChoicesPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : ChoiceFilter,
  });
  const ListVotingChoicesRequest = IDL.Record({
    'page_req' : ListVotingChoicesPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListVotingChoicesPage = IDL.Record({
    'data' : IDL.Vec(Choice),
    'has_next' : IDL.Bool,
  });
  const ListVotingChoicesResponse = IDL.Record({
    'page' : ListVotingChoicesPage,
  });
  const VotingConfigFilter = IDL.Record({
    'permission' : IDL.Opt(PermissionId),
    'group' : IDL.Opt(GroupId),
  });
  const ListVotingConfigsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Null,
    'filter' : VotingConfigFilter,
  });
  const ListVotingConfigsRequest = IDL.Record({
    'page_req' : ListVotingConfigsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListVotingConfigsPage = IDL.Record({
    'data' : IDL.Vec(VotingConfig),
    'has_next' : IDL.Bool,
  });
  const ListVotingConfigsResponse = IDL.Record({
    'page' : ListVotingConfigsPage,
  });
  const VotingSort = IDL.Variant({
    'UpdatedAt' : IDL.Bool,
    'None' : IDL.Null,
    'CreatedAt' : IDL.Bool,
  });
  const ListVotingsPageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : VotingSort,
    'filter' : IDL.Null,
  });
  const ListVotingsRequest = IDL.Record({
    'page_req' : ListVotingsPageRequest,
    'query_delegation_proof_opt' : IDL.Opt(QueryDelegationProof),
  });
  const ListVotingsPage = IDL.Record({
    'data' : IDL.Vec(Voting),
    'has_next' : IDL.Bool,
  });
  const ListVotingsResponse = IDL.Record({ 'page' : ListVotingsPage });
  const LockBatchesRequest = IDL.Record({ 'ids' : IDL.Vec(BatchId) });
  const MintGroupSharesRequest = IDL.Record({
    'qty' : Shares,
    'owner' : IDL.Principal,
    'group_id' : GroupId,
  });
  const SendBatchRequest = IDL.Record({
    'batch_id' : BatchId,
    'target_canister' : IDL.Principal,
  });
  const TransferGroupSharesRequest = IDL.Record({
    'to' : IDL.Principal,
    'qty' : Shares,
    'from' : IDL.Principal,
    'group_id' : GroupId,
  });
  const TransferMyGroupSharesRequest = IDL.Record({
    'to' : IDL.Principal,
    'qty' : Shares,
    'group_id' : GroupId,
  });
  const UpdateAccessConfigRequest = IDL.Record({
    'id' : AccessConfigId,
    'new_description' : IDL.Opt(IDL.Text),
    'new_allowees' : IDL.Opt(IDL.Vec(AlloweeConstraint)),
    'new_name' : IDL.Opt(IDL.Text),
    'new_permissions' : IDL.Opt(IDL.Vec(PermissionId)),
  });
  const UpdateGroupRequest = IDL.Record({
    'new_description' : IDL.Opt(IDL.Text),
    'new_name' : IDL.Opt(IDL.Text),
    'group_id' : GroupId,
  });
  const UpdateMyProfileRequest = IDL.Record({
    'new_description' : IDL.Opt(IDL.Text),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateNestedVotingConfigRequest = IDL.Record({
    'id' : NestedVotingConfigId,
    'description_opt' : IDL.Opt(IDL.Text),
    'name_opt' : IDL.Opt(IDL.Text),
    'vote_calculation_opt' : IDL.Opt(NestedVoteCalculation),
    'allowee_groups_opt' : IDL.Opt(IDL.Vec(IDL.Tuple(GroupId, Fraction))),
  });
  const UpdatePermissionRequest = IDL.Record({
    'id' : PermissionId,
    'new_description' : IDL.Opt(IDL.Text),
    'new_targets' : IDL.Opt(IDL.Vec(PermissionTarget)),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateProfileRequest = IDL.Record({
    'id' : ProfileId,
    'new_description' : IDL.Opt(IDL.Text),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateSettingsRequest = IDL.Record({
    'new_description' : IDL.Opt(IDL.Text),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateVotingRequest = IDL.Record({
    'id' : VotingId,
    'new_description' : IDL.Opt(IDL.Text),
    'new_winners_need' : IDL.Opt(IDL.Nat32),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateVotingChoiceRequest = IDL.Record({
    'new_description' : IDL.Opt(IDL.Text),
    'choice_id' : ChoiceId,
    'new_program' : IDL.Opt(Program),
    'new_name' : IDL.Opt(IDL.Text),
  });
  const UpdateVotingConfigRequest = IDL.Record({
    'id' : VotingConfigId,
    'description_opt' : IDL.Opt(IDL.Text),
    'next_round_opt' : IDL.Opt(ThresholdValue),
    'name_opt' : IDL.Opt(IDL.Text),
    'quorum_opt' : IDL.Opt(ThresholdValue),
    'approval_opt' : IDL.Opt(ThresholdValue),
    'round_opt' : IDL.Opt(RoundSettings),
    'choices_count_opt' : IDL.Opt(IDL.Opt(LenInterval)),
    'winners_count_opt' : IDL.Opt(IDL.Opt(LenInterval)),
    'rejection_opt' : IDL.Opt(ThresholdValue),
    'win_opt' : IDL.Opt(ThresholdValue),
    'permissions_opt' : IDL.Opt(IDL.Vec(PermissionId)),
  });
  return IDL.Service({
    'accept_my_group_shares' : IDL.Func([AcceptMyGroupSharesRequest], [], []),
    'burn_group_shares' : IDL.Func([BurnGroupSharesRequest], [], []),
    'burn_my_group_shares' : IDL.Func([BurnMyGroupSharesRequest], [], []),
    'burn_unaccepted_group_shares' : IDL.Func([BurnGroupSharesRequest], [], []),
    'cast_my_nested_vote' : IDL.Func([CastMyNestedVoteRequest], [], []),
    'cast_my_vote' : IDL.Func([CastMyVoteRequest], [], []),
    'create_access_config' : IDL.Func(
        [CreateAccessConfigRequest],
        [CreateAccessConfigResponse],
        [],
      ),
    'create_batch' : IDL.Func([CreateBatchRequest], [CreateBatchResponse], []),
    'create_chunk' : IDL.Func([CreateChunkRequest], [CreateChunkResponse], []),
    'create_group' : IDL.Func([CreateGroupRequest], [CreateGroupResponse], []),
    'create_nested_voting' : IDL.Func(
        [CreateNestedVotingRequest],
        [CreateNestedVotingResponse],
        [],
      ),
    'create_nested_voting_config' : IDL.Func(
        [CreateNestedVotingConfigRequest],
        [CreateNestedVotingConfigResponse],
        [],
      ),
    'create_permission' : IDL.Func(
        [CreatePermissionRequest],
        [CreatePermissionResponse],
        [],
      ),
    'create_profile' : IDL.Func([CreateProfileRequest], [], []),
    'create_voting' : IDL.Func(
        [CreateVotingRequest],
        [CreateVotingResponse],
        [],
      ),
    'create_voting_choice' : IDL.Func(
        [CreateVotingChoiceRequest],
        [CreateVotingChoiceResponse],
        [],
      ),
    'create_voting_config' : IDL.Func(
        [CreateVotingConfigRequest],
        [CreateVotingConfigResponse],
        [],
      ),
    'decline_my_group_shares' : IDL.Func([DeclineMyGroupSharesRequest], [], []),
    'delete_access_config' : IDL.Func([DeleteAccessConfigRequest], [], []),
    'delete_batches' : IDL.Func([DeleteBatchesRequest], [], []),
    'delete_group' : IDL.Func([DeleteGroupRequest], [], []),
    'delete_nested_voting' : IDL.Func([DeleteNestedVotingRequest], [], []),
    'delete_nested_voting_config' : IDL.Func(
        [DeleteNestedVotingConfigRequest],
        [],
        [],
      ),
    'delete_permission' : IDL.Func([DeletePermissionRequest], [], []),
    'delete_profile' : IDL.Func([DeleteProfileRequest], [], []),
    'delete_unlocked_batches' : IDL.Func([DeleteBatchesRequest], [], []),
    'delete_voting' : IDL.Func([DeleteVotingRequest], [], []),
    'delete_voting_choice' : IDL.Func([DeleteVotingChoiceRequest], [], []),
    'delete_voting_config' : IDL.Func([DeleteVotingConfigRequest], [], []),
    'execute' : IDL.Func([ExecuteRequest], [ExecuteResponse], []),
    'get_access_config' : IDL.Func(
        [GetAccessConfigRequest],
        [GetAccessConfigResponse],
        ['query'],
      ),
    'get_batch' : IDL.Func([GetBatchRequest], [GetBatchResponse], ['query']),
    'get_chunk' : IDL.Func([GetChunkRequest], [GetChunkResponse], ['query']),
    'get_group' : IDL.Func([GetGroupRequest], [GetGroupResponse], ['query']),
    'get_group_shares_balance_of' : IDL.Func(
        [GetGroupSharesBalanceOfRequest],
        [GetGroupSharesBalanceOfResponse],
        ['query'],
      ),
    'get_groups_of' : IDL.Func(
        [GetGroupsOfRequest],
        [GetGroupsResponse],
        ['query'],
      ),
    'get_my_group_shares_balance' : IDL.Func(
        [GetMyGroupSharesBalanceRequest],
        [GetMyGroupSharesBalanceResponse],
        ['query'],
      ),
    'get_my_groups' : IDL.Func([], [GetGroupsResponse], ['query']),
    'get_my_nested_vote' : IDL.Func(
        [GetMyNestedVoteRequest],
        [GetMyNestedVoteResponse],
        ['query'],
      ),
    'get_my_profile' : IDL.Func([], [GetProfileResponse], ['query']),
    'get_my_query_delegation_proof' : IDL.Func(
        [GetMyQueryDelegationProofRequest],
        [GetMyQueryDelegationProofResponse],
        ['query'],
      ),
    'get_my_shares_info_at' : IDL.Func(
        [GetMySharesInfoAtRequest],
        [GetSharesInfoOfAtResponse],
        [],
      ),
    'get_my_unaccepted_group_shares_balance' : IDL.Func(
        [GetMyGroupSharesBalanceRequest],
        [GetMyGroupSharesBalanceResponse],
        ['query'],
      ),
    'get_my_vote' : IDL.Func(
        [GetMyVoteRequest],
        [GetMyVoteResponse],
        ['query'],
      ),
    'get_nested_voting' : IDL.Func(
        [GetNestedVotingRequest],
        [GetNestedVotingResponse],
        ['query'],
      ),
    'get_nested_voting_config' : IDL.Func(
        [GetNestedVotingConfigRequest],
        [GetNestedVotingConfigResponse],
        ['query'],
      ),
    'get_permission' : IDL.Func(
        [GetPermissionRequest],
        [GetPermissionResponse],
        ['query'],
      ),
    'get_profile' : IDL.Func(
        [GetProfileRequest],
        [GetProfileResponse],
        ['query'],
      ),
    'get_settings' : IDL.Func(
        [GetSettingsRequest],
        [GetSettingsResponse],
        ['query'],
      ),
    'get_shares_info_of_at' : IDL.Func(
        [GetSharesInfoOfAtRequest],
        [GetSharesInfoOfAtResponse],
        [],
      ),
    'get_total_group_shares' : IDL.Func(
        [GetTotalGroupSharesRequest],
        [GetTotalGroupSharesResponse],
        ['query'],
      ),
    'get_total_unaccepted_group_shares' : IDL.Func(
        [GetTotalGroupSharesRequest],
        [GetTotalGroupSharesResponse],
        ['query'],
      ),
    'get_unaccepted_group_shares_balance_of' : IDL.Func(
        [GetGroupSharesBalanceOfRequest],
        [GetGroupSharesBalanceOfResponse],
        ['query'],
      ),
    'get_voting' : IDL.Func([GetVotingRequest], [GetVotingResponse], ['query']),
    'get_voting_choice' : IDL.Func(
        [GetVotingChoiceRequest],
        [GetVotingChoiceResponse],
        ['query'],
      ),
    'get_voting_config' : IDL.Func(
        [GetVotingConfigRequest],
        [GetVotingConfigResponse],
        ['query'],
      ),
    'get_voting_results' : IDL.Func(
        [GetVotingResultsRequest],
        [GetVotingResultsResponse],
        ['query'],
      ),
    'list_access_configs' : IDL.Func(
        [ListAccessConfigsRequest],
        [ListAccessConfigsResponse],
        ['query'],
      ),
    'list_batches' : IDL.Func(
        [ListBatchesRequest],
        [ListBatchesResponse],
        ['query'],
      ),
    'list_chunks' : IDL.Func(
        [ListChunksRequest],
        [ListChunksResponse],
        ['query'],
      ),
    'list_group_shares' : IDL.Func(
        [ListGroupSharesRequest],
        [ListGroupSharesResponse],
        ['query'],
      ),
    'list_groups' : IDL.Func(
        [ListGroupsRequest],
        [ListGroupsResponse],
        ['query'],
      ),
    'list_nested_voting_configs' : IDL.Func(
        [ListNestedVotingConfigsRequest],
        [ListNestedVotingConfigsResponse],
        ['query'],
      ),
    'list_nested_votings' : IDL.Func(
        [ListNestedVotingsRequest],
        [ListNestedVotingsResponse],
        ['query'],
      ),
    'list_permissions' : IDL.Func(
        [ListPermissionsRequest],
        [ListPermissionsResponse],
        ['query'],
      ),
    'list_profiles' : IDL.Func(
        [ListProfilesRequest],
        [ListProfilesResponse],
        ['query'],
      ),
    'list_program_execution_entry_ids' : IDL.Func(
        [ListProgramExecutionEntryIdsRequest],
        [ListProgramExecutionEntryIdsResponse],
        [],
      ),
    'list_unaccepted_group_shares' : IDL.Func(
        [ListGroupSharesRequest],
        [ListGroupSharesResponse],
        ['query'],
      ),
    'list_voting_choices' : IDL.Func(
        [ListVotingChoicesRequest],
        [ListVotingChoicesResponse],
        ['query'],
      ),
    'list_voting_configs' : IDL.Func(
        [ListVotingConfigsRequest],
        [ListVotingConfigsResponse],
        ['query'],
      ),
    'list_votings' : IDL.Func(
        [ListVotingsRequest],
        [ListVotingsResponse],
        ['query'],
      ),
    'lock_batches' : IDL.Func([LockBatchesRequest], [], []),
    'mint_group_shares' : IDL.Func([MintGroupSharesRequest], [], []),
    'send_batch' : IDL.Func([SendBatchRequest], [], []),
    'transfer_group_shares' : IDL.Func([TransferGroupSharesRequest], [], []),
    'transfer_my_group_shares' : IDL.Func(
        [TransferMyGroupSharesRequest],
        [],
        [],
      ),
    'update_access_config' : IDL.Func([UpdateAccessConfigRequest], [], []),
    'update_group' : IDL.Func([UpdateGroupRequest], [], []),
    'update_my_profile' : IDL.Func([UpdateMyProfileRequest], [], []),
    'update_nested_voting_config' : IDL.Func(
        [UpdateNestedVotingConfigRequest],
        [],
        [],
      ),
    'update_permission' : IDL.Func([UpdatePermissionRequest], [], []),
    'update_profile' : IDL.Func([UpdateProfileRequest], [], []),
    'update_settings' : IDL.Func([UpdateSettingsRequest], [], []),
    'update_voting' : IDL.Func([UpdateVotingRequest], [], []),
    'update_voting_choice' : IDL.Func([UpdateVotingChoiceRequest], [], []),
    'update_voting_config' : IDL.Func([UpdateVotingConfigRequest], [], []),
  });
};
export const init = ({ IDL }) => {
  const InitRequest = IDL.Record({
    'union_description' : IDL.Text,
    'wallet_creator' : IDL.Principal,
    'union_name' : IDL.Text,
    'history_ledger' : IDL.Principal,
  });
  return [InitRequest];
};
