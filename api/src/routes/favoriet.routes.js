 
/**
 * Bunda API - Favoriet Routes
 * 
 * Dit bestand definieert de routes voor favorieten.
 */

const express = require('express');
const favorietController = require('../controllers/favoriet.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route GET /api/favorieten
 * @desc Haal favorieten van huidige gebruiker
 * @access Privé
 */
router.get(
  '/',
  authMiddleware.authenticeer,
  favorietController.getFavorieten
);

/**
 * @route POST /api/favorieten
 * @desc Voeg een woning toe aan favorieten
 * @access Privé
 */
router.post(
  '/',
  authMiddleware.authenticeer,
  validatieMiddleware.valideerFavoriet,
  favorietController.voegFavorietToe
);

/**
 * @route DELETE /api/favorieten/:id
 * @desc Verwijder een favoriet
 * @access Privé
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  favorietController.verwijderFavoriet
);

/**
 * @route DELETE /api/favorieten/woning/:woningId
 * @desc Verwijder een woning uit favorieten
 * @access Privé
 */
router.delete(
  '/woning/:woningId',
  authMiddleware.authenticeer,
  favorietController.verwijderWoningUitFavorieten
);

module.exports = router;