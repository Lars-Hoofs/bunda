 
/**
 * Bunda API - Kenmerk Service
 * 
 * Deze service bevat logica voor het beheren van kenmerken.
 */

const { Kenmerk, WoningKenmerk, Woning } = require('../models');
const { Op } = require('sequelize');

/**
 * Haalt alle kenmerken op, optioneel gefilterd
 * @param {Object} filters - Optionele filters voor categorie
 * @returns {Promise<Array>} Lijst van kenmerken
 */
const getKenmerken = async (filters = {}) => {
  const whereClause = {};
  
  if (filters.categorie) {
    whereClause.categorie = filters.categorie;
  }
  
  const kenmerken = await Kenmerk.findAll({
    where: whereClause,
    order: [
      ['categorie', 'ASC'],
      ['naam', 'ASC']
    ]
  });
  
  return kenmerken;
};

/**
 * Maakt een nieuw kenmerk aan
 * @param {Object} kenmerkData - Gegevens van het kenmerk
 * @returns {Promise<Object>} Nieuw aangemaakt kenmerk
 */
const maakKenmerk = async (kenmerkData) => {
  // Controleer of er al een kenmerk met deze naam bestaat
  const bestaandKenmerk = await Kenmerk.findOne({
    where: {
      naam: kenmerkData.naam
    }
  });
  
  if (bestaandKenmerk) {
    const error = new Error('Er bestaat al een kenmerk met deze naam');
    error.statusCode = 400;
    throw error;
  }
  
  // Maak nieuw kenmerk aan
  const kenmerk = await Kenmerk.create(kenmerkData);
  
  return kenmerk;
};

/**
 * Werkt een kenmerk bij
 * @param {number} id - ID van het kenmerk
 * @param {Object} updates - Velden om bij te werken
 * @returns {Promise<Object>} Bijgewerkt kenmerk
 */
const updateKenmerk = async (id, updates) => {
  const kenmerk = await Kenmerk.findByPk(id);
  
  if (!kenmerk) {
    const error = new Error('Kenmerk niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Als de naam wordt gewijzigd, controleer of deze al bestaat
  if (updates.naam && updates.naam !== kenmerk.naam) {
    const bestaandKenmerk = await Kenmerk.findOne({
      where: {
        naam: updates.naam,
        id: { [Op.ne]: id }
      }
    });
    
    if (bestaandKenmerk) {
      const error = new Error('Er bestaat al een kenmerk met deze naam');
      error.statusCode = 400;
      throw error;
    }
  }
  
  // Werk kenmerk bij
  await kenmerk.update(updates);
  
  return kenmerk;
};

/**
 * Verwijdert een kenmerk
 * @param {number} id - ID van het kenmerk
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderKenmerk = async (id) => {
  const kenmerk = await Kenmerk.findByPk(id);
  
  if (!kenmerk) {
    const error = new Error('Kenmerk niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Controleer of het kenmerk in gebruik is bij woningen
  const kenmerkInGebruik = await WoningKenmerk.findOne({
    where: { kenmerkId: id }
  });
  
  if (kenmerkInGebruik) {
    const error = new Error('Kan kenmerk niet verwijderen omdat het in gebruik is');
    error.statusCode = 400;
    throw error;
  }
  
  // Verwijder kenmerk
  await kenmerk.destroy();
  
  return true;
};

/**
 * Haalt kenmerk categorieën op
 * @returns {Promise<Array>} Lijst van unieke categorieën
 */
const getKenmerkCategorieen = async () => {
  const kenmerken = await Kenmerk.findAll({
    attributes: ['categorie'],
    group: ['categorie'],
    order: [['categorie', 'ASC']]
  });
  
  return kenmerken.map(k => k.categorie);
};

/**
 * Haalt kenmerken op voor een specifieke woning
 * @param {number} woningId - ID van de woning
 * @returns {Promise<Array>} Lijst van kenmerken voor de woning
 */
const getWoningKenmerken = async (woningId) => {
  // Controleer of de woning bestaat
  const woning = await Woning.findByPk(woningId);
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Haal kenmerken op voor de woning
  const kenmerken = await Kenmerk.findAll({
    include: [
      {
        model: WoningKenmerk,
        as: 'woningKenmerken',
        where: { woningId },
        attributes: ['waarde']
      }
    ]
  });
  
  return kenmerken;
};

/**
 * Voegt kenmerken toe aan een woning
 * @param {number} woningId - ID van de woning
 * @param {Array} kenmerken - Array van kenmerk IDs en optionele waarden
 * @param {number} verkoperId - ID van de verkoper om te controleren of het de eigenaar is
 * @returns {Promise<Array>} Toegevoegde kenmerken
 */
const voegWoningKenmerkenToe = async (woningId, kenmerken, verkoperId) => {
  // Controleer of de woning bestaat en of de verkoper de eigenaar is
  const woning = await Woning.findByPk(woningId);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  if (woning.verkoperId !== verkoperId) {
    const error = new Error('Niet geautoriseerd om kenmerken toe te voegen aan deze woning');
    error.statusCode = 403;
    throw error;
  }
  
  // Controleer of alle kenmerken bestaan
  const kenmerkIds = kenmerken.map(k => k.kenmerkId);
  const bestaandeKenmerken = await Kenmerk.findAll({
    where: {
      id: kenmerkIds
    }
  });
  
  if (bestaandeKenmerken.length !== kenmerkIds.length) {
    const error = new Error('Eén of meer kenmerken bestaan niet');
    error.statusCode = 400;
    throw error;
  }
  
  // Verwijder eventuele bestaande relaties voor deze kenmerken
  await WoningKenmerk.destroy({
    where: {
      woningId,
      kenmerkId: kenmerkIds
    }
  });
  
  // Voeg kenmerken toe aan woning
  const teVoegenKenmerken = kenmerken.map(k => ({
    woningId,
    kenmerkId: k.kenmerkId,
    waarde: k.waarde || null
  }));
  
  const toegevoegdeKenmerken = await WoningKenmerk.bulkCreate(teVoegenKenmerken);
  
  return toegevoegdeKenmerken;
};

/**
 * Verwijdert een kenmerk van een woning
 * @param {number} woningId - ID van de woning
 * @param {number} kenmerkId - ID van het kenmerk
 * @param {number} verkoperId - ID van de verkoper om te controleren of het de eigenaar is
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderWoningKenmerk = async (woningId, kenmerkId, verkoperId) => {
  // Controleer of de woning bestaat en of de verkoper de eigenaar is
  const woning = await Woning.findByPk(woningId);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  if (woning.verkoperId !== verkoperId) {
    const error = new Error('Niet geautoriseerd om kenmerken te verwijderen van deze woning');
    error.statusCode = 403;
    throw error;
  }
  
  // Zoek de relatie
  const woningKenmerk = await WoningKenmerk.findOne({
    where: {
      woningId,
      kenmerkId
    }
  });
  
  if (!woningKenmerk) {
    const error = new Error('Kenmerk is niet gekoppeld aan deze woning');
    error.statusCode = 404;
    throw error;
  }
  
  // Verwijder de relatie
  await woningKenmerk.destroy();
  
  return true;
};

module.exports = {
  getKenmerken,
  maakKenmerk,
  updateKenmerk,
  verwijderKenmerk,
  getKenmerkCategorieen,
  getWoningKenmerken,
  voegWoningKenmerkenToe,
  verwijderWoningKenmerk
};