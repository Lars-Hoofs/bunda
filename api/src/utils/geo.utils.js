 
/**
 * Bunda API - Geografische Hulpfuncties
 * 
 * Dit bestand bevat uitgebreide functies voor het uitvoeren van geografische berekeningen
 * en bewerkingen die nodig zijn voor het zoeken en visualiseren van woningen.
 */

/**
 * Converteert graden naar radialen
 * @param {number} graden - Hoek in graden
 * @returns {number} Hoek in radialen
 */
const toRadialen = (graden) => {
    return graden * (Math.PI / 180);
  };
  
  /**
   * Converteert radialen naar graden
   * @param {number} radialen - Hoek in radialen
   * @returns {number} Hoek in graden
   */
  const toGraden = (radialen) => {
    return radialen * (180 / Math.PI);
  };
  
  /**
   * Berekent de afstand tussen twee punten met Haversine formule
   * @param {number} lat1 - Breedtegraad van eerste punt
   * @param {number} lon1 - Lengtegraad van eerste punt
   * @param {number} lat2 - Breedtegraad van tweede punt
   * @param {number} lon2 - Lengtegraad van tweede punt
   * @returns {number} Afstand in kilometers
   */
  const berekenAfstand = (lat1, lon1, lat2, lon2) => {
    // Radius van de aarde in kilometers
    const R = 6371;
    
    // Converteer graden naar radialen
    const dLat = toRadialen(lat2 - lat1);
    const dLon = toRadialen(lon2 - lon1);
    
    // Haversine formule
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadialen(lat1)) * Math.cos(toRadialen(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const afstand = R * c; // in kilometers
    
    return afstand;
  };
  
  /**
   * Berekent het middelpunt van een verzameling coördinaten
   * @param {Array} coordinaten - Array van objecten met breedtegraad en lengtegraad
   * @returns {Object} Object met gemiddelde breedtegraad en lengtegraad
   */
  const berekenMiddelpunt = (coordinaten) => {
    if (!coordinaten || coordinaten.length === 0) {
      return null;
    }
    
    // Voor nauwkeuriger middelpunt berekening gebruiken we cartesische coördinaten
    let x = 0;
    let y = 0;
    let z = 0;
    let aantalGeldig = 0;
    
    for (const coord of coordinaten) {
      if (coord && coord.breedtegraad !== undefined && coord.lengtegraad !== undefined) {
        // Converteer naar radialen
        const lat = toRadialen(coord.breedtegraad);
        const lon = toRadialen(coord.lengtegraad);
        
        // Converteer naar cartesische coördinaten
        x += Math.cos(lat) * Math.cos(lon);
        y += Math.cos(lat) * Math.sin(lon);
        z += Math.sin(lat);
        
        aantalGeldig++;
      }
    }
    
    if (aantalGeldig === 0) {
      return null;
    }
    
    // Bereken gemiddelde
    x /= aantalGeldig;
    y /= aantalGeldig;
    z /= aantalGeldig;
    
    // Converteer terug naar lat/lon
    const hyp = Math.sqrt(x * x + y * y);
    const lon = Math.atan2(y, x);
    const lat = Math.atan2(z, hyp);
    
    return {
      breedtegraad: toGraden(lat),
      lengtegraad: toGraden(lon)
    };
  };
  
  /**
   * Berekent een begrenzingsvak voor een middelpunt en straal
   * @param {number} breedtegraad - Breedtegraad van middelpunt
   * @param {number} lengtegraad - Lengtegraad van middelpunt
   * @param {number} straal - Straal in kilometers
   * @returns {Object} Begrenzingsvak met min/max breedtegraad en lengtegraad
   */
  const berekenBegrenzingsvak = (breedtegraad, lengtegraad, straal) => {
    // Ruwweg 111.32 km per breedtegraad
    const kmPerBreedtegraad = 111.32;
    
    // Km per lengtegraad varieert met breedtegraad
    const kmPerLengtegraad = Math.abs(Math.cos(toRadialen(breedtegraad))) * kmPerBreedtegraad;
    
    // Omzetten van km naar graden
    const deltaBreedtegraad = straal / kmPerBreedtegraad;
    const deltaLengtegraad = straal / kmPerLengtegraad;
    
    return {
      minBreedtegraad: breedtegraad - deltaBreedtegraad,
      maxBreedtegraad: breedtegraad + deltaBreedtegraad,
      minLengtegraad: lengtegraad - deltaLengtegraad,
      maxLengtegraad: lengtegraad + deltaLengtegraad
    };
  };
  
  /**
   * Converteert een adres naar geografische coördinaten (geocoding)
   * In een echte implementatie zou dit een externe API gebruiken
   * @param {string} adres - Volledig adres
   * @returns {Promise<Object>} Object met breedtegraad en lengtegraad
   */
  const geocodeAdres = async (adres) => {
    // Placeholder voor echte geocoding functionaliteit
    // In een echte implementatie zou dit een externe API zoals Google Maps of Nominatim gebruiken
    
    // Belgische steden en postcodes als voorbeeld
    const bekendePlaatsen = {
      'brussel': { breedtegraad: 50.8503, lengtegraad: 4.3517 },
      'antwerpen': { breedtegraad: 51.2194, lengtegraad: 4.4025 },
      'gent': { breedtegraad: 51.0543, lengtegraad: 3.7174 },
      'luik': { breedtegraad: 50.6326, lengtegraad: 5.5797 },
      'brugge': { breedtegraad: 51.2093, lengtegraad: 3.2247 },
      '1000 brussel': { breedtegraad: 50.8503, lengtegraad: 4.3517 },
      '2000 antwerpen': { breedtegraad: 51.2194, lengtegraad: 4.4025 },
      '9000 gent': { breedtegraad: 51.0543, lengtegraad: 3.7174 },
      '4000 luik': { breedtegraad: 50.6326, lengtegraad: 5.5797 },
      '8000 brugge': { breedtegraad: 51.2093, lengtegraad: 3.2247 }
    };
  
    // Kijk of het adres een bekende plaats bevat
    const adresLowerCase = adres.toLowerCase();
    
    for (const [key, value] of Object.entries(bekendePlaatsen)) {
      if (adresLowerCase.includes(key)) {
        return value;
      }
    }
    
    // Standaard terugvallen op Brussel als centrum van België
    return {
      breedtegraad: 50.8503,
      lengtegraad: 4.3517
    };
  };
  
  /**
   * Omgekeerde geocoding - omzet coördinaten naar een adres
   * @param {number} breedtegraad - Breedtegraad
   * @param {number} lengtegraad - Lengtegraad
   * @returns {Promise<string>} Adres string
   */
  const reverseGeocode = async (breedtegraad, lengtegraad) => {
    // Placeholder voor echte reverse geocoding functionaliteit
    // Echte implementatie zou een API gebruiken
  
    // Simplistische implementatie met vaste punten
    const bekendePunten = [
      { 
        coordinaten: { breedtegraad: 50.8503, lengtegraad: 4.3517 }, 
        adres: 'Grote Markt, 1000 Brussel' 
      },
      { 
        coordinaten: { breedtegraad: 51.2194, lengtegraad: 4.4025 }, 
        adres: 'Grote Markt, 2000 Antwerpen' 
      },
      { 
        coordinaten: { breedtegraad: 51.0543, lengtegraad: 3.7174 }, 
        adres: 'Korenmarkt, 9000 Gent' 
      }
    ];
  
    // Vind het dichtstbijzijnde punt
    let dichtstbijAdres = 'Onbekend adres in België';
    let minAfstand = Number.MAX_VALUE;
    
    for (const punt of bekendePunten) {
      const afstand = berekenAfstand(
        breedtegraad, 
        lengtegraad, 
        punt.coordinaten.breedtegraad, 
        punt.coordinaten.lengtegraad
      );
      
      if (afstand < minAfstand) {
        minAfstand = afstand;
        dichtstbijAdres = punt.adres;
      }
    }
    
    return dichtstbijAdres;
  };
  
  /**
   * Genereert een geoJSON object voor een locatie
   * @param {number} breedtegraad - Breedtegraad
   * @param {number} lengtegraad - Lengtegraad
   * @param {Object} eigenschappen - Aanvullende eigenschappen
   * @returns {Object} GeoJSON Point object
   */
  const maakGeoJSONPunt = (breedtegraad, lengtegraad, eigenschappen = {}) => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lengtegraad, breedtegraad] // GeoJSON gebruikt [lng, lat] volgorde
      },
      properties: eigenschappen
    };
  };
  
  /**
   * Genereert een GeoJSON FeatureCollection van punten
   * @param {Array} punten - Array van objecten met breedtegraad, lengtegraad en eigenschappen
   * @returns {Object} GeoJSON FeatureCollection
   */
  const maakGeoJSONFeatureCollection = (punten) => {
    const features = punten.map(punt => {
      return maakGeoJSONPunt(
        punt.breedtegraad, 
        punt.lengtegraad, 
        punt.eigenschappen || {}
      );
    });
    
    return {
      type: 'FeatureCollection',
      features
    };
  };
  
  /**
   * Genereert een GeoJSON Polygon voor een begrenzingsvak
   * @param {Object} begrenzingsvak - Object met min/max breedtegraad en lengtegraad
   * @param {Object} eigenschappen - Aanvullende eigenschappen
   * @returns {Object} GeoJSON Polygon object
   */
  const maakGeoJSONPolygon = (begrenzingsvak, eigenschappen = {}) => {
    const { minBreedtegraad, maxBreedtegraad, minLengtegraad, maxLengtegraad } = begrenzingsvak;
    
    // GeoJSON coördinaten zijn in volgorde [lng, lat]
    // Polygon moet gesloten zijn (eerste en laatste punt moeten hetzelfde zijn)
    const coordinates = [
      [
        [minLengtegraad, minBreedtegraad],
        [maxLengtegraad, minBreedtegraad],
        [maxLengtegraad, maxBreedtegraad],
        [minLengtegraad, maxBreedtegraad],
        [minLengtegraad, minBreedtegraad] // Sluit de ring
      ]
    ];
    
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates
      },
      properties: eigenschappen
    };
  };
  
  /**
   * Controleert of een punt binnen een begrenzingsvak valt
   * @param {number} breedtegraad - Breedtegraad van het punt
   * @param {number} lengtegraad - Lengtegraad van het punt
   * @param {Object} begrenzingsvak - Object met min/max breedtegraad en lengtegraad
   * @returns {boolean} True als het punt binnen het begrenzingsvak valt
   */
  const isPuntInBegrenzingsvak = (breedtegraad, lengtegraad, begrenzingsvak) => {
    const { minBreedtegraad, maxBreedtegraad, minLengtegraad, maxLengtegraad } = begrenzingsvak;
    
    return (
      breedtegraad >= minBreedtegraad &&
      breedtegraad <= maxBreedtegraad &&
      lengtegraad >= minLengtegraad &&
      lengtegraad <= maxLengtegraad
    );
  };
  
  /**
   * Converteert Belgische Lambert72 coördinaten naar WGS84 (lat/lon)
   * @param {number} x - X-coördinaat in Lambert72
   * @param {number} y - Y-coördinaat in Lambert72
   * @returns {Object} Object met breedtegraad en lengtegraad in WGS84
   */
  const lambert72NaarWGS84 = (x, y) => {
    // Dit is een vereenvoudigde implementatie
    // Een echte implementatie zou meer complexe berekeningen gebruiken
    
    // Belgisch Lambert 72 naar WGS84 (lat/lon) conversie parameters
    const lambda0 = toRadialen(4.367486666666667); // Centrale meridiaan
    const phi0 = toRadialen(50.797815); // Referentie breedtegraad
    const k0 = 0.7716421928; // Schaalfactor
    const x0 = 150000.01256; // False Easting
    const y0 = 5400088.4378; // False Northing
    const a = 6378388.0; // Halve lange as van de ellipsoïde
    const e = 0.081991889979; // Excentriciteit
    
    // Transformatie berekeningen
    const xShift = x - x0;
    const yShift = y - y0;
    
    // Polar radiale coördinaat
    const rho = Math.sqrt(xShift * xShift + yShift * yShift);
    
    // Polaire hoek
    const theta = Math.atan2(xShift, yShift);
    
    // Breedtegraad berekening
    const phi = phi0 + (rho / (a * k0));
    
    // Lengtegraad berekening
    const lambda = lambda0 + (theta / k0);
    
    return {
      breedtegraad: toGraden(phi),
      lengtegraad: toGraden(lambda)
    };
  };
  
  /**
   * Formatteert een postcode en gemeente volgens Belgisch formaat
   * @param {string} postcode - Postcode
   * @param {string} gemeente - Gemeentenaam
   * @returns {string} Geformatteerde postcode en gemeente
   */
  const formatteerPostcodeGemeente = (postcode, gemeente) => {
    if (!postcode || !gemeente) {
      return '';
    }
    
    // Zorg ervoor dat postcode een string is
    const postcodeString = String(postcode);
    
    // Belgische postcodes zijn 4 cijfers
    if (postcodeString.length !== 4 || isNaN(parseInt(postcodeString))) {
      return `${gemeente}`;
    }
    
    return `${postcodeString} ${gemeente}`;
  };
  
  /**
   * Formatteert een volledig Belgisch adres
   * @param {string} straat - Straatnaam
   * @param {string} huisnummer - Huisnummer
   * @param {string} postcode - Postcode
   * @param {string} gemeente - Gemeentenaam
   * @returns {string} Geformatteerd adres
   */
  const formatteerAdres = (straat, huisnummer, postcode, gemeente) => {
    if (!straat) {
      return formatteerPostcodeGemeente(postcode, gemeente);
    }
    
    const straatHuisnummer = huisnummer ? `${straat} ${huisnummer}` : straat;
    const postcodeGemeente = formatteerPostcodeGemeente(postcode, gemeente);
    
    if (!postcodeGemeente) {
      return straatHuisnummer;
    }
    
    return `${straatHuisnummer}, ${postcodeGemeente}`;
  };
  
  /**
   * Clustert nabijgelegen punten op basis van afstand
   * @param {Array} punten - Array van punten met breedtegraad en lengtegraad
   * @param {number} afstandThreshold - Maximale afstand in km om als cluster te beschouwen
   * @returns {Array} Array van clusters, elk een array van punten
   */
  const clusterPunten = (punten, afstandThreshold = 1) => {
    if (!punten || punten.length === 0) {
      return [];
    }
    
    // Kopieer de punten om de originele array niet te wijzigen
    const resterende = [...punten];
    const clusters = [];
    
    while (resterende.length > 0) {
      // Start een nieuw cluster met het eerste punt
      const cluster = [resterende.shift()];
      
      // Controleer alle andere punten
      for (let i = 0; i < resterende.length; i++) {
        const punt = resterende[i];
        
        // Controleer of dit punt dicht bij een van de punten in het huidige cluster ligt
        const isNabij = cluster.some(clusterPunt => {
          const afstand = berekenAfstand(
            clusterPunt.breedtegraad, clusterPunt.lengtegraad,
            punt.breedtegraad, punt.lengtegraad
          );
          return afstand <= afstandThreshold;
        });
        
        // Als het nabij is, voeg het toe aan het cluster en verwijder het uit de resterende punten
        if (isNabij) {
          cluster.push(punt);
          resterende.splice(i, 1);
          i--; // Aanpassen voor volgende iteratie na splice
        }
      }
      
      // Voeg het voltooide cluster toe aan de lijst
      clusters.push(cluster);
    }
    
    return clusters;
  };
  
  /**
   * Berekent het zwaartepunt van een geclusterde verzameling punten
   * @param {Array} clusters - Array van clusters, elk een array van punten
   * @returns {Array} Array van zwaartepunten, één voor elk cluster
   */
  const berekenClusterZwaartepunten = (clusters) => {
    return clusters.map(cluster => {
      const zwaartepunt = berekenMiddelpunt(cluster);
      return {
        ...zwaartepunt,
        aantalPunten: cluster.length
      };
    });
  };
  
  /**
   * Genereert punten langs een route tussen twee locaties
   * @param {Object} startpunt - Object met breedtegraad en lengtegraad
   * @param {Object} eindpunt - Object met breedtegraad en lengtegraad
   * @param {number} aantalPunten - Aantal tussenpunten
   * @returns {Array} Array van punten langs de route
   */
  const genereerRoutePunten = (startpunt, eindpunt, aantalPunten = 10) => {
    const punten = [];
    
    for (let i = 0; i <= aantalPunten; i++) {
      const factor = i / aantalPunten;
      
      // Lineaire interpolatie tussen start- en eindpunt
      const breedtegraad = startpunt.breedtegraad + 
        (eindpunt.breedtegraad - startpunt.breedtegraad) * factor;
      
      const lengtegraad = startpunt.lengtegraad + 
        (eindpunt.lengtegraad - startpunt.lengtegraad) * factor;
      
      punten.push({ breedtegraad, lengtegraad });
    }
    
    return punten;
  };
  
  module.exports = {
    toRadialen,
    toGraden,
    berekenAfstand,
    berekenMiddelpunt,
    berekenBegrenzingsvak,
    geocodeAdres,
    reverseGeocode,
    maakGeoJSONPunt,
    maakGeoJSONFeatureCollection,
    maakGeoJSONPolygon,
    isPuntInBegrenzingsvak,
    lambert72NaarWGS84,
    formatteerPostcodeGemeente,
    formatteerAdres,
    clusterPunten,
    berekenClusterZwaartepunten,
    genereerRoutePunten
  };