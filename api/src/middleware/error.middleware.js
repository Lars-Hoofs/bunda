 
/**
 * Bunda API - Error Handler Middleware
 * 
 * Deze middleware vangt fouten af en formatteert ze naar een consistente JSON respons.
 */

const { ValidationError, DatabaseError } = require('sequelize');
const appConfig = require('../config/app.config');

/**
 * Algemene error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Standaardwaarden
  let statusCode = 500;
  let bericht = appConfig.berichten.ALGEMEEN.SERVER_FOUT;
  let details = null;
  
  // Sequelize validatiefouten
  if (err instanceof ValidationError) {
    statusCode = 400;
    bericht = appConfig.berichten.ALGEMEEN.ONGELDIGE_INVOER;
    details = err.errors.map(e => ({
      veld: e.path,
      bericht: e.message
    }));
  }
  
  // Sequelize databasefouten
  else if (err instanceof DatabaseError) {
    statusCode = 500;
    bericht = 'Database fout opgetreden';
    // In productie willen we geen database details lekken
    details = process.env.NODE_ENV === 'development' ? err.message : null;
  }
  
  // Express-validator fouten
  else if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    bericht = appConfig.berichten.ALGEMEEN.ONGELDIGE_INVOER;
    details = err.array();
  }
  
  // Specifieke door ontwikkelaars gedefinieerde fouten
  else if (err.statusCode && err.bericht) {
    statusCode = err.statusCode;
    bericht = err.bericht;
    details = err.details || null;
  }
  
  // Standaard JSON foutrespons
  return res.status(statusCode).json({
    succes: false,
    bericht: bericht,
    details: details,
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;