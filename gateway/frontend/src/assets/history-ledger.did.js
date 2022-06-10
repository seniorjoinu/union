export const idlFactory = ({ IDL }) => {
  const GetProgramExecutionEntryMetaRequest = IDL.Record({ 'id' : IDL.Nat64 });
  const Id = IDL.Nat64;
  const VotingConfigId = Id;
  const AccessConfigId = Id;
  const ProgramExecutedWith = IDL.Variant({
    'WithVotingConfig' : VotingConfigId,
    'WithAccessConfig' : AccessConfigId,
  });
  const GetProgramExecutionEntryMetaResponse = IDL.Record({
    'initiator' : IDL.Principal,
    'program_executed_with' : ProgramExecutedWith,
  });
  const GetProgramExecutionEntryProgramRequest = IDL.Record({
    'id' : IDL.Nat64,
  });
  const RemoteCallEndpoint = IDL.Record({
    'canister_id' : IDL.Principal,
    'method_name' : IDL.Text,
  });
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
  const GetProgramExecutionEntryProgramResponse = IDL.Record({
    'program' : IDL.Opt(Program),
  });
  const GetProgramExecutionEntryResultRequest = IDL.Record({
    'id' : IDL.Nat64,
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
  const GetProgramExecutionEntryResultResponse = IDL.Record({
    'result' : IDL.Opt(ProgramExecutionResult),
  });
  const GroupId = Id;
  const GetSharesInfoOfAtRequest = IDL.Record({
    'at' : IDL.Nat64,
    'of' : IDL.Principal,
    'group_id' : GroupId,
  });
  const Shares = IDL.Nat;
  const SharesInfo = IDL.Record({
    'signature' : IDL.Empty,
    'balance' : Shares,
    'group_id' : GroupId,
    'timestamp' : IDL.Nat64,
    'principal_id' : IDL.Principal,
    'total_supply' : Shares,
  });
  const GetSharesInfoOfAtResponse = IDL.Record({
    'info_opt' : IDL.Opt(SharesInfo),
  });
  const ProgramExecutionFilter = IDL.Record({
    'from_timestamp' : IDL.Opt(IDL.Nat64),
    'endpoint' : IDL.Opt(RemoteCallEndpoint),
    'to_timestamp' : IDL.Opt(IDL.Nat64),
  });
  const PageRequest = IDL.Record({
    'page_size' : IDL.Nat32,
    'page_index' : IDL.Nat32,
    'sort' : IDL.Empty,
    'filter' : ProgramExecutionFilter,
  });
  const ListProgramExecutionEntryIdsRequest = IDL.Record({
    'page_req' : PageRequest,
  });
  const Page = IDL.Record({
    'data' : IDL.Vec(IDL.Nat64),
    'has_next' : IDL.Bool,
  });
  const ListProgramExecutionEntryIdsResponse = IDL.Record({ 'page' : Page });
  return IDL.Service({
    'get_program_execution_entry_meta' : IDL.Func(
        [GetProgramExecutionEntryMetaRequest],
        [GetProgramExecutionEntryMetaResponse],
        ['query'],
      ),
    'get_program_execution_entry_program' : IDL.Func(
        [GetProgramExecutionEntryProgramRequest],
        [GetProgramExecutionEntryProgramResponse],
        ['query'],
      ),
    'get_program_execution_entry_result' : IDL.Func(
        [GetProgramExecutionEntryResultRequest],
        [GetProgramExecutionEntryResultResponse],
        ['query'],
      ),
    'get_shares_info_of_at' : IDL.Func(
        [GetSharesInfoOfAtRequest],
        [GetSharesInfoOfAtResponse],
        ['query'],
      ),
    'list_program_execution_entry_ids' : IDL.Func(
        [ListProgramExecutionEntryIdsRequest],
        [ListProgramExecutionEntryIdsResponse],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return [IDL.Principal]; };
