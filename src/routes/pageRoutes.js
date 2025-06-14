const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.renderHomePage);
router.get('/restaurantes', pageController.renderRestaurantsPage);

module.exports = router;