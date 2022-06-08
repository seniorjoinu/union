use candid::{encode_one, CandidType, Deserialize, Nat, Principal};

pub type GroupId = u64;
pub type AccessConfigId = u64;
pub type Shares = Nat;
pub type Blob = Vec<u8>;

#[derive(CandidType, Deserialize)]
pub struct MintGroupSharesRequest {
    pub group_id: GroupId,
    pub owner: Principal,
    pub qty: Shares,
}

#[derive(CandidType, Deserialize)]
pub struct ExecuteRequest {
    pub access_config_id: AccessConfigId,
    pub program: Program,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum Program {
    Empty,
    RemoteCallSequence(Vec<RemoteCallPayload>),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct RemoteCallPayload {
    pub endpoint: RemoteCallEndpoint,
    pub args: RemoteCallArgs,
    pub cycles: u64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum RemoteCallArgs {
    CandidString(Vec<String>),
    Encoded(Blob),
}

#[derive(CandidType, Deserialize, Debug, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct RemoteCallEndpoint {
    pub canister_id: Principal,
    pub method_name: String,
}

pub fn create_execute_request(
    union_id: Principal,
    group_id: GroupId,
    access_config_id: AccessConfigId,
    member_id: Principal,
    qty_to_mint: Shares,
) -> Vec<u8> {
    let mint_shares_request = encode_one(MintGroupSharesRequest {
        group_id,
        owner: member_id,
        qty: qty_to_mint,
    })
    .expect("Unable to encode mint shares request");

    let it = ExecuteRequest {
        access_config_id,
        program: Program::RemoteCallSequence(vec![RemoteCallPayload {
            endpoint: RemoteCallEndpoint {
                canister_id: union_id,
                method_name: String::from("mint_group_shares"),
            },
            args: RemoteCallArgs::Encoded(mint_shares_request),
            cycles: 0,
        }]),
    };

    encode_one(it).expect("Unable to encode execute request")
}
