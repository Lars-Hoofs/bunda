/**
 * Bunda API - Suggestie Controller
 * 
 * Deze controller bevat endpoints voor het doen van adressuggesties
 * en andere autocomplete functies.
 */

const geocodingService = require('../services/geocoding.service');

/**
 * Haalt adressuggesties op voor autocomplete zoekfunctie
 * @route GET /api/suggesties/adres
 */
const getAdresSuggesties = async (req, res, next) => {
  try {
    const { zoekterm, limiet = 5 } = req.query;
    
    if (!zoekterm || zoekterm.length < 2) {
      return res.json({
        succes: true,
        data: [],
        metadata: {
          zoekterm,
          aantal: 0
        }
      });
    }
    
    const suggesties = await geocodingService.adresSuggesties(
      zoekterm, 
      parseInt(limiet)
    );
    
    // Formatteer de response voor de frontend
    const geformatteerd = suggesties.map(suggestie => ({
      id: `${suggestie.breedtegraad},${suggestie.lengtegraad}`,
      tekst: suggestie.tekst,
      type: suggestie.type,
      breedtegraad: suggestie.breedtegraad,
      lengtegraad: suggestie.lengtegraad
    }));
    
    res.json({
      succes: true,
      data: geformatteerd,
      metadata: {
        zoekterm,
        aantal: geformatteerd.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Voert geocoding uit voor een specifiek adres
 * @route GET /api/suggesties/geocode
 */
const geocodeAdres = async (req, res, next) => {
  try {
    const { adres } = req.query;
    
    if (!adres) {
      return res.status(400).json({
        succes: false,
        bericht: 'Adres is verplicht'
      });
    }
    
    const resultaat = await geocodingService.geocodeAdres(adres);
    
    res.json({
      succes: true,
      data: resultaat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Voert reverse geocoding uit voor specifieke coördinaten
 * @route GET /api/suggesties/reverseGeocode
 */
const reverseGeocode = async (req, res, next) => {
  try {
    const { breedtegraad, lengtegraad } = req.query;
    
    if (!breedtegraad || !lengtegraad) {
      return res.status(400).json({
        succes: false,
        bericht: 'Breedtegraad en lengtegraad zijn verplicht'
      });
    }
    
    const resultaat = await geocodingService.reverseGeocode(
      parseFloat(breedtegraad),
      parseFloat(lengtegraad)
    );
    
    res.json({
      succes: true,
      data: resultaat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt reistijden op naar bepaalde voorzieningen
 * Dit gebruikt externe APIs en zou worden geïntegreerd met een routering service
 * @route POST /api/suggesties/reistijden
 */
const getReistijden = async (req, res, next) => {
  try {
    const { breedtegraad, lengtegraad, voorzieningen } = req.body;
    
    if (!breedtegraad || !lengtegraad) {
      return res.status(400).json({
        succes: false,
        bericht: 'Breedtegraad en lengtegraad zijn verplicht'
      });
    }
    
    // In een echte implementatie zou dit API-aanroepen doen naar een
    // routeringsdienst zoals Mapbox, Google, of OpenStreetMap Routing
    
    // Dummy data voor voorbeeld
    const reistijdenData = {
      station: {
        reistijd: 15, // minuten
        afstand: 3.2, // kilometers
        vervoerswijze: 'lopen'
      },
      supermarkt: {
        reistijd: 5,
        afstand: 0.8,
        vervoerswijze: 'lopen'
      },
      school: {
        reistijd: 8,
        afstand: 1.5,
        vervoerswijze: 'lopen'
      },
      ziekenhuis: {
        reistijd: 12,
        afstand: 4.5,
        vervoerswijze: 'auto'
      }
    };
    
    // Filter op gevraagde voorzieningen als die zijn opgegeven
    const resultaat = voorzieningen && Array.isArray(voorzieningen) && voorzieningen.length > 0
      ? Object.fromEntries(
          Object.entries(reistijdenData).filter(([key]) => 
            voorzieningen.includes(key)
          )
        )
      : reistijdenData;
    
    res.json({
      succes: true,
      data: resultaat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt cache-statistieken op (alleen voor admin)
 * @route GET /api/suggesties/cache-stats
 */
const getCacheStats = async (req, res, next) => {
  try {
    // Alleen toegankelijk voor beheerders
    if (req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Alleen beheerders kunnen cachestatistieken bekijken'
      });
    }
    
    const stats = geocodingService.getGeocodingCacheStats();
    
    res.json({
      succes: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdresSuggesties,
  geocodeAdres,
  reverseGeocode,
  getReistijden,
  getCacheStats
};