 
/**
 * Bunda API - Gebruiker Routes
 * 
 * Dit bestand definieert de routes voor gebruikersbeheer.
 */

const express = require('express');
const gebruikerController = require('../controllers/gebruiker.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route GET /api/gebruikers
 * @desc Haal lijst van gebruikers op (admin)
 * @access Privé (alleen admin)
 */
router.get(
  '/',
  authMiddleware.authenticeer,
  authMiddleware.isBeheerder,
  gebruikerController.getGebruikers
);

/**
 * @route GET /api/gebruikers/:id
 * @desc Haal gebruiker op met ID
 * @access Privé (eigen account of admin)
 */
router.get(
  '/:id',
  authMiddleware.authenticeer,
  gebruikerController.getGebruikerById
);

/**
 * @route PUT /api/gebruikers/:id
 * @desc Update gebruiker
 * @access Privé (eigen account of admin)
 */
router.put(
  '/:id',
  authMiddleware.authenticeer,
  validatieMiddleware.valideerGebruikerUpdate,
  gebruikerController.updateGebruiker
);

/**
 * @route DELETE /api/gebruikers/:id
 * @desc Verwijder gebruiker
 * @access Privé (eigen account of admin)
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  gebruikerController.verwijderGebruiker
);

/**
 * @route GET /api/gebruikers/:id/woningen
 * @desc Haal woningen op van een verkoper
 * @access Publiek
 */
router.get(
  '/:id/woningen',
  gebruikerController.getGebruikerWoningen
);

module.exports = router;