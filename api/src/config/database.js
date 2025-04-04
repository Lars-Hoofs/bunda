 
/**
 * Bunda API - Database configuratie
 * 
 * Dit bestand configureert de database verbinding met Sequelize.
 */

const { Sequelize } = require('sequelize');
const appConfig = require('./app.config');
const path = require('path');

// Maak een Sequelize instantie met SQLite
const sequelize = new Sequelize({
  dialect: appConfig.database.type,
  storage: path.join(__dirname, '../../', appConfig.database.bestandsNaam),
  logging: appConfig.database.logSQL ? console.log : false
});

module.exports = sequelize;