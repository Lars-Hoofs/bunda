/**
 * Bunda API - Express App Setup
 * 
 * Dit bestand configureert de Express applicatie, middlewares en routes.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const appConfig = require('./config/app.config');

// Importeer routes
const authRoutes = require('./routes/auth.routes');
const gebruikerRoutes = require('./routes/gebruiker.routes');
const woningRoutes = require('./routes/woning.routes');
const afbeeldingRoutes = require('./routes/afbeelding.routes');
const favorietRoutes = require('./routes/favoriet.routes');
const kenmerkRoutes = require('./routes/kenmerk.routes');
const bezichtigingRoutes = require('./routes/bezichtiging.routes');
const beheerderRoutes = require('./routes/beheerder.routes');

// Error handler middleware
const errorHandler = require('./middleware/error.middleware');

// Maak Express app instantie
const app = express();

// Middleware configuratie
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Statische bestanden (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../', appConfig.uploads.afbeeldingenMap)));

// API informatie route
app.get('/', (req, res) => {
  res.json({
    naam: appConfig.app.naam,
    beschrijving: appConfig.app.beschrijving,
    versie: appConfig.app.versie,
    status: 'actief'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/gebruikers', gebruikerRoutes);
app.use('/api/woningen', woningRoutes);
app.use('/api/afbeeldingen', afbeeldingRoutes);
app.use('/api/favorieten', favorietRoutes);
app.use('/api/kenmerken', kenmerkRoutes);
app.use('/api/bezichtigingen', bezichtigingRoutes);
app.use('/api/beheerder', beheerderRoutes);

// 404 afhandeling
app.use((req, res, next) => {
  res.status(404).json({
    succes: false,
    bericht: 'Eindpunt niet gevonden',
    eindpunt: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;