/**
 * Bunda API - Server Entry Point
 * 
 * Dit is het hoofdbestand dat de server opstart en initialiseert.
 * Het laadt de Express app en start deze op de geconfigureerde poort.
 */

// Laad .env bestand voor omgevingsvariabelen
require('dotenv').config();

// Importeer de app configuratie
const appConfig = require('./src/config/app.config');

// Importeer de Express app
const app = require('./src/app');

// Importeer de database verbinding
const db = require('./src/config/database');

// Test de database verbinding
db.authenticate()
  .then(() => {
    console.log('Database verbinding succesvol!');
    
    // Synchroniseer de modellen met de database
    return db.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    console.log('Database tabellen gesynchroniseerd');
    
    // Start de server
    const PORT = appConfig.app.port;
    app.listen(PORT, () => {
      console.log(`Bunda API server draait op poort ${PORT} in ${appConfig.app.omgeving} modus`);
    });
  })
  .catch(error => {
    console.error('Kan geen verbinding maken met de database:', error);
  });

// Afhandeling voor onverwachte fouten
process.on('uncaughtException', (error) => {
  console.error('Onbehandelde uitzondering:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Onbehandelde belofte afwijzing:', reason);
});