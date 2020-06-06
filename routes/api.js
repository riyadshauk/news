const express = require('express');
const router = express.Router();
const { get } = require('http');

const apiURLBuilder = countryCode => 'http://newsapi.org/v2/top-headlines?' +
  `country=${countryCode}&` +
  'apiKey=0c9bcb5d89fe4399aced0c7f1d829135';

const fetchArticles = url => new Promise((resolve, reject) => {
  let error;
  let articles = [];
  get(url, (reader, rawData = '') => {
    reader.on('error', err => error = err);
    reader.on('data', chunk => rawData += chunk);
    reader.on('end', () => {
      try {
        articles = JSON.parse(rawData).articles;
      } catch (error) {
        return reject(error);
      }
      if (error) {
        return reject(error);
      }
      return resolve(articles);
    });
  });
});

/* GET Top Headlines . */
router.get('/', async (req, res) => {
  const { country } = req.query;
  const url = apiURLBuilder(country);
  try {
    const articles = await fetchArticles(url);
    return res.json({ articles });
  } catch (error) {
    return res.status(404).json({ err: error });
  }
});

module.exports = router;