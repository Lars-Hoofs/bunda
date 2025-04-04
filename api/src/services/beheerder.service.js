 
/**
 * Bunda API - Beheerder Service
 * 
 * Deze service bevat logica voor beheerderfunctionaliteiten.
 */

const { Op, literal, fn, col, where } = require('sequelize');
const db = require('../config/database');
const { 
  Gebruiker, Woning, WoningAfbeelding, Bezichtiging,
  Kenmerk, Favoriet
} = require('../models');

/**
 * Haalt dashboard statistieken op
 * @returns {Promise<Object>} Dashboard statistieken
 */
const getDashboardStats = async () => {
  const [
    totaalGebruikers,
    totaalWoningen,
    totaalVerkopers,
    totaalBezichtigingen,
    actieveWoningen,
    verkochteWoningen,
    recenteGebruikers,
    recenteWoningen,
    populariteitsRanking
  ] = await Promise.all([
    Gebruiker.count(),
    Woning.count(),
    Gebruiker.count({ where: { rol: 2 } }),
    Bezichtiging.count(),
    Woning.count({ where: { status: 'beschikbaar' } }),
    Woning.count({ where: { status: 'verkocht' } }),
    Gebruiker.findAll({
      limit: 5,
      order: [['aangemaaktOp', 'DESC']],
      attributes: ['id', 'voornaam', 'achternaam', 'email', 'rol', 'aangemaaktOp']
    }),
    Woning.findAll({
      limit: 5,
      order: [['aangemaaktOp', 'DESC']],
      attributes: ['id', 'titel', 'prijs', 'status', 'aangemaaktOp'],
      include: [
        {
          model: Gebruiker,
          as: 'verkoper',
          attributes: ['id', 'voornaam', 'achternaam']
        }
      ]
    }),
    // Woningen gerangschikt op basis van aantal favorieten
    Woning.findAll({
      attributes: [
        'id', 
        'titel', 
        'prijs',
        [fn('COUNT', col('favorietVanGebruikers.id')), 'aantalFavorieten']
      ],
      include: [
        {
          model: Gebruiker,
          as: 'favorietVanGebruikers',
          attributes: [],
          through: { attributes: [] }
        }
      ],
      group: ['woning.id'],
      having: literal('aantalFavorieten > 0'),
      order: [[literal('aantalFavorieten'), 'DESC']],
      limit: 5
    })
  ]);

  // Bereken maandelijkse statistieken
  const maandStatistieken = await getMaandStatistieken();

  return {
    totalen: {
      gebruikers: totaalGebruikers,
      woningen: totaalWoningen,
      verkopers: totaalVerkopers,
      bezichtigingen: totaalBezichtigingen,
      actieveWoningen,
      verkochteWoningen
    },
    recente: {
      gebruikers: recenteGebruikers,
      woningen: recenteWoningen
    },
    populariteit: {
      topWoningen: populariteitsRanking
    },
    maandStatistieken
  };
};

/**
 * Berekent maandelijkse statistieken
 * @returns {Promise<Array>} Maandelijkse statistieken
 */
const getMaandStatistieken = async () => {
  // Haal de laatste 6 maanden op
  const resultaat = [];
  const nu = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const maand = new Date(nu.getFullYear(), nu.getMonth() - i, 1);
    const eindeMaand = new Date(nu.getFullYear(), nu.getMonth() - i + 1, 0);
    
    const [nieuweGebruikers, nieuweWoningen, verkochteWoningen] = await Promise.all([
      Gebruiker.count({
        where: {
          aangemaaktOp: {
            [Op.between]: [maand, eindeMaand]
          }
        }
      }),
      Woning.count({
        where: {
          aangemaaktOp: {
            [Op.between]: [maand, eindeMaand]
          }
        }
      }),
      Woning.count({
        where: {
          status: 'verkocht',
          bijgewerktOp: {
            [Op.between]: [maand, eindeMaand]
          }
        }
      })
    ]);
    
    resultaat.push({
      maand: `${maand.getFullYear()}-${String(maand.getMonth() + 1).padStart(2, '0')}`,
      nieuweGebruikers,
      nieuweWoningen,
      verkochteWoningen
    });
  }
  
  return resultaat;
};

/**
 * Haalt alle gebruikers op met geavanceerde filtering
 * @param {Object} filters - Filters voor de zoekopdracht
 * @param {Object} opties - Paginatie en sorteeropties
 * @returns {Promise<Object>} Gebruikers en metadata
 */
const getGebruikers = async (filters = {}, opties = {}) => {
  const { 
    rol, zoekterm, status, datumVan, datumTot 
  } = filters;
  
  const { 
    pagina = 1, 
    aantalPerPagina = 10,
    sorteerOp = 'aangemaaktOp',
    sorteerRichting = 'DESC'
  } = opties;
  
  // Bouw where clause
  const whereClause = {};
  
  if (rol) {
    whereClause.rol = rol;
  }
  
  if (zoekterm) {
    whereClause[Op.or] = [
      { voornaam: { [Op.like]: `%${zoekterm}%` } },
      { achternaam: { [Op.like]: `%${zoekterm}%` } },
      { email: { [Op.like]: `%${zoekterm}%` } }
    ];
  }
  
  if (datumVan && datumTot) {
    whereClause.aangemaaktOp = {
      [Op.between]: [new Date(datumVan), new Date(datumTot)]
    };
  } else if (datumVan) {
    whereClause.aangemaaktOp = {
      [Op.gte]: new Date(datumVan)
    };
  } else if (datumTot) {
    whereClause.aangemaaktOp = {
      [Op.lte]: new Date(datumTot)
    };
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal gebruikers op met paginatie en sortering
  const { count, rows } = await Gebruiker.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [[sorteerOp, sorteerRichting]],
    attributes: { exclude: ['wachtwoord', 'resetToken', 'resetTokenVerlooptOp'] }
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
 * Werkt de rol van een gebruiker bij
 * @param {number} id - Gebruiker ID
 * @param {number} rol - Nieuwe rol (1, 2 of 3)
 * @returns {Promise<Object>} Bijgewerkte gebruiker
 */
const updateGebruikerRol = async (id, rol) => {
  const gebruiker = await Gebruiker.findByPk(id);
  
  if (!gebruiker) {
    const error = new Error('Gebruiker niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Werk rol bij
  gebruiker.rol = rol;
  await gebruiker.save();
  
  return gebruiker;
};

/**
 * Haalt alle woningen op met geavanceerde filtering
 * @param {Object} filters - Filters voor de zoekopdracht
 * @param {Object} opties - Paginatie en sorteeropties
 * @returns {Promise<Object>} Woningen en metadata
 */
const getWoningen = async (filters = {}, opties = {}) => {
  const { 
    status, verkoperId, prijsVan, prijsTot, goedgekeurd,
    datumVan, datumTot, zoekterm
  } = filters;
  
  const { 
    pagina = 1, 
    aantalPerPagina = 10,
    sorteerOp = 'aangemaaktOp',
    sorteerRichting = 'DESC'
  } = opties;
  
  // Bouw where clause
  const whereClause = {};
  
  if (status) {
    whereClause.status = status;
  }
  
  if (verkoperId) {
    whereClause.verkoperId = verkoperId;
  }
  
  if (prijsVan && prijsTot) {
    whereClause.prijs = {
      [Op.between]: [prijsVan, prijsTot]
    };
  } else if (prijsVan) {
    whereClause.prijs = {
      [Op.gte]: prijsVan
    };
  } else if (prijsTot) {
    whereClause.prijs = {
      [Op.lte]: prijsTot
    };
  }
  
  if (goedgekeurd !== undefined) {
    whereClause.goedgekeurd = goedgekeurd;
  }
  
  if (datumVan && datumTot) {
    whereClause.aangemaaktOp = {
      [Op.between]: [new Date(datumVan), new Date(datumTot)]
    };
  } else if (datumVan) {
    whereClause.aangemaaktOp = {
      [Op.gte]: new Date(datumVan)
    };
  } else if (datumTot) {
    whereClause.aangemaaktOp = {
      [Op.lte]: new Date(datumTot)
    };
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
  
  // Haal woningen op met paginatie en sortering
  const { count, rows } = await Woning.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [[sorteerOp, sorteerRichting]],
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
 * Markeert of verwijdert een woning als uitgelicht
 * @param {number} id - Woning ID
 * @param {boolean} isUitgelicht - Of de woning uitgelicht moet worden
 * @returns {Promise<Object>} Bijgewerkte woning
 */
const toggleWoningUitgelicht = async (id, isUitgelicht) => {
  const woning = await Woning.findByPk(id);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Werk uitgelicht status bij
  woning.isUitgelicht = isUitgelicht;
  await woning.save();
  
  return woning;
};

/**
 * Werkt de status van een woning bij
 * @param {number} id - Woning ID
 * @param {string} status - Nieuwe status
 * @returns {Promise<Object>} Bijgewerkte woning
 */
const updateWoningStatus = async (id, status) => {
  const woning = await Woning.findByPk(id);
  
  if (!woning) {
    const error = new Error('Woning niet gevonden');
    error.statusCode = 404;
    throw error;
  }
  
  // Werk status bij
  woning.status = status;
  await woning.save();
  
  return woning;
};

/**
 * Haalt alle bezichtigingen op met geavanceerde filtering
 * @param {Object} filters - Filters voor de zoekopdracht
 * @param {Object} opties - Paginatie en sorteeropties
 * @returns {Promise<Object>} Bezichtigingen en metadata
 */
const getBezichtigingen = async (filters = {}, opties = {}) => {
  const { 
    status, woningId, gebruikerId, datumVan, datumTot 
  } = filters;
  
  const { 
    pagina = 1, 
    aantalPerPagina = 10,
    sorteerOp = 'aangemaaktOp',
    sorteerRichting = 'DESC'
  } = opties;
  
  // Bouw where clause
  const whereClause = {};
  
  if (status) {
    whereClause.status = status;
  }
  
  if (woningId) {
    whereClause.woningId = woningId;
  }
  
  if (gebruikerId) {
    whereClause.gebruikerId = gebruikerId;
  }
  
  if (datumVan && datumTot) {
    whereClause.bezichtigingDatum = {
      [Op.between]: [new Date(datumVan), new Date(datumTot)]
    };
  } else if (datumVan) {
    whereClause.bezichtigingDatum = {
      [Op.gte]: new Date(datumVan)
    };
  } else if (datumTot) {
    whereClause.bezichtigingDatum = {
      [Op.lte]: new Date(datumTot)
    };
  }
  
  // Bereken offset op basis van pagina en aantal per pagina
  const offset = (pagina - 1) * aantalPerPagina;
  
  // Haal bezichtigingen op met paginatie en sortering
  const { count, rows } = await Bezichtiging.findAndCountAll({
    where: whereClause,
    limit: aantalPerPagina,
    offset,
    order: [[sorteerOp, sorteerRichting]],
    include: [
      {
        model: Woning,
        as: 'woning',
        attributes: ['id', 'titel', 'status', 'verkoperId']
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
 * Haalt het activiteitenlogboek op
 * @param {Object} filters - Filters voor de zoekopdracht
 * @param {Object} paginatie - Paginatieopties
 * @returns {Promise<Object>} Activiteiten en metadata
 */
const getActiviteitenLog = async (filters = {}, paginatie = {}) => {
  // Dit zou normaal gesproken een model genaamd 'Activiteit' gebruiken
  // Maar voor dit voorbeeld retourneren we een lege array
  
  return {
    activiteiten: [],
    metadata: {
      totaal: 0,
      pagina: 1,
      aantalPerPagina: 20,
      totaalPaginas: 0
    }
  };
};

module.exports = {
  getDashboardStats,
  getGebruikers,
  updateGebruikerRol,
  getWoningen,
  toggleWoningUitgelicht,
  updateWoningStatus,
  getBezichtigingen,
  getActiviteitenLog
};