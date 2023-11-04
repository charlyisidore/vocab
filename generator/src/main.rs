use std::path::PathBuf;

use clap::Parser;
use vocab_generator::{build, Config};

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Path to the word database.
    #[arg(long)]
    database: Option<PathBuf>,

    /// Dictionary encoding method (lines, front, frontopt, trie).
    #[arg(long)]
    encoder: Option<String>,

    /// Output directory.
    #[arg(long)]
    output: Option<PathBuf>,

    /// Directory for the challenges.
    #[arg(long)]
    challenge_dir: Option<PathBuf>,

    /// Directory for the dictionaries.
    #[arg(long)]
    dictionary_dir: Option<PathBuf>,

    /// Do not output challenges.
    #[arg(long)]
    no_challenge: bool,

    /// Do not output dictionaries.
    #[arg(long)]
    no_dictionary: bool,

    /// Specify a random seed.
    #[arg(long)]
    seed: Option<u64>,
}

fn main() -> anyhow::Result<()> {
    let args = Args::parse();

    let config = Config {
        database_path: args.database.unwrap_or("Lexique383.tsv".into()),
        encoder_name: args.encoder.unwrap_or("front".to_owned()),
        output_path: args.output.unwrap_or("public".into()),
        challenge_dir: args.challenge_dir.unwrap_or("challenge".into()),
        dictionary_dir: args.dictionary_dir.unwrap_or("dictionary".into()),
        write_challenge: !args.no_challenge,
        write_dictionary: !args.no_dictionary,
        random_seed: args.seed.unwrap_or(0x548c9decbce65297),
    };

    let result = build(config);

    if let Some(err) = result.err() {
        println!("Error: {err}");
    }

    Ok(())
}
