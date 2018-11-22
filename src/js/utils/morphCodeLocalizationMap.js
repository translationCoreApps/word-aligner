/* eslint-disable camelcase */

// this is from http://openscriptures.github.io/morphhb/parsing/HebrewMorphologyCodes.html
export const morphCodeLocalizationMapHeb = { // Hebrew
  // parts of speech
  A: {
    key: 'adjective',
    params: ['adjective_types', 'gender', 'number', 'state']
  },
  C: {
    key: 'conjunction',
    params: []
  },
  D: {
    key: 'adverb',
    params: ['']
  },
  N: {
    key: 'noun',
    params: ['noun_types', 'gender', 'number', 'state']
  },
  P: {
    key: 'pronoun',
    params: ['pronoun_types', 'person', 'gender', 'number']
  },
  R: {
    key: 'preposition',
    params: ['preposition_types']
  },
  S: {
    key: 'suffix',
    params: ['suffix_types', 'person', 'gender', 'number']
  },
  T: {
    key: 'particle',
    params: ['particle_types']
  },
  V: {
    key: 'verb',
    params: ['verb_stems', 'verb_conjugation_types', 'person', 'gender', 'number', 'state']
  },

  // details
  adjective_types: {
    a: 'adjective',
    c: 'cardinal number',
    g: 'gentilic',
    o: 'ordinal number'
  },
  gender: {
    b: 'both (noun)',
    c: 'common (verb)',
    f: 'feminine',
    m: 'masculine'
  },
  noun_types: {
    c: 'common',
    g: 'gentilic',
    p: 'proper name'
  },
  number: {
    d: 'dual',
    p: 'plural',
    s: 'singular'
  },
  particle_types: {
    a: 'affirmation',
    d: 'definite article',
    e: 'exhortation',
    i: 'interrogative',
    j: 'interjection',
    m: 'demonstrative',
    n: 'negative',
    o: 'direct object marker',
    r: 'relative'
  },
  person: {
    1: 'first',
    2: 'second',
    3: 'third'
  },
  preposition_types: {
    d: 'definite article'
  },
  pronoun_types: {
    d: 'demonstrative',
    f: 'indefinite',
    i: 'interrogative',
    p: 'personal',
    r: 'relative'
  },
  state: {
    a: 'absolute',
    c: 'construct',
    d: 'determined'
  },
  suffix_types: {
    d: 'directional he',
    h: 'paragogic he',
    n: 'paragogic nun',
    p: 'pronominal'
  },
  verb_conjugation_types: {
    p: 'perfect (qatal)',
    q: 'sequential perfect (weqatal)',
    i: 'imperfect (yiqtol)',
    w: 'sequential imperfect (wayyiqtol)',
    h: 'cohortative',
    j: 'jussive',
    v: 'imperative',
    r: 'participle active',
    s: 'participle passive',
    a: 'infinitive absolute',
    c: 'infinitive construct'
  },
  verb_stems: {
    q: 'qal',
    N: 'niphal',
    p: 'piel',
    P: 'pual',
    h: 'hiphil',
    H: 'hophal',
    t: 'hithpael',
    o: 'polel',
    O: 'polal',
    r: 'hithpolel',
    m: 'poel',
    M: 'poal',
    k: 'palel',
    K: 'pulal',
    Q: 'qal passive',
    l: 'pilpel',
    L: 'polpal',
    f: 'hithpalpel',
    D: 'nithpael',
    j: 'pealal',
    i: 'pilel',
    u: 'hothpaal',
    c: 'tiphil',
    v: 'hishtaphel',
    w: 'nithpalel',
    y: 'nithpoel',
    z: 'hithpoel'
  }
};

export const morphCodeLocalizationMapAr = { // Aramaic, same as Hebrew except for verb stems
  ...morphCodeLocalizationMapHeb,
  verb_stems: {
    q: 'peal',
    Q: 'peil',
    u: 'hithpeel',
    p: 'pael',
    P: 'ithpaal',
    M: 'hithpaal',
    a: 'aphel',
    h: 'haphel',
    s: 'saphel',
    e: 'shaphel',
    H: 'hophal',
    i: 'ithpeel',
    t: 'hishtaphel',
    v: 'ishtaphel',
    w: 'hithaphel',
    o: 'polel',
    z: 'ithpoel',
    r: 'hithpolel',
    f: 'hithpalpel',
    b: 'hephal',
    c: 'tiphel',
    m: 'poel',
    l: 'palpel',
    L: 'ithpalpel',
    O: 'ithpolel',
    G: 'ittaphal'
  }
};

// These reflect the columns on page 55 of https://greekcntr.org/downloads/project.pdf
// This helps us translate codes starting and the 3rd place (the 2nd index) of a morph string
// The numbered keys are the index of that code in the string, where the letter index is the code
// Each role's 3rd index (the type code) is different, so we nest index 3 in the role's entry

export const morphCodeLocalizationMapGrk = {
  2: { // role
    N: {
      key: 'noun',
      3: { // noun types
        S: 'substantive_adj',
        P: 'predicate_adj'
      }
    },
    A: {
      key: 'adjective',
      3: { // adjective types
        A: 'ascriptive',
        R: 'restrictive'
      }
    },
    E: {
      key: 'determiner',
      3: { // determiner types
        A: 'article',
        D: 'demonstrative',
        F: 'differential',
        P: 'possessive',
        Q: 'quantifier',
        N: 'number',
        O: 'ordinal',
        R: 'relative',
        T: 'interrogative'
      }
    },
    R: {
      key: 'pronoun',
      3: { // pronoun types
        D: 'demonstrative',
        P: 'personal',
        E: 'reflexive',
        C: 'reciprocal',
        I: 'indefinite',
        R: 'relative',
        T: 'interrogative'
      }
    },
    V: {
      key: 'verb',
      3: { // verb types
        T: 'transitive',
        I: 'intransitive',
        L: 'linking',
        M: 'modal',
        P: 'periphrastic'
      }
    },
    I: {
      key: 'interjection',
      3: { // interjection types
        E: 'exclamation',
        D: 'directive',
        R: 'response'
      }
    },
    P: {
      key: 'preposition',
      3: { // preposition types
        I: 'improper'
      }
    },
    D: {
      key: 'adverb',
      3: { // adverb types
        O: 'correlative'
      }
    },
    C: {
      key: 'conjunction',
      3: { // conjuction types
        C: 'coordinating',
        S: 'subordinating',
        O: 'correlative'
      }
    },
    T: {
      key: 'particle',
      3: { // particle types
        F: 'foreign',
        E: 'error'
      }
    }
  },
  4: { // mood
    I: 'indicative',
    M: 'imperative',
    S: 'subjunctive',
    O: 'optative',
    N: 'infinitive',
    P: 'participle'
  },
  5: { // tense
    P: 'present',
    I: 'imperfect',
    F: 'future',
    A: 'aorist',
    E: 'perfect',
    L: 'pluperfect'
  },
  6: { // voice
    A: 'active',
    M: 'middle',
    P: 'passive'
  },
  7: { // person
    1: 'first',
    2: 'second',
    3: 'third'
  },
  8: { // case
    N: 'nominative',
    G: 'genitive',
    D: 'dative',
    A: 'accusative',
    V: 'vocative'
  },
  9: { // gender
    M: 'masculine',
    F: 'feminine',
    N: 'neuter'
  },
  10: { // number
    S: 'singular',
    P: 'plural'
  },
  11: { // other
    C: 'comparative',
    S: 'superlatives',
    D: 'diminutive',
    I: 'indeclinable'
  }
};
