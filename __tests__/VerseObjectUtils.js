jest.unmock('fs-extra');
import fs from 'fs-extra';
import path from 'path-extra';
import {VerseObjectUtils} from '../src/';

describe('VerseObjectUtils.sortWordObjectsByString', () => {
  it('should return wordObjectsArray sorted and in order from string', function() {
    const string = 'qwerty asdf zxcv uiop jkl; bnm, qwerty asdf zxcv jkl; bnm,';
    const wordObjectArray = [
      {word: 'zxcv', occurrence: 2, occurrences: 2},
      {word: 'qwerty', occurrence: 2, occurrences: 2},
      {word: 'qwerty', occurrence: 1, occurrences: 2},
      {word: 'zxcv', occurrence: 1, occurrences: 2}
    ];
    const output = VerseObjectUtils.sortWordObjectsByString(
      wordObjectArray, string);
    const expected = [
      {word: 'qwerty', occurrence: 1, occurrences: 2},
      {word: 'zxcv', occurrence: 1, occurrences: 2},
      {word: 'qwerty', occurrence: 2, occurrences: 2},
      {word: 'zxcv', occurrence: 2, occurrences: 2}
    ];
    expect(output).toEqual(expected);
  });
  it('should return wordObjectsArray sorted and in order from stringWordObjects', function() {
    const stringData = [
      {word: 'qwerty', occurrence: 1, occurrences: 2, stringData: 0},
      {word: 'zxcv', occurrence: 1, occurrences: 2, stringData: 0},
      {word: 'qwerty', occurrence: 2, occurrences: 2, stringData: 0},
      {word: 'zxcv', occurrence: 2, occurrences: 2, stringData: 0}
    ];
    const wordObjectArray = [
      {word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1},
      {word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1}
    ];
    const output = VerseObjectUtils.sortWordObjectsByString(
      wordObjectArray, stringData);
    const expected = [
      {word: 'qwerty', occurrence: 1, occurrences: 2, wordObjectData: 1},
      {word: 'zxcv', occurrence: 2, occurrences: 2, wordObjectData: 1}
    ];
    expect(output).toEqual(expected);
  });
});

describe('VerseObjectUtils.getWordsFromVerseObjects', () => {
  it('should flatten out vereseObject children with single nested objects', () => {
    const {verseObjects} = require('./fixtures/pivotAlignmentVerseObjects/matt1-1b.json');
    expect(VerseObjectUtils.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 1,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 1,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'David',
      occurrence: 1,
      occurrences: 1
    },
    {type: 'text', text: ', '},
    {
      tag: 'w',
      type: 'word',
      text: 'son',
      occurrence: 2,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'of',
      occurrence: 2,
      occurrences: 2
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Abraham',
      occurrence: 1,
      occurrences: 1
    },
    {type: 'text', text: '.'}]);
  });

  it('should flatten out vereseObject children with double nested objects', () => {
    const {verseObjects} = require('./fixtures/pivotAlignmentVerseObjects/oneToMany.json');
    expect(VerseObjectUtils.getWordsFromVerseObjects(verseObjects)).toEqual([{
      tag: 'w',
      type: 'word',
      text: 'de',
      occurrence: 1,
      occurrences: 1
    },
    {
      tag: 'w',
      type: 'word',
      text: 'Jesucristo',
      occurrence: 1,
      occurrences: 1
    }]);
  });
});

describe("getOrderedVerseObjectsFromString", () => {
  it('handles words without punctuation', () => {
    const string = "hello world";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      }
    ];
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expected.length);
  });

  it('handles words with punctuation', () => {
    const string = "hello, world.";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "hello",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "world",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });

  it('handles multiple occurrences of words and punctuation', () => {
    const string = "son of David, son of Abraham.";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: "."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });

  it('handles embeded markers like footnotes', () => {
    const string = "son of David, son of Abraham. \\f Footnotes shouldn't be rendered as text but as content in their own object.\\f*";
    const expected = [
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 1,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "David",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ", "
      },
      {
        tag: "w",
        type: "word",
        text: "son",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "of",
        occurrence: 2,
        occurrences: 2
      },
      {
        tag: "w",
        type: "word",
        text: "Abraham",
        occurrence: 1,
        occurrences: 1
      },
      {
        type: "text",
        text: ". "
      },
      {
        tag: "f",
        type: "footnote",
        endTag: "f*",
        content: "Footnotes shouldn't be rendered as text but as content in their own object."
      }
    ];
    const expectedWordCount = expected.filter(item => (item.type === "word")).length;
    const {newVerseObjects, wordMap} = VerseObjectUtils.getOrderedVerseObjectsFromString(string);
    expect(newVerseObjects).toEqual(expected);
    expect(wordMap.length).toEqual(expectedWordCount);
  });
});

describe("getWordListFromVerseObjectArray", () => {
  it('handles arrays with nested milestones and text', () => {
    // given
    const testFile = path.join('__tests__', 'fixtures', 'verseObjects', 'tit1-4.json');
    const testData = fs.readJSONSync(testFile);
    const expected = "Τίτῳ γνησίῳ τέκνῳ κατὰ κοινὴν πίστιν χάρις καὶ εἰρήνη ἀπὸ Θεοῦ Πατρὸς καὶ Χριστοῦ Ἰησοῦ τοῦ Σωτῆρος ἡμῶν";

    // when
    const results = VerseObjectUtils.getWordListFromVerseObjectArray(testData);

    // then
    const verseWords = VerseObjectUtils.mergeVerseData(results);
    expect(verseWords).toEqual(expected);
  });
});
