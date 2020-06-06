import { SVGButton } from './styles.js';

const favoriteArticlesUpdated = new Event('favoriteArticlesUpdated');

const retrieveFavoriteArticlesJSON = () => {
  const key = 'favoriteArticlesJSON';
  let articles = {};
  try {
    articles = JSON.parse(localStorage.getItem(key));
  } catch { }
  if (articles === null) {
    localStorage.setItem(key, JSON.stringify({}));
    articles = {};
  }
  return articles;
};

export const retrieveFavoriteArticles = () => Object.values(retrieveFavoriteArticlesJSON());

const articleHash = article => article.publishedAt + article.title;

const addFavoriteArticle = article => {
  const favoriteArticlesJSON = retrieveFavoriteArticlesJSON();
  favoriteArticlesJSON[articleHash(article)] = article;
  // Note: setting this string in storage every time seems sub-optimal, but at least it avoids potential bugs.
  localStorage.setItem('favoriteArticlesJSON', JSON.stringify(favoriteArticlesJSON));
};

const removeFavoriteArticle = article => {
  const favoriteArticlesJSON = retrieveFavoriteArticlesJSON();
  const key = articleHash(article);
  if (favoriteArticlesJSON[key] !== undefined) {
    delete favoriteArticlesJSON[key];
    // Note: setting this string in storage every time seems sub-optimal, but at least it avoids potential bugs.
    localStorage.setItem('favoriteArticlesJSON', JSON.stringify(favoriteArticlesJSON));
  }
};

export const favoriteArticlesSection = document.getElementById('favorite-articles');

const emitFavoriteArticlesUpdated = () => {
  favoriteArticlesSection.dispatchEvent(favoriteArticlesUpdated);
};

const notFavorited = article => retrieveFavoriteArticlesJSON()[articleHash(article)] === undefined;

export const createFavoriteButton = article => {
  const favoriteButton = document.createElement('button');
  favoriteButton.innerHTML = `
  <button class="btn-octicon" type="button" aria-label="Favorite Button">
    <svg class="octicon star" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" width="14" height="16">
      <path class="FavoriteButtonSVGPath" fill-rule="evenodd" d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z">
      </path>
    </svg>
  </button>
  `;
  favoriteButton.value = notFavorited(article) ? 'Favorite' : 'Un-favorite';
  favoriteButton.classList.add('FavoriteButton');
  // favoriteButton.setAttribute('style', "padding: 0; border: none; background: none; fill:blue;")
  favoriteButton.onclick = e => {
    e.preventDefault();
    favoriteButton.querySelector('svg').classList.toggle('--favorited');
    if (favoriteButton.value === 'Favorite') {
      addFavoriteArticle(article);
    } else {
      removeFavoriteArticle(article);
    }
    /**
     * Note: Be careful not to change the button text before checking the above conditions : )
     * Also, this line does favoriteButton.textContent initialization based on values from localStorage
     */
    favoriteButton.value = notFavorited(article) ? 'Favorite' : 'Un-favorite';
    const updateFavButtonTextOnClick = () => {
      favoriteButton.value === 'Favorite' ? 'Un-favorite' : 'Favorite';
    }
    favoriteButton.addEventListener('favoriteArticlesUpdated', updateFavButtonTextOnClick);
    emitFavoriteArticlesUpdated();
  };
  return favoriteButton;
};