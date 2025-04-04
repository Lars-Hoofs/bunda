/**
 * Bunda API - Gebruiker Routes
 * 
 * Dit bestand definieert de routes voor gebruikersbeheer.
 */

const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');
const gebruikerController = require('../controllers/gebruiker.controller');

// Debug logging
console.log('Controller functions:', Object.keys(gebruikerController));
console.log('updateGebruiker type:', typeof gebruikerController.updateGebruiker);

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
// Using a temporary inline function to isolate the issue
router.put(
  '/:id',
  authMiddleware.authenticeer,
  validatieMiddleware.valideerGebruikerUpdate,
  (req, res, next) => {
    console.log('Temporary route handler called');
    try {
      // If the controller function exists, call it
      if (typeof gebruikerController.updateGebruiker === 'function') {
        return gebruikerController.updateGebruiker(req, res, next);
      } else {
        console.error('updateGebruiker is not a function:', typeof gebruikerController.updateGebruiker);
        res.status(500).json({ 
          succes: false, 
          bericht: 'Interne serverfout. Probeer het later opnieuw.' 
        });
      }
    } catch (error) {
      console.error('Error in PUT route handler:', error);
      next(error);
    }
  }
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