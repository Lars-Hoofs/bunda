 
/**
 * Bunda API - Woning Model
 * 
 * Dit model definieert de structuur van woningen in de database.
 */

const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Woning = db.define('woning', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titel: {
    type: DataTypes.STRING,
    allowNull: false
  },
  beschrijving: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  prijs: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  oppervlakte: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  slaapkamers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  badkamers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  bouwjaar: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1800,
      max: new Date().getFullYear()
    }
  },
  energielabel: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isIn: [['A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G']]
    }
  },
  straat: {
    type: DataTypes.STRING,
    allowNull: false
  },
  huisnummer: {
    type: DataTypes.STRING,
    allowNull: false
  },
  stad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postcode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  breedtegraad: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  lengtegraad: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  verkoperId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gebruikers',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('beschikbaar', 'verkocht', 'in behandeling'),
    allowNull: false,
    defaultValue: 'beschikbaar'
  },
  isUitgelicht: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: 'bijgewerktOp'
});

// Hulpmethode om volledige adres te krijgen
Woning.prototype.getVolledigAdres = function() {
  return `${this.straat} ${this.huisnummer}, ${this.postcode} ${this.stad}`;
};

module.exports = Woning;