 
/**
 * Bunda API - Authenticatie Middleware
 * 
 * Deze middleware valideert JWT tokens en authorisatie niveaus voor gebruikers.
 */

const jwt = require('jsonwebtoken');
const appConfig = require('../config/app.config');
const { Gebruiker, Woning } = require('../models');

/**
 * Middleware om JWT token te verifiëren
 */
const authenticeer = async (req, res, next) => {
  try {
    // Controleer of er een token is
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        succes: false, 
        bericht: 'Toegang geweigerd. Token niet aanwezig.' 
      });
    }

    // Haal token uit header
    const token = authHeader.split(' ')[1];
    
    // Verifieer token
    const decodedToken = jwt.verify(token, appConfig.auth.jwtSecret);
    
    // Vind de gebruiker in de database
    const gebruiker = await Gebruiker.findByPk(decodedToken.id);
    
    // Controleer of de gebruiker bestaat
    if (!gebruiker) {
      return res.status(401).json({ 
        succes: false, 
        bericht: 'Gebruiker bestaat niet meer.' 
      });
    }
    
    // Voeg gebruiker toe aan request object
    req.gebruiker = gebruiker;
    
    // Ga verder met de route
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        succes: false, 
        bericht: 'Token is verlopen. Log opnieuw in.' 
      });
    }
    
    return res.status(401).json({ 
      succes: false, 
      bericht: 'Ongeldige token.' 
    });
  }
};

/**
 * Middleware om te controleren of gebruiker niveau 1 of hoger heeft (alle ingelogde gebruikers)
 */
const isGebruiker = (req, res, next) => {
  if (!req.gebruiker) {
    return res.status(401).json({ 
      succes: false, 
      bericht: 'Niet geauthenticeerd.' 
    });
  }

  // Alle authenticated gebruikers zijn toegestaan
  next();
};

/**
 * Middleware om te controleren of gebruiker niveau 2 of hoger heeft (verkoper of admin)
 */
const isVerkoper = (req, res, next) => {
  if (!req.gebruiker) {
    return res.status(401).json({ 
      succes: false, 
      bericht: 'Niet geauthenticeerd.' 
    });
  }

  if (req.gebruiker.rol < appConfig.gebruikerNiveaus.VERKOPER) {
    return res.status(403).json({ 
      succes: false, 
      bericht: 'Toegang geweigerd. Verkoper rechten vereist.' 
    });
  }

  next();
};

/**
 * Middleware om te controleren of gebruiker niveau 3 heeft (admin)
 */
const isBeheerder = (req, res, next) => {
  if (!req.gebruiker) {
    return res.status(401).json({ 
      succes: false, 
      bericht: 'Niet geauthenticeerd.' 
    });
  }

  if (req.gebruiker.rol < appConfig.gebruikerNiveaus.ADMIN) {
    return res.status(403).json({ 
      succes: false, 
      bericht: 'Toegang geweigerd. Beheerder rechten vereist.' 
    });
  }

  next();
};

/**
 * Middleware om te controleren of de gebruiker de eigenaar is van de woning
 */
const isWoningEigenaar = async (req, res, next) => {
  try {
    if (!req.gebruiker) {
      return res.status(401).json({ 
        succes: false, 
        bericht: 'Niet geauthenticeerd.' 
      });
    }

    // Admin heeft altijd toegang
    if (req.gebruiker.rol === appConfig.gebruikerNiveaus.ADMIN) {
      return next();
    }

    const woningId = req.params.id || req.body.woningId;
    if (!woningId) {
      return res.status(400).json({ 
        succes: false, 
        bericht: 'Woning ID niet opgegeven.' 
      });
    }

    const woning = await Woning.findByPk(woningId);
    if (!woning) {
      return res.status(404).json({ 
        succes: false, 
        bericht: 'Woning niet gevonden.' 
      });
    }

    if (woning.verkoperId !== req.gebruiker.id) {
      return res.status(403).json({ 
        succes: false, 
        bericht: 'Toegang geweigerd. U bent niet de eigenaar van deze woning.' 
      });
    }

    req.woning = woning;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticeer,
  isGebruiker,
  isVerkoper,
  isBeheerder,
  isWoningEigenaar
};