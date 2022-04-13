
use clap::{Parser};
use std::io::{Write};
use candid::{IDLArgs, types::Label, parser::value::IDLValue};
use std::fs;
use crate::utils;

#[derive(Parser)]
#[clap(name("did"))]
pub struct CandidOpts {
	#[clap(subcommand)]
	command: Command,
}

#[derive(clap::Subcommand)]
pub enum Command {
    Encode(CandidEncodeOpts),
    Get(CandidGetOpts),
}

#[derive(Parser)]
#[clap(name("encode"))]
pub struct CandidEncodeOpts {
	argument: String,

	#[clap(long, possible_values(&["file", "blob", "content", "string"]))]
	mode: String,
}

#[derive(Parser)]
#[clap(name("get"))]
pub struct CandidGetOpts {
	argument: String,
	selector: String,
}

pub async fn execute(opts: CandidOpts) {
	match opts.command {
			Command::Encode(v) => encode(v).await,
			Command::Get(v) => get(v).await,
	}
}

pub async fn encode(opts: CandidEncodeOpts) {
	let arg = opts.argument;

	let hex = match opts.mode.as_str() {
		"file" => {
			let bytes = utils::get_file_as_byte_vec(&utils::abspath(arg.as_str()).unwrap());

			let res = hex::encode(bytes);

			return std::io::stdout().write_all(res.as_bytes()).unwrap();
		},
		"blob" => {
			let bytes = utils::get_file_as_byte_vec(&utils::abspath(arg.as_str()).unwrap());

			let mut res = String::new();
			for ch in bytes.iter() {
					res.push_str(&candid::parser::pretty::pp_char(*ch));
			}
			res
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

pub async fn get(opts: CandidGetOpts) {
	let arg = opts.argument;
	let mut selectors = opts.selector.split('.');

	let bytes = candid::pretty_parse::<IDLArgs>("Candid argument", arg.as_str())
		.map_err(|e| format!("Invalid Candid values: {}", e))
		.unwrap()
		.to_bytes()
		.unwrap();

	let decoded = match IDLArgs::from_bytes(&bytes) {
		Ok(_v) => _v,
		Err(_) => return,
	};

	let mut value: &IDLValue;

	let index_selector = selectors
		.next()
		.ok_or(format!("Invalid selector start index"))
		.unwrap();
	let index = index_selector.parse::<usize>()
		.ok()
		.ok_or(format!("Invalid selector start index"))
		.unwrap();

	value = &decoded.args
		.get(index)
		.ok_or(format!("Invalid first selector '{}'", index_selector))
		.unwrap();

	selectors.for_each(|x| {
		match value {
			candid::parser::value::IDLValue::Record(record) => {
				let field_id = candid::idl_hash(&x);

				let found = record.iter().find(|f| match &f.id {
					Label::Id(id) => id.clone() == field_id || id.to_string() == x,
					Label::Unnamed(id) => id.clone() == field_id || id.to_string() == x,
					Label::Named(name) => x == name,
				});

				let field = found.ok_or(format!("Invalid selector {} for record '{:?}'", x, record)).unwrap();
				value = &field.val;
			},
			// TODO handle variant, null, empty
			candid::parser::value::IDLValue::Vec(vector) => {
				let index = if x.starts_with('#') {
					match x.replace('#', "").as_str() {
						"max" => {
							let elem = vector.iter().max_by(|a, b| {
								let a_num = parse_idl_number(a.to_string());
								let b_num = parse_idl_number(b.to_string());
								
								a_num.cmp(&b_num)
							}).unwrap();

							vector.iter().position(|r| r == elem).unwrap()
						},
						"min" => {
							let elem = vector.iter().min_by(|a, b| {
								let a_num = parse_idl_number(a.to_string());
								let b_num = parse_idl_number(b.to_string());
								
								a_num.cmp(&b_num)
							}).unwrap();

							vector.iter().position(|r| r == elem).unwrap()
						},
						_ => { panic!("Unknown operation {}", x) }
					}
				} else {
					x.parse::<usize>()
						.ok()
						.ok_or(format!("Wrong index '{}' for vec '{:?}'", x, vector))
						.unwrap()
				};

				value = &vector
					.get(index)
					.ok_or(format!("Invalid index selector '{:?}' for vec '{:?}'", x, vector))
					.unwrap();
			},
			candid::parser::value::IDLValue::Variant(variant) => {
				let var = variant.0.as_ref();
				let field_id = candid::idl_hash(&x);

				let equal = match &var.id {
					Label::Id(id) => id.clone() == field_id,
					Label::Unnamed(id) => id.clone() == field_id,
					Label::Named(name) => x == name,
				};
				if !equal {
					panic!("Wrong selector {} for variant {:?}", x, var)
				}
				value = &var.val;
			},
			_ => {}
		}
	});

	println!("{:?}", value);
}

fn parse_idl_number(x: String) -> usize {
	x.split(':')
	.next()
	.unwrap()
	.trim()
	.parse::<usize>()
	.ok()
	.ok_or(format!("Vec value is not a number"))
	.unwrap()
}