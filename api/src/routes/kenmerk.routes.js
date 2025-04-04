 
/**
 * Bunda API - Kenmerk Routes
 * 
 * Dit bestand definieert de routes voor kenmerken.
 */

const express = require('express');
const kenmerkController = require('../controllers/kenmerk.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route GET /api/kenmerken
 * @desc Haal alle kenmerken op
 * @access Publiek
 */
router.get(
  '/',
  kenmerkController.getKenmerken
);

/**
 * @route POST /api/kenmerken
 * @desc Maak een nieuw kenmerk aan (admin)
 * @access Privé (alleen admin)
 */
router.post(
  '/',
  authMiddleware.authenticeer,
  authMiddleware.isBeheerder,
  validatieMiddleware.valideerKenmerk,
  kenmerkController.maakKenmerk
);

/**
 * @route PUT /api/kenmerken/:id
 * @desc Update een kenmerk (admin)
 * @access Privé (alleen admin)
 */
router.put(
  '/:id',
  authMiddleware.authenticeer,
  authMiddleware.isBeheerder,
  validatieMiddleware.valideerKenmerk,
  kenmerkController.updateKenmerk
);

/**
 * @route DELETE /api/kenmerken/:id
 * @desc Verwijder een kenmerk (admin)
 * @access Privé (alleen admin)
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  authMiddleware.isBeheerder,
  kenmerkController.verwijderKenmerk
);

/**
 * @route GET /api/kenmerken/categorieen
 * @desc Haal alle kenmerk categorieën op
 * @access Publiek
 */
router.get(
  '/categorieen',
  kenmerkController.getKenmerkCategorieen
);

/**
 * @route GET /api/kenmerken/woning/:woningId
 * @desc Haal kenmerken van een woning op
 * @access Publiek
 */
router.get(
  '/woning/:woningId',
  kenmerkController.getWoningKenmerken
);

/**
 * @route POST /api/kenmerken/woning/:woningId
 * @desc Voeg kenmerken toe aan een woning
 * @access Privé (woning eigenaar of admin)
 */
router.post(
  '/woning/:woningId',
  authMiddleware.authenticeer,
  authMiddleware.isWoningEigenaar,
  validatieMiddleware.valideerWoningKenmerken,
  kenmerkController.voegWoningKenmerkenToe
);

/**
 * @route DELETE /api/kenmerken/woning/:woningId/:kenmerkId
 * @desc Verwijder een kenmerk van een woning
 * @access Privé (woning eigenaar of admin)
 */
router.delete(
  '/woning/:woningId/:kenmerkId',
  authMiddleware.authenticeer,
  authMiddleware.isWoningEigenaar,
  kenmerkController.verwijderWoningKenmerk
);

module.exports = router;