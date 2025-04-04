 
/**
 * Bunda API - Afbeelding Routes
 * 
 * Dit bestand definieert de routes voor afbeeldingen bij woningen.
 */

const express = require('express');
const afbeeldingController = require('../controllers/afbeelding.controller');
const authMiddleware = require('../middleware/auth.middleware');
const uploadMiddleware = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @route POST /api/afbeeldingen/woning/:woningId
 * @desc Upload afbeeldingen voor een woning
 * @access Privé (woning eigenaar of admin)
 */
router.post(
  '/woning/:woningId',
  authMiddleware.authenticeer,
  authMiddleware.isWoningEigenaar,
  uploadMiddleware.afbeeldingen.array('afbeeldingen', 10),
  afbeeldingController.uploadAfbeeldingen
);

/**
 * @route DELETE /api/afbeeldingen/:id
 * @desc Verwijder een afbeelding
 * @access Privé (woning eigenaar of admin)
 */
router.delete(
  '/:id',
  authMiddleware.authenticeer,
  afbeeldingController.verwijderAfbeelding
);

/**
 * @route PUT /api/afbeeldingen/:id/primair
 * @desc Stel een afbeelding in als primair
 * @access Privé (woning eigenaar of admin)
 */
router.put(
  '/:id/primair',
  authMiddleware.authenticeer,
  afbeeldingController.setPrimaireAfbeelding
);

/**
 * @route PUT /api/afbeeldingen/volgorde
 * @desc Update de volgorde van afbeeldingen
 * @access Privé (woning eigenaar of admin)
 */
router.put(
  '/volgorde',
  authMiddleware.authenticeer,
  afbeeldingController.updateAfbeeldingVolgorde
);

module.exports = router;