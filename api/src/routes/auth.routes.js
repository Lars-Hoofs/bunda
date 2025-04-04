 
/**
 * Bunda API - Authenticatie Routes
 * 
 * Dit bestand definieert de routes voor authenticatie.
 */

const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/registreren
 * @desc Registreer een nieuwe gebruiker
 * @access Publiek
 */
router.post(
  '/registreren',
  validatieMiddleware.valideerRegistratie,
  authController.registreren
);

/**
 * @route POST /api/auth/inloggen
 * @desc Log een gebruiker in en verkrijg een token
 * @access Publiek
 */
router.post(
  '/inloggen',
  validatieMiddleware.valideerLogin,
  authController.inloggen
);

/**
 * @route POST /api/auth/vernieuw-token
 * @desc Vernieuw een toegangstoken met een verversingstoken
 * @access Publiek
 */
router.post(
  '/vernieuw-token',
  authController.vernieuwToken
);

/**
 * @route POST /api/auth/wachtwoord-vergeten
 * @desc Start het wachtwoord reset proces
 * @access Publiek
 */
router.post(
  '/wachtwoord-vergeten',
  authController.wachtwoordVergeten
);

/**
 * @route POST /api/auth/wachtwoord-resetten
 * @desc Reset een wachtwoord met een token
 * @access Publiek
 */
router.post(
  '/wachtwoord-resetten',
  authController.wachtwoordResetten
);

/**
 * @route GET /api/auth/mijn-account
 * @desc Haal het profiel van de huidige ingelogde gebruiker op
 * @access Privé
 */
router.get(
  '/mijn-account',
  authMiddleware.authenticeer,
  authController.getMijnAccount
);

module.exports = router;