use serde::Deserialize;

/// Parse error.
#[derive(Debug)]
pub struct ParseError {
    name: String,
    token: String,
    context: String,
}

impl ParseError {
    pub fn new<S1, S2, S3>(name: S1, token: S2, context: S3) -> Self
    where
        S1: AsRef<str>,
        S2: AsRef<str>,
        S3: AsRef<str>,
    {
        Self {
            name: name.as_ref().to_owned(),
            token: token.as_ref().to_owned(),
            context: context.as_ref().to_owned(),
        }
    }
}

impl std::fmt::Display for ParseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "invalid {} {:?} in {:?}",
            self.name, self.token, self.context
        )
    }
}

impl std::error::Error for ParseError {}

/// Catégorie grammaticale
#[derive(Clone, Debug, PartialEq)]
pub enum Cgram {
    /// Adjectif
    Adj,
    /// Adjectif démonstratif
    AdjDem,
    /// Adjectif indéfini
    AdjInd,
    /// Adjectif interrogatif
    AdjInt,
    /// Adjectif numérique
    AdjNum,
    /// Adjectif possessif
    AdjPos,
    /// Adverbe
    Adv,
    /// Article défini
    ArtDef,
    /// Article indéfini
    ArtInd,
    /// Auxiliaire
    Aux,
    /// Conjonction
    Con,
    /// Liaison euphonique (l')
    Lia,
    /// Nom commun
    Nom,
    /// Onomatopée
    Ono,
    /// Préposition
    Pre,
    /// Pronom démonstratif
    ProDem,
    /// Pronom indéfini
    ProInd,
    /// Pronom interrogatif
    ProInt,
    /// Pronom personnel
    ProPer,
    /// Pronom possessif
    ProPos,
    /// Pronom relatif
    ProRel,
    /// Verbe
    Ver,
}

/// Genre
#[derive(Clone, Debug, PartialEq)]
pub enum Genre {
    /// Masculin
    M,
    /// Féminin
    F,
}

/// Nombre
#[derive(Clone, Debug, PartialEq)]
pub enum Nombre {
    /// Singulier
    S,
    /// Pluriel
    P,
}

/// Information complémentaire sur les verbes
#[derive(Clone, Debug, Default, PartialEq)]
pub struct VecInfover(pub Vec<Infover>);

/// Information complémentaire sur les verbes (élement)
#[derive(Clone, Debug, PartialEq)]
pub struct Infover {
    /// Mode
    pub mode: InfoverMode,
    /// Temps
    pub temps: Option<InfoverTemps>,
    /// Personne
    pub personne: Option<InfoverPersonne>,
}

/// Mode (information complémentaire sur les verbes)
#[derive(Clone, Debug, PartialEq)]
pub enum InfoverMode {
    /// Indicatif
    Ind,
    /// Conditionnel
    Cnd,
    /// Subjonctif
    Sub,
    /// Participe
    Par,
    /// Infinitif
    Inf,
    /// Impératif
    Imp,
}

/// Temps (information complémentaire sur les verbes)
#[derive(Clone, Debug, PartialEq)]
pub enum InfoverTemps {
    /// Présent
    Pre,
    /// Futur
    Fut,
    /// Imparfait
    Imp,
    /// Passé
    Pas,
}

/// Personne (information complémentaire sur les verbes)
#[derive(Clone, Debug, PartialEq)]
pub enum InfoverPersonne {
    /// 1ère personne du singulier
    S1,
    /// 2ème personne du singulier
    S2,
    /// 3ème personne du singulier
    S3,
    /// 1ère personne du pluriel
    P1,
    /// 2ème personne du pluriel
    P2,
    /// 3ème personne du pluriel
    P3,
}

/// Catégories grammaticales possibles de la forme orthographique
#[derive(Clone, Debug, Default, PartialEq)]
pub struct VecCgram(pub Vec<Cgram>);

/// Database record of Lexique 3.83
#[derive(Clone, Debug, Default, Deserialize, PartialEq)]
pub struct Record {
    /// Mot
    pub ortho: String,
    /// Phonie
    pub phon: String,
    /// Lemme
    pub lemme: String,
    /// Classe grammaticale
    pub cgram: Option<Cgram>,
    /// Genre
    pub genre: Option<Genre>,
    /// Nombre
    pub nombre: Option<Nombre>,
    /// Fréquence du lemme par million selon le corpus de films
    pub freqlemfilms2: f64,
    /// Fréquence du lemme par million selon le corpus de livres
    pub freqlemlivres: f64,
    /// Fréquence par million selon le corpus de films
    pub freqfilms2: f64,
    /// Fréquence par million selon le corpus de livres
    pub freqlivres: f64,
    /// Informations verbales
    pub infover: VecInfover,
    /// Nombre d'homographes
    pub nbhomogr: usize,
    /// Nombre d'homophones
    pub nbhomoph: usize,
    //// Nombre de lettres
    pub nblettres: usize,
    /// Nombre de phonèmes
    pub nbphons: usize,
    /// Structure orthographique
    pub cvcv: String,
    /// Structure de la forme phonologique
    pub p_cvcv: String,
    /// Nombre de voisins orthographiques
    pub voisorth: usize,
    /// Nombre de voisins phonologiques
    pub voisphon: usize,
    /// Point d'unicité orthographique
    pub puorth: usize,
    /// Point d'unicité phonologique
    pub puphon: usize,
    /// Syllabation
    pub syll: String,
    /// Nombre de syllabes
    pub nbsyll: usize,
    /// Structure phonologique syllabique
    #[serde(rename = "cv-cv")]
    pub cv_cv: String,
    /// Représentation orthographique inversée
    pub orthrenv: String,
    /// Représentation phonologique inversée
    pub phonrenv: String,
    /// Représentation orthographique syllabée
    pub orthosyll: String,
    /// Catégories grammaticales possibles de la forme orthographique
    pub cgramortho: VecCgram,
    /// Pourcentage de personnes connaissant la définition du lemme
    pub deflem: Option<f64>,
    /// Nombre de personnes ayant répondu pour la définition de ce lemme
    pub defobs: Option<f64>,
    /// Distance de Levenshtein orthographique
    pub old20: f64,
    /// Distance de Levenshtein phonologique
    pub pld20: Option<f64>,
    /// Morphologie Dérivationnelle
    pub morphoder: String,
    /// Nombre de morphèmes
    pub nbmorph: usize,
}

/// Parse the `cgram` field
fn parse_cgram<S>(s: S) -> Result<Cgram, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "ADJ" => Ok(Cgram::Adj),
        "ADJ:dem" => Ok(Cgram::AdjDem),
        "ADJ:ind" => Ok(Cgram::AdjInd),
        "ADJ:int" => Ok(Cgram::AdjInt),
        "ADJ:num" => Ok(Cgram::AdjNum),
        "ADJ:pos" => Ok(Cgram::AdjPos),
        "ADV" => Ok(Cgram::Adv),
        "ART:def" => Ok(Cgram::ArtDef),
        "ART:ind" => Ok(Cgram::ArtInd),
        "AUX" => Ok(Cgram::Aux),
        "CON" => Ok(Cgram::Con),
        "LIA" => Ok(Cgram::Lia),
        "NOM" => Ok(Cgram::Nom),
        "ONO" => Ok(Cgram::Ono),
        "PRE" => Ok(Cgram::Pre),
        "PRO:dem" => Ok(Cgram::ProDem),
        "PRO:ind" => Ok(Cgram::ProInd),
        "PRO:int" => Ok(Cgram::ProInt),
        "PRO:per" => Ok(Cgram::ProPer),
        "PRO:pos" => Ok(Cgram::ProPos),
        "PRO:rel" => Ok(Cgram::ProRel),
        "VER" => Ok(Cgram::Ver),
        other => Err(ParseError::new("cgram", other, s)),
    }
}

/// Parse the `genre` field.
fn parse_genre<S>(s: S) -> Result<Genre, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "m" => Ok(Genre::M),
        "f" => Ok(Genre::F),
        other => Err(ParseError::new("genre", other, s)),
    }
}

/// Parse the `nombre` field.
fn parse_nombre<S>(s: S) -> Result<Nombre, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "s" => Ok(Nombre::S),
        "p" => Ok(Nombre::P),
        other => Err(ParseError::new("nombre", other, s)),
    }
}

/// Parse the `infover` field.
fn parse_vec_infover<S>(s: S) -> Result<VecInfover, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();

    Ok(VecInfover(
        s.split(';')
            .filter(|s| !s.is_empty())
            .map(parse_infover)
            .collect::<Result<_, _>>()?,
    ))
}

/// Parse an item in the `infover` field.
fn parse_infover<S>(s: S) -> Result<Infover, ParseError>
where
    S: AsRef<str>,
{
    let parts: Vec<&str> = s.as_ref().split(':').collect();

    Ok(Infover {
        mode: parts.get(0).map(parse_infover_mode).unwrap()?,
        temps: parts
            .get(1)
            .map(parse_infover_temps)
            .map_or(Ok(None), |result| result.map(Some))?,
        personne: parts
            .get(2)
            .map(parse_infover_personne)
            .map_or(Ok(None), |result| result.map(Some))?,
    })
}

/// Parse a `mode` value in the `infover` field.
fn parse_infover_mode<S>(s: S) -> Result<InfoverMode, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "ind" => Ok(InfoverMode::Ind),
        "cnd" => Ok(InfoverMode::Cnd),
        "sub" => Ok(InfoverMode::Sub),
        "par" => Ok(InfoverMode::Par),
        "inf" => Ok(InfoverMode::Inf),
        "imp" => Ok(InfoverMode::Imp),
        other => Err(ParseError::new("infover mode", other, s)),
    }
}

/// Parse a `temps` value in the `infover` field.
fn parse_infover_temps<S>(s: S) -> Result<InfoverTemps, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "pre" => Ok(InfoverTemps::Pre),
        "fut" => Ok(InfoverTemps::Fut),
        "imp" => Ok(InfoverTemps::Imp),
        "pas" => Ok(InfoverTemps::Pas),
        other => Err(ParseError::new("infover temps", other, s)),
    }
}

/// Parse a `personne` value in the `infover` field.
fn parse_infover_personne<S>(s: S) -> Result<InfoverPersonne, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();
    match s {
        "1s" => Ok(InfoverPersonne::S1),
        "2s" => Ok(InfoverPersonne::S2),
        "3s" => Ok(InfoverPersonne::S3),
        "1p" => Ok(InfoverPersonne::P1),
        "2p" => Ok(InfoverPersonne::P2),
        "3p" => Ok(InfoverPersonne::P3),
        other => Err(ParseError::new("infover personne", other, s)),
    }
}

/// Parse the `cgramortho` field.
fn parse_vec_cgram<S>(s: S) -> Result<VecCgram, ParseError>
where
    S: AsRef<str>,
{
    let s = s.as_ref();

    if s.is_empty() {
        return Ok(VecCgram(Vec::new()));
    }

    Ok(VecCgram(
        s.split(',').map(parse_cgram).collect::<Result<_, _>>()?,
    ))
}

/// Custom deserializer for the `cgram` field.
impl<'de> Deserialize<'de> for Cgram {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s: &str = Deserialize::deserialize(deserializer)?;
        parse_cgram(s).map_err(serde::de::Error::custom)
    }
}

/// Custom deserializer for the `genre` field.
impl<'de> Deserialize<'de> for Genre {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s: &str = Deserialize::deserialize(deserializer)?;
        parse_genre(s).map_err(serde::de::Error::custom)
    }
}

/// Custom deserializer for the `nombre` field.
impl<'de> Deserialize<'de> for Nombre {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s: &str = Deserialize::deserialize(deserializer)?;
        parse_nombre(s).map_err(serde::de::Error::custom)
    }
}

/// Custom deserializer for the `infover` field.
impl<'de> Deserialize<'de> for VecInfover {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s: &str = Deserialize::deserialize(deserializer)?;
        parse_vec_infover(s).map_err(serde::de::Error::custom)
    }
}

/// Custom deserializer for the `cgramortho` field.
impl<'de> Deserialize<'de> for VecCgram {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let s: &str = Deserialize::deserialize(deserializer)?;
        parse_vec_cgram(s).map_err(serde::de::Error::custom)
    }
}
