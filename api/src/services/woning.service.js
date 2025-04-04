 
/**
 * Bunda API - Woning Service
 * 
 * Deze service bevat logica voor CRUD-operaties op woningen en zoekopdrachten.
 */

const { Woning, Gebruiker, WoningAfbeelding, Kenmerk, Favoriet } = require('../models');
const { Op, literal, fn, col } = require('sequelize');
const appConfig = require('../config/app.config');

/**
 * Haalt alle woningen op met filtering en sortering
 * @param {Object} filters - Filteropties
 * @param {Object} sortering - Sorteeropties
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Woningen en metadata
 */
const getWoningen = async (filters = {}, sortering = {}, paginatie = {}) => {
  const { 
    status, minPrijs, maxPrijs, minOppervlakte, 
    stad, postcode, minSlaapkamers, minBadkamers, 
    verkoperId, zoekterm
  } = filters;
  
  const { veld = 'aangemaaktOp', richting = 'DESC' } = sortering;
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Bouw where clause op basis van filters
  const whereClause = {};
  
  if (status) {
    whereClause.status = status;
  } else {
    // Standaard alleen beschikbare woningen tonen
    whereClause.status = 'beschikbaar';
  }
  
  if (minPrijs) {
    whereClause.prijs = { ...whereClause.prijs, [Op.gte]: minPrijs };
  }
  
  if (maxPrijs) {
    whereClause.prijs = { ...whereClause.prijs, [Op.lte]: maxPrijs };
  }
  
  if (minOppervlakte) {
    whereClause.oppervlakte = { [Op.gte]: minOppervlakte };
  }
  
  if (stad) {
    whereClause.stad = { [Op.like]: `%${stad}%` };
  }
  
  if (postcode) {
    whereClause.postcode = { [Op.like]: `%${postcode}%` };
  }
  
  if (minSlaapkamers) {
    whereClause.slaapkamers = { [Op.gte]: minSlaapkamers };
  }
  
  if (minBadkamers) {
    whereClause.badkamers = { [Op.gte]: minBadkamers };
  }
  
  if (verkoperId) {
    whereClause.verkoperId = verkoperId;
  }
  
  if (zoekterm) {
    whereClause[Op.or] = [
      { titel: { [Op.like]: `%${zoekterm}%` } },
      { beschrijving: { [Op.like]: `%${zoekterm}%` } },
      { stad: { [Op.like]: `%${zoekterm}%` } },
      { straat: { [Op.like]: `%${zoekterm}%` } }
    ];
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal woningen op met paginatie, sortering en filtering
  const { count, rows } = await Woning.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [[veld, richting]],
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
      },
      {
        model: Kenmerk,
        as: 'kenmerken',
        through: { attributes: [] },
        attributes: ['id', 'naam', 'categorie'],
        required: false
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

/**
 * Zoekt woningen binnen een bepaalde straal van een locatie
 * @param {number} breedtegraad - Breedtegraad middelpunt
 * @param {number} lengtegraad - Lengtegraad middelpunt
 * @param {number} straal - Zoekstraal in kilometers
 * @param {Object} filters - Aanvullende filters
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Woningen en metadata
 */
const zoekWoningenInStraal = async (breedtegraad, lengtegraad, straal = 10, filters = {}, paginatie = {}) => {
  const { pagina = 1, aantalPerPagina = 10 } = paginatie;
  
  // Beperk straal tot maximum
  if (straal > appConfig.zoeken.maxStraal) {
    straal = appConfig.zoeken.maxStraal;
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Bouw where clause op basis van filters
  const whereClause = { ...filters };
  
  // Standaard alleen beschikbare woningen tonen
  if (!whereClause.status) {
    whereClause.status = 'beschikbaar';
  }
  
  // Implementeer Haversine formule in SQL voor afstandsberekening
  // 6371 is de straal van de aarde in kilometers
  const afstandsFormule = `
    (6371 * acos(
      cos(radians(${breedtegraad})) * 
      cos(radians(breedtegraad)) * 
      cos(radians(lengtegraad) - radians(${lengtegraad})) + 
      sin(radians(${breedtegraad})) * 
      sin(radians(breedtegraad))
    ))
  `;
  
  // Voeg afstand toe als virtueel veld
  const { count, rows } = await Woning.findAndCountAll({
    attributes: {
      include: [
        [literal(afstandsFormule), 'afstand']
      ]
    },
    where: {
      ...whereClause,
      breedtegraad: { [Op.not]: null },
      lengtegraad: { [Op.not]: null }
    },
    having: literal(`afstand <= ${straal}`),
    limit: aantalPerPagina,
    offset,
    order: [
      [literal('afstand'), 'ASC']
    ],
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
      },
      {
        model: Kenmerk,
        as: 'kenmerken',
        through: { attributes: [] },
        attributes: ['id', 'naam', 'categorie'],
        required: false
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
      totaalPaginas,
      breedtegraad,
      lengtegraad,
      straal
    }
  };
};

/**
 * Maakt een nieuwe woning aan
 * @param {Object} woningData - Gegevens van de woning
 * @param {number} verkoperId - ID van de verkoper
 * @returns {Promise<Object>} Nieuw aangemaakte woning
 */
const maakWoning = async (woningData, verkoperId) => {
  // Voeg verkoperId toe aan woningData
  woningData.verkoperId = verkoperId;
  
  // Maak woning aan
  const woning = await Woning.create(woningData);
  
  return woning;
};

/**
 * Haalt een specifieke woning op op basis van ID
 * @param {number} id - Woning ID
 * @returns {Promise<Object>} Woning met gerelateerde data
 */
const getWoningById = async (id) => {
  const woning = await Woning.findByPk(id, {
    include: [
      {
        model: Gebruiker,
        as: 'verkoper',
        attributes: ['id', 'voornaam', 'achternaam', 'email', 'telefoon']
      },
      {
        model: WoningAfbeelding,
        as: 'afbeeldingen',
        attributes: ['id', 'afbeeldingUrl', 'isPrimair', 'volgorde']
      },
      {
        model: Kenmerk,
        as: 'kenmerken',
        through: { attributes: [] },
        attributes: ['id', 'naam', 'categorie', 'icoon']
      }
    ]
  });
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  return woning;
};

/**
 * Werkt een woning bij
 * @param {number} id - Woning ID
 * @param {Object} updates - Velden om bij te werken
 * @returns {Promise<Object>} Bijgewerkte woning
 */
const updateWoning = async (id, updates) => {
  const woning = await Woning.findByPk(id);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Verwijder velden die niet bijgewerkt mogen worden
  delete updates.id;
  delete updates.aangemaaktOp;
  delete updates.bijgewerktOp;
  delete updates.verkoperId;
  
  // Update woning
  await woning.update(updates);
  
  return woning;
};

/**
 * Verwijdert een woning
 * @param {number} id - Woning ID
 * @returns {Promise<boolean>} True als verwijderd
 */
const verwijderWoning = async (id) => {
  const woning = await Woning.findByPk(id);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  await woning.destroy();
  
  return true;
};

/**
 * Haalt uitgelichte woningen op
 * @param {number} aantal - Aantal uitgelichte woningen om op te halen
 * @returns {Promise<Array>} Lijst van uitgelichte woningen
 */
const getUitgelichteWoningen = async (aantal = 6) => {
  const woningen = await Woning.findAll({
    where: {
      status: 'beschikbaar',
      isUitgelicht: true
    },
    limit: aantal,
    order: [['aangemaaktOp', 'DESC']],
    include: [
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
  });
  
  return woningen;
};

module.exports = {
  getWoningen,
  zoekWoningenInStraal,
  maakWoning,
  getWoningById,
  updateWoning,
  verwijderWoning,
  getUitgelichteWoningen
};