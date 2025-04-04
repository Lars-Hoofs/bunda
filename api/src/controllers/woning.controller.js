 
/**
 * Bunda API - Woning Controller
 * 
 * Deze controller bevat de endpoint handlers voor woning-gerelateerde routes.
 */

const woningService = require('../services/woning.service');
const appConfig = require('../config/app.config');

/**
 * Haalt woningen op met filtering en paginatie
 * @route GET /api/woningen
 */
const getWoningen = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      status, minPrijs, maxPrijs, minOppervlakte, stad, postcode,
      minSlaapkamers, minBadkamers, verkoperId, zoekterm,
      sorteerOp, sorteerRichting, pagina, aantalPerPagina
    } = req.query;
    
    // Bouw filters object
    const filters = {
      status,
      minPrijs: minPrijs ? parseFloat(minPrijs) : undefined,
      maxPrijs: maxPrijs ? parseFloat(maxPrijs) : undefined,
      minOppervlakte: minOppervlakte ? parseFloat(minOppervlakte) : undefined,
      stad,
      postcode,
      minSlaapkamers: minSlaapkamers ? parseInt(minSlaapkamers) : undefined,
      minBadkamers: minBadkamers ? parseInt(minBadkamers) : undefined,
      verkoperId,
      zoekterm
    };
    
    // Bouw sortering object
    const sortering = {
      veld: sorteerOp || 'aangemaaktOp',
      richting: sorteerRichting || 'DESC'
    };
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    const result = await woningService.getWoningen(filters, sortering, paginatie);
    
    res.json({
      succes: true,
      data: result.woningen,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Zoekt woningen binnen een bepaalde straal van een locatie
 * @route GET /api/woningen/zoeken
 */
const zoekWoningen = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      breedtegraad, lengtegraad, straal, 
      status, minPrijs, maxPrijs, minOppervlakte,
      minSlaapkamers, minBadkamers,
      pagina, aantalPerPagina
    } = req.query;
    
    // Controleer verplichte parameters
    if (!breedtegraad || !lengtegraad) {
      return res.status(400).json({
        succes: false,
        bericht: 'Breedtegraad en lengtegraad zijn verplichte parameters'
      });
    }
    
    // Bouw filters object
    const filters = {
      status,
      minPrijs: minPrijs ? parseFloat(minPrijs) : undefined,
      maxPrijs: maxPrijs ? parseFloat(maxPrijs) : undefined,
      minOppervlakte: minOppervlakte ? parseFloat(minOppervlakte) : undefined,
      minSlaapkamers: minSlaapkamers ? parseInt(minSlaapkamers) : undefined,
      minBadkamers: minBadkamers ? parseInt(minBadkamers) : undefined
    };
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    const result = await woningService.zoekWoningenInStraal(
      parseFloat(breedtegraad),
      parseFloat(lengtegraad),
      straal ? parseFloat(straal) : appConfig.zoeken.standaardStraal,
      filters,
      paginatie
    );
    
    res.json({
      succes: true,
      data: result.woningen,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Maakt een nieuwe woning aan
 * @route POST /api/woningen
 */
const maakWoning = async (req, res, next) => {
  try {
    const woningData = req.body;
    const verkoperId = req.gebruiker.id;
    
    const nieuweWoning = await woningService.maakWoning(woningData, verkoperId);
    
    res.status(201).json({
      succes: true,
      bericht: appConfig.berichten.WONING.CREATIE_SUCCES,
      data: nieuweWoning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt een specifieke woning op
 * @route GET /api/woningen/:id
 */
const getWoningById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const woning = await woningService.getWoningById(id);
    
    res.json({
      succes: true,
      data: woning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Werkt een woning bij
 * @route PUT /api/woningen/:id
 */
const updateWoning = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const bijgewerktWoning = await woningService.updateWoning(id, updates);
    
    res.json({
      succes: true,
      bericht: appConfig.berichten.WONING.UPDATE_SUCCES,
      data: bijgewerktWoning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een woning
 * @route DELETE /api/woningen/:id
 */
const verwijderWoning = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await woningService.verwijderWoning(id);
    
    res.json({
      succes: true,
      bericht: appConfig.berichten.WONING.VERWIJDER_SUCCES
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt uitgelichte woningen op
 * @route GET /api/woningen/uitgelicht
 */
const getUitgelichteWoningen = async (req, res, next) => {
  try {
    const { aantal } = req.query;
    
    const woningen = await woningService.getUitgelichteWoningen(
      aantal ? parseInt(aantal) : 6
    );
    
    res.json({
      succes: true,
      data: woningen
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWoningen,
  zoekWoningen,
  maakWoning,
  getWoningById,
  updateWoning,
  verwijderWoning,
  getUitgelichteWoningen
};