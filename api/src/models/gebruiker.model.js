/**
 * Bunda API - Gebruiker Model
 * 
 * Dit model definieert de structuur van gebruikers in de database.
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const appConfig = require('../config/app.config');
const db = require('../config/database');

const Gebruiker = db.define('gebruiker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  wachtwoord: {
    type: DataTypes.STRING,
    allowNull: false
  },
  voornaam: {
    type: DataTypes.STRING,
    allowNull: false
  },
  achternaam: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefoon: {
    type: DataTypes.STRING,
    allowNull: true
  },
  rol: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: appConfig.gebruikerNiveaus.GEBRUIKER, // 1 = Gebruiker
    validate: {
      isIn: [[
        appConfig.gebruikerNiveaus.GEBRUIKER,    // 1 = Gebruiker
        appConfig.gebruikerNiveaus.VERKOPER,     // 2 = Verkoper
        appConfig.gebruikerNiveaus.ADMIN         // 3 = Admin
      ]]
    }
  },
  resetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetTokenVerlooptOp: {
    type: DataTypes.DATE,
    allowNull: true
  },
  laatsteLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  // Gebruik Nederlandse namen voor createdAt en updatedAt
  createdAt: 'aangemaaktOp',
  updatedAt: 'bijgewerktOp',
  
  // Voeg instance-methoden toe
  hooks: {
    beforeCreate: async (gebruiker) => {
      if (gebruiker.wachtwoord) {
        const salt = await bcrypt.genSalt(appConfig.auth.saltRounds);
        gebruiker.wachtwoord = await bcrypt.hash(gebruiker.wachtwoord, salt);
      }
    },
    beforeUpdate: async (gebruiker) => {
      if (gebruiker.changed('wachtwoord')) {
        const salt = await bcrypt.genSalt(appConfig.auth.saltRounds);
        gebruiker.wachtwoord = await bcrypt.hash(gebruiker.wachtwoord, salt);
      }
    }
  }
});

// Instance methode om wachtwoord te valideren
Gebruiker.prototype.controleerWachtwoord = async function(wachtwoord) {
  return await bcrypt.compare(wachtwoord, this.wachtwoord);
};

// Statische methoden
Gebruiker.vindMetEmail = function(email) {
  return this.findOne({ where: { email } });
};

// Overschrijf toJSON om wachtwoord te verwijderen uit responses
Gebruiker.prototype.toJSON = function() {
  const waarden = Object.assign({}, this.get());
  delete waarden.wachtwoord;
  delete waarden.resetToken;
  delete waarden.resetTokenVerlooptOp;
  return waarden;
};

module.exports = Gebruiker;