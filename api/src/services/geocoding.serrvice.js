/**
 * Bunda API - Geocoding Service
 * 
 * Deze service verzorgt de integratie met externe geocoding diensten
 * voor het omzetten van adressen naar coördinaten en vice versa.
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const { formatteerAdres } = require('../utils/geo.utils');

// Cache configuratie (bewaart resultaten 1 week)
const geocodeCache = new NodeCache({ stdTTL: 604800 });

/**
 * Mapbox API configuratie
 * In productie zouden deze waarden uit environment variables komen
 */
const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY || 'je_mapbox_api_key_hier';
const MAPBOX_GEOCODING_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const GEOCODING_COUNTRY = 'be'; // Belgische resultaten prioriteren

/**
 * Geocodeert een adres naar coördinaten met Mapbox API
 * @param {string} adres - Adres om te geocoderen
 * @returns {Promise<Object>} Object met breedtegraad en lengtegraad
 */
const geocodeAdres = async (adres) => {
  // Controleer eerst de cache
  const cacheKey = `geocode:${adres}`;
  const cachedResult = geocodeCache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Bouw de URL voor het Mapbox Geocoding API verzoek
    const encodedAdres = encodeURIComponent(adres);
    const url = `${MAPBOX_GEOCODING_URL}/${encodedAdres}.json?access_token=${MAPBOX_API_KEY}&country=${GEOCODING_COUNTRY}&limit=1`;
    
    // Doe het API verzoek
    const response = await axios.get(url);
    
    // Verwerk het resultaat
    if (response.data && response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      const [lengtegraad, breedtegraad] = feature.center;
      
      // Extraheer adrescomponenten
      const context = feature.context || [];
      const postcode = context.find(item => item.id.startsWith('postcode'))?.text;
      const plaats = context.find(item => item.id.startsWith('place'))?.text;
      
      const resultaat = {
        breedtegraad,
        lengtegraad,
        betrouwbaarheid: feature.relevance,
        geformatteerd_adres: feature.place_name,
        postcode,
        plaats,
        straat: feature.text,
        huisnummer: feature.address
      };
      
      // Sla het resultaat op in de cache
      geocodeCache.set(cacheKey, resultaat);
      
      return resultaat;
    }
    
    // Geen resultaten gevonden
    throw new Error('Geen resultaten gevonden voor dit adres');
    
  } catch (error) {
    console.error('Geocoding fout:', error.message);
    
    // Fallback resultaat voor Brussel als centrum van België
    return {
      breedtegraad: 50.8503,
      lengtegraad: 4.3517,
      betrouwbaarheid: 0,
      geformatteerd_adres: 'België',
      foutmelding: error.message
    };
  }
};

/**
 * Voert omgekeerde geocoding uit (coördinaten naar adres) met Mapbox API
 * @param {number} breedtegraad - Breedtegraad
 * @param {number} lengtegraad - Lengtegraad
 * @returns {Promise<Object>} Gedetailleerd adresobject
 */
const reverseGeocode = async (breedtegraad, lengtegraad) => {
  // Controleer eerst de cache
  const cacheKey = `reverse:${breedtegraad},${lengtegraad}`;
  const cachedResult = geocodeCache.get(cacheKey);
  
  if (cachedResult) {
    return cachedResult;
  }
  
  try {
    // Bouw de URL voor het Mapbox Reverse Geocoding API verzoek
    const url = `${MAPBOX_GEOCODING_URL}/${lengtegraad},${breedtegraad}.json?access_token=${MAPBOX_API_KEY}&country=${GEOCODING_COUNTRY}&types=address&limit=1`;
    
    // Doe het API verzoek
    const response = await axios.get(url);
    
    // Verwerk het resultaat
    if (response.data && response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      
      // Extraheer adrescomponenten
      const context = feature.context || [];
      const postcode = context.find(item => item.id.startsWith('postcode'))?.text;
      const plaats = context.find(item => item.id.startsWith('place'))?.text;
      const regio = context.find(item => item.id.startsWith('region'))?.text;
      
      const resultaat = {
        breedtegraad,
        lengtegraad,
        straat: feature.text,
        huisnummer: feature.address,
        postcode,
        plaats,
        regio,
        geformatteerd_adres: feature.place_name,
        adrescomponenten: {
          straat: feature.text,
          huisnummer: feature.address,
          postcode,
          plaats,
          regio,
          land: 'België'
        }
      };
      
      // Sla het resultaat op in de cache
      geocodeCache.set(cacheKey, resultaat);
      
      return resultaat;
    }
    
    // Geen resultaten gevonden
    throw new Error('Geen adres gevonden voor deze coördinaten');
    
  } catch (error) {
    console.error('Reverse geocoding fout:', error.message);
    
    // Fallback resultaat
    return {
      breedtegraad,
      lengtegraad,
      geformatteerd_adres: 'Onbekende locatie in België',
      foutmelding: error.message
    };
  }
};

/**
 * Voert geocoding uit voor meerdere adressen in batch
 * @param {Array} adressen - Array van adresstrings
 * @returns {Promise<Array>} Array van geocoding resultaten
 */
const batchGeocodeAdressen = async (adressen) => {
  // Voorkom te grote batches
  if (adressen.length > 50) {
    throw new Error('Te veel adressen in batch (maximum is 50)');
  }
  
  // Doe de verzoeken parallel met Promise.all
  const resultaten = await Promise.all(
    adressen.map(adres => geocodeAdres(adres))
  );
  
  return resultaten;
};

/**
 * Maakt een geocode suggestie voor automatische aanvulling terwijl gebruiker typt
 * @param {string} gedeeltelijkAdres - Gedeeltelijk adres ingetypt door gebruiker
 * @param {number} limiet - Maximum aantal suggesties
 * @returns {Promise<Array>} Array van adressuggesties
 */
const adresSuggesties = async (gedeeltelijkAdres, limiet = 5) => {
  if (!gedeeltelijkAdres || gedeeltelijkAdres.length < 3) {
    return [];
  }
  
  try {
    // Bouw de URL voor Mapbox Geocoding API verzoek met autocomplete
    const encodedAdres = encodeURIComponent(gedeeltelijkAdres);
    const url = `${MAPBOX_GEOCODING_URL}/${encodedAdres}.json?access_token=${MAPBOX_API_KEY}&country=${GEOCODING_COUNTRY}&autocomplete=true&limit=${limiet}&types=address,place,postcode`;
    
    // Doe het API verzoek
    const response = await axios.get(url);
    
    // Verwerk de resultaten
    if (response.data && response.data.features) {
      return response.data.features.map(feature => ({
        tekst: feature.place_name,
        plaats: feature.text,
        breedtegraad: feature.center[1],
        lengtegraad: feature.center[0],
        type: feature.place_type[0]
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('Adressuggestie fout:', error.message);
    return [];
  }
};

/**
 * Zoekt adressen binnen een polygoon
 * @param {Array} polygoonCoordinaten - Array van [lengtegraad, breedtegraad] punten die een polygoon vormen
 * @returns {Promise<Array>} Array van adressen binnen de polygoon
 */
const zoekAdressenInPolygoon = async (polygoonCoordinaten) => {
  try {
    // Formatteer polygoon voor Mapbox API
    const polygoon = polygoonCoordinaten.map(punt => 
      `${punt[0]},${punt[1]}`
    ).join(';');
    
    // Voeg eerste punt toe om polygoon te sluiten
    const gesloten = polygoon + `;${polygoonCoordinaten[0][0]},${polygoonCoordinaten[0][1]}`;
    
    // Bouw de URL voor Mapbox Geocoding API met polygoon filter
    const url = `${MAPBOX_GEOCODING_URL}.json?access_token=${MAPBOX_API_KEY}&country=${GEOCODING_COUNTRY}&limit=50&types=address&polygon=${gesloten}`;
    
    // Doe het API verzoek
    const response = await axios.get(url);
    
    // Verwerk de resultaten
    if (response.data && response.data.features) {
      return response.data.features.map(feature => ({
        straat: feature.text,
        huisnummer: feature.address,
        geformatteerd_adres: feature.place_name,
        breedtegraad: feature.center[1],
        lengtegraad: feature.center[0]
      }));
    }
    
    return [];
    
  } catch (error) {
    console.error('Zoeken in polygoon fout:', error.message);
    return [];
  }
};

/**
 * Integreert geocoding met woninggegevens
 * @param {Object} woningGegevens - Woninggegevens inclusief adresinfo
 * @returns {Promise<Object>} Woninggegevens verrijkt met geocoding info
 */
const verrijkWoningMetGeocode = async (woningGegevens) => {
  // Bouw adres op uit componenten
  const adres = formatteerAdres(
    woningGegevens.straat,
    woningGegevens.huisnummer,
    woningGegevens.postcode,
    woningGegevens.stad
  );
  
  // Als de woning al coördinaten heeft, gebruik die
  if (woningGegevens.breedtegraad && woningGegevens.lengtegraad) {
    return {
      ...woningGegevens,
      geformatteerd_adres: adres,
      heeft_geldige_coordinaten: true
    };
  }
  
  try {
    // Geocode het adres
    const geocodeResultaat = await geocodeAdres(adres);
    
    // Verrijk woninggegevens met geocode resultaat
    return {
      ...woningGegevens,
      breedtegraad: geocodeResultaat.breedtegraad,
      lengtegraad: geocodeResultaat.lengtegraad,
      geformatteerd_adres: geocodeResultaat.geformatteerd_adres || adres,
      geocode_betrouwbaarheid: geocodeResultaat.betrouwbaarheid,
      heeft_geldige_coordinaten: true
    };
    
  } catch (error) {
    console.error(`Geocoding fout voor woning ${woningGegevens.id}:`, error.message);
    
    // Geef oorspronkelijke gegevens terug met foutindicatie
    return {
      ...woningGegevens,
      geformatteerd_adres: adres,
      heeft_geldige_coordinaten: false,
      geocode_fout: error.message
    };
  }
};

/**
 * Leegt de geocoding cache
 */
const leegGeocodingCache = () => {
  geocodeCache.flushAll();
};

/**
 * Haalt statistieken op over de geocoding cache
 * @returns {Object} Cache statistieken
 */
const getGeocodingCacheStats = () => {
  return {
    aantal_items: geocodeCache.getStats().keys,
    grootte: geocodeCache.getStats().ksize,
    hits: geocodeCache.getStats().hits,
    misses: geocodeCache.getStats().misses,
    hit_rate: geocodeCache.getStats().hits / (geocodeCache.getStats().hits + geocodeCache.getStats().misses || 1)
  };
};

module.exports = {
  geocodeAdres,
  reverseGeocode,
  batchGeocodeAdressen,
  adresSuggesties,
  zoekAdressenInPolygoon,
  verrijkWoningMetGeocode,
  leegGeocodingCache,
  getGeocodingCacheStats
};