 
/**
 * Bunda API - Favoriet Controller
 * 
 * Deze controller bevat de endpoint handlers voor favoriet-gerelateerde routes.
 */

const favorietService = require('../services/favoriet.service');

/**
 * Haalt favorieten op van de huidige gebruiker
 * @route GET /api/favorieten
 */
const getFavorieten = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { pagina, aantalPerPagina } = req.query;
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    const result = await favorietService.getFavorieten(req.gebruiker.id, paginatie);
    
    res.json({
      succes: true,
      data: result.favorieten,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Voegt een woning toe aan favorieten
 * @route POST /api/favorieten
 */
const voegFavorietToe = async (req, res, next) => {
  try {
    const { woningId, notitie } = req.body;
    
    const favoriet = await favorietService.voegFavorietToe(req.gebruiker.id, woningId, notitie);
    
    res.status(201).json({
      succes: true,
      bericht: 'Woning succesvol toegevoegd aan favorieten',
      data: favoriet
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een favoriet
 * @route DELETE /api/favorieten/:id
 */
const verwijderFavoriet = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await favorietService.verwijderFavoriet(id, req.gebruiker.id);
    
    res.json({
      succes: true,
      bericht: 'Favoriet succesvol verwijderd'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verwijdert een woning uit favorieten
 * @route DELETE /api/favorieten/woning/:woningId
 */
const verwijderWoningUitFavorieten = async (req, res, next) => {
  try {
    const { woningId } = req.params;
    
    await favorietService.verwijderWoningUitFavorieten(woningId, req.gebruiker.id);
    
    res.json({
      succes: true,
      bericht: 'Woning succesvol verwijderd uit favorieten'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorieten,
  voegFavorietToe,
  verwijderFavoriet,
  verwijderWoningUitFavorieten
};