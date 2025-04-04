 
/**
 * Bunda API - Model Associaties
 * 
 * Dit bestand importeert alle modellen en definieert hun onderlinge relaties.
 */

// Importeer alle modellen
const Gebruiker = require('./gebruiker.model');
const Woning = require('./woning.model');
const WoningAfbeelding = require('./woningAfbeelding.model');
const Kenmerk = require('./kenmerk.model');
const WoningKenmerk = require('./woningKenmerk.model');
const Favoriet = require('./favoriet.model');
const Bezichtiging = require('./bezichtiging.model');

// Definieer relaties tussen modellen

// Gebruiker - Woning (Verkoper heeft vele woningen)
Gebruiker.hasMany(Woning, { 
  as: 'woningen',
  foreignKey: 'verkoperId'
});
Woning.belongsTo(Gebruiker, { 
  as: 'verkoper',
  foreignKey: 'verkoperId'
});

// Woning - WoningAfbeelding (Woning heeft vele afbeeldingen)
Woning.hasMany(WoningAfbeelding, {
  as: 'afbeeldingen',
  foreignKey: 'woningId',
  onDelete: 'CASCADE'
});
WoningAfbeelding.belongsTo(Woning, {
  as: 'woning',
  foreignKey: 'woningId'
});

// Woning - Kenmerk (Many-to-Many via WoningKenmerk)
Woning.belongsToMany(Kenmerk, {
  through: WoningKenmerk,
  as: 'kenmerken',
  foreignKey: 'woningId'
});
Kenmerk.belongsToMany(Woning, {
  through: WoningKenmerk,
  as: 'woningen',
  foreignKey: 'kenmerkId'
});

// Gebruiker - Woning (Many-to-Many via Favoriet)
Gebruiker.belongsToMany(Woning, {
  through: Favoriet,
  as: 'favorieten',
  foreignKey: 'gebruikerId'
});
Woning.belongsToMany(Gebruiker, {
  through: Favoriet,
  as: 'favorietVanGebruikers',
  foreignKey: 'woningId'
});

// Bezichtiging - Woning
Woning.hasMany(Bezichtiging, {
  as: 'bezichtigingen',
  foreignKey: 'woningId'
});
Bezichtiging.belongsTo(Woning, {
  as: 'woning',
  foreignKey: 'woningId'
});

// Bezichtiging - Gebruiker
Gebruiker.hasMany(Bezichtiging, {
  as: 'bezichtigingen',
  foreignKey: 'gebruikerId'
});
Bezichtiging.belongsTo(Gebruiker, {
  as: 'gebruiker',
  foreignKey: 'gebruikerId'
});

// Exporteer modellen met relaties
module.exports = {
  Gebruiker,
  Woning,
  WoningAfbeelding,
  Kenmerk,
  WoningKenmerk,
  Favoriet,
  Bezichtiging
};