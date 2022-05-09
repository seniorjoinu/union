use crate::candid::{CandidCallResult, ToCandidType};
use crate::types::Blob;
use crate::validation::ValidationError;
use candid::parser::value::IDLValue;
use candid::ser::IDLBuilder;
use candid::utils::{ArgumentDecoder, ArgumentEncoder};
use candid::{decode_args, encode_args, CandidType, Deserialize, Principal};
use ic_cdk::api::call::call_raw;
use ic_cdk::id;

const WILDCARD: &str = "*";

#[derive(CandidType, Deserialize, Debug, Clone, Eq, PartialEq, Ord, PartialOrd, Hash)]
pub struct RemoteCallEndpoint {
    pub canister_id: Principal,
    pub method_name: String,
}

impl RemoteCallEndpoint {
    pub fn new(canister_id: Principal, method_name: &str) -> Self {
        Self {
            canister_id,
            method_name: String::from(method_name),
        }
    }
    
    pub fn wildcard(canister_id: Principal) -> Self {
        Self {
            canister_id,
            method_name: String::from(WILDCARD)
        }
    }
    
    pub fn is_wildcard(&self) -> bool {
        self.method_name == WILDCARD
    }
    
    pub fn to_wildcard(&self) -> Self {
        Self {
            canister_id: self.canister_id,
            method_name: String::from(WILDCARD)
        }
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum RemoteCallArgs {
    CandidString(Vec<String>),
    Encoded(Blob),
}

impl RemoteCallArgs {
    pub fn validate(&self) -> Result<(), ValidationError> {
        match self {
            RemoteCallArgs::CandidString(str_args) => {
                for (i, arg) in str_args.iter().enumerate() {
                    arg.parse::<IDLValue>().map_err(|e| {
                        ValidationError(format!("Invalid argument #{}: {:?}", i, e))
                    })?;
                }

                Ok(())
            }
            _ => Ok(()),
        }
    }

    pub fn serialize_args(&self) -> Result<Vec<u8>, ValidationError> {
        match self {
            RemoteCallArgs::CandidString(str_args) => {
                let mut builder = IDLBuilder::new();

                for (i, arg) in str_args.iter().enumerate() {
                    let idl_arg = arg.parse::<IDLValue>().map_err(|e| {
                        ValidationError(format!("Invalid argument #{}: {:?}", i, e))
                    })?;

                    builder.value_arg(&idl_arg).map_err(|e| {
                        ValidationError(format!("Builder error on argument #{}: {:?}", i, e))
                    })?;
                }

                builder
                    .serialize_to_vec()
                    .map_err(|e| ValidationError(format!("Arguments serialization failed {:?}", e)))
            }
            RemoteCallArgs::Encoded(blob) => Ok(blob.clone()),
        }
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct RemoteCallPayload {
    pub endpoint: RemoteCallEndpoint,
    pub args: RemoteCallArgs,
    pub cycles: u64,
}

impl RemoteCallPayload {
    pub fn new(
        canister_id: Principal,
        method_name: &str,
        args: RemoteCallArgs,
        cycles: u64,
    ) -> Self {
        Self {
            endpoint: RemoteCallEndpoint {
                canister_id,
                method_name: String::from(method_name),
            },
            args,
            cycles,
        }
    }

    pub fn new_encode<Tuple: ArgumentEncoder>(
        canister_id: Principal,
        method_name: &str,
        args: Tuple,
        cycles: u64,
    ) -> Self {
        Self {
            endpoint: RemoteCallEndpoint {
                canister_id,
                method_name: String::from(method_name),
            },
            args: RemoteCallArgs::Encoded(encode_args(args).expect("Unable to encode args")),
            cycles,
        }
    }

    pub async fn do_call<Tuple: ArgumentDecoderOwned>(&self) -> CandidCallResult<Tuple> {
        let res = self.do_call_raw().await?;

        Ok(decode_args(&res).expect("Failed to decode the response"))
    }

    pub async fn do_call_raw(&self) -> CandidCallResult<Vec<u8>> {
        call_raw(
            self.endpoint.canister_id,
            &self.endpoint.method_name,
            &self.args.serialize_args().unwrap(), // call "validate" on args to check for errors
            self.cycles,
        )
        .await
        .to_candid_type()
    }
}

pub trait ArgumentDecoderOwned: for<'de> ArgumentDecoder<'de> {}

impl<T> ArgumentDecoderOwned for T where T: for<'de> ArgumentDecoder<'de> {}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum Program {
    Empty,
    RemoteCallSequence(Vec<RemoteCallPayload>),
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum ProgramExecutionResult {
    Empty,
    RemoteCallSequence(Vec<CandidCallResult<Blob>>),
}

impl Program {
    pub fn validate(&self) -> Result<(), ValidationError> {
        match self {
            Program::Empty => Ok(()),
            Program::RemoteCallSequence(seq) => {
                for call in seq {
                    call.args.validate()?;
                }

                Ok(())
            }
        }
    }

    pub async fn execute(&self) -> ProgramExecutionResult {
        match self {
            Program::Empty => ProgramExecutionResult::Empty,
            Program::RemoteCallSequence(seq) => {
                let mut results = vec![];

                for call in seq {
                    let result = call.do_call_raw().await;

                    if result.is_err() {
                        results.push(result);
                        break;
                    } else {
                        results.push(result);
                    }
                }

                ProgramExecutionResult::RemoteCallSequence(results)
            }
        }
    }
}
