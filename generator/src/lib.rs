mod encoder;
mod lexique;
mod random;

use std::{collections::HashSet, fs::create_dir_all, path::PathBuf};

use rand::seq::SliceRandom;
use random::SquaresRng;
use serde::Deserialize;

/// Build configuration.
#[derive(Clone, Debug)]
pub struct Config {
    pub database_path: PathBuf,
    pub encoder_name: String,
    pub output_path: PathBuf,
    pub challenge_dir: PathBuf,
    pub dictionary_dir: PathBuf,
    pub write_challenge: bool,
    pub write_dictionary: bool,
    pub random_seed: u64,
}

/// Custom error.
#[derive(Debug)]
struct CustomError(String);

impl std::fmt::Display for CustomError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

impl std::error::Error for CustomError {}

/// Partial database record.
#[derive(Clone, Debug, Deserialize)]
struct Record {
    /// Normalized word
    #[serde(skip_deserializing)]
    word: String,
    /// Mot
    ortho: String,
    /// Classe grammaticale
    cgram: Option<lexique::Cgram>,
    /// Fréquence par million selon le corpus de films
    freqfilms2: f64,
    /// Fréquence par million selon le corpus de livres
    freqlivres: f64,
    /// Informations verbales
    infover: lexique::VecInfover,
}

/// Build the static files.
///
/// # Output structure
///
/// - `/dictionary/{length}{letter}.txt`: List of accepted words of length
///   `{length}` and starting with `{letter}`.
/// - `/challenge-count.txt`: Number of challenges.
/// - `/challenge/{id}.txt`: Solution of challenge identified by `{id}`.
pub fn build(config: Config) -> anyhow::Result<()> {
    // Minimum word length
    let min_length: usize = 6;

    // Maximum word length
    let max_length: usize = 10;

    // Allowed grammatical categories in dictionary
    let dictionary_cgram = [
        // Adjectif
        lexique::Cgram::Adj,
        // Adverbe
        lexique::Cgram::Adv,
        // Nom commun
        lexique::Cgram::Nom,
        // Verbe
        lexique::Cgram::Ver,
    ];

    // Number of daily challenges to generate
    let num_daily_challenges = 365 * 2;

    // Read and pre-filter the database
    let database: Vec<Record> = csv::ReaderBuilder::new()
        .delimiter(b'\t')
        .from_path(config.database_path)?
        .deserialize::<Record>()
        .filter(|result| {
            // Keep words according to their grammatical categories
            // If error, return false
            result.as_ref().map_or(false, |record| {
                // If cgram is None, return false
                record
                    .cgram
                    .as_ref()
                    .map(|v| dictionary_cgram.contains(v))
                    .unwrap_or(false)
            })
        })
        .map(|result| {
            result.map(|record| {
                // Get normalized words (ascii lowercase)
                Record {
                    word: normalize(&record.ortho),
                    ..record
                }
            })
        })
        .filter(|result| {
            result.as_ref().map_or(false, |record| {
                // Keep words according to their length
                let length = record.word.chars().count();
                length >= min_length && length <= max_length
            })
        })
        .filter(|result| {
            result.as_ref().map_or(false, |record| {
                // Remove compound words
                record.word.chars().all(|c| c.is_ascii_alphabetic())
            })
        })
        .collect::<Result<_, _>>()?;

    // Dictionary: all words from the database
    let dictionary: Vec<String> = database
        .iter()
        .map(|record| record.word.to_owned())
        .collect();

    // Sort and remove duplicates
    let dictionary: Vec<String> = sort_dedup(dictionary);

    // Challenge list: words from a subset of the database
    let challenges: Vec<String> = database
        .iter()
        .filter(|record| {
            // Keep words according to their frequency in movies and books
            record.freqfilms2 >= 1.0 && record.freqlivres >= 1.0
        })
        .filter(|record| {
            // Keep words according to their grammatical category
            match record.cgram {
                // Nom commun
                Some(lexique::Cgram::Nom) => true,
                // Verbe
                Some(lexique::Cgram::Ver) => record.infover.0.iter().any(|infover| {
                    match infover.mode {
                        // Infinitif
                        lexique::InfoverMode::Inf => true,
                        // Participe
                        lexique::InfoverMode::Par => match infover.temps {
                            // Participe présent
                            Some(lexique::InfoverTemps::Pre) => true,
                            // Participe passé
                            Some(lexique::InfoverTemps::Pas) => true,
                            _ => false,
                        },
                        _ => false,
                    }
                }),
                _ => false,
            }
        })
        .map(|record| record.word.to_owned())
        .collect();

    // Sort and remove duplicates
    let challenges: Vec<String> = sort_dedup(challenges);

    if config.write_challenge {
        let challenge_dir = config.output_path.join(config.challenge_dir);

        create_dir_all(&challenge_dir)?;

        // Write the total number of challenges
        let challenge_count = challenges.len();
        std::fs::write(
            config.output_path.join("challenge-count.txt"),
            format!("{challenge_count}"),
        )?;

        // Create random challenges
        for (index, word) in challenges.iter().enumerate() {
            let index = index + 1;
            let path = challenge_dir.join(format!("{index}.txt"));

            std::fs::write(path, word)?;
        }

        let today = chrono::Utc::now().date_naive();

        // January 1, 1970
        let unix_epoch = chrono::NaiveDateTime::from_timestamp_millis(0)
            .unwrap()
            .date();

        let days_since_unix_epoch =
            chrono::NaiveDate::signed_duration_since(today, unix_epoch).num_days() as u64;

        // Previous daily challenges should not be altered by a new build.
        // To preserve the sequence between builds, we use a counter-based RNG.
        // We initialize the counter with the number of days since the UNIX epoch.
        let mut rng = SquaresRng::new(days_since_unix_epoch, config.random_seed);

        let challenge_dates = today
            .iter_days()
            .take(num_daily_challenges)
            .map(|date| date.format("%Y-%m-%d").to_string());

        // Create daily challenges
        for date in challenge_dates {
            let path = challenge_dir.join(format!("{date}.txt"));
            let word = challenges.choose(&mut rng).unwrap();

            std::fs::write(path, word)?;
        }
    }

    if config.write_dictionary {
        let dictionary_dir = config.output_path.join(config.dictionary_dir);

        create_dir_all(&dictionary_dir)?;

        // Get all first letters from challenges
        let first_letters: HashSet<char> = challenges
            .iter()
            .filter_map(|word| word.chars().nth(0))
            .collect();

        // Create sub-dictionaries
        for word_length in min_length..=max_length {
            for first_letter in &first_letters {
                let sub_dictionary: Vec<_> = dictionary
                    .iter()
                    .filter(|word| word.chars().count() == word_length)
                    .filter(|word| word.starts_with(first_letter.to_owned()))
                    .map(|word| &word[1..])
                    .collect();

                if sub_dictionary.is_empty() {
                    continue;
                }

                let path = dictionary_dir.join(format!("{word_length}{first_letter}.txt"));

                match config.encoder_name.as_str() {
                    "lines" => encoder::write_lines(path, sub_dictionary)?,
                    "front" => encoder::write_front_coding(path, sub_dictionary)?,
                    "frontopt" => encoder::write_front_coding_opt(path, sub_dictionary)?,
                    "trie" => encoder::write_trie(path, sub_dictionary)?,
                    _ => {
                        let encoder = config.encoder_name;
                        return Err(
                            CustomError(format!("unknown encoding method {encoder:?}")).into()
                        );
                    },
                };
            }
        }
    }

    Ok(())
}

/// Convert a word to lowercase and remove diacritics.
fn normalize<S>(s: S) -> String
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    s.to_lowercase()
        .chars()
        .fold(String::with_capacity(s.len()), |mut result, c| {
            match c {
                'á' | 'à' | 'â' | 'ä' | 'ã' => result.push('a'),
                'é' | 'è' | 'ê' | 'ë' => result.push('e'),
                'î' | 'ï' => result.push('i'),
                'ô' | 'ö' => result.push('o'),
                'ú' | 'ù' | 'û' | 'ü' => result.push('u'),
                'æ' => result.push_str("ae"),
                'œ' => result.push_str("oe"),
                'ç' => result.push('c'),
                'ñ' => result.push('n'),
                _ => {
                    if !c.is_ascii() {
                        panic!("unknown non-ascii character '{c}' in \"{s}\"")
                    }
                    result.push(c)
                },
            };
            result
        })
}

/// Sort a list and remove duplicates.
fn sort_dedup<T>(mut v: Vec<T>) -> Vec<T>
where
    T: Ord,
{
    v.sort();
    v.dedup();
    v
}
