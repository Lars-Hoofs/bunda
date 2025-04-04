 
/**
 * Bunda API - Authenticatie Service
 * 
 * Deze service bevat logica voor registratie, login, en tokenmanagement.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const appConfig = require('../config/app.config');
const { Gebruiker } = require('../models');

/**
 * Maakt een nieuwe gebruiker aan
 * @param {Object} gebruikerData - Gebruikersgegevens (email, wachtwoord, etc.)
 * @returns {Promise<Object>} Nieuwe gebruiker (zonder wachtwoord)
 */
const registreerGebruiker = async (gebruikerData) => {
  // Controleer of email al in gebruik is
  const bestaandeGebruiker = await Gebruiker.vindMetEmail(gebruikerData.email);
  if (bestaandeGebruiker) {
    const error = new Error('E-mailadres is al in gebruik');
    error.statusCode = 400;
    throw error;
  }

  // Maak nieuwe gebruiker
  const gebruiker = await Gebruiker.create(gebruikerData);
  
  return gebruiker;
};

/**
 * Verifieert de inloggegevens en geeft tokens terug als ze geldig zijn
 * @param {string} email - E-mailadres van de gebruiker
 * @param {string} wachtwoord - Wachtwoord van de gebruiker
 * @returns {Promise<Object>} Object met toegangstoken en verversingstoken
 */
const inloggen = async (email, wachtwoord) => {
  // Zoek gebruiker op email
  const gebruiker = await Gebruiker.vindMetEmail(email);
  if (!gebruiker) {
    const error = new Error(appConfig.berichten.AUTH.GEBRUIKER_NIET_GEVONDEN);
    error.statusCode = 401;
    throw error;
  }

  // Controleer wachtwoord
  const isGeldigWachtwoord = await gebruiker.controleerWachtwoord(wachtwoord);
  if (!isGeldigWachtwoord) {
    const error = new Error(appConfig.berichten.AUTH.ONGELDIG_WACHTWOORD);
    error.statusCode = 401;
    throw error;
  }

  // Update laatste login tijdstip
  gebruiker.laatsteLogin = new Date();
  await gebruiker.save();

  // Genereer tokens
  const tokens = _genereeerTokens(gebruiker);
  
  return {
    gebruiker,
    ...tokens
  };
};

/**
 * Verfrist een toegangstoken met een geldig verversingstoken
 * @param {string} verversingsToken - Het verversingstoken
 * @returns {Promise<Object>} Object met nieuw toegangstoken
 */
const verversToken = async (verversingsToken) => {
  try {
    // Verifieer verversingstoken
    const decoded = jwt.verify(verversingsToken, appConfig.auth.jwtSecret);
    
    // Zoek gebruiker op
    const gebruiker = await Gebruiker.findByPk(decoded.id);
    if (!gebruiker) {
      const error = new Error('Ongeldige token: gebruiker bestaat niet');
      error.statusCode = 401;
      throw error;
    }

    // Genereer nieuw toegangstoken
    const toegangsToken = _genereeerToegangToken(gebruiker);
    
    return { toegangsToken };
  } catch (error) {
    const fout = new Error('Ongeldige of verlopen verversingstoken');
    fout.statusCode = 401;
    throw fout;
  }
};

/**
 * Start het wachtwoord reset proces
 * @param {string} email - E-mailadres van de gebruiker
 * @returns {Promise<Object>} Bericht dat reset instructies zijn verzonden
 */
const wachtwoordVergetenStart = async (email) => {
  // Zoek gebruiker op email
  const gebruiker = await Gebruiker.vindMetEmail(email);
  if (!gebruiker) {
    // We retourneren dezelfde melding om privacy redenen, ongeacht of de gebruiker bestaat
    return { bericht: 'Als dit e-mailadres in ons systeem staat, hebben we reset-instructies verzonden' };
  }

  // Genereer reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Sla token op in database
  gebruiker.resetToken = resetToken;
  gebruiker.resetTokenVerlooptOp = new Date(Date.now() + 3600000); // 1 uur geldig
  await gebruiker.save();

  // Hier zou een email service de reset instructies moeten verzenden
  console.log(`Reset token voor ${email}: ${resetToken}`);
  
  return { bericht: 'Als dit e-mailadres in ons systeem staat, hebben we reset-instructies verzonden' };
};

/**
 * Reset het wachtwoord met een geldig reset token
 * @param {string} token - Reset token
 * @param {string} nieuwWachtwoord - Nieuw wachtwoord
 * @returns {Promise<Object>} Bericht dat het wachtwoord is gereset
 */
const wachtwoordReset = async (token, nieuwWachtwoord) => {
  // Zoek gebruiker met dit token
  const gebruiker = await Gebruiker.findOne({
    where: {
      resetToken: token,
      resetTokenVerlooptOp: { $gt: new Date() }
    }
  });

  if (!gebruiker) {
    const error = new Error('Ongeldig of verlopen token');
    error.statusCode = 400;
    throw error;
  }

  // Update wachtwoord
  gebruiker.wachtwoord = nieuwWachtwoord;
  gebruiker.resetToken = null;
  gebruiker.resetTokenVerlooptOp = null;
  await gebruiker.save();

  return { bericht: 'Wachtwoord is succesvol gereset' };
};

/**
 * Genereert zowel een toegangstoken als een verversingstoken
 * @param {Object} gebruiker - Gebruikersobject
 * @returns {Object} Objecten die beide tokens bevatten
 */
const _genereeerTokens = (gebruiker) => {
  const toegangsToken = _genereeerToegangToken(gebruiker);
  
  // Genereer verversingstoken (langer geldig)
  const verversingsToken = jwt.sign(
    { id: gebruiker.id },
    appConfig.auth.jwtSecret,
    { expiresIn: appConfig.auth.refreshTokenVerlooptIn }
  );
  
  return { toegangsToken, verversingsToken };
};

/**
 * Genereert een toegangstoken voor een gebruiker
 * @param {Object} gebruiker - Gebruikersobject
 * @returns {string} JWT toegangstoken
 */
const _genereeerToegangToken = (gebruiker) => {
  return jwt.sign(
    { 
      id: gebruiker.id,
      email: gebruiker.email,
      rol: gebruiker.rol
    },
    appConfig.auth.jwtSecret,
    { expiresIn: appConfig.auth.jwtVerlooptIn }
  );
};

module.exports = {
  registreerGebruiker,
  inloggen,
  verversToken,
  wachtwoordVergetenStart,
  wachtwoordReset
};