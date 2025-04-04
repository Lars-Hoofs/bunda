 
/**
 * Bunda API - Bezichtiging Routes
 * 
 * Dit bestand definieert de routes voor bezichtigingen.
 */

const express = require('express');
const bezichtigingController = require('../controllers/bezichtiging.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validatieMiddleware = require('../middleware/validatie.middleware');

const router = express.Router();

/**
 * @route GET /api/bezichtigingen
 * @desc Haal bezichtigingen op (gefilterd op rol)
 * @access Privé
 */
router.get(
  '/',
  authMiddleware.authenticeer,
  bezichtigingController.getBezichtigingen
);

/**
 * @route POST /api/bezichtigingen
 * @desc Vraag een bezichtiging aan
 * @access Privé
 */
router.post(
  '/',
  authMiddleware.authenticeer,
  validatieMiddleware.valideerBezichtiging,
  bezichtigingController.vraagBezichtigingAan
);

/**
 * @route GET /api/bezichtigingen/:id
 * @desc Haal bezichtiging op met ID
 * @access Privé (betrokken partijen of admin)
 */
router.get(
  '/:id',
  authMiddleware.authenticeer,
  bezichtigingController.getBezichtigingById
);

/**
 * @route PUT /api/bezichtigingen/:id
 * @desc Update bezichtigingsstatus
 * @access Privé (verkoper van woning of admin)
 */
router.put(
  '/:id',
  authMiddleware.authenticeer,
  validatieMiddleware.valideerBezichtigingUpdate,
  bezichtigingController.updateBezichtigingStatus
);

/**
 * @route DELETE /api/bezichtigingen/:id
 * @desc Annuleer bezichtiging
 * @access Privé (aanvrager, verkoper of admin)
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  bezichtigingController.annuleerBezichtiging
);

/**
 * @route POST /api/bezichtigingen/:id/bevestig
 * @desc Bevestig een bezichtiging met token
 * @access Publiek (met geldig token)
 */
router.post(
  '/:id/bevestig',
  bezichtigingController.bevestigBezichtiging
);

module.exports = router;