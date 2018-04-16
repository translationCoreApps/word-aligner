// helpers
import * as VerseObjectHelpers from './helpers/verseObjects';
import * as ArrayHelpers from './helpers/array';

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of topWords
 * @param {String} verseString - The string to base the bottomWords sorting
 * @return {Array} - sorted array of verseObjects to be used for verseText of targetLanguage
 */
export const merge = (alignments, wordBank, verseString) => {
  let verseObjects; // array to return
  // get the definitive list of verseObjects from the verse, unaligned but in order
  const unalignedOrdered = VerseObjectHelpers.getOrderedVerseObjectsFromString(
    verseString
  );
  // assign verseObjects with unaligned objects to be replaced with aligned ones
  verseObjects = JSON.parse(JSON.stringify(unalignedOrdered));
  // check each word in the verse string is also in the word bank or alignments
  const vereseObjectsNotInAlignmentData = verseStringWordsContainedInAlignments(
    alignments, wordBank, verseObjects
  );
  if (vereseObjectsNotInAlignmentData.length > 0) {
    const verseWordsJoined = vereseObjectsNotInAlignmentData.map(({text}) => text).join(', ');
    throw {message: `The words "${verseWordsJoined}" from the target language verse are not in the alignment data.`, type: 'InvalidatedAlignments'};
  }
  // each wordBank object should result in one verseObject
  wordBank.forEach(bottomWord => {
    const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(
      bottomWord
    );
    const index = VerseObjectHelpers.indexOfVerseObject(
      unalignedOrdered, verseObject
    );
    if (index > -1) verseObjects[index] = verseObject;
    else {
      throw {message: `Word: ${bottomWord.word} missing from word bank.`, type: 'InvalidatedAlignments'};
    }
  });
  let indicesToDelete = [];
  // each alignment should result in one verseObject
  alignments.forEach(alignment => {
    const {topWords, bottomWords} = alignment;
    // each bottomWord results in a nested verseObject of tag: w, type: word
    // located inside innermost nested topWord/k verseObject
    let replacements = {};
    bottomWords.forEach(bottomWord => {
      const verseObject = VerseObjectHelpers.wordVerseObjectFromBottomWord(
        bottomWord
      );
      const index = VerseObjectHelpers.indexOfVerseObject(
        unalignedOrdered, verseObject
      );
      if (index === -1) {
        throw {message: "VerseObject not found in verseText while merging:" + JSON.stringify(verseObject), type: 'InvalidatedAlignments'};
      }
      replacements[index] = verseObject;
    });
    // each topWord results in a nested verseObject of tag: k, type: milestone
    const milestones = topWords.map(topWord =>
      VerseObjectHelpers.milestoneVerseObjectFromTopWord(topWord)
    );
    const indices = Object.keys(replacements);
    // group consecutive indexes so that they can be aggregated
    const groupedConsecutiveIndices = ArrayHelpers.groupConsecutiveNumbers(
      indices
    );
    // loop through groupedConsecutiveIndices to reduce and place where needed.
    groupedConsecutiveIndices.forEach(consecutiveIndices => {
      // map the consecutiveIndices to replacement verseObjects
      const replacementVerseObjects = consecutiveIndices.map(
        index => replacements[index]
      );
      // remove and use the first index in group to place the aligned verseObject milestone later
      const indexToReplace = consecutiveIndices.shift();
      // the rest of the consecutiveIndices need to be queued to be deleted later after shift
      indicesToDelete = indicesToDelete.concat(consecutiveIndices);
      // place the replacementVerseObjects in the last milestone as children
      milestones[milestones.length - 1].children = replacementVerseObjects;
      // nest the milestones so that the first is the parent and each subsequent is nested
      const milestone = VerseObjectHelpers.nestMilestones(milestones);
      // replace the original verseObject from the verse text with the aligned milestone verseObject
      verseObjects[indexToReplace] = milestone;
    });
  });
  // deleteIndices that were queued due to consecutive bottomWords in alignments
  verseObjects = ArrayHelpers.deleteIndices(verseObjects, indicesToDelete);
  return verseObjects;
};

/**
 * Determines if the given verse objects from a string are contained in
 * the given alignments
 *
 * @param {Array} alignments - array of aligned word objects {bottomWords, topWords}
 * @param {Array} wordBank - array of unused topWords for aligning
 * @param {Object} verseObjects - verse objects from verse string to be checked
 * @return {boolean} - Returns if the given verse objects from a string are contained in
 * the given alignments
 */
export function verseStringWordsContainedInAlignments(
  alignments, wordBank, verseObjects) {
  return verseObjects.filter(verseObject => {
    const checkIfWordMatches = function(verseObject) {
      return function({word, occurrence, occurrences}) {
        const verseObjectWord = verseObject.text;
        const verseObjectOccurrence = verseObject.occurrence;
        const verseObjectOccurrences = verseObject.occurrences;
        return word === verseObjectWord &&
          occurrence === verseObjectOccurrence &&
          occurrences === verseObjectOccurrences;
      };
    };
    if (verseObject.type !== 'word') return false;
    const wordCheckerFunction = checkIfWordMatches(verseObject);
    const containedInWordBank = Boolean(wordBank.find(wordCheckerFunction));
    const containedInAlignments = Boolean(alignments.find(({bottomWords}) => {
      return Boolean(bottomWords.find(wordCheckerFunction));
    }));
    return !containedInWordBank && !containedInAlignments;
  });
}

/**
 * @description test to see if this is the same milestone (needed when milestones are not contiguous)
 * @param {Object} a - First milestone to test
 * @param {Object} b - Second milestone to test
 * @return {boolean} true if same milestone
 */
const sameMilestone = (a, b) => {
  const same = (a.type === b.type) &&
  (a.content === b.content) &&
  (a.occurrence === b.occurrence);
  return same;
};

/**
 * @description find the alignment to use for this milestone.  If milestone has already been given an alignment, then
 *                use that one.  Otherwise return null.  This is needed because milestones are not always
 *                contiguous.
 * @param {Array} baseMilestones - already found base milestones.
 * @param {Object} newMilestone - milestone not yet given an alignment
 * @return {Object} previous Alignment if found - else null.
 */
const getAlignmentForMilestone = (baseMilestones, newMilestone) => {
  for (let baseMilestone of baseMilestones) {
    if (baseMilestone.alignment &&
      sameMilestone(baseMilestone.milestone, newMilestone)) {
      return baseMilestone.alignment;
    }
  }
  return null;
};

/**
 * @description adds verse object to alignment
 * @param {Object} verseObject - Verse object to be added
 * @param {Object} alignment - The alignment object that will be added to
 */
export const addVerseObjectToAlignment = (verseObject, alignment) => {
  if (verseObject.type === 'milestone' && verseObject.children.length > 0) {
    const wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(
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
    const wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(
      verseObject
    );
    alignment.bottomWords.push(wordObject);
  }
};

/**
 * compare occurrences of a and b, and handle conversion to int if necessary
 * @param {Object} a - first occurrences value
 * @param {Object} b - second occurrence value
 * @return {boolean} - if they are the same or not
 */
const compareOccurrences = function(a, b) {
  let sameOccurrence = (a.occurrence === b.occurrence);
  if (!sameOccurrence && a.occurrence && b.occurrence) {
    if (typeof a.occurrence !== typeof b.occurrence) { // one may be string and the other an int
      const occurrence1 = (typeof a.occurrence === 'string') ? parseInt(a.occurrence, 10) : a.occurrence;
      const occurrence2 = (typeof b.occurrence === 'string') ? parseInt(b.occurrence, 10) : b.occurrence;
      sameOccurrence = (occurrence1 === occurrence2) && (occurrence1 !== 0);
    }
  }
  return sameOccurrence;
};

/**
 * @description Returns index of the verseObject in the alignments first milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
export const indexOfFirstMilestone = (alignments, verseObject) => {
  let index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex(alignment => {
      if (alignment.topWords.length > 0) {
        const _verseObject = alignment.topWords[0];
        if (_verseObject.word === verseObject.text) {
          return compareOccurrences(_verseObject, verseObject);
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description Returns index of the verseObject in the alignments milestone (ignores occurrences since that can be off)
 * @param {Array} alignments - array of the alignments to search in
 * @param {Object} verseObject - verseObject to search for
 * @return {Int} - the index of the verseObject
 */
export const indexOfMilestone = (alignments, verseObject) => {
  let index = -1;
  if (verseObject.type === 'word') {
    index = alignments.findIndex(alignment => {
      for (let _verseObject of alignment.topWords) {
        if (_verseObject.word === verseObject.text) {
          return compareOccurrences(_verseObject, verseObject);
        }
      }
      return false;
    });
  }
  return index;
};

/**
 * @description uses the alignedVerseString to order alignments
 * @param {String|Array} alignmentVerse - optional alignment verse
 * @param {Array} alignmentUnOrdered - alignments to order
 * @return {Array} ordered alignments if alignment string given, else unordered alignments
 */
export const orderAlignments = function(alignmentVerse, alignmentUnOrdered) {
  if (typeof alignmentVerse === 'string') {
    alignmentVerse = VerseObjectHelpers.getOrderedVerseObjectsFromString(
      alignmentVerse
    );
  } else {
    alignmentVerse = VerseObjectHelpers.getOrderedVerseObjects(alignmentVerse);
  }
  if (Array.isArray(alignmentVerse)) {
    let alignment = [];
    // order alignments
    for (let i = 0; i < alignmentVerse.length; i++) {
      const nextWord = alignmentVerse[i];
      let index = indexOfFirstMilestone(alignmentUnOrdered, nextWord);
      if ((index < 0) && (nextWord.type === 'word') && (i < alignmentVerse.length - 1)) {
        const wordAfter = alignmentVerse[i + 1];
        if (wordAfter.type === 'text') { // maybe this was punctuation split from word
          nextWord.text += wordAfter.text; // add possible punctuation
          index = indexOfFirstMilestone(alignmentUnOrdered, nextWord); // try again
        }
      }
      if (index >= 0) {
        alignment.push(alignmentUnOrdered[index]);
        alignmentUnOrdered.splice(index, 1); // remove item
      } else if (nextWord.type === 'word') { // if not found, may be either an unaligned topWord or merged topWord
        index = indexOfMilestone(alignmentUnOrdered, nextWord);
        if (index < 0) { // if not found in unordered list, try already ordered
          index = indexOfMilestone(alignment, nextWord);
        }
        if (index < 0) { // if still not found in topWords, it's an unaligned topWord
          const wordObject = VerseObjectHelpers.alignmentObjectFromVerseObject(
            nextWord
          );
          alignment.push({topWords: [wordObject], bottomWords: []});
        }
      }
    }
    if (alignmentUnOrdered.length > 0) {
      alignment = alignment.concat(alignmentUnOrdered);
    }
    return alignment;
  }
  return alignmentUnOrdered;
};

/**
 * @description pivots alignments into bottomWords/targetLanguage verseObjectArray sorted by verseText
 * @param {Array} verseObjects - array of aligned verseObjects [{milestone children={verseObject}}, ...]
 * @param {Array|Object|String} alignedVerse - optional verse to use for ordering alignments
 * @return {Object} - object of alignments (array of alignments) and wordbank (array of unused words)
 */
export const unmerge = (verseObjects, alignedVerse) => {
  let baseMilestones = [];
  let wordBank = [];
  let alignments = [];
  if (verseObjects && verseObjects.verseObjects) {
    verseObjects = verseObjects.verseObjects;
  }
  if (typeof alignedVerse !== 'string') {
    alignedVerse = VerseObjectHelpers.getWordList(alignedVerse);
  }
  for (let verseObject of verseObjects) {
    let alignment = getAlignmentForMilestone(baseMilestones, verseObject);
    if (!alignment) {
      alignment = {topWords: [], bottomWords: []};
      alignments.push(alignment);
      baseMilestones.push({alignment: alignment, milestone: verseObject});
    }
    addVerseObjectToAlignment(verseObject, alignment);
  }
  const alignmentUnOrdered = [];
  for (let _alignment of alignments) {
    if (_alignment.topWords.length > 0) {
      alignmentUnOrdered.push(_alignment);
    } else {
      wordBank = wordBank.concat(_alignment.bottomWords);
    }
  }
  let alignment = orderAlignments(alignedVerse, alignmentUnOrdered);
  return {alignment, wordBank};
};

