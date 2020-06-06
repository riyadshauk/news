export const port = '3033';
export const apiURL = 'http://0.0.0.0:3033';

const testEnv = true; // toggle this for deploying
const publicApiURL = 'https://riyadshauk.com/news'; // or whatever the public URL / IP address is that is accessible from browsers, on the same origin that the website is being hosted from
/**
 * @param {string} countryCode 
 */
export const apiURLBuilder = (countryCode = 'US') => `${testEnv ? apiURL : publicApiURL}/api?country=${countryCode}`;
