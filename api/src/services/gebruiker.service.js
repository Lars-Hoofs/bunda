 
/**
 * Bunda API - Gebruiker Service
 * 
 * Deze service bevat logica voor CRUD-operaties op gebruikers.
 */

const { Gebruiker, Woning } = require('../models');
const { Op } = require('sequelize');

/**
 * Haalt alle gebruikers op met optionele filtering
 * @param {Object} filters - Filteropties zoals rol, zoekterm, etc.
 * @param {Object} paginatie - Paginatieopties zoals pagina en aantal per pagina
 * @returns {Promise<Object>} Gebruikers en metadata
 */
const getGebruikers = async (filters = {}, paginatie = {}) => {
  const { rol, zoekterm } = filters;
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  const whereClause = {};
  
  // Filter op rol indien opgegeven
  if (rol) {
    whereClause.rol = rol;
  }
  
  // Filter op zoekterm indien opgegeven
  if (zoekterm) {
    whereClause[Op.or] = [
      { voornaam: { [Op.like]: `%${zoekterm}%` } },
      { achternaam: { [Op.like]: `%${zoekterm}%` } },
      { email: { [Op.like]: `%${zoekterm}%` } }
    ];
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal gebruikers op met paginatie
  const { count, rows } = await Gebruiker.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    gebruikers: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

/**
 * Haalt een specifieke gebruiker op op basis van ID
 * @param {number} id - Gebruiker ID
 * @returns {Promise<Object>} Gebruiker
 */
const getGebruikerById = async (id) => {
  const gebruiker = await Gebruiker.findByPk(id);
  
  if (!gebruiker) {
    const error = new Error('Gebruiker niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  return gebruiker;
};

/**
 * Werkt een gebruiker bij
 * @param {number} id - Gebruiker ID
 * @param {Object} updates - Velden om bij te werken
 * @returns {Promise<Object>} Bijgewerkte gebruiker
 */
const updateGebruiker = async (id, updates) => {
  const gebruiker = await Gebruiker.findByPk(id);
  
  if (!gebruiker) {
    const error = new Error('Gebruiker niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Verwijder velden die niet bijgewerkt mogen worden
  delete updates.id;
  delete updates.aangemaaktOp;
  delete updates.bijgewerktOp;
  
  // Update gebruiker
  await gebruiker.update(updates);
  
  return gebruiker;
};

/**
 * Verwijdert een gebruiker
 * @param {number} id - Gebruiker ID
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderGebruiker = async (id) => {
  const gebruiker = await Gebruiker.findByPk(id);
  
  if (!gebruiker) {
    const error = new Error('Gebruiker niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  await gebruiker.destroy();
  
  return true;
};

/**
 * Haalt alle woningen op die eigendom zijn van een specifieke gebruiker
 * @param {number} gebruikerId - Gebruiker ID
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Woningen en metadata
 */
const getGebruikerWoningen = async (gebruikerId, paginatie = {}) => {
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Controleer of gebruiker bestaat
  const gebruiker = await Gebruiker.findByPk(gebruikerId);
  
  if (!gebruiker) {
    const error = new Error('Gebruiker niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal woningen op met paginatie
  const { count, rows } = await Woning.findAndCountAll({
    where: { verkoperId: gebruikerId },
    limit: aantalPerPagina,
    offset,
    order: [['aangemaaktOp', 'DESC']],
    include: [
      {
        model: Gebruiker,
        as: 'verkoper',
        attributes: ['id', 'voornaam', 'achternaam', 'email']
      }
    ]
  });
  
  // Bereken totaal aantal pagina's
  const totaalPaginas = Math.ceil(count / aantalPerPagina);
  
  return {
    woningen: rows,
    metadata: {
      totaal: count,
      pagina,
      aantalPerPagina,
      totaalPaginas
    }
  };
};

module.exports = {
  getGebruikers,
  getGebruikerById,
  updateGebruiker,
  verwijderGebruiker,
  getGebruikerWoningen
};