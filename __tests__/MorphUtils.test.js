jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import * as MorphUtils from '../src/js/utils/MorphUtils';
import ospath from 'ospath';

const RESOURCE_PATH = path.join(ospath.home(), 'translationCore', 'resources');
const OT_PATH = path.join(RESOURCE_PATH, 'hbo/bibles/uhb/v1.4.1');
const outputFolder = path.join(__dirname, 'fixtures/morphs');

describe('MorphUtils tests', () => {
  it('test Genesis', () => {
    const morphs = {};
    const bookId = "1ch";
    const bookPath = path.join(OT_PATH, bookId);
    const files = fs.readdirSync(bookPath);
    for (let file of files) {
      const chapter = fs.readJsonSync(path.join(bookPath, file));
      const verses = Object.keys(chapter);
      for (let verseNum of verses) {
        const verse = chapter[verseNum];
        const objects = verse.verseObjects;
        getMorphs(objects, morphs);
      }
    }
    for (let morph of Object.keys(morphs)) {
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      morphs[morph] = morphKeys;
    }
    const outFile = path.join(outputFolder, bookId + '-morphs.json');
    fs.writeJsonSync(outFile, morphs);
  });

  it('Test MorphUtils.getMorphLocalizationKeys() - All morph strings render as expected', () => {
    const morphsPath = path.join('__tests__', 'fixtures', 'morphs', 'all-titus-morphs.json');
    const allTitusMorphs = fs.readJSONSync(morphsPath);
    Object.keys(allTitusMorphs).forEach(morph => {
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      // process.stdout.write('  "'+morph+'": "'+morphKeys+'",\n');
      expect(morphKeys).toEqual(allTitusMorphs[morph]);
    });
  });

  describe('Greek', () => {
    it('Test MorphUtils.getMorphLocalizationKeys() - Unknown codes still return in comma delimited list', () => {
      const badMorph = 'AbCZEF,HI';
      const expectedMorphKeys = ['*Z', '*E', '*F', '*H', '*I'];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - morph is null', () => {
      const badMorph = null;
      const expectedMorphKeys = [];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - morph is too short', () => {
      const badMorph = 'Gr,';
      const expectedMorphKeys = 'Gr,';
      const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - morph is just a role', () => {
      const badMorph = 'Gr,A';
      const expectedMorphKeys = ['adjective'];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });

    it('Test MorphUtils.getMorphLocalizationKeys() - morph is not a string', () => {
      const badMorph = {A: 'B'};
      const expectedMorphKeys = [];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(badMorph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
  });

  describe('Hebrew', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew adjective', () => {
      const morph = "He,Acmsa";
      const expectedMorphKeys = ["adjective", "cardinal_number", "masculine", "singular", "absolute"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew adverb', () => {
      const morph = "He,D";
      const expectedMorphKeys = ["adverb"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew multipart noun', () => {
      const morph = "He,C:Td:Ncbsa";
      const expectedMorphKeys = ["conjunction", "*:", "particle", "definite_article", "*:", "noun", "common", "both_genders", "singular", "absolute"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew Preposition', () => {
      const morph = "He,R";
      const expectedMorphKeys = ["preposition"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Hebrew verb', () => {
      const morph = "He,Vqp3fs";
      const expectedMorphKeys = ["verb", "qal", "perfect_qatal", "third", "feminine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
  });

  describe('Aramaic', () => {
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic verb', () => {
      const morph = "Ar,Vqp3ms";
      const expectedMorphKeys = ["verb", "peal", "perfect_qatal", "third", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic pronoun', () => {
      const morph = "Ar,Pf3bs";
      const expectedMorphKeys = ["pronoun", "indefinite", "third", "both_genders", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
    it('Test MorphUtils.getFullMorphologicalString() - Aramaic preposition, suffix', () => {
      const morph = "Ar,R:Sp3ms";
      const expectedMorphKeys = ["preposition", "*:", "suffix", "pronominal", "third", "masculine", "singular"];
      const morphKeys = MorphUtils.getMorphLocalizationKeys(morph);
      expect(morphKeys).toEqual(expectedMorphKeys);
    });
  });
});

//
// helpers
//

function getMorphs(objects, morphs) {
  for (let object of objects) {
    if (object.morph) {
      morphs[object.morph] = object.morph;
    }
    if (object.children) {
      getMorphs(object.children, morphs);
    }
  }
}
