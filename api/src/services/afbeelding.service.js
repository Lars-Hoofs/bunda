 
/**
 * Bunda API - Afbeelding Service
 * 
 * Deze service bevat logica voor het beheren van woningafbeeldingen.
 */

const fs = require('fs').promises;
const path = require('path');
const { WoningAfbeelding, Woning } = require('../models');
const appConfig = require('../config/app.config');

/**
 * Slaat geüploade afbeeldingen op voor een woning
 * @param {number} woningId - ID van de woning
 * @param {Array} bestanden - Geüploade bestanden
 * @param {boolean} bevatPrimair - Of er een primaire afbeelding is
 * @returns {Promise<Array>} Opgeslagen afbeeldingen
 */
const opslaanAfbeeldingen = async (woningId, bestanden, bevatPrimair = false) => {
  // Controleer of woning bestaat
  const woning = await Woning.findByPk(woningId);
  if (!woning) {
    throw new Error('Woning niet gevonden');
  }
  
  // Als er geen afbeeldingen zijn geüpload, retourneer lege array
  if (!bestanden || bestanden.length === 0) {
    return [];
  }
  
  // Haal huidige aantal afbeeldingen op om volgordenummers toe te kennen
  const aantalBestaandeAfbeeldingen = await WoningAfbeelding.count({
    where: { woningId }
  });
  
  // Als er nog geen afbeeldingen zijn, maak de eerste afbeelding primair
  const isEersteAfbeelding = aantalBestaandeAfbeeldingen === 0;
  
  // Maak array van afbeeldingen om op te slaan
  const afbeeldingenTeOpslaan = bestanden.map((bestand, index) => ({
    woningId,
    afbeeldingUrl: `/uploads/afbeeldingen/${bestand.filename}`,
    bestandsnaam: bestand.filename,
    isPrimair: isEersteAfbeelding && index === 0 && !bevatPrimair,
    volgorde: aantalBestaandeAfbeeldingen + index
  }));
  
  // Sla afbeeldingen op in database
  const opgeslagenAfbeeldingen = await WoningAfbeelding.bulkCreate(afbeeldingenTeOpslaan);
  
  return opgeslagenAfbeeldingen;
};

/**
 * Verwijdert een afbeelding
 * @param {number} afbeeldingId - ID van de afbeelding
 * @param {number} verkoperId - ID van de verkoper om te controleren of het de eigenaar is
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderAfbeelding = async (afbeeldingId, verkoperId) => {
  // Haal afbeelding op inclusief woning om te controleren op eigenaarschap
  const afbeelding = await WoningAfbeelding.findByPk(afbeeldingId, {
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'verkoperId']
      }
    ]
  });
  
  if (!afbeelding) {
    throw new Error('Afbeelding niet gevonden');
  }
  
  // Controleer of de verkoper de eigenaar is van de woning
  if (afbeelding.woning.verkoperId !== verkoperId) {
    throw new Error('Niet geautoriseerd om deze afbeelding te verwijderen');
  }
  
  // Verwijder bestand van schijf
  const bestandspad = path.join(
    __dirname, 
    '../../', 
    appConfig.uploads.afbeeldingenMap, 
    afbeelding.bestandsnaam
  );
  
  try {
    await fs.unlink(bestandspad);
  } catch (error) {
    console.error(`Kan bestand niet verwijderen: ${bestandspad}`, error);
    // Ga toch door met verwijderen van database record
  }
  
  // Als het een primaire afbeelding was, maak een andere afbeelding primair
  if (afbeelding.isPrimair) {
    const andereAfbeelding = await WoningAfbeelding.findOne({
      where: {
        woningId: afbeelding.woningId,
        id: { [Op.ne]: afbeeldingId }
      },
      order: [['volgorde', 'ASC']]
    });
    
    if (andereAfbeelding) {
      andereAfbeelding.isPrimair = true;
      await andereAfbeelding.save();
    }
  }
  
  // Verwijder database record
  await afbeelding.destroy();
  
  return true;
};

/**
 * Stelt een afbeelding in als primair
 * @param {number} afbeeldingId - ID van de afbeelding
 * @param {number} verkoperId - ID van de verkoper om te controleren of het de eigenaar is
 * @returns {Promise<Object>} Bijgewerkte afbeelding
 */
const setPrimaireAfbeelding = async (afbeeldingId, verkoperId) => {
  // Haal afbeelding op inclusief woning om te controleren op eigenaarschap
  const afbeelding = await WoningAfbeelding.findByPk(afbeeldingId, {
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'verkoperId']
      }
    ]
  });
  
  if (!afbeelding) {
    throw new Error('Afbeelding niet gevonden');
  }
  
  // Controleer of de verkoper de eigenaar is van de woning
  if (afbeelding.woning.verkoperId !== verkoperId) {
    throw new Error('Niet geautoriseerd om deze afbeelding te wijzigen');
  }
  
  // Reset de primaire status van alle andere afbeeldingen
  await WoningAfbeelding.update(
    { isPrimair: false },
    { where: { woningId: afbeelding.woningId } }
  );
  
  // Maak deze afbeelding primair
  afbeelding.isPrimair = true;
  await afbeelding.save();
  
  return afbeelding;
};

/**
 * Werkt de volgorde van afbeeldingen bij
 * @param {number} woningId - ID van de woning
 * @param {Array} volgordeData - Array met afbeelding IDs en nieuwe volgordes
 * @param {number} verkoperId - ID van de verkoper om te controleren of het de eigenaar is
 * @returns {Promise<Array>} Bijgewerkte afbeeldingen
 */
const updateAfbeeldingVolgorde = async (woningId, volgordeData, verkoperId) => {
  // Controleer of de woning bestaat en of de verkoper de eigenaar is
  const woning = await Woning.findByPk(woningId);
  
  if (!woning) {
    throw new Error('Woning niet gevonden');
  }
  
  if (woning.verkoperId !== verkoperId) {
    throw new Error('Niet geautoriseerd om de volgorde van afbeeldingen te wijzigen');
  }
  
  // Werk de volgorde bij voor elke afbeelding
  const updateBeloftes = volgordeData.map(item => {
    return WoningAfbeelding.update(
      { volgorde: item.volgorde },
      { where: { id: item.id, woningId } }
    );
  });
  
  await Promise.all(updateBeloftes);
  
  // Haal bijgewerkte afbeeldingen op
  const bijgewerktAfbeeldingen = await WoningAfbeelding.findAll({
    where: { woningId },
    order: [['volgorde', 'ASC']]
  });
  
  return bijgewerktAfbeeldingen;
};

module.exports = {
  opslaanAfbeeldingen,
  verwijderAfbeelding,
  setPrimaireAfbeelding,
  updateAfbeeldingVolgorde
};