use clap::{Parser, Subcommand};
use tokio::runtime::Runtime;

mod canister;
mod did;
mod utils;

#[derive(Parser)]
#[clap(name("uc"))]
pub struct CliOpts {
    #[clap(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    Canister(canister::CanisterOpts),
    Did(did::CandidOpts),
}

fn main() {
    let cli_opts = CliOpts::parse();
    let command = cli_opts.command;

    let runtime = Runtime::new().expect("Unable to create a runtime");
    runtime.block_on(exec(command));
}

pub async fn exec(cmd: Command) {
    match cmd {
        Command::Canister(v) => canister::execute(v).await,
        Command::Did(v) => did::execute(v).await,
    }
}
