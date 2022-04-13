use candid::{CandidType, Deserialize, IDLArgs};
use ic_cdk::api::call::{CallResult, RejectionCode};

pub type Blob = Vec<u8>;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub enum CandidRejectionCode {
    NoError,

    SysFatal,
    SysTransient,
    DestinationInvalid,
    CanisterReject,
    CanisterError,

    Unknown,
}

impl CandidRejectionCode {
    pub fn from_common(rej_code: RejectionCode) -> Self {
        match rej_code {
            RejectionCode::NoError => Self::NoError,
            RejectionCode::SysFatal => Self::SysFatal,
            RejectionCode::SysTransient => Self::SysTransient,
            RejectionCode::DestinationInvalid => Self::DestinationInvalid,
            RejectionCode::CanisterReject => Self::CanisterReject,
            RejectionCode::CanisterError => Self::CanisterError,
            RejectionCode::Unknown => Self::Unknown,
        }
    }
}

pub type CandidCallResult<T> = Result<T, (CandidRejectionCode, String)>;

pub trait ToCandidType<T: CandidType> {
    fn to_candid_type(self) -> T;
}

impl<T: CandidType> ToCandidType<CandidCallResult<T>> for CallResult<T> {
    fn to_candid_type(self) -> Result<T, (CandidRejectionCode, String)> {
        match self {
            Ok(t) => Ok(t),
            Err((rej_code, string)) => Err((CandidRejectionCode::from_common(rej_code), string)),
        }
    }
}

pub trait ToDecodedCandidType {
    fn to_decoded(self) -> CandidCallResult<String>;
}

impl ToDecodedCandidType for CandidCallResult<Vec<u8>> {
    fn to_decoded(self) -> CandidCallResult<String> {
        match self {
            Ok(blob) => Ok(IDLArgs::from_bytes(&blob)
                .expect("Unable to decode call result")
                .to_string()),
            Err(e) => Err(e),
        }
    }
}
