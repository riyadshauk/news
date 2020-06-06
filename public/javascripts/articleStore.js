import Store from './store.js';
/**
 * @summary This is essentially a variation of sessionStorage,
 * as oppose to localStorage but it shouldn't survive page reloads.
 */
export default new Store({
  articles: [],
  countryCode: '',
  filter: '',
  lastRetrievedArticlesURL: '',
});