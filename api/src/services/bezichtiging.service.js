 
/**
 * Bunda API - Bezichtiging Service
 * 
 * Deze service bevat logica voor het beheren van bezichtigingen.
 */

const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Bezichtiging, Woning, Gebruiker } = require('../models');

/**
 * Haalt alle bezichtigingen op voor admins
 * @param {Object} filters - Filteropties zoals status
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Bezichtigingen en metadata
 */
const getAlleBezichtigingen = async (filters = {}, paginatie = {}) => {
  const { status, woningId } = filters;
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Bouw where clause
  const whereClause = {};
  
  if (status) {
    whereClause.status = status;
  }
  
  if (woningId) {
    whereClause.woningId = woningId;
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal bezichtigingen op met paginatie
  const { count, rows } = await Bezichtiging.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']],
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'titel', 'status', 'verkoperId'],
        include: [
          {
            model: Gebruiker,
            as: 'verkoper',
            attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
          }
        ]
      },
      {
        model: Gebruiker,
        as: 'gebruiker',
        attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
      }
    ]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    bezichtigingen: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

/**
 * Haalt bezichtigingen op voor een verkoper
 * @param {number} verkoperId - ID van de verkoper
 * @param {Object} filters - Filteropties zoals status
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Bezichtigingen en metadata
 */
const getVerkoperBezichtigingen = async (verkoperId, filters = {}, paginatie = {}) => {
  const { status, woningId } = filters;
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal bezichtigingen op met paginatie
  const { count, rows } = await Bezichtiging.findAndCountAll({
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'titel', 'status', 'verkoperId'],
        where: { verkoperId },
        required: true
      },
      {
        model: Gebruiker,
        as: 'gebruiker',
        attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
      }
    ],
    where: {
      ...(status ? { status } : {}),
      ...(woningId ? { woningId } : {})
    },
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    bezichtigingen: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

/**
 * Haalt bezichtigingen op voor een gebruiker
 * @param {number} gebruikerId - ID van de gebruiker
 * @param {Object} filters - Filteropties zoals status
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Bezichtigingen en metadata
 */
const getGebruikerBezichtigingen = async (gebruikerId, filters = {}, paginatie = {}) => {
  const { status, woningId } = filters;
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Bouw where clause
  const whereClause = { gebruikerId };
  
  if (status) {
    whereClause.status = status;
  }
  
  if (woningId) {
    whereClause.woningId = woningId;
  }
  
  // Haal bezichtigingen op met paginatie
  const { count, rows } = await Bezichtiging.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']],
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'titel', 'status', 'verkoperId'],
        include: [
          {
            model: Gebruiker,
            as: 'verkoper',
            attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
          }
        ]
      }
    ]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    bezichtigingen: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

/**
 * Vraagt een bezichtiging aan
 * @param {number} gebruikerId - ID van de gebruiker die de bezichtiging aanvraagt
 * @param {number} woningId - ID van de woning
 * @param {Date} bezichtigingDatum - Datum en tijd van de bezichtiging
 * @param {string} notities - Optionele notities bij de aanvraag
 * @returns {Promise<Object>} Aangemaakte bezichtiging
 */
const vraagBezichtigingAan = async (gebruikerId, woningId, bezichtigingDatum, notities) => {
  // Controleer of de woning bestaat
  const woning = await Woning.findByPk(woningId);
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Controleer of de woning beschikbaar is
  if (woning.status !== 'beschikbaar') {
    const error = new Error('Deze woning is niet beschikbaar voor bezichtiging');
    error.statusCode = 400;
    throw error;
  }
  
  // Controleer of de datum in de toekomst ligt
  if (new Date(bezichtigingDatum) <= new Date()) {
    const error = new Error('Bezichtigingsdatum moet in de toekomst liggen');
    error.statusCode = 400;
    throw error;
  }
  
  // Genereer bevestigingstoken
  const bevestigingsToken = uuidv4();
  
  // Maak bezichtiging aan
  const bezichtiging = await Bezichtiging.create({
    gebruikerId,
    woningId,
    bezichtigingDatum,
    notities,
    status: 'aangevraagd',
    bevestigingsToken
  });
  
  return bezichtiging;
};

/**
 * Haalt een specifieke bezichtiging op
 * @param {number} id - ID van de bezichtiging
 * @returns {Promise<Object>} Bezichtiging met gerelateerde data
 */
const getBezichtigingById = async (id) => {
  const bezichtiging = await Bezichtiging.findByPk(id, {
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'titel', 'status', 'verkoperId'],
        include: [
          {
            model: Gebruiker,
            as: 'verkoper',
            attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
          }
        ]
      },
      {
        model: Gebruiker,
        as: 'gebruiker',
        attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
      }
    ]
  });
  
  if (!bezichtiging) {
    const error = new Error('Bezichtiging niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  return bezichtiging;
};

/**
 * Werkt de status van een bezichtiging bij
 * @param {number} id - ID van de bezichtiging
 * @param {string} status - Nieuwe status
 * @param {string} verkoperNotities - Optionele notities van de verkoper
 * @returns {Promise<Object>} Bijgewerkte bezichtiging
 */
const updateBezichtigingStatus = async (id, status, verkoperNotities) => {
  const bezichtiging = await Bezichtiging.findByPk(id);
  
  if (!bezichtiging) {
    const error = new Error('Bezichtiging niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Update status en notities
  bezichtiging.status = status;
  if (verkoperNotities) {
    bezichtiging.verkoperNotities = verkoperNotities;
  }
  
  await bezichtiging.save();
  
  return bezichtiging;
};

/**
 * Annuleert een bezichtiging
 * @param {number} id - ID van de bezichtiging
 * @returns {Promise<boolean>} True als geannuleerd
 */
const annuleerBezichtiging = async (id) => {
  const bezichtiging = await Bezichtiging.findByPk(id);
  
  if (!bezichtiging) {
    const error = new Error('Bezichtiging niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Controleer of de bezichtiging nog niet heeft plaatsgevonden
  if (new Date(bezichtiging.bezichtigingDatum) < new Date()) {
    const error = new Error('Kan een bezichtiging in het verleden niet annuleren');
    error.statusCode = 400;
    throw error;
  }
  
  // Controleer of de status juist is
  if (!['aangevraagd', 'goedgekeurd'].includes(bezichtiging.status)) {
    const error = new Error('Alleen aangevraagde of goedgekeurde bezichtigingen kunnen worden geannuleerd');
    error.statusCode = 400;
    throw error;
  }
  
  await bezichtiging.destroy();
  
  return true;
};

/**
 * Bevestigt een bezichtiging met een token
 * @param {number} id - ID van de bezichtiging
 * @param {string} token - Bevestigingstoken
 * @returns {Promise<Object>} Bijgewerkte bezichtiging
 */
const bevestigBezichtiging = async (id, token) => {
  const bezichtiging = await Bezichtiging.findByPk(id);
  
  if (!bezichtiging) {
    const error = new Error('Bezichtiging niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Controleer token
  if (bezichtiging.bevestigingsToken !== token) {
    const error = new Error('Ongeldige token');
    error.statusCode = 400;
    throw error;
  }
  
  // Update status naar voltooid
  bezichtiging.status = 'voltooid';
  bezichtiging.bevestigingsToken = null;
  
  await bezichtiging.save();
  
  return bezichtiging;
};

module.exports = {
  getAlleBezichtigingen,
  getVerkoperBezichtigingen,
  getGebruikerBezichtigingen,
  vraagBezichtigingAan,
  getBezichtigingById,
  updateBezichtigingStatus,
  annuleerBezichtiging,
  bevestigBezichtiging
};