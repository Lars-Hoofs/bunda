 
/**
 * Bunda API - WoningAfbeelding Model
 * 
 * Dit model definieert de structuur van afbeeldingen bij woningen.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const WoningAfbeelding = db.define('woningAfbeelding', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  woningId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'wonings',
      key: 'id'
    }
  },
  afbeeldingUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isPrimair: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  bestandsnaam: {
    type: DataTypes.STRING,
    allowNull: false
  },
  volgorde: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: false // Geen updatedAt voor dit model
});

module.exports = WoningAfbeelding;