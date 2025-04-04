 
/**
 * Bunda API - Gebruiker Controller
 * 
 * Deze controller bevat de endpoint handlers voor gebruiker-gerelateerde routes.
 */

const gebruikerService = require('../services/gebruiker.service');

/**
 * Haalt alle gebruikers op (alleen voor admin)
 * @route GET /api/gebruikers
 */
const getGebruikers = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { rol, zoekterm, pagina, aantalPerPagina } = req.query;
    
    // Bouw filters object
    const filters = {
      rol: rol ? parseInt(rol) : undefined,
      zoekterm
    };
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    const result = await gebruikerService.getGebruikers(filters, paginatie);
    
    res.json({
      succes: true,
      data: result.gebruikers,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt een specifieke gebruiker op
 * @route GET /api/gebruikers/:id
 */
const getGebruikerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Controleer of het de eigen gebruiker of een admin is
    if (req.gebruiker.id != id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Toegang geweigerd. U mag alleen uw eigen profiel bekijken.'
      });
    }
    
    const gebruiker = await gebruikerService.getGebruikerById(id);
    
    res.json({
      succes: true,
      data: gebruiker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Werkt een gebruiker bij
 * @route PUT /api/gebruikers/:id
 */
const updateGebruiker = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Controleer of het de eigen gebruiker of een admin is
    if (req.gebruiker.id != id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Toegang geweigerd. U mag alleen uw eigen profiel bijwerken.'
      });
    }
    
    // Voorkom dat gebruikers hun eigen rol wijzigen (tenzij admin)
    if (req.gebruiker.id == id && req.gebruiker.rol !== 3 && updates.rol) {
      delete updates.rol;
    }
    
    const bijgewerktGebruiker = await gebruikerService.updateGebruiker(id, updates);
    
    res.json({
      succes: true,
      bericht: 'Gebruiker succesvol bijgewerkt',
      data: bijgewerktGebruiker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een gebruiker
 * @route DELETE /api/gebruikers/:id
 */
const verwijderGebruiker = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Controleer of het de eigen gebruiker of een admin is
    if (req.gebruiker.id != id && req.gebruiker.rol !== 3) {
      return res.status(403).json({
        succes: false,
        bericht: 'Toegang geweigerd. U mag alleen uw eigen account verwijderen.'
      });
    }
    
    await gebruikerService.verwijderGebruiker(id);
    
    res.json({
      succes: true,
      bericht: 'Gebruiker succesvol verwijderd'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt woningen op die bij een verkoper horen
 * @route GET /api/gebruikers/:id/woningen
 */
const getGebruikerWoningen = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { pagina, aantalPerPagina } = req.query;
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    const result = await gebruikerService.getGebruikerWoningen(id, paginatie);
    
    res.json({
      succes: true,
      data: result.woningen,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGebruikers,
  getGebruikerById,
  updateGebruiker,
  verwijderGebruiker,
  getGebruikerWoningen
};