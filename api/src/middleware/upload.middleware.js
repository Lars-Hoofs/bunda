 
/**
 * Bunda API - Upload Middleware
 * 
 * Deze middleware configureert bestandsupload met multer.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const appConfig = require('../config/app.config');

// Zorg ervoor dat de upload directory bestaat
const afbeeldingenDir = path.join(__dirname, '../../', appConfig.uploads.afbeeldingenMap);
if (!fs.existsSync(afbeeldingenDir)) {
  fs.mkdirSync(afbeeldingenDir, { recursive: true });
}

// Configureer opslag voor afbeeldingen
const afbeeldingenOpslag = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, afbeeldingenDir);
  },
  filename: function(req, file, cb) {
    // Genereer unieke bestandsnaam met uuid en originele extensie
    const extname = path.extname(file.originalname);
    const filename = `${uuidv4()}${extname}`;
    cb(null, filename);
  }
});

// Filter voor afbeeldingsbestanden
const afbeeldingFilter = (req, file, cb) => {
  // Accepteer alleen afbeeldingsbestanden
  if (appConfig.uploads.toegestaneTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Alleen JPG en PNG bestanden zijn toegestaan'), false);
  }
};

// Configureer multer voor afbeeldingen
const afbeeldingen = multer({
  storage: afbeeldingenOpslag,
  fileFilter: afbeeldingFilter,
  limits: {
    fileSize: appConfig.uploads.maxGrootte // bijv. 5MB
  }
});

// Middleware voor het afhandelen van multer fouten
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        succes: false,
        bericht: `Bestand te groot. Maximum grootte is ${appConfig.uploads.maxGrootte / (1024 * 1024)} MB.`
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      succes: false,
      bericht: err.message
    });
  }
  
  next();
};

module.exports = {
  afbeeldingen,
  handleMulterErrors
};