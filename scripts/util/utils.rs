use std::{fs, fs::File};
use std::io::Read;
use ic_agent::{Identity, identity::BasicIdentity};

pub fn get_identity() -> impl Identity {
	let output = std::process::Command::new("dfx")
			.args(["identity", "whoami"])
			.output()
			.expect("failed to execute process");
	
	let identity_name = String::from_utf8(output.stdout)
			.unwrap()
			.replace("\n", "")
			.trim()
			.to_string();
	
	use_identity(identity_name)
}

pub fn use_identity(identity_name: String) -> impl Identity {
	let pem_rel_path = format!("~/.config/dfx/identity/{}/identity.pem", identity_name);
	let pem_path = abspath(pem_rel_path.as_str()).unwrap();

	BasicIdentity::from_pem_file(pem_path).expect("Could not read the key pair.")
}

pub fn abspath(p: &str) -> Option<String> {
	let exp_path = shellexpand::full(p).ok()?;
	let can_path = std::fs::canonicalize(exp_path.as_ref()).ok()?;
	can_path.into_os_string().into_string().ok()
}

pub fn get_file_as_byte_vec(filename: &String) -> Vec<u8> {
    let mut f = File::open(&filename).expect("no file found");
    let metadata = fs::metadata(&filename).expect("unable to read metadata");
    let mut buffer = vec![0; metadata.len() as usize];
    f.read(&mut buffer).expect("buffer overflow");

    buffer
}