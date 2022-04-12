
use clap::{Parser};
use std::io::{Write};
use candid::IDLArgs;
use std::fs;
use crate::utils;

#[derive(Parser)]
#[clap(name("did"))]
pub struct CandidOpts {
	argument: String,

	#[clap(long, possible_values(&["file", "content", "string"]))]
	mode: String,
}

pub async fn execute(opts: CandidOpts) {
	let arg = opts.argument;

	let hex = match opts.mode.as_str() {
		"file" => {
			let bytes = utils::get_file_as_byte_vec(&utils::abspath(arg.as_str()).unwrap());

			let res = hex::encode(bytes);

			return std::io::stdout().write_all(res.as_bytes()).unwrap();
		},
		"content" => {
			// NOT USED
			let content = fs::read_to_string(utils::abspath(arg.as_str()).unwrap())
					.expect("Something went wrong reading the file");

			candid::pretty_parse::<IDLArgs>("Candid argument", content.as_str())
				.map_err(|e| format!("Invalid Candid values: {}", e))
				.unwrap()
				.to_string()
		},
		_ => {
			// NOT USED
			candid::pretty_parse::<IDLArgs>("Candid argument", &arg)
				.map_err(|e| format!("Invalid Candid values: {}", e))
				.unwrap()
				.to_string()
		},
	};

	std::io::stdout().write_all(hex.as_bytes()).unwrap();
}
