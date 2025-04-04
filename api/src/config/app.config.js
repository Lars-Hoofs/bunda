 
/**
 * Bunda API Configuratie
 * 
 * Dit bestand bevat de belangrijkste configuratie-instellingen voor de Bunda API
 */

module.exports = {
    // Algemene app-instellingen
    app: {
      naam: 'Bunda API',
      beschrijving: 'Belgisch vastgoedplatform API',
      versie: '1.0.0',
      taal: 'nl', // De API gebruikt Nederlands als standaardtaal
      port: process.env.PORT || 3000,
      omgeving: process.env.NODE_ENV || 'development'
    },
  
    // Database configuratie
    database: {
      type: 'sqlite',
      bestandsNaam: 'bunda.sqlite',
      logSQL: false
    },
  
    // Authenticatie instellingen
    auth: {
      jwtSecret: process.env.JWT_SECRET || 'bunda-geheim-jwt-token-dev',
      jwtVerlooptIn: '1d',
      refreshTokenVerlooptIn: '7d',
      saltRounds: 10
    },
  
    // Bestandsupload instellingen
    uploads: {
      afbeeldingenMap: 'uploads/afbeeldingen',
      maxGrootte: 5 * 1024 * 1024, // 5MB
      toegestaneTypes: ['image/jpeg', 'image/png']
    },
  
    // Gebruikersniveaus
    gebruikerNiveaus: {
      GEBRUIKER: 1,
      VERKOPER: 2,
      ADMIN: 3
    },
  
    // API respons berichten (in het Nederlands)
    berichten: {
      // Auth berichten
      AUTH: {
        REGISTRATIE_SUCCES: 'Gebruiker succesvol geregistreerd',
        LOGIN_SUCCES: 'Succesvol ingelogd',
        ONGELDIG_WACHTWOORD: 'Ongeldig wachtwoord',
        GEBRUIKER_NIET_GEVONDEN: 'Gebruiker niet gevonden',
        NIET_GEAUTORISEERD: 'Niet geautoriseerd om deze actie uit te voeren'
      },
      
      // Woning berichten
      WONING: {
        CREATIE_SUCCES: 'Woning succesvol aangemaakt',
        UPDATE_SUCCES: 'Woning succesvol bijgewerkt',
        VERWIJDER_SUCCES: 'Woning succesvol verwijderd',
        NIET_GEVONDEN: 'Woning niet gevonden'
      },
      
      // Algemene berichten
      ALGEMEEN: {
        NIET_GEVONDEN: 'Niet gevonden',
        SERVER_FOUT: 'Interne serverfout',
        ONGELDIGE_INVOER: 'Ongeldige invoergegevens'
      }
    },
  
    // Zoekfunctie instellingen
    zoeken: {
      maxStraal: 50, // Maximum zoekstraal in kilometers
      standaardStraal: 10 // Standaard zoekstraal in kilometers
    }
  };