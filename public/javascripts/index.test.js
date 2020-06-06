import { retrieveTopHeadlines } from './index.js';
import fetch from '../mocks/isomorphic-fetch.js';
import localStorageMock from '../mocks/localStorage';
import { apiURLBuilder } from './config.js';

const nextStubbedFetch = (articles, countryCode = 'US') => fetch
  .mock(apiURLBuilder(countryCode), { articles });
const freshArticles = [1, 2, 3];
const staleCachedArticles = [4, 5, 6];
const vacuousArticles = [];
const countryWithData = 'US';
const countryWithoutData = 'AF';

const runTestCases = (countryCode, messagePrefix) => {
  const articlesFromAPI = countryCode === countryWithData ? freshArticles : vacuousArticles;
  test(messagePrefix + 'without cache', async () => {
    Object.defineProperty(global, 'fetch', {
      value: nextStubbedFetch(articlesFromAPI, countryCode),
    });

    const articles = await retrieveTopHeadlines(countryCode);
    // @ts-ignore
    expect(articles).toStrictEqual(articlesFromAPI);
  });

  test(messagePrefix + 'with expired cache', async () => {
    Object.defineProperty(global, 'fetch', {
      value: nextStubbedFetch(articlesFromAPI, countryCode),
    });

    const staleRetrievalTime = Date.now() - (5 * 3600) * 1000;
    window.localStorage.setItem(apiURLBuilder('US'), JSON.stringify({
      articles: staleCachedArticles, retrievalTime: staleRetrievalTime,
    }));

    const articles = await retrieveTopHeadlines(countryCode);
    // @ts-ignore
    expect(articles).toStrictEqual(articlesFromAPI);
  });

  test(messagePrefix + 'with valid cache', async () => {
    Object.defineProperty(global, 'fetch', {
      value: nextStubbedFetch(articlesFromAPI, countryCode),
    });

    const freshRetrievalTime = Date.now() - 30;
    window.localStorage.setItem(apiURLBuilder('US'), JSON.stringify({
      articles: articlesFromAPI, retrievalTime: freshRetrievalTime,
    }));
    // console.log(`window.localStorage.getItem(apiURLBuilder(${countryCode})):`, window.localStorage.getItem(apiURLBuilder(countryCode)), `apiURLBuilder(${countryCode}):`, apiURLBuilder(countryCode));

    const articles = await retrieveTopHeadlines(countryCode);
    // @ts-ignore
    expect(articles).toStrictEqual(articlesFromAPI);
  });
};

describe('retrieveTopHeadlines', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  afterEach(() => {
    fetch.restore();
    fetch.reset();
    window.localStorage.removeItem(apiURLBuilder(countryWithData));
    window.localStorage.removeItem(apiURLBuilder(countryWithoutData));
  });

  describe('Retrieve meaningful articles ([1, 2, 3])', () =>
    runTestCases(countryWithData, 'Retrieve meaningful articles ([1, 2, 3]) '));

  describe('Retrieve vacuous articles ([])', () =>
    runTestCases(countryWithoutData, 'Retrieve vacuous articles ([]) '));
});