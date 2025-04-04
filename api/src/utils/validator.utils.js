 
/**
 * Bunda API - Validatie Hulpfuncties
 * 
 * Dit bestand bevat extra validatiefuncties voor gebruik in de API.
 */

/**
 * Valideer of een string een geldig e-mailadres is
 * @param {string} email - E-mailadres om te valideren
 * @returns {boolean} True als geldig e-mailadres
 */
const isGeldigEmail = (email) => {
    if (!email) return false;
    
    // Regex voor e-mailvalidatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Valideer of een string een geldige Belgische postcode is
   * @param {string} postcode - Postcode om te valideren
   * @returns {boolean} True als geldige Belgische postcode
   */
  const isGeldigeBelgischePostcode = (postcode) => {
    if (!postcode) return false;
    
    // Belgische postcodes zijn 4 cijfers
    const postcodeRegex = /^[0-9]{4}$/;
    return postcodeRegex.test(postcode);
  };
  
  /**
   * Valideer of een string een geldig Belgisch telefoonnummer is
   * @param {string} telefoon - Telefoonnummer om te valideren
   * @returns {boolean} True als geldig Belgisch telefoonnummer
   */
  const isGeldigBelgischTelefoonnummer = (telefoon) => {
    if (!telefoon) return false;
    
    // Verwijder spaties, haakjes en streepjes
    const schoonTelefoon = telefoon.replace(/[\s()\-]/g, '');
    
    // Controleer of het nummer begint met +32 of 0
    const telefoonRegex = /^(?:\+32|0)[0-9]{8,9}$/;
    return telefoonRegex.test(schoonTelefoon);
  };
  
  /**
   * Valideer of een datum in het verleden ligt
   * @param {Date|string} datum - Datum om te valideren
   * @returns {boolean} True als datum in het verleden ligt
   */
  const isInVerleden = (datum) => {
    const vergelijkDatum = new Date(datum);
    const nu = new Date();
    
    return vergelijkDatum < nu;
  };
  
  /**
   * Valideer of een datum in de toekomst ligt
   * @param {Date|string} datum - Datum om te valideren
   * @returns {boolean} True als datum in de toekomst ligt
   */
  const isInToekomst = (datum) => {
    const vergelijkDatum = new Date(datum);
    const nu = new Date();
    
    return vergelijkDatum > nu;
  };
  
  /**
   * Valideer of een wachtwoord voldoende sterk is
   * @param {string} wachtwoord - Wachtwoord om te valideren
   * @returns {Object} Object met geldig vlag en eventuele fouten
   */
  const valideerWachtwoordSterkte = (wachtwoord) => {
    if (!wachtwoord) {
      return { geldig: false, fouten: ['Wachtwoord is verplicht'] };
    }
    
    const fouten = [];
    
    if (wachtwoord.length < 8) {
      fouten.push('Wachtwoord moet minimaal 8 tekens bevatten');
    }
    
    if (!wachtwoord.match(/[A-Z]/)) {
      fouten.push('Wachtwoord moet minimaal één hoofdletter bevatten');
    }
    
    if (!wachtwoord.match(/[a-z]/)) {
      fouten.push('Wachtwoord moet minimaal één kleine letter bevatten');
    }
    
    if (!wachtwoord.match(/[0-9]/)) {
      fouten.push('Wachtwoord moet minimaal één cijfer bevatten');
    }
    
    if (!wachtwoord.match(/[^A-Za-z0-9]/)) {
      fouten.push('Wachtwoord moet minimaal één speciaal teken bevatten');
    }
    
    return {
      geldig: fouten.length === 0,
      fouten
    };
  };
  
  /**
   * Valideer of een gegeven waarde een geldige prijs is
   * @param {number|string} prijs - Prijs om te valideren
   * @param {number} min - Minimale prijs (optioneel)
   * @param {number} max - Maximale prijs (optioneel)
   * @returns {boolean} True als geldige prijs
   */
  const isGeldigePrijs = (prijs, min = 0, max = Number.MAX_SAFE_INTEGER) => {
    // Converteer naar getal als het een string is
    const numeriekePrijs = typeof prijs === 'string' ? parseFloat(prijs) : prijs;
    
    // Controleer of het een geldig getal is
    if (isNaN(numeriekePrijs)) {
      return false;
    }
    
    // Controleer of de prijs binnen de grenzen valt
    return numeriekePrijs >= min && numeriekePrijs <= max;
  };
  
  /**
   * Valideer of een object alleen de opgegeven velden bevat
   * @param {Object} object - Te valideren object
   * @param {Array} toegestaneVelden - Array van toegestane veldnamen
   * @returns {boolean} True als het object alleen toegestane velden bevat
   */
  const heeftAlleenToegestaneVelden = (object, toegestaneVelden) => {
    if (!object || typeof object !== 'object') {
      return false;
    }
    
    const objectVelden = Object.keys(object);
    
    for (const veld of objectVelden) {
      if (!toegestaneVelden.includes(veld)) {
        return false;
      }
    }
    
    return true;
  };
  
  /**
   * Controleert of alle vereiste velden aanwezig zijn in het object
   * @param {Object} object - Te valideren object
   * @param {Array} vereisteVelden - Array van vereiste veldnamen
   * @returns {boolean} True als alle vereiste velden aanwezig zijn
   */
  const heeftVereisteVelden = (object, vereisteVelden) => {
    if (!object || typeof object !== 'object') {
      return false;
    }
    
    const objectVelden = Object.keys(object);
    
    for (const veld of vereisteVelden) {
      if (!objectVelden.includes(veld) || object[veld] === undefined || object[veld] === null) {
        return false;
      }
    }
    
    return true;
  };
  
  module.exports = {
    isGeldigEmail,
    isGeldigeBelgischePostcode,
    isGeldigBelgischTelefoonnummer,
    isInVerleden,
    isInToekomst,
    valideerWachtwoordSterkte,
    isGeldigePrijs,
    heeftAlleenToegestaneVelden,
    heeftVereisteVelden
  };