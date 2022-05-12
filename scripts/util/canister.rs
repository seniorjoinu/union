use std::{sync::Arc, fs, fmt::Debug};
use clap::{Parser};
use candid::{IDLArgs};
use ic_agent::{agent::AgentConfig, Agent, NonceFactory};
use ic_agent::agent::http_transport::ReqwestHttpReplicaV2Transport;
use candid::{CandidType, Deserialize};
use ic_types::Principal;
use garcon::Delay;
use std::time::Duration;
use crate::utils;

#[derive(Parser)]
#[clap(name("canister"))]
pub struct CanisterOpts {
    canister_id: String,
    method_name: String,
    filename: Option<String>,

		#[clap(long)]
    wallet: Option<String>,

    #[clap(long)]
    with_cycles: Option<String>,

    #[clap(long, possible_values(&["ic"]))]
    network: Option<String>,
}

#[derive(Debug, CandidType, Deserialize)]
struct CallIn {
    canister: Principal,
    method_name: String,
    #[serde(with = "serde_bytes")]
    args: Vec<u8>,
    cycles: u64,
}

pub async fn execute(opts: CanisterOpts) {
	let canister_id_str = opts.canister_id.as_str();
	let canister_id = Principal::from_text(&canister_id_str).expect("Wrong canister id");

	let cycles = opts
		.with_cycles
		.as_deref()
		.map_or(0_u64, |amount| amount.parse::<u64>().unwrap());

	let method_name = opts.method_name.as_str();
	let url = match opts.network {
			Some(_) => String::from("https://ic0.app"),
			None => String::from("http://localhost:8000"),
	};
	let should_fetch_root_key = url.contains("localhost") || url.contains("127.0.0.1");
	let mut arguments = String::from("");

	if let Some(filename) = opts.filename.as_deref() {
			arguments = fs::read_to_string(utils::abspath(filename).unwrap())
					.expect("Something went wrong reading the file");
	}
	
	let identity = utils::get_identity();

	let transport = ReqwestHttpReplicaV2Transport::create(url).unwrap();
	let agent = Agent::new(AgentConfig {
			identity: Arc::new(identity),
			nonce_factory: Arc::new(NonceFactory::random()),
			transport: Some(Arc::new(transport)),
			ingress_expiry_duration: None,
	}).expect("Unable to create agent");

	if should_fetch_root_key {
			agent.fetch_root_key().await.expect("Cannot fetch root key");
	}
	
	let arg_value = candid::pretty_parse::<IDLArgs>("Candid argument", arguments.as_str())
			.expect("Cannot parse argument")
			.to_bytes()
			.expect("Cannot convert parsed argument to bytes");
	
	let blob = match opts.wallet {
		Some(wallet) => {
			let wallet_id_str = wallet.as_str().replace("--wallet=", "");
			let wallet_id = Principal::from_text(&wallet_id_str.trim()).unwrap();

			let arg = CallIn {
				canister: canister_id,
				method_name: String::from(method_name),
				args: arg_value,
				cycles,
			};
			let arg_wallet_value = candid::encode_one(arg)
				.expect("Cannot encode CallIn argument");

			agent.update(&wallet_id, "wallet_call")
			.with_arg(&arg_wallet_value)
			.call_and_wait(waiter_with_exponential_backoff())
			.await
		},
		None => agent.update(&canister_id, method_name)
			.with_arg(&arg_value)
			.call_and_wait(waiter_with_exponential_backoff())
			.await
	}.expect("Error while call");

	let result_str = IDLArgs::from_bytes(&blob)
		.expect("Unable to decode call result")
		.to_string();
	println!("{:?}", result_str);
}

const RETRY_PAUSE: Duration = Duration::from_millis(200);
const MAX_RETRY_PAUSE: Duration = Duration::from_secs(1);

pub fn waiter_with_exponential_backoff() -> Delay {
	Delay::builder()
			.exponential_backoff_capped(RETRY_PAUSE, 1.4, MAX_RETRY_PAUSE)
			.build()
}
