import tokenize from './web_modules/search-text-tokenizer.js';

/**
 * @param {string} query
 * @returns {(s: string) => boolean} passesFilterCriteria
 */
// eslint-disable-next-line import/prefer-default-export
export const passesFilterCriteriaFrom = (query) => {
  const terms = tokenize(query);
  const passesFilterCriteria = (string) => {
    let passesCriteriaForPrevTerm = true; // vacuously
    for (let i = 0; i < terms.length; i += 1) {
      const { term, exclude } = terms[i];
      passesCriteriaForPrevTerm = (
        !exclude && string.includes(term)) || (exclude && !string.includes(term)
      );
      if (!passesCriteriaForPrevTerm) {
        return false;
      }
    }
    return true;
  };
  return passesFilterCriteria;
};