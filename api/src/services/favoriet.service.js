 
/**
 * Bunda API - Favoriet Service
 * 
 * Deze service bevat logica voor het beheren van favoriete woningen.
 */

const { Favoriet, Woning, Gebruiker, WoningAfbeelding } = require('../models');
const { Op } = require('sequelize');

/**
 * Haalt alle favorieten op van een gebruiker
 * @param {number} gebruikerId - ID van de gebruiker
 * @param {Object} paginatie - Paginatieopties zoals pagina en aantal per pagina
 * @returns {Promise<Object>} Favorieten en metadata
 */
const getFavorieten = async (gebruikerId, paginatie = {}) => {
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal favorieten op met paginatie
  const { count, rows } = await Favoriet.findAndCountAll({
    where: { gebruikerId },
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']],
    include: [
      {
        model: Woning,
        as: 'woning',
        include: [
          {
            model: Gebruiker,
            as: 'verkoper',
            attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
          },
          {
            model: WoningAfbeelding,
            as: 'afbeeldingen',
            attributes: ['id', 'afbeeldingUrl', 'isPrimair'],
            limit: 1,
            where: {
              isPrimair: true
            },
            required: false
          }
        ]
      }
    ]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    favorieten: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

/**
 * Voegt een woning toe aan favorieten
 * @param {number} gebruikerId - ID van de gebruiker
 * @param {number} woningId - ID van de woning
 * @param {string} notitie - Optionele notitie bij de favoriet
 * @returns {Promise<Object>} Nieuwe favoriet
 */
const voegFavorietToe = async (gebruikerId, woningId, notitie = null) => {
  // Controleer of de woning bestaat
  const woning = await Woning.findByPk(woningId);
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Controleer of de woning al in favorieten staat
  const bestaandeFavoriet = await Favoriet.findOne({
    where: {
      gebruikerId,
      woningId
    }
  });
  
  if (bestaandeFavoriet) {
    // Update de notitie als deze is gewijzigd
    if (notitie !== bestaandeFavoriet.notitie) {
      bestaandeFavoriet.notitie = notitie;
      await bestaandeFavoriet.save();
    }
    return bestaandeFavoriet;
  }
  
  // Maak nieuwe favoriet
  const favoriet = await Favoriet.create({
    gebruikerId,
    woningId,
    notitie
  });
  
  return favoriet;
};

/**
 * Verwijdert een favoriet
 * @param {number} favorietId - ID van de favoriet
 * @param {number} gebruikerId - ID van de gebruiker
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderFavoriet = async (favorietId, gebruikerId) => {
  const favoriet = await Favoriet.findOne({
    where: {
      id: favorietId,
      gebruikerId
    }
  });
  
  if (!favoriet) {
    const error = new Error('Favoriet niet gevonden of niet geautoriseerd');
    error.statusCode = 404;
    throw error;
  }
  
  await favoriet.destroy();
  
  return true;
};

/**
 * Verwijdert een woning uit favorieten
 * @param {number} woningId - ID van de woning
 * @param {number} gebruikerId - ID van de gebruiker
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderWoningUitFavorieten = async (woningId, gebruikerId) => {
  const favoriet = await Favoriet.findOne({
    where: {
      woningId,
      gebruikerId
    }
  });
  
  if (!favoriet) {
    const error = new Error('Woning niet gevonden in favorieten');
    error.statusCode = 404;
    throw error;
  }
  
  await favoriet.destroy();
  
  return true;
};

/**
 * Controleert of een woning in favorieten staat
 * @param {number} woningId - ID van de woning
 * @param {number} gebruikerId - ID van de gebruiker
 * @returns {Promise<boolean>} True als in favorieten
 */
const isWoningInFavorieten = async (woningId, gebruikerId) => {
  const favoriet = await Favoriet.findOne({
    where: {
      woningId,
      gebruikerId
    }
  });
  
  return !!favoriet;
};

module.exports = {
  getFavorieten,
  voegFavorietToe,
  verwijderFavoriet,
  verwijderWoningUitFavorieten,
  isWoningInFavorieten
};