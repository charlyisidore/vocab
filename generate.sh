#!/usr/bin/env bash
set -eux
if [[ ! -f Lexique383.tsv ]]
then
    wget --output-document=Lexique383.zip http://www.lexique.org/databases/Lexique383/Lexique383.zip
    unzip Lexique383.zip Lexique383.tsv
    rm Lexique383.zip
fi
cd generator/
cargo build --release
mv target/release/vocab_generator ../generate
cd ../
./generate
