use std::{
    collections::BTreeMap,
    fs::File,
    io::{BufWriter, Write},
    path::Path,
};

/// Write a list of words line by line, without compression (for benchmarking).
pub fn write_lines<P, I, T>(path: P, iter: I) -> Result<(), std::io::Error>
where
    P: AsRef<Path>,
    I: IntoIterator<Item = T>,
    T: AsRef<str>,
{
    let mut writer = BufWriter::new(File::create(path)?);

    for word in iter {
        let word = word.as_ref();
        writeln!(writer, "{word}")?;
    }

    Ok(())
}

/// Write a list of words using a front coding algorithm.
/// Assumes all words have the same length.
/// This variant encodes one word per line.
pub fn write_front_coding<P, I, T>(path: P, iter: I) -> Result<(), std::io::Error>
where
    P: AsRef<Path>,
    I: IntoIterator<Item = T>,
    T: AsRef<str>,
{
    let mut writer = BufWriter::new(File::create(path)?);

    let mut previous = String::new();

    for current in iter {
        let prefix_length = common_prefix_length(&previous, &current.as_ref());
        let suffix = &current.as_ref()[prefix_length..];

        if !previous.is_empty() {
            write!(writer, "\n")?;
        }
        write!(writer, "{suffix}")?;

        previous = current.as_ref().to_owned();
    }

    Ok(())
}

/// Write a list of words using an optimized front coding algorithm.
/// Assumes all words have the same length.
/// This variant encodes the suffix length when it is greater than 1, instead of
/// writing new lines.
/// It should reduce the dictionary size compared to `write_front_coding_lines`,
/// but decoding is more tedious.
pub fn write_front_coding_opt<P, I, T>(path: P, iter: I) -> Result<(), std::io::Error>
where
    P: AsRef<Path>,
    I: IntoIterator<Item = T>,
    T: AsRef<str>,
{
    let mut writer = BufWriter::new(File::create(path)?);

    let mut previous = String::new();

    for current in iter {
        let prefix_length = common_prefix_length(&previous, &current.as_ref());
        let suffix = &current.as_ref()[prefix_length..];

        if !previous.is_empty() && suffix.len() > 1 {
            let offset = suffix.len() - 1;
            write!(writer, "{offset}")?;
        }

        write!(writer, "{suffix}")?;

        previous = current.as_ref().to_owned();
    }

    Ok(())
}

/// Get the length of the longest common prefix between two words.
fn common_prefix_length<S1, S2>(s1: S1, s2: S2) -> usize
where
    S1: AsRef<str>,
    S2: AsRef<str>,
{
    s1.as_ref()
        .chars()
        .zip(s2.as_ref().chars())
        .take_while(|(x, y)| x == y)
        .count()
}

/// Write a list of words using the trie algorithm.
/// Assumes all words have the same length.
pub fn write_trie<P, I, T>(path: P, iter: I) -> Result<(), std::io::Error>
where
    P: AsRef<Path>,
    I: IntoIterator<Item = T>,
    T: AsRef<str>,
{
    let mut writer = BufWriter::new(File::create(path)?);

    let mut trie = Trie::default();

    for current in iter {
        trie.insert(current);
    }

    trie.write(&mut writer)?;

    Ok(())
}

/// Trie node.
#[derive(Debug, Default)]
struct Trie {
    /// Children nodes.
    children: BTreeMap<char, Trie>,
}

impl Trie {
    /// Insert a word in the trie.
    pub fn insert<S>(&mut self, word: S)
    where
        S: AsRef<str>,
    {
        let mut node = self;
        for c in word.as_ref().chars() {
            node = node.children.entry(c).or_default();
        }
    }

    /// Write the trie by encoding each node as
    /// `{character}{num_children}{...descendants}`.
    pub fn write<W>(&self, writer: &mut W) -> Result<(), std::io::Error>
    where
        W: std::io::Write,
    {
        for (c, node) in self.children.iter() {
            let n = node.children.len();
            let buffer = if n > 0 {
                format!("{c}{n}")
            } else {
                // Since the word length is known, we can omit the '0'
                format!("{c}")
            };
            writer.write(buffer.as_bytes())?;
            node.write(writer)?;
        }
        Ok(())
    }
}
