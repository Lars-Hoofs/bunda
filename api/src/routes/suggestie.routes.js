/**
 * Bunda API - Suggestie Routes
 * 
 * Dit bestand definieert de routes voor adressuggesties en geocoding.
 */

const express = require('express');
const suggestieController = require('../controllers/suggestie.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route GET /api/suggesties/adres
 * @desc Haalt adressuggesties op voor autocomplete
 * @access Publiek
 */
router.get(
  '/adres',
  suggestieController.getAdresSuggesties
);

/**
 * @route GET /api/suggesties/geocode
 * @desc Voert geocoding uit voor een specifiek adres
 * @access Publiek
 */
router.get(
  '/geocode',
  suggestieController.geocodeAdres
);

/**
 * @route GET /api/suggesties/reverseGeocode
 * @desc Voert reverse geocoding uit voor coördinaten
 * @access Publiek
 */
router.get(
  '/reverseGeocode',
  suggestieController.reverseGeocode
);

/**
 * @route POST /api/suggesties/reistijden
 * @desc Haalt reistijden op naar voorzieningen
 * @access Publiek
 */
router.post(
  '/reistijden',
  suggestieController.getReistijden
);

/**
 * @route GET /api/suggesties/cache-stats
 * @desc Haalt geocoding cache statistieken op
 * @access Privé (alleen admin)
 */
router.get(
  '/cache-stats',
  authMiddleware.authenticeer,
  authMiddleware.isBeheerder,
  suggestieController.getCacheStats
);

module.exports = router;