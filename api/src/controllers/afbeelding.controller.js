 
/**
 * Bunda API - Afbeelding Controller
 * 
 * Deze controller bevat de endpoint handlers voor afbeelding-gerelateerde routes.
 */

const afbeeldingService = require('../services/afbeelding.service');
const { Op } = require('sequelize');
const { WoningAfbeelding, Woning } = require('../models');

/**
 * Upload afbeeldingen voor een woning
 * @route POST /api/afbeeldingen/woning/:woningId
 */
const uploadAfbeeldingen = async (req, res, next) => {
  try {
    const { woningId } = req.params;
    const { bevatPrimair } = req.body;
    
    // Controleer of er bestanden zijn geüpload
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        succes: false,
        bericht: 'Geen afbeeldingen geüpload'
      });
    }
    
    // Sla afbeeldingen op
    const opgeslagenAfbeeldingen = await afbeeldingService.opslaanAfbeeldingen(
      woningId, 
      req.files, 
      bevatPrimair === 'true'
    );
    
    res.status(201).json({
      succes: true,
      bericht: 'Afbeeldingen succesvol geüpload',
      data: opgeslagenAfbeeldingen
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijder een afbeelding
 * @route DELETE /api/afbeeldingen/:id
 */
const verwijderAfbeelding = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Haal afbeelding op om te controleren of de woning bestaat
    const afbeelding = await WoningAfbeelding.findByPk(id, {
      include: [
        {
          model: Woning,
          as: 'woning',
          attributes: ['id', 'verkoperId']
        }
      ]
    });
    
    if (!afbeelding) {
      return res.status(404).json({
        succes: false,
        bericht: 'Afbeelding niet gevonden'
      });
    }
    
    // Controleer of de gebruiker eigenaar is of admin
    if (afbeelding.woning.verkoperId !== req.gebruiker.id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Niet geautoriseerd om deze afbeelding te verwijderen'
      });
    }
    
    await afbeeldingService.verwijderAfbeelding(id, req.gebruiker.id);
    
    res.json({
      succes: true,
      bericht: 'Afbeelding succesvol verwijderd'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stel een afbeelding in als primair
 * @route PUT /api/afbeeldingen/:id/primair
 */
const setPrimaireAfbeelding = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Haal afbeelding op om te controleren of de woning bestaat
    const afbeelding = await WoningAfbeelding.findByPk(id, {
      include: [
        {
          model: Woning,
          as: 'woning',
          attributes: ['id', 'verkoperId']
        }
      ]
    });
    
    if (!afbeelding) {
      return res.status(404).json({
        succes: false,
        bericht: 'Afbeelding niet gevonden'
      });
    }
    
    // Controleer of de gebruiker eigenaar is of admin
    if (afbeelding.woning.verkoperId !== req.gebruiker.id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Niet geautoriseerd om deze afbeelding te wijzigen'
      });
    }
    
    const bijgewerktAfbeelding = await afbeeldingService.setPrimaireAfbeelding(id, req.gebruiker.id);
    
    res.json({
      succes: true,
      bericht: 'Afbeelding succesvol ingesteld als primair',
      data: bijgewerktAfbeelding
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update de volgorde van afbeeldingen
 * @route PUT /api/afbeeldingen/volgorde
 */
const updateAfbeeldingVolgorde = async (req, res, next) => {
  try {
    const { woningId, volgorde } = req.body;
    
    if (!woningId || !volgorde || !Array.isArray(volgorde)) {
      return res.status(400).json({
        succes: false,
        bericht: 'Ongeldige invoer. WoningId en volgorde array zijn vereist'
      });
    }
    
    // Controleer of de woning bestaat en of de gebruiker de eigenaar is
    const woning = await Woning.findByPk(woningId);
    
    if (!woning) {
      return res.status(404).json({
        succes: false,
        bericht: 'Woning niet gevonden'
      });
    }
    
    // Controleer of de gebruiker eigenaar is of admin
    if (woning.verkoperId !== req.gebruiker.id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Niet geautoriseerd om de volgorde van afbeeldingen te wijzigen'
      });
    }
    
    const bijgewerktAfbeeldingen = await afbeeldingService.updateAfbeeldingVolgorde(
      woningId,
      volgorde,
      req.gebruiker.id
    );
    
    res.json({
      succes: true,
      bericht: 'Volgorde succesvol bijgewerkt',
      data: bijgewerktAfbeeldingen
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAfbeeldingen,
  verwijderAfbeelding,
  setPrimaireAfbeelding,
  updateAfbeeldingVolgorde
};