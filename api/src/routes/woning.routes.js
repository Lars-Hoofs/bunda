 
/**
 * Bunda API - Woning Routes
 * 
 * Dit bestand definieert de routes voor woningen.
 */

const express = require('express');
const woningController = require('../controllers/woning.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route GET /api/woningen
 * @desc Haal alle woningen op (met filters)
 * @access Publiek
 */
router.get(
  '/',
  woningController.getWoningen
);

/**
 * @route GET /api/woningen/zoeken
 * @desc Zoek woningen binnen een straal
 * @access Publiek
 */
router.get(
  '/zoeken',
  validatieMiddleware.valideerZoekopdracht,
  woningController.zoekWoningen
);

/**
 * @route GET /api/woningen/uitgelicht
 * @desc Haal uitgelichte woningen op
 * @access Publiek
 */
router.get(
  '/uitgelicht',
  woningController.getUitgelichteWoningen
);

/**
 * @route POST /api/woningen
 * @desc Maak een nieuwe woning aan
 * @access Privé (alleen verkopers)
 */
router.post(
  '/',
  authMiddleware.authenticeer,
  authMiddleware.isVerkoper,
  validatieMiddleware.valideerWoning,
  woningController.maakWoning
);

/**
 * @route GET /api/woningen/:id
 * @desc Haal een woning op met ID
 * @access Publiek
 */
router.get(
  '/:id',
  woningController.getWoningById
);

/**
 * @route PUT /api/woningen/:id
 * @desc Update een woning
 * @access Privé (eigenaar of admin)
 */
router.put(
  '/:id',
  authMiddleware.authenticeer,
  authMiddleware.isWoningEigenaar,
  validatieMiddleware.valideerWoning,
  woningController.updateWoning
);

/**
 * @route DELETE /api/woningen/:id
 * @desc Verwijder een woning
 * @access Privé (eigenaar of admin)
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  authMiddleware.isWoningEigenaar,
  woningController.verwijderWoning
);

module.exports = router;