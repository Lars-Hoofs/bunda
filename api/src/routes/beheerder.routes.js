 
/**
 * Bunda API - Beheerder Routes
 * 
 * Dit bestand definieert de routes voor beheerders (admin).
 */

const express = require('express');
const beheerderController = require('../controllers/beheerder.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Alle routes in dit bestand vereisen beheerderrechten
 */
router.use(authMiddleware.authenticeer);
router.use(authMiddleware.isBeheerder);

/**
 * @route GET /api/beheerder/dashboard
 * @desc Haal dashboard statistieken op
 * @access Privé (alleen admin)
 */
router.get(
  '/dashboard',
  beheerderController.getDashboardStats
);

/**
 * @route GET /api/beheerder/gebruikers
 * @desc Beheer gebruikers
 * @access Privé (alleen admin)
 */
router.get(
  '/gebruikers',
  beheerderController.getGebruikers
);

/**
 * @route PUT /api/beheerder/gebruikers/:id/rol
 * @desc Update gebruiker rol
 * @access Privé (alleen admin)
 */
router.put(
  '/gebruikers/:id/rol',
  beheerderController.updateGebruikerRol
);

/**
 * @route GET /api/beheerder/woningen
 * @desc Beheer woningen
 * @access Privé (alleen admin)
 */
router.get(
  '/woningen',
  beheerderController.getWoningen
);

/**
 * @route PUT /api/beheerder/woningen/:id/uitgelicht
 * @desc Markeer/verwijder woning als uitgelicht
 * @access Privé (alleen admin)
 */
router.put(
  '/woningen/:id/uitgelicht',
  beheerderController.toggleWoningUitgelicht
);

/**
 * @route PUT /api/beheerder/woningen/:id/status
 * @desc Update woning status
 * @access Privé (alleen admin)
 */
router.put(
  '/woningen/:id/status',
  beheerderController.updateWoningStatus
);

/**
 * @route GET /api/beheerder/bezichtigingen
 * @desc Beheer alle bezichtigingen
 * @access Privé (alleen admin)
 */
router.get(
  '/bezichtigingen',
  beheerderController.getBezichtigingen
);

/**
 * @route GET /api/beheerder/activiteiten
 * @desc Bekijk activiteitenlogboek
 * @access Privé (alleen admin)
 */
router.get(
  '/activiteiten',
  beheerderController.getActiviteitenLog
);

module.exports = router;