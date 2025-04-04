/**
 * Voorbeeld van integratie van geocoding in de WoningService
 * Dit zijn code-fragmenten die in de woning.service.js kunnen worden geïntegreerd
 */

const { Op } = require('sequelize');
const { Woning, Gebruiker } = require('../models');
const geocodingService = require('./geocoding.service');
const geoUtils = require('../utils/geo.utils');

/**
 * Maak een nieuwe woning met automatische geocoding
 * @param {Object} woningData - Gegevens van de woning
 * @param {number} verkoperId - ID van de verkoper
 * @returns {Promise<Object>} Nieuwe woning met geocoding
 */
const maakWoningMetGeocode = async (woningData, verkoperId) => {
  // Voeg verkoperId toe aan woningData
  woningData.verkoperId = verkoperId;
  
  // Maak eerst de woning aan zonder coördinaten als deze niet zijn opgegeven
  const woning = await Woning.create(woningData);
  
  // Voer geocoding uit als coördinaten niet zijn opgegeven
  if (!woningData.breedtegraad || !woningData.lengtegraad) {
    try {
      // Haal volledige woninggegevens op inclusief basis adresgegevens
      const volledige = await Woning.findByPk(woning.id);
      
      // Verrijk met geocoding
      const verrijkteWoning = await geocodingService.verrijkWoningMetGeocode(volledige);
      
      // Update woning met geocoding resultaten
      if (verrijkteWoning.heeft_geldige_coordinaten) {
        await woning.update({
          breedtegraad: verrijkteWoning.breedtegraad,
          lengtegraad: verrijkteWoning.lengtegraad
        });
      }
    } catch (error) {
      console.error(`Geocoding fout voor nieuwe woning ${woning.id}:`, error.message);
      // Ga door zonder coördinaten
    }
  }
  
  return woning;
};

/**
 * Geavanceerde zoekfunctie die gebruik maakt van geocoding voor adres input
 * @param {string} zoekterm - Zoekterm die een adres kan bevatten
 * @param {number} straal - Zoekstraal in kilometers
 * @param {Object} filters - Aanvullende filters
 * @returns {Promise<Object>} Zoekresultaten
 */
const zoekWoningenMetAdres = async (zoekterm, straal = 10, filters = {}) => {
  // Controleer of de zoekterm een adres zou kunnen zijn
  const lijktOpAdres = /\b\d+\b.*\b\d{4}\b/.test(zoekterm) || // bevat huisnummer en 4-cijferige postcode
                      /\b(straat|laan|weg|plein)\b/i.test(zoekterm);
  
  if (lijktOpAdres) {
    try {
      // Probeer geocoding op de zoekterm
      const geocodeResultaat = await geocodingService.geocodeAdres(zoekterm);
      
      // Als gevonden, gebruik coördinaten voor straalzoeken
      if (geocodeResultaat.betrouwbaarheid > 0.7) {
        const straalResultaten = await zoekWoningenInStraal(
          geocodeResultaat.breedtegraad,
          geocodeResultaat.lengtegraad,
          straal,
          filters
        );
        
        // Voeg zoekcontext toe
        straalResultaten.zoekContext = {
          type: 'adres',
          zoekterm,
          gevondenAdres: geocodeResultaat.geformatteerd_adres,
          breedtegraad: geocodeResultaat.breedtegraad,
          lengtegraad: geocodeResultaat.lengtegraad,
          straal
        };
        
        return straalResultaten;
      }
    } catch (error) {
      console.error('Geocoding fout bij zoeken:', error.message);
      // Valt terug op normale zoekopdracht
    }
  }
  
  // Standaard zoekgedrag als geen adres werd herkend
  return getWoningen({ ...filters, zoekterm });
};

/**
 * Zoekt woningen binnen een administratieve regio (gemeente, wijk, etc.)
 * @param {string} regioNaam - Naam van de regio (gemeente, wijk, etc.)
 * @param {Object} filters - Aanvullende filters
 * @returns {Promise<Object>} Woningen in de regio
 */
const zoekWoningenInRegio = async (regioNaam, filters = {}) => {
  try {
    // Geocode de regio om het begrenzingsvak te vinden
    const geocodeResultaat = await geocodingService.geocodeAdres(regioNaam);
    
    // Als de regio niet werd gevonden, val terug op tekstuele zoekopdracht
    if (!geocodeResultaat || geocodeResultaat.betrouwbaarheid < 0.5) {
      return getWoningen({ ...filters, zoekterm: regioNaam });
    }
    
    // Gebruik de coördinaten van de regio om een begrenzingsvak te maken
    // Dit is een vereenvoudiging; een echte implementatie zou een polygoon-gebaseerde
    // benadering gebruiken voor nauwkeurigere regiogrenzen
    const straal = 3; // Geschatte straal voor een kleine gemeente in km
    const begrenzingsvak = geoUtils.berekenBegrenzingsvak(
      geocodeResultaat.breedtegraad,
      geocodeResultaat.lengtegraad,
      straal
    );
    
    // Zoek woningen binnen het begrenzingsvak
    const { count, rows } = await Woning.findAndCountAll({
      where: {
        ...filters,
        breedtegraad: { 
          [Op.between]: [begrenzingsvak.minBreedtegraad, begrenzingsvak.maxBreedtegraad] 
        },
        lengtegraad: { 
          [Op.between]: [begrenzingsvak.minLengtegraad, begrenzingsvak.maxLengtegraad] 
        }
      },
      include: [
        // ... overige includes
      ]
    });
    
    return {
      woningen: rows,
      metadata: {
        totaal: count,
        regioNaam: geocodeResultaat.geformatteerd_adres || regioNaam,
        begrenzingsvak
      }
    };
  } catch (error) {
    console.error(`Fout bij zoeken in regio ${regioNaam}:`, error.message);
    // Val terug op standaard tekstzoekopdracht
    return getWoningen({ ...filters, zoekterm: regioNaam });
  }
};

/**
 * Voorbeeld van een geavanceerde polygoonzoekfunctie met PostGIS
 * Dit vereist PostgreSQL met PostGIS en aanpassingen in Sequelize configuratie
 * @param {Array} polygoonPunten - Array van punten die een polygoon vormen
 * @param {Object} filters - Aanvullende filters
 * @returns {Promise<Object>} Woningen binnen de polygoon
 */
const zoekWoningenInPolygoon = async (polygoonPunten, filters = {}) => {
  try {
    // Converteer punten naar GeoJSON polygoon
    const polygoon = {
      type: 'Polygon',
      coordinates: [polygoonPunten.map(punt => [punt.lengtegraad, punt.breedtegraad])]
    };
    
    // PostgreSQL met PostGIS query
    // Dit werkt alleen met een PostgreSQL database met PostGIS extensie
    const woningen = await Woning.findAll({
      where: {
        ...filters,
        // Gebruik Sequelize literal voor spatial query
        // Dit vereist dat de woning tabel een geometrie kolom heeft
        [Op.and]: [
          Sequelize.fn(
            'ST_Contains',
            Sequelize.fn('ST_GeomFromGeoJSON', JSON.stringify(polygoon)),
            Sequelize.fn(
              'ST_SetSRID',
              Sequelize.fn('ST_MakePoint', Sequelize.col('lengtegraad'), Sequelize.col('breedtegraad')),
              4326 // SRID voor WGS84
            )
          )
        ]
      },
      include: [
        // ... overige includes
      ]
    });
    
    return {
      woningen,
      metadata: {
        totaal: woningen.length,
        polygoon
      }
    };
  } catch (error) {
    console.error('Fout bij polygoon zoekopdracht:', error.message);
    throw error;
  }
};

/**
 * Update adressen voor woningen zonder coördinaten
 * Dit kan als achtergrondtaak worden gebruikt om oude data bij te werken
 * @returns {Promise<Object>} Resultaat van de geocoding operatie
 */
const updateOntbrekendeCoordinaten = async () => {
  // Vind woningen zonder coördinaten
  const woningenZonderCoordinaten = await Woning.findAll({
    where: {
      [Op.or]: [
        { breedtegraad: null },
        { lengtegraad: null },
        { breedtegraad: 0 },
        { lengtegraad: 0 }
      ]
    },
    limit: 100 // Verwerk in batches om rate limits te respecteren
  });
  
  console.log(`${woningenZonderCoordinaten.length} woningen gevonden zonder coördinaten`);
  
  // Als er geen woningen zijn, stop
  if (woningenZonderCoordinaten.length === 0) {
    return { succes: true, bijgewerkt: 0 };
  }
  
  // Bijwerk-teller
  let bijgewerkt = 0;
  
  // Verwerk elke woning
  for (const woning of woningenZonderCoordinaten) {
    try {
      // Verrijk met geocoding
      const verrijkteWoning = await geocodingService.verrijkWoningMetGeocode(woning);
      
      // Update woning als er geldige coördinaten zijn gevonden
      if (verrijkteWoning.heeft_geldige_coordinaten) {
        await woning.update({
          breedtegraad: verrijkteWoning.breedtegraad,
          lengtegraad: verrijkteWoning.lengtegraad
        });
        
        bijgewerkt++;
      }
      
      // Wacht kort tussen aanroepen om rate limits te respecteren
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`Fout bij geocoding van woning ${woning.id}:`, error.message);
      // Ga door met de volgende woning
    }
  }
  
  return {
    succes: true,
    totaal: woningenZonderCoordinaten.length,
    bijgewerkt
  };
};

// Deze functies zouden in de echte woning.service.js worden geëxporteerd