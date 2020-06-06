import { countryToCountryCode } from './reference.js';
import store from './articleStore.js';
import { apiURLBuilder } from './config.js';
import { displayArticleTitles, newsTitlesSection } from './article.js';
import { favoriteArticlesSection, retrieveFavoriteArticles } from './favorite.js';
import { article, favorite } from './styles.js';
import { passesFilterCriteriaFrom } from './filter.js';

const { setState, state } = store;

const buildSelectCountryDropdown = () => {
  const countryDropdown = document.getElementById('select-country-dropdown');
  Object.entries(countryToCountryCode).forEach(([countryName, countryCode]) => {
    const countryItem = document.createElement('option');
    countryItem.append(countryName);
    countryItem.value = countryCode;
    countryItem.id = countryCode;
    countryDropdown.appendChild(countryItem);
    countryItem.onclick = toggleCountry;
  });
};

const displayFavoriteArticleTitles = () => {
  displayArticleTitles(favoriteArticlesSection, retrieveFavoriteArticles(), favorite.menuItem);
};

const displayLastRetrievedArticleTitles = () => {
  const lastRetrievedArticles = localStorage.getItem(state.lastRetrievedArticlesURL);
  const articles = JSON.parse(lastRetrievedArticles || "{}").articles || [];
  displayArticleTitles(newsTitlesSection, articles, article.menuItem);
};

window.onload = async () => {
  buildSelectCountryDropdown();
  const countryDropdown = document.getElementById('select-country-dropdown');
  try {
    await toggleCountry({ target: countryDropdown.firstElementChild });
  } catch { }
  favoriteArticlesSection.addEventListener('favoriteArticlesUpdated', displayFavoriteArticleTitles);
  favoriteArticlesSection.addEventListener('favoriteArticlesUpdated', displayLastRetrievedArticleTitles);
  displayFavoriteArticleTitles();
};

const isWithinXHoursOfNow = (otherTime, x = 0.5) =>
  (Date.now() - otherTime) / 1000 < (x * 3600);

/**
 * @description Retrieves (and caches) top headlines from the News API. If a request
 * (for a specific countryCode) has been made from this browser in the past half-hour,
 * then it will just use the saved articles in localStorage.
 * 
 * Although this takes some space on the user's browser,
 * I don't want to run out of API calls using my (free) API key.
 * 
 * @todo This is only being exported to test with Jest... Tried using rewire...
 * Ideally, there should be a better option than needing to modify/export
 * source just to test it.
 */
export const retrieveTopHeadlines = async countryCode => {
  const url = apiURLBuilder(countryCode);
  let { articles, retrievalTime } = (JSON.parse(localStorage.getItem(url) || '{}'));
  if (articles && isWithinXHoursOfNow(retrievalTime, 0.5)) {
    setState({ articles, lastRetrievedArticlesURL: url });
    return articles;
  }
  articles = [];
  try {
    const response = await fetch(url);
    articles = (await response.json()).articles;
  } catch (err) {
    console.error(err.stack);
  }
  localStorage.setItem(url, JSON.stringify({ articles, retrievalTime: Date.now() }));
  setState({ articles, lastRetrievedArticlesURL: url });
  return articles;
};


const toggleCountry = async ({ target }) => {
  const country = target.firstChild.textContent;
  let formattedCountry;
  if (country.indexOf('United') === 0) {
    formattedCountry = `The ${country}`;
  } else {
    formattedCountry = country;
  }
  document.getElementById('header').innerHTML = `Top News Headlines for ${formattedCountry}`;
  setState({ countryCode: countryToCountryCode[country] });
  const countryCode = state.countryCode || 'US';
  const articles = await retrieveTopHeadlines(countryCode);
  displayArticleTitles(newsTitlesSection, articles, article.menuItem);
};

/**
 * @description Filters articles (case-insensitive) shown on the news feed
 * (in both the main articles section, and the favorites section).
 * @param {*} target 
 */
export const filterArticles = (target) => {
  setTimeout(() => {
    const { value } = target;
    const passesFilterCriteria = passesFilterCriteriaFrom(value.toLowerCase());
    const filteredArticles = state.articles
      .filter(({ title }) => passesFilterCriteria(title.toLowerCase()));
    displayArticleTitles(newsTitlesSection, filteredArticles, article.menuItem);
    const filteredArticleSet = new Set(filteredArticles.map(({ title }) => title));
    const filteredFavoriteTitles = retrieveFavoriteArticles()
      .filter(({ title }) => filteredArticleSet.has(title));
    displayArticleTitles(favoriteArticlesSection, filteredFavoriteTitles, favorite.menuItem);
  }, 10);
};

/**
 * Strangely, the broken images load perfectly fine in Firefox, when this function
 * is provided to the onerror attribute of the img tags...
 * However, when the onerror attribute is removed, some of the images are broken.
 * @param image
 * @summary The actual body of this function seems to be irrelevant to
 * the behavior of this SPA.
 */
export const imgError = image => {
  image.onerror = '';
  image.src = '';
  return true;
};

export const toggleSidebar = () =>
  document.getElementById('favorites-section').classList.toggle('--active');