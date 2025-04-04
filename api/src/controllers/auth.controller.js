 
/**
 * Bunda API - Authenticatie Controller
 * 
 * Deze controller bevat de endpoint handlers voor authenticatie-gerelateerde routes.
 */

const authService = require('../services/auth.service');
const appConfig = require('../config/app.config');

/**
 * Registreert een nieuwe gebruiker
 * @route POST /api/auth/registreren
 */
const registreren = async (req, res, next) => {
  try {
    const gebruikerData = req.body;
    
    // Standaard rol is gebruiker (niveau 1) tenzij anders aangegeven
    if (!gebruikerData.rol) {
      gebruikerData.rol = appConfig.gebruikerNiveaus.GEBRUIKER;
    }
    
    const nieuweGebruiker = await authService.registreerGebruiker(gebruikerData);
    
    res.status(201).json({
      succes: true,
      bericht: appConfig.berichten.AUTH.REGISTRATIE_SUCCES,
      data: nieuweGebruiker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logt een gebruiker in
 * @route POST /api/auth/inloggen
 */
const inloggen = async (req, res, next) => {
  try {
    const { email, wachtwoord } = req.body;
    
    const { gebruiker, toegangsToken, verversingsToken } = await authService.inloggen(email, wachtwoord);
    
    res.json({
      succes: true,
      bericht: appConfig.berichten.AUTH.LOGIN_SUCCES,
      data: {
        gebruiker,
        toegangsToken,
        verversingsToken
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verfrist een toegangstoken met behulp van een verversingstoken
 * @route POST /api/auth/vernieuw-token
 */
const vernieuwToken = async (req, res, next) => {
  try {
    const { verversingsToken } = req.body;
    
    const { toegangsToken } = await authService.verversToken(verversingsToken);
    
    res.json({
      succes: true,
      data: { toegangsToken }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start het wachtwoord vergeten proces
 * @route POST /api/auth/wachtwoord-vergeten
 */
const wachtwoordVergeten = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const resultaat = await authService.wachtwoordVergetenStart(email);
    
    res.json({
      succes: true,
      bericht: resultaat.bericht
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset het wachtwoord met behulp van een resettoken
 * @route POST /api/auth/wachtwoord-resetten
 */
const wachtwoordResetten = async (req, res, next) => {
  try {
    const { token, nieuwWachtwoord } = req.body;
    
    const resultaat = await authService.wachtwoordReset(token, nieuwWachtwoord);
    
    res.json({
      succes: true,
      bericht: resultaat.bericht
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt de huidige ingelogde gebruiker op
 * @route GET /api/auth/mijn-account
 */
const getMijnAccount = async (req, res, next) => {
  try {
    // Authenticated middleware heeft req.gebruiker al ingesteld
    res.json({
      succes: true,
      data: req.gebruiker
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registreren,
  inloggen,
  vernieuwToken,
  wachtwoordVergeten,
  wachtwoordResetten,
  getMijnAccount
};