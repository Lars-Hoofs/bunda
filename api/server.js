/**
 * Bunda API - Server Entry Point
 * 
 * Dit is het hoofdbestand dat de server opstart en initialiseert.
 * Het laadt de Express app en start deze op de geconfigureerde poort.
 */

// Laad .env bestand voor omgevingsvariabelen
require('dotenv').config();

// Importeer de benodigde modules
const appConfig = require('./src/config/app.config');
const app = require('./src/app');
const db = require('./src/config/database');

// Start de applicatie op
async function startServer() {
  try {
    // Test de database verbinding
    await db.authenticate();
    console.log('Database verbinding succesvol!');
    
    // Synchroniseer de modellen met de database
    const syncOptions = { 
      alter: process.env.NODE_ENV === 'development'
    };
    
    await db.sync(syncOptions);
    console.log('Database tabellen gesynchroniseerd');
    
    // Start de server
    const PORT = appConfig.app.port || 3000;
    app.listen(PORT, () => {
      console.log(`Bunda API server draait op poort ${PORT} in ${appConfig.app.omgeving} modus`);
    });
  } catch (error) {
    console.error('Fout bij het opstarten van de server:', error);
    process.exit(1);
  }
}

// Start de server
startServer();

// Afhandeling voor onverwachte fouten
process.on('uncaughtException', (error) => {
  console.error('Onbehandelde uitzondering:', error);
  // Geef de applicatie tijd om logs af te handelen voordat deze wordt afgesloten
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Onbehandelde belofte afwijzing:', reason);
  // Log stacktrace voor betere debugging
  console.error('Stack:', reason?.stack || 'Geen stacktrace beschikbaar');
});

// Afhandelen van SIGTERM signaal voor graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM ontvangen. Server wordt afgesloten...');
  // Hier kunnen we opruimingscode toevoegen indien nodig
  process.exit(0);
});