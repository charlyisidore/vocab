# Vocab' generator

Generator of challenge and dictionary files for Vocab' in Rust.

This generator takes the [Lexique 3.83 database](http://www.lexique.org/) in TSV format as the input, and outputs a collection of text files to be fetched by the Vocab' app.

## Usage

Build the generator:

```bash
cargo build --release
```

Copy the generator to the Vocab' project directory:

```bash
cp target/release/vocab_generator ../vocab_generator
```

Run the generator:

```bash
cd ../
./vocab_generator
```

## Output

The output files are organized as follows:

```
public/
├─ challenge-count.txt  Total number of challenges
├─ challenge/           Challenges
│  ├─ 1.txt             Solution of random challenge 1
│  ├─ 2.txt             Solution of random challenge 2
│  ├─ ...
│  ├─ {n}.txt           Solution of random challenge {n}
│  ├─ 2024-01-01.txt    Solution of daily challenge 2024-01-01
│  ├─ 2024-01-02.txt    Solution of daily challenge 2024-01-02
│  └─ ...
└─ dictionary/          Dictionaries
   ├─ 6a.txt            List of accepted words of length 6 starting with "a"
   ├─ 6b.txt            List of accepted words of length 6 starting with "b"
   ├─ ...
   └─ 10z.txt           List of accepted words of length 10 starting with "z"
```

### Dictionaries

In order to save bandwidth, the list of accepted words is split into sub-dictionaries, each containing only accepted words of a specific length starting with a specific letter.
This ensures that the Vocab' app fetches only the words valid for a given challenge.
Besides, sub-dictionaries are encoded using the front coding algorithm.

### Challenges

Challenges can be identified by either index or date.
When identified by index, the index ranges from 1 to the number written in `challenge-count.txt`.
When identified by date, the date follows the ISO format (`yyyy-mm-dd`).

## License

[AGPL-3.0-only](https://www.gnu.org/licenses/agpl-3.0.html)

## References

- New, Boris, Christophe Pallier, Marc Brysbaert, and Ludovic
  Ferrand. 2004. "Lexique 2: A New French Lexical Database." _Behavior
  Research Methods, Instruments, & Computers_ 36 (3): 516--524.
  [pdf](New%20et%20al.%20-%202004%20-%20Lexique%202%20A%20new%20French%20lexical%20database.pdf)

- New, Boris, Christophe Pallier, Ludovic Ferrand, and Rafael
  Matos. 2001. "Une Base de Données Lexicales Du Français Contemporain
  Sur Internet: LEXIQUE" _L'Année Psychologique_ 101 (3): 447--462.
  [pdf](New%20et%20al.%20-%202001%20-%20Une%20base%20de%20données%20lexicales%20du%20français%20contempo.pdf)

- Boris New, Marc Brysbaert, Jean Veronis, and Christophe
  Pallier. 2007. "The Use of Film Subtitles to Estimate Word
  Frequencies." Applied Psycholinguistics 28 (4): 661--77.
  https://doi.org/10.1017/S014271640707035X.
  ([pdf](New.Brysbaert.Veronis.Pallier.2007.APU.pdf))
