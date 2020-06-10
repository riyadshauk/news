/// <reference types="cypress" />
import { apiURLBuilder, apiURL } from '../../public/javascripts/config';

const newsDashboardURL = apiURL;
const NO_ARTICLES_MSG = 'Unfortunately, there are no news articles associated with your selection.';

/**
 * @summary the Fetch API is not implemented in the Cypress environment,
 * so we must effectively stub out any fetch calls in the code being
 * tested by instead using the XHR API via a fetch() polyfill.
 */
let fetchPollyfill;

const doBeforeEach = (countryCode = 'US', fetchArticles = 'fetchArticles') => {
  const url = apiURLBuilder(countryCode);
  cy.server();
  cy.route(url).as(fetchArticles);
  cy.request(url);

  cy.visit(newsDashboardURL, {
    onBeforeLoad: win => {
      delete win.fetch;
      // @ts-ignore
      win.eval(fetchPollyfill); // Property 'eval' does not exist on type 'Window'; Cypress win has eval injected.
      // @ts-ignore
      win.fetch = win.unfetch;
    },
  });
};

describe('Test the Trending News Master-Detail/List-Modal UI', () => {
  before(() => {
    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
    cy.request(polyfillUrl).then(response => fetchPollyfill = response.body);
  });

  beforeEach(() => doBeforeEach());

  it('Displays fresh/uncached initial list of news titles for default country (eg, US)', () => { // happy path : )
    cy.contains('Top News Headlines for The United States');
    cy.window().then(({ document }) => {
      const newsTitleElements = document.getElementById('national-news-titles').children;
      const initiallyNoArticlesArePresent = JSON.stringify(newsTitleElements) === '{}';
      expect(initiallyNoArticlesArePresent, 'initiallyNoArticlesArePresent').to.be.true;

      cy.wait('@fetchArticles').then(() => {
        expect(newsTitleElements.length).to.be.greaterThan(0);
      });
    });
  });

  /**
   * @todo This test case was working, as expected, before I did some refactoring,
   * but now, although it is passing, it [sometimes – why??] only seems to wait for
   * one article to be retrieved, even though the response returns more articles...
   */
  it('Does not display detailed article section, until an article is clicked, '
    + 'and the info in the detailed article section should directly correspond '
    + 'to the clicked title.', () => {
      cy.window().then(({ document }) => {
        const detailedArticleSection = document.getElementById('article-detail');
        cy.wait('@fetchArticles').then(() => {
          const newsTitleHeadings = document.querySelectorAll('#top-headlines .ArticleTitle');
          expect(detailedArticleSection.children.length).to.equal(0);
          const newsTitleIdx = Math.floor(Math.random() * newsTitleHeadings.length);
          expect(newsTitleIdx).to.be.lessThan(newsTitleHeadings.length);

          const newsTitle = newsTitleHeadings[newsTitleIdx];

          /**
           * @note I don't know why simply using Cypress to click via
           *  cy.get(`#national-news-titles > .ArticleTitle:nth-child(${newsTitleIdx + 1}) > h5`)
           *    .click({force: true})
           * doesn't work...
           */
          // @ts-ignore
          newsTitle.click();

          expect(detailedArticleSection.children.length).to.be.greaterThan(0);
          const detailedArticleTitleWithoutPrefixedTitleWord =
            detailedArticleSection.children[0].textContent.replace('Title', '');
          expect(detailedArticleTitleWithoutPrefixedTitleWord.trim()).to.equal(newsTitle.textContent);

        });
      });
    });

  describe('Initially hides "Selected Article" and "Favorites" sections, '
    + 'and can toggle both (by clicking on previous selected article or '
    + 'clicking the favorite slide-out/in icon, according)', () => {

      let document;
      let favoriteTitleHeadings;
      let fetchPollyfill;
      before(() => {
        const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
        cy.request(polyfillUrl).then(response => fetchPollyfill = response.body);
      });

      beforeEach(() => {
        doBeforeEach();

        cy.window().then((window) => {
          document = window.document;
          cy.wait('@fetchArticles').then(() => {
            favoriteTitleHeadings = document.querySelectorAll('#favorite-articles h5');
          });
        });
      });

      it('Initially does not have favorited articles', () => {
        cy.get('.SideBar-btn').click().then(() => {
          expect(favoriteTitleHeadings.length).to.equal(1);
          expect(favoriteTitleHeadings[0].textContent).to.equal(NO_ARTICLES_MSG);
        });
      });

      it('Initially hides "Favorites" section/sidebar, and can toggle its visibility', () => {
        expect(Cypress.dom.isVisible(document.getElementById('favorites-section'))).to.equal(false);
        cy.get('.SideBar-btn').click().then(() => {
          expect(Cypress.dom.isVisible(document.getElementById('favorites-section'))).to.equal(true);
        });
      });

      it('Initially hides "Selected Article" section', () => {
        expect(Cypress.dom.isVisible(document.getElementById('article-detail-container'))).to.equal(false);
      });

      it('Shows article in "Selected Article" section only when its article title is clicked', () => {
        const articleDetailSection = document.getElementById('article-detail');
        cy.get('#top-headlines .ArticleTitle').first().click({ force: true }).then(() => {
          expect(Cypress.dom.isVisible(document.getElementById('article-detail-container'))).to.equal(true);
          expect(articleDetailSection.children.length).to.be.greaterThan(0);
          cy.get('#top-headlines .ArticleTitle').first().click({ force: true }).then(() => {
            expect(Cypress.dom.isVisible(document.getElementById('article-detail-container'))).to.equal(false);
          });
        });
      });

      it('Can properly "favorite" and "unfavorite" an article', () => {
        cy.get('.SideBar-btn').click().then(() => {
          const newsTitleSections = document.querySelectorAll('#top-headlines');
          const firstNewsTitleSection = newsTitleSections[0];
          cy.get('#top-headlines button').first().click().then(() => {
            favoriteTitleHeadings = document.querySelectorAll('#favorite-articles h5');
            expect(favoriteTitleHeadings.length).to.equal(1);
            expect(favoriteTitleHeadings[0].textContent).to.equal(firstNewsTitleSection.querySelector('h5').textContent);
            cy.get('#top-headlines button').first().click().then(() => {
              favoriteTitleHeadings = document.querySelectorAll('#favorite-articles h5');
              expect(favoriteTitleHeadings.length).to.equal(1);
              expect(favoriteTitleHeadings[0].textContent).to.equal(NO_ARTICLES_MSG);
            });
          });
        });
      });

    });

  describe('API and page-level filtering should properly function', () => {

    let fetchPollyfill;
    before(() => {
      const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
      cy.request(polyfillUrl).then(response => fetchPollyfill = response.body);
    });

    it('Get no results from country with no available news data (Afghanistan)', () => {
      doBeforeEach('AF', 'fetchAfghanistan');
      cy.window().then((window) => {
        const document = window.document;
        cy.get('#select-country-dropdown').select('Afghanistan');
        cy.wait('@fetchAfghanistan').then(() => {
          const articleHeadings = document.querySelectorAll('#national-news-titles h5');
          expect(articleHeadings.length).to.equal(1);
          expect(articleHeadings[0].textContent).to.equal(NO_ARTICLES_MSG);
        });
      });
    });

    it('Get results from a different country with news data (Australia)', () => {
      doBeforeEach('AU', 'fetchAustralia');
      cy.window().then((window) => {
        const document = window.document;
        cy.get('#select-country-dropdown').select('Australia');
        cy.wait('@fetchAustralia').then(() => {
          const articleHeadings = document.querySelectorAll('#national-news-titles h5');
          expect(articleHeadings.length).to.be.greaterThan(1);
          expect(articleHeadings[0].textContent).to.not.equal(NO_ARTICLES_MSG);
        });
      });
    });

    /**
     * The main issue with testing this without mocking/using a fixture,
     * is how would we even verify: What about testing phrases?
     * Rather than doing pure e2e testing here, it's nice to still test
     * the UI and expected results with e2e, but while mocking the article
     * data.
     */
    it('Filter article titles by including/excluding phrases and words.', () => {
      cy.fixture('articles').then(articles => {
        const url = apiURLBuilder('US');
        cy.server();
        cy.route('GET', url, articles).as('fetchArticles'); // pass in the fixture here for mocking
        cy.request(url);

        cy.visit(newsDashboardURL, {
          onBeforeLoad: win => {
            delete win.fetch;
            // @ts-ignore
            win.eval(fetchPollyfill); // Property 'eval' does not exist on type 'Window'; Cypress win has eval injected.
            // @ts-ignore
            win.fetch = win.unfetch;
          },
        }).then(() => {
          cy.window().then((window) => {
            const document = window.document;
            cy.wait('@fetchArticles').then(() => {
              // cy.get('#top-headlines button').click({ multiple: true }).then(() => { // favorite every article
              cy.fixture('filters').then(filters => {
                filters.forEach(({ term, titles }) => {
                  const backspaceCode = '{backspace}';
                  let deletePreviousInputTerm = '';
                  for (let i = 0; i < 100; i++) deletePreviousInputTerm += backspaceCode;
                  cy.get('#articles-filter').type(deletePreviousInputTerm + term).then(() => {
                    const titleSet = new Set(titles);

                    const articleHeadings = document.querySelectorAll('#national-news-titles h5');
                    expect(articleHeadings.length).to.equal(titles.length);
                    articleHeadings.forEach(heading => expect(titleSet.has(heading.textContent)).to.equal(true));

                    // const favoriteHeadings = document.querySelectorAll('#favorite-articles h5');
                    // expect(favoriteHeadings.length).to.equal(titles.length);
                    // favoriteHeadings.forEach(heading => expect(titleSet.has(heading.textContent)).to.equal(true));

                  });
                });
              });
              // });

            });
          });
        });
      });

    });

  });

});