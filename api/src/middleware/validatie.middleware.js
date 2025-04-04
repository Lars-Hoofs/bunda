 
/**
 * Bunda API - Validatie Middleware
 * 
 * Deze middleware definieert validatieregels voor verschillende soorten verzoeken.
 */

const { body, param, query, validationResult } = require('express-validator');
const appConfig = require('../config/app.config');

// Hulpfunctie om validatieresultaten te controleren
const valideer = (req, res, next) => {
  const fouten = validationResult(req);
  
  if (!fouten.isEmpty()) {
    return res.status(400).json({
      succes: false,
      bericht: appConfig.berichten.ALGEMEEN.ONGELDIGE_INVOER,
      details: fouten.array()
    });
  }
  
  next();
};

// Validatie voor registratie
const valideerRegistratie = [
  body('email')
    .isEmail().withMessage('Geldig e-mailadres vereist')
    .normalizeEmail(),
    
  body('wachtwoord')
    .isLength({ min: 8 }).withMessage('Wachtwoord moet minimaal 8 tekens bevatten')
    .matches(/\d/).withMessage('Wachtwoord moet minimaal één cijfer bevatten')
    .matches(/[A-Z]/).withMessage('Wachtwoord moet minimaal één hoofdletter bevatten'),
    
  body('voornaam')
    .notEmpty().withMessage('Voornaam is verplicht')
    .isLength({ max: 50 }).withMessage('Voornaam mag maximaal 50 tekens bevatten'),
    
  body('achternaam')
    .notEmpty().withMessage('Achternaam is verplicht')
    .isLength({ max: 50 }).withMessage('Achternaam mag maximaal 50 tekens bevatten'),
  
  body('telefoon')
    .optional()
    .isMobilePhone('any').withMessage('Geldig telefoonnummer vereist'),
    
  body('rol')
    .optional()
    .isInt({ min: 1, max: 3 }).withMessage('Rol moet 1, 2 of 3 zijn'),
    
  valideer
];

// Validatie voor inloggen
const valideerLogin = [
  body('email')
    .isEmail().withMessage('Geldig e-mailadres vereist')
    .normalizeEmail(),
    
  body('wachtwoord')
    .notEmpty().withMessage('Wachtwoord is verplicht'),
    
  valideer
];

// Validatie voor woning creatie/update
const valideerWoning = [
  body('titel')
    .notEmpty().withMessage('Titel is verplicht')
    .isLength({ max: 100 }).withMessage('Titel mag maximaal 100 tekens bevatten'),
    
  body('beschrijving')
    .notEmpty().withMessage('Beschrijving is verplicht'),
    
  body('prijs')
    .notEmpty().withMessage('Prijs is verplicht')
    .isFloat({ min: 0 }).withMessage('Prijs moet een positief getal zijn'),
    
  body('oppervlakte')
    .notEmpty().withMessage('Oppervlakte is verplicht')
    .isFloat({ min: 0 }).withMessage('Oppervlakte moet een positief getal zijn'),
    
  body('slaapkamers')
    .optional()
    .isInt({ min: 0 }).withMessage('Aantal slaapkamers moet een positief getal zijn'),
    
  body('badkamers')
    .optional()
    .isInt({ min: 0 }).withMessage('Aantal badkamers moet een positief getal zijn'),
    
  body('bouwjaar')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Bouwjaar moet tussen 1800 en ${new Date().getFullYear()} liggen`),
    
  body('energielabel')
    .optional()
    .isIn(['A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'])
    .withMessage('Energielabel moet een geldige waarde zijn (A++ t/m G)'),
    
  body('straat')
    .notEmpty().withMessage('Straat is verplicht')
    .isLength({ max: 100 }).withMessage('Straat mag maximaal 100 tekens bevatten'),
    
  body('huisnummer')
    .notEmpty().withMessage('Huisnummer is verplicht')
    .isLength({ max: 10 }).withMessage('Huisnummer mag maximaal 10 tekens bevatten'),
    
  body('stad')
    .notEmpty().withMessage('Stad is verplicht')
    .isLength({ max: 100 }).withMessage('Stad mag maximaal 100 tekens bevatten'),
    
  body('postcode')
    .notEmpty().withMessage('Postcode is verplicht')
    .isLength({ max: 10 }).withMessage('Postcode mag maximaal 10 tekens bevatten'),
    
  body('breedtegraad')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Breedtegraad moet tussen -90 en 90 liggen'),
    
  body('lengtegraad')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Lengtegraad moet tussen -180 en 180 liggen'),
    
  body('status')
    .optional()
    .isIn(['beschikbaar', 'verkocht', 'in behandeling'])
    .withMessage('Status moet een geldige waarde zijn'),
    
  valideer
];

// Validatie voor bezichtiging creatie
const valideerBezichtiging = [
  body('woningId')
    .notEmpty().withMessage('Woning ID is verplicht')
    .isInt({ min: 1 }).withMessage('Woning ID moet een positief getal zijn'),
    
  body('bezichtigingDatum')
    .notEmpty().withMessage('Bezichtigingsdatum is verplicht')
    .isISO8601().withMessage('Bezichtigingsdatum moet een geldig datum/tijd formaat hebben')
    .custom((waarde) => {
      const datum = new Date(waarde);
      const nu = new Date();
      if (datum <= nu) {
        throw new Error('Bezichtigingsdatum moet in de toekomst liggen');
      }
      return true;
    }),
    
  body('notities')
    .optional()
    .isLength({ max: 500 }).withMessage('Notities mogen maximaal 500 tekens bevatten'),
    
  valideer
];

// Validatie voor zoekopdrachten
const valideerZoekopdracht = [
  query('straal')
    .optional()
    .isFloat({ min: 0, max: appConfig.zoeken.maxStraal })
    .withMessage(`Straal moet tussen 0 en ${appConfig.zoeken.maxStraal} km liggen`),
    
  query('breedtegraad')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Breedtegraad moet tussen -90 en 90 liggen'),
    
  query('lengtegraad')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Lengtegraad moet tussen -180 en 180 liggen'),
    
  query('minPrijs')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimumprijs moet een positief getal zijn'),
    
  query('maxPrijs')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximumprijs moet een positief getal zijn'),
    
  query('minOppervlakte')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimumoppervlakte moet een positief getal zijn'),
    
  query('minSlaapkamers')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum aantal slaapkamers moet een positief getal zijn'),
    
  query('minBadkamers')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum aantal badkamers moet een positief getal zijn'),
    
  query('kenmerken')
    .optional()
    .isArray().withMessage('Kenmerken moet een array zijn'),
    
  valideer
];

module.exports = {
  valideer,
  valideerRegistratie,
  valideerLogin,
  valideerWoning,
  valideerBezichtiging,
  valideerZoekopdracht
};