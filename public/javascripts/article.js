import { createFavoriteButton } from './favorite.js';

const populateArticleDetail = (article) => {
  const {
    title,
    description,
    url,
    urlToImage,
    publishedAt,
    content,
    source,
  } = article;
  const articleDetailSection = document.getElementById('article-detail');
  articleDetailSection.innerHTML = `
  <h3>
    <a href=${url}>
      ${title || 'NO TITLE AVAILABLE'}
    </a>
  <br>
  <h4>
    ${description || '[NO DESCRIPTION AVAILABLE.]'}
  </h4>
  <img src=${urlToImage} onerror="imgError(this)" />
  <p>
    Published at
    ${new Date(publishedAt).toLocaleString() || '[NO TIME PROVIDED]'}
    by <a href=
    ${url}>${(source || {}).name || '[UNKNOWN SOURCE]'}
    </a>.
  </p>
  <p>
    ${content || '[NO CONTENT AVAILABLE.]'}
  </p>
  `;
};

const createNewsTitleElement = (article) => {
  const { title } = article;
  const newsTitleElement = document.createElement('h3');
  newsTitleElement.textContent = title;
  newsTitleElement.onclick = () => populateArticleDetail(article);
  return newsTitleElement;
};

const displayArticlesError = () => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'Articles--error';
  // eslint-disable-next-line max-len
  errorDiv.innerHTML = '<h3>Unfortunately, there are no news articles associated with your selection.</h3>';
  return errorDiv;
};

export const newsTitlesSection = (
  document.getElementById('national-news-titles')
);

/**
 * @requires createFavoriteButton
 * @requires createNewsTitleElement
 * @summary A title row has a container – Why? So that clicking the favorite
 * button does not open up the article modal. However, clicking within the div
 * wrapped around title does.
 * @param {{}} article
 * @param {string} className
 */
const createTitleContainer = (article, className = '') => {
  const titleContainer = document.createElement('div');
  if (className) {
    titleContainer.classList.add(className);
  }

  const favoriteButtonContainer = document.createElement('div');
  favoriteButtonContainer.appendChild(createFavoriteButton(article));
  titleContainer.appendChild(favoriteButtonContainer);

  const titleElement = createNewsTitleElement(article);
  titleElement.classList.add('ArticleTitle');
  titleContainer.appendChild(titleElement);

  return titleContainer;
};

/**
 * @requires createTitleContainer
 * @param {HTMLElement} articlesContainer
 * @param {Array<{}>} articles
 * @param {string} className
 * @example article: {
 *     "source": {
 *         "id": "engadget",
 *         "name": "Engadget"
 *     },
 *     "author": "",
 *     "title": "Amazon sellers use 'collectible' label to dodge price gouging rules - Engadget",
 *     "description": "Third-party sellers on Amazon are using 'collectible' labels to get around rules preventing price gouging.",
 *     "url": "https://www.engadget.com/amazon-sellers-price-gouging-workaround-085620344.html",
 *     "urlToImage": "https://o.aolcdn.com/images/dims?resize=1200%2C630&crop=1200%2C630%2C0%2C0&quality=95&image_uri=https%3A%2F%2Fs.yimg.com%2Fos%2Fcreatr-images%2F2019-11%2F1f8c8c70-ffbc-11e9-b6ed-c6935565acf2&client=amp-blogside-v2&signature=75231182bdd2560fb0c5080b80bb60f4a27e0159",
 *     "publishedAt": "2020-05-31T09:31:22Z",
 *     "content": "Amazon’s measures to prevent price gouging have a relatively simple workaround. The Verge has learned that some third-party sellers are marking products as “collectible” to evade Amazon’s automated p… [+530 chars]"
 * },
 */
export const displayArticleTitles = (
  articlesContainer,
  articles,
  className = '',
) => {
  try {
    // eslint-disable-next-line no-param-reassign
    articlesContainer.innerHTML = '';
    articles.forEach((article) => articlesContainer
      .appendChild(createTitleContainer(article, className)));
    if (articles.length === 0) {
      articlesContainer.appendChild(displayArticlesError());
    }
  } catch (err) {
    // console.error(err.stack);
  }
};