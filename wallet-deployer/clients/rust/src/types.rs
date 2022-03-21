use ic_cdk::export::candid::{CandidType, Deserialize};

pub type Blob = Vec<u8>;

#[derive(Clone, CandidType, Deserialize)]
pub struct SpawnRequest {
	pub wasm_module: Blob,
}

#[derive(Clone, CandidType, Deserialize)]
pub struct UpdateCodeRequest {
	pub wasm_module: Blob,
}