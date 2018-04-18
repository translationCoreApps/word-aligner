import usfm from 'usfm-js';
import tokenizer from 'string-punctuation-tokenizer';

/**
 * An object containing information about the word in a target language
 *
 * @typedef WordObject
 * @type {Object}
 * @property {number} occurrences - Total amount of ccurrences for
 *  the word in the verse.
 * @property {number} occurrence - Specific occurrence of the word
 * in the verse.
 * @property {string} text - The text that used for rendering on the screen.
 * @property {string} tag - Denotes the type of usfm tag the word originates
 * from.
 * @property {[WordObject]} [children] - Containing WordObject's
 * for pivoting WordObject's off of another
 * @property {('text'|'word'|'paragraph')} type - Denotes the category of content
 * the word holds
 * @property {string} [word] - The text that used for rendering on the screen.
 */

/**
 * An object containing information about the word
 * in the original language
 * @typedef {[WordObject]} VerseObject
 */

/**
 * get text from word type verse object or word object
 * @param {WordObject} wordObject - an object containing information about the word
 * @return {string|undefined} text from word object
 */
export const getWordText = wordObject => {
  if (wordObject && (wordObject.type === 'word')) {
    return wordObject.text;
  }
  return wordObject ? wordObject.word : undefined;
};

/**
 * Gets the occurrence of a subString in words by counting up to subString index
 * @param {String|Array} words - word list or string to search
 * @param {Number} currentWordIndex - index of desired word in words
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the occurrence of the word at currentWordIndex
 */
export const getOccurrence = (words, currentWordIndex, subString) => {
  if (typeof words === 'string') {
    return tokenizer.occurrenceInString(words, currentWordIndex, subString);
  }

  let occurrence = 0;
  if (Array.isArray(words)) {
    for (let i = 0; i <= currentWordIndex; i++) {
      if (getWordText(words[i]) === subString) occurrence++;
    }
  }
  return occurrence;
};

/**
 * Function that count occurrences of a substring in words
 * @param {String|Array} words - word list or string to search
 * @param {String} subString - The sub string to search for
 * @return {Integer} - the count of the occurrences
 */
export const getOccurrences = (words, subString) => {
  if (typeof words === 'string') {
    return tokenizer.occurrencesInString(words, subString);
  }

  let occurrences = 0;
  if (Array.isArray(words)) {
    for (let word of words) {
      if (getWordText(word) === subString) occurrences++;
    }
  }
  return occurrences;
};

/**
 * @description verseObjects with occurrences from verseObjects
 * @param {Array} verseObjects - Word list to add occurrence(s) to
 * @return {Array} - verseObjects with occurrences
 */
export const getOrderedVerseObjects = verseObjects => {
  const _verseObjects = JSON.parse(JSON.stringify(verseObjects)); // clone data before modifying
  _verseObjects.forEach((verseObject, i) => {
    if (verseObject.type === 'word') {
      verseObject.occurrence = getOccurrence(
        _verseObjects,
        i,
        verseObject.text);
      verseObject.occurrences = getOccurrences(_verseObjects, verseObject.text);
    }
  });
  return _verseObjects;
};
/**
 * @description verseObjects with occurrences via string
 * @param {String} string - The string to search in
 * @returns {Array} - verseObjects with occurrences
 */

export const getOrderedVerseObjectsFromString = string => {
  if (!string) return [];
  let verseObjects = [];
  // convert string using usfm to JSON
  const _verseObjects = usfm.toJSON('\\v 1 ' + string, {chunk: true}).verses["1"].verseObjects;
  const _verseObjectsWithTextString = _verseObjects
    .map(verseObject => verseObject.text)
    .filter(text => text)
    .join(' ');
  let nonWordVerseObjectCount = 0;
  _verseObjects.forEach(_verseObject => {
    if (_verseObject.text) {
      tokenizer.tokenizeWithPunctuation(_verseObject.text).forEach(text => {
        let verseObject;
        if (tokenizer.word.test(text)) { // if the text has word characters, its a word object
          const wordIndex = verseObjects.length - nonWordVerseObjectCount;
          let occurrence = tokenizer.occurrenceInString(
            _verseObjectsWithTextString,
            wordIndex,
            text);
          const occurrences = tokenizer.occurrencesInString(
            _verseObjectsWithTextString,
            text);
          if (occurrence > occurrences) occurrence = occurrences;
          verseObject = {
            tag: "w",
            type: "word",
            text,
            occurrence,
            occurrences
          };
        } else { // the text does not have word characters
          nonWordVerseObjectCount++;
          verseObject = {
            type: "text",
            text: text
          };
        }
        verseObjects.push(verseObject);
      });
    } else {
      verseObjects.push(_verseObject);
    }
  });
  return verseObjects;
};

/**
 * @description Nests the milestons so that the first is the root and each after is nested
 * @param {Array} milestones - an array of milestone objects
 * @return {Object} - the nested milestone
 */
export const nestMilestones = milestones => {
  const _milestones = JSON.parse(JSON.stringify(milestones));
  let milestone;
  _milestones.reverse();
  _milestones.forEach(_milestone => {
    if (milestone) { // if the milestone was already there
      _milestone.children = [milestone]; // nest the existing milestone as children
      milestone = _milestone; // replace the milestone with this one
    } else { // if this is the first milestone, populate it
      milestone = _milestone;
    }
    // next loop will use the resulting milestone to nest until no more milestones
  });
  return milestone;
};

/**
 * @description Converts a bottomWord to a verseObject of tag: w, type: word
 * @param {WordObject} bottomWord - a wordObject to convert
 * @param {string} textKey - key of the text in the bottom word object
 * @return {Object} - a verseObject of tag: w, type: word
 */
export const wordVerseObjectFromBottomWord = (bottomWord, textKey = 'word') => (
  {
    tag: "w",
    type: "word",
    text: bottomWord[textKey],
    occurrence: bottomWord.occurrence,
    occurrences: bottomWord.occurrences
  }
);

/**
 * @description Converts a topWord to a verseObject of tag: w, type: word
 * @param {WordObject} topWord - a wordObject to convert
 * @return {Object} - a verseObject of tag: w, type: word
 */
export const milestoneVerseObjectFromTopWord = topWord => {
  let verseObject = JSON.parse(JSON.stringify(topWord));
  verseObject.tag = "zaln";
  verseObject.type = "milestone";
  verseObject.content = topWord.word;
  delete verseObject.word;
  delete verseObject.tw;
  return verseObject;
};

/**
 * @description Converts a verseObject of tag: w, type: word into an alignmentObject
 * @param {WordObject} verseObject - a wordObject to convert
 * @return {Object} - an alignmentObject
 */
export const alignmentObjectFromVerseObject = verseObject => {
  let wordObject = JSON.parse(JSON.stringify(verseObject));
  wordObject.word = wordObject.text || wordObject.content;
  delete wordObject.content;
  delete wordObject.text;
  delete wordObject.tag;
  delete wordObject.type;
  delete wordObject.children;
  return wordObject;
};

/**
 * @description Returns index of the verseObject in the verseObjects (ignores occurrences since that can be off)
 * @param {Array} verseObjects - array of the verseObjects to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
export const indexOfVerseObject = (verseObjects, verseObject) => (
  verseObjects.findIndex(_verseObject => {
    return (_verseObject.text === verseObject.text) &&
    (_verseObject.occurrence === verseObject.occurrence) &&
    (_verseObject.type === verseObject.type) &&
    (_verseObject.tag === verseObject.tag);
  })
);

/**
 * extracts word objects from verse object. If verseObject is word type, return that in array, else if it is a
 * milestone, then add words found in children to word array.  If no words found return empty array.
 * @param {object} verseObject - verse objects to have words extracted from
 * @return {Array} words found
 */
export const extractWordsFromVerseObject = verseObject => {
  let words = [];
  if (typeof verseObject === 'object') {
    if (verseObject.word || verseObject.type === 'word') {
      words.push(verseObject);
    } else if (verseObject.type === 'milestone' && verseObject.children) {
      for (let child of verseObject.children) {
        const childWords = extractWordsFromVerseObject(child);
        words = words.concat(childWords);
      }
    }
  }
  return words;
};

/**
 * @description merge verse data into a string
 * @param {Object|Array} verseData - verse objects to be merged
 * @param {array} filter - Optional filter to get a specific type of word object type.
 * @return {String} - the merged verse object string
 */
export const mergeVerseData = (verseData, filter) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  const verseArray = [];
  verseData.forEach(part => {
    if (typeof part === 'string') {
      verseArray.push(part);
    }
    let words = [part];
    if (part.type === 'milestone') {
      words = extractWordsFromVerseObject(part);
    }
    words.forEach(word => {
      if (!filter || (word.text && word.type && filter.includes(word.type))) {
        verseArray.push(word.text);
      }
    });
  });
  let verseText = '';
  for (let verse of verseArray) {
    if (verse) {
      if (verseText && (verseText[verseText.length - 1] !== '\n')) {
        verseText += ' ';
      }
      verseText += verse;
    }
  }
  return verseText;
};

/**
 * extract list of word objects from array of verseObjects (will also search children of milestones).
 * @param {Array} verseObjects - verse objects to search for word list from
 * @return {Array} - words found
 */
export const getWordListFromVerseObjectArray = verseObjects => {
  let wordList = [];
  for (let verseObject of verseObjects) {
    const words = extractWordsFromVerseObject(verseObject);
    wordList = wordList.concat(words);
  }
  return wordList;
};

const addContentAttributeToChildren = (childrens,
  parentObject, grandParentObject) => {
  return childrens.map(child => {
    if (child.children) {
      child = addContentAttributeToChildren(child.children,
         child,
         parentObject);
    } else if (!child.content && parentObject.content) {
      const childrenContent = [parentObject];
      if (grandParentObject) childrenContent.push(grandParentObject);
      child.content = childrenContent;
    }
    return child;
  });
};

/**
 * @description flatten verse objects from nested format to flat array
 * @param {array} verse - source array of nested verseObjects
 * @param {array} words - output array that will be filled with flattened verseObjects
 */
const flattenVerseObjects = (verse, words) => {
  for (let object of verse) {
    if (object) {
      if (object.type === 'word') {
        object.strong = object.strong || object.strongs;
        words.push(object);
      } else if (object.type === 'milestone') { // get children of milestone
        // add content attibute to children
        const newObject = addContentAttributeToChildren(object.children,
          object);
        flattenVerseObjects(newObject, words);
      } else {
        words.push(object);
      }
    }
  }
};

/**
 * @description returns a flat array of VerseObjects (currently needed for rendering UGNT since words may be nested in milestones)
 * @param {Object|Array} verse - verseObjects that need to be flattened.
 * @return {array} wordlist - flat array of VerseObjects
 */
export const getWordListForVerse = verse => {
  let words = [];
  if (verse.verseObjects) {
    flattenVerseObjects(verse.verseObjects, words);
  } else { // already a flat word list
    words = verse;
  }
  return words;
};

 /** Method to filter usfm markers from a string or verseObjects array
  * @param {String|Array|Object} verseObjects - The string to remove markers from
  * @return {Array} - Array without usfm markers
  */
export const getWordList = verseObjects => {
  let wordList = [];
  if (typeof verseObjects === 'string') {
    verseObjects = getOrderedVerseObjectsFromString(verseObjects);
  }
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }

  if (verseObjects) {
    wordList = getWordListFromVerseObjectArray(verseObjects);
  }
  return wordList;
};

/**
 * @description test to see if this is the same milestone (needed when milestones are not contiguous)
 * @param {Object} a - First milestone to test
 * @param {Object} b - Second milestone to test
 * @return {boolean} true if same milestone
 */
export const sameMilestone = (a, b) => {
  const same = (a.type === b.type) &&
    (a.content === b.content) &&
    (a.occurrence === b.occurrence);
  return same;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject - Verse object to be added
 * @param {Object} alignment - The alignment object that will be added to
 */
export const addVerseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    /** @type{WordObject} */
    const wordObject = alignmentObjectFromVerseObject(
      verseObject
    );
    const duplicate = alignment.topWords.find(function(obj) {
      return (obj.word === wordObject.word) &&
        (obj.occurrence === wordObject.occurrence);
    });
    if (!duplicate) {
      alignment.topWords.push(wordObject);
    }
    verseObject.children.forEach(_verseObject => {
      addVerseObjectToAlignment(_verseObject, alignment);
    });
  } else if (verseObject.type === 'word' && !verseObject.children) {
    /** @type{WordObject} */
    const wordObject = alignmentObjectFromVerseObject(
      verseObject
    );
    alignment.bottomWords.push(wordObject);
  }
};

/**
 * Concatenates an array of words into a verse.
 * @param {array} verseArray - array of strings in a verse.
 * @return {string} combined verse
 */
export const combineVerseArray = verseArray => {
  return verseArray.map(o => getWordText(o)).join(' ');
};

/**
 * create an array of word objects with occurrence(s)
 * @param {[WordObject]} words - List of words without occurrences
 * @return {[WordObject]} - array of wordObjects
 */
export const populateOccurrencesInWordObjects = words => {
  words = getWordList(words);
  let index = 0; // only count verseObject words
  return words.map(wordObject => {
    const wordText = getWordText(wordObject);
    if (wordText) { // if verseObject is word
      wordObject.occurrence = getOccurrence(
        words, index++, wordText);
      wordObject.occurrences = getOccurrences(
        words, wordText
      );
      return wordObject;
    }
    return null;
  }).filter(wordObject => (wordObject !== null));
};

/**
 * @description wordObjectArray via string
 * @param {String} string - The string to search in
 * @return {[WordObject]} - array of wordObjects
 */
export const wordObjectArrayFromString = string => {
  const wordObjectArray = tokenizer.tokenize(string).map((word, index) => {
    const occurrence = tokenizer.occurrenceInString(string, index, word);
    const occurrences = tokenizer.occurrencesInString(string, word);
    return {
      word,
      occurrence: occurrence,
      occurrences: occurrences
    };
  });
  return wordObjectArray;
};

/**
 * @description sorts wordObjectArray via string
 * @param {[WordObject]} wordObjectArray - array of wordObjects
 * @param {string|[VerseObject]|VerseObject} stringData - The string to search in
 * @return {[WordObject]} - sorted array of wordObjects
 */
export const sortWordObjectsByString = (wordObjectArray, stringData) => {
  if (stringData.verseObjects) {
    stringData = populateOccurrencesInWordObjects(
      stringData.verseObjects);
  } else if (Array.isArray(stringData)) {
    stringData = populateOccurrencesInWordObjects(stringData);
  } else {
    stringData = wordObjectArrayFromString(stringData);
  }
  let _wordObjectArray = wordObjectArray.map(wordObject => {
    const {word, occurrence, occurrences} = wordObject;
    const _wordObject = {
      word,
      occurrence,
      occurrences
    };
    const indexInString = stringData.findIndex(object => {
      const equal = (
        getWordText(object) ===
        getWordText(_wordObject) &&
        object.occurrence === _wordObject.occurrence &&
        object.occurrences === _wordObject.occurrences
      );
      return equal;
    });
    wordObject.index = indexInString;
    return wordObject;
  });
  _wordObjectArray = _wordObjectArray.sort((a, b) => {
    return a.index - b.index;
  });
  _wordObjectArray = _wordObjectArray.map(wordObject => {
    delete wordObject.index;
    return wordObject;
  });
  return _wordObjectArray;
};

/**
 * Helper function to flatten a double nested array
 * @param {array} arr - Array to be flattened
 * @return {array} - Flattened array
 */
export const flattenArray = arr => {
  return [].concat(...arr);
};

/**
 * Helper method to grab only verse objects or childen of verse objects but
 * not grab verse objects containing children.
 * i.e. given {a:1, b:{2, children:{2a, 2b}} returns 1, 2a, 2b (skips 2)
 *
 * @param {[VerseObject]} verseObjects - Objects containing data for the words such as
 * occurences, occurence, tag, text and type
 * @return {[WordObject]} - same format as input, except objects containing childern
 * get flatten to top level
 */
export const getWordsFromVerseObjects = verseObjects => {
  const wordObjects = verseObjects.map(versebject => {
    if (versebject.children) {
      return getWordsFromVerseObjects(versebject.children);
    }
    return versebject;
  });
  return flattenArray(wordObjects);
};