 
/**
 * Bunda API - Favoriet Model
 * 
 * Dit model definieert de relatie tussen gebruikers en favoriete woningen (many-to-many).
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Favoriet = db.define('favoriet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  gebruikerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gebruikers',
      key: 'id'
    }
  },
  woningId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'wonings',
      key: 'id'
    }
  },
  notitie: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: false, // Geen updatedAt voor dit model
  
  // Zorg ervoor dat een woning maar één keer in de favorieten van een gebruiker kan staan
  indexes: [
    {
      unique: true,
      fields: ['gebruikerId', 'woningId']
    }
  ]
});

module.exports = Favoriet;