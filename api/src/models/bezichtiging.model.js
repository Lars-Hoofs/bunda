 
/**
 * Bunda API - Bezichtiging Model
 * 
 * Dit model definieert de structuur van bezichtigingsaanvragen.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Bezichtiging = db.define('bezichtiging', {
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
  gebruikerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gebruikers',
      key: 'id'
    }
  },
  bezichtigingDatum: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      // Valideer dat de datum in de toekomst ligt
      isInToekomst(waarde) {
        if (new Date(waarde) < new Date()) {
          throw new Error('Bezichtigingsdatum moet in de toekomst liggen');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('aangevraagd', 'goedgekeurd', 'afgewezen', 'voltooid'),
    allowNull: false,
    defaultValue: 'aangevraagd'
  },
  notities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verkoperNotities: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bevestigingsToken: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: 'bijgewerktOp'
});

module.exports = Bezichtiging;