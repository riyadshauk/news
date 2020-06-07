/// <reference types="cypress" />
import { apiURLBuilder, apiURL } from '../../public/javascripts/config';

const newsDashboardURL = apiURL;

describe('Test the Trending News Master-Detail/List-Modal UI', () => {
  /**
   * @summary the Fetch API is not implemented in the Cypress environment,
   * so we must effectively stub out any fetch calls in the code being
   * tested by instead using the XHR API via a fetch() polyfill.
   */
  let fetchPollyfill;

  before(() => {
    const polyfillUrl = 'https://unpkg.com/unfetch/dist/unfetch.umd.js';
    cy.request(polyfillUrl).then(response => fetchPollyfill = response.body);
  });

  beforeEach(() => {
    const url = apiURLBuilder('US');
    cy.server();
    cy.route(url).as('fetchArticles');
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
  });

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
          const newsTitleHeadings = document.querySelectorAll('#top-headlines h3');
          console.log('newsTitleHeadings:', newsTitleHeadings);
          expect(detailedArticleSection.children.length).to.equal(0);
          const newsTitleIdx = Math.floor(Math.random() * newsTitleHeadings.length);
          expect(newsTitleIdx).to.be.lessThan(newsTitleHeadings.length);

          const newsTitle = newsTitleHeadings[newsTitleIdx];

          /**
           * @note I don't know why simply using Cypress to click via
           *  cy.get(`#national-news-titles > h3:nth-child(${newsTitleIdx + 1})`).click();
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

});