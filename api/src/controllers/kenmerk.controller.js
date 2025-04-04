 
/**
 * Bunda API - Kenmerk Controller
 * 
 * Deze controller bevat de endpoint handlers voor kenmerk-gerelateerde routes.
 */

const kenmerkService = require('../services/kenmerk.service');

/**
 * Haalt alle kenmerken op
 * @route GET /api/kenmerken
 */
const getKenmerken = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { categorie } = req.query;
    
    // Bouw filters object
    const filters = { categorie };
    
    const kenmerken = await kenmerkService.getKenmerken(filters);
    
    res.json({
      succes: true,
      data: kenmerken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Maakt een nieuw kenmerk aan (alleen admin)
 * @route POST /api/kenmerken
 */
const maakKenmerk = async (req, res, next) => {
  try {
    const kenmerkData = req.body;
    
    const nieuwKenmerk = await kenmerkService.maakKenmerk(kenmerkData);
    
    res.status(201).json({
      succes: true,
      bericht: 'Kenmerk succesvol aangemaakt',
      data: nieuwKenmerk
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Werkt een kenmerk bij (alleen admin)
 * @route PUT /api/kenmerken/:id
 */
const updateKenmerk = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const bijgewerktKenmerk = await kenmerkService.updateKenmerk(id, updates);
    
    res.json({
      succes: true,
      bericht: 'Kenmerk succesvol bijgewerkt',
      data: bijgewerktKenmerk
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een kenmerk (alleen admin)
 * @route DELETE /api/kenmerken/:id
 */
const verwijderKenmerk = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await kenmerkService.verwijderKenmerk(id);
    
    res.json({
      succes: true,
      bericht: 'Kenmerk succesvol verwijderd'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt alle kenmerk categorieën op
 * @route GET /api/kenmerken/categorieen
 */
const getKenmerkCategorieen = async (req, res, next) => {
  try {
    const categorieen = await kenmerkService.getKenmerkCategorieen();
    
    res.json({
      succes: true,
      data: categorieen
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt kenmerken op van een woning
 * @route GET /api/kenmerken/woning/:woningId
 */
const getWoningKenmerken = async (req, res, next) => {
  try {
    const { woningId } = req.params;
    
    const kenmerken = await kenmerkService.getWoningKenmerken(woningId);
    
    res.json({
      succes: true,
      data: kenmerken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Voegt kenmerken toe aan een woning
 * @route POST /api/kenmerken/woning/:woningId
 */
const voegWoningKenmerkenToe = async (req, res, next) => {
  try {
    const { woningId } = req.params;
    const { kenmerken } = req.body;
    
    if (!kenmerken || !Array.isArray(kenmerken)) {
      return res.status(400).json({
        succes: false,
        bericht: 'Kenmerken moeten worden opgegeven als een array'
      });
    }
    
    const toegevoegdeKenmerken = await kenmerkService.voegWoningKenmerkenToe(
      woningId,
      kenmerken,
      req.gebruiker.id
    );
    
    res.status(201).json({
      succes: true,
      bericht: 'Kenmerken succesvol toegevoegd aan woning',
      data: toegevoegdeKenmerken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een kenmerk van een woning
 * @route DELETE /api/kenmerken/woning/:woningId/:kenmerkId
 */
const verwijderWoningKenmerk = async (req, res, next) => {
  try {
    const { woningId, kenmerkId } = req.params;
    
    await kenmerkService.verwijderWoningKenmerk(
      woningId,
      kenmerkId,
      req.gebruiker.id
    );
    
    res.json({
      succes: true,
      bericht: 'Kenmerk succesvol verwijderd van woning'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKenmerken,
  maakKenmerk,
  updateKenmerk,
  verwijderKenmerk,
  getKenmerkCategorieen,
  getWoningKenmerken,
  voegWoningKenmerkenToe,
  verwijderWoningKenmerk
};