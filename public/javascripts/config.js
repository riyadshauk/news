export const test = {
  port: '3033',
  apiURL: 'http://localhost:3033'
}
export const prod = {
  port: '443',
  apiURL: 'https://riyadshauk.com/news'
};
/**
 * @param {string} countryCode 
 * 
 * @todo default this to use prod.apiURL, then stub out
 * (programmatically overwrite) this to test.apiURL inside of tests.
 */
export const apiURLBuilder = (countryCode = 'US') => `${test.apiURL}/api?country=${countryCode}`;