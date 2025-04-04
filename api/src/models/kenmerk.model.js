 
/**
 * Bunda API - Kenmerk Model
 * 
 * Dit model definieert de structuur van kenmerken van woningen.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Kenmerk = db.define('kenmerk', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  naam: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  categorie: {
    type: DataTypes.ENUM('binnen', 'buiten', 'beveiliging', 'comfort', 'energie', 'water', 'overig'),
    allowNull: false,
    defaultValue: 'overig'
  },
  icoon: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: 'bijgewerktOp'
});

module.exports = Kenmerk;