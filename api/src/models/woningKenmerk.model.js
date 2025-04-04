 
/**
 * Bunda API - WoningKenmerk Model
 * 
 * Dit model definieert de relatie tussen woningen en kenmerken (many-to-many).
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const WoningKenmerk = db.define('woningKenmerk', {
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
  kenmerkId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'kenmerks',
      key: 'id'
    }
  },
  waarde: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: false, // Geen updatedAt voor dit model
  
  // Zorg ervoor dat een kenmerk maar één keer aan een woning kan worden toegevoegd
  indexes: [
    {
      unique: true,
      fields: ['woningId', 'kenmerkId']
    }
  ]
});

module.exports = WoningKenmerk;