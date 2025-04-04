 
/**
 * Bunda API - Bezichtiging Controller
 * 
 * Deze controller bevat de endpoint handlers voor bezichtiging-gerelateerde routes.
 */

const bezichtigingService = require('../services/bezichtiging.service');
const woningService = require('../services/woning.service');
const appConfig = require('../config/app.config');

/**
 * Haalt bezichtigingen op, gefilterd op rol
 * @route GET /api/bezichtigingen
 */
const getBezichtigingen = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { status, woningId, pagina, aantalPerPagina } = req.query;
    
    // Bouw filters object
    const filters = { status, woningId };
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10
    };
    
    // Verschillende gedrag op basis van gebruikersrol
    let result;
    
    if (req.gebruiker.rol === appConfig.gebruikerNiveaus.ADMIN) {
      // Beheerders zien alle bezichtigingen
      result = await bezichtigingService.getAlleBezichtigingen(filters, paginatie);
    } else if (req.gebruiker.rol === appConfig.gebruikerNiveaus.VERKOPER) {
      // Verkopers zien bezichtigingen voor hun woningen
      result = await bezichtigingService.getVerkoperBezichtigingen(req.gebruiker.id, filters, paginatie);
    } else {
      // Normale gebruikers zien alleen eigen bezichtigingen
      result = await bezichtigingService.getGebruikerBezichtigingen(req.gebruiker.id, filters, paginatie);
    }
    
    res.json({
      succes: true,
      data: result.bezichtigingen,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Vraagt een bezichtiging aan
 * @route POST /api/bezichtigingen
 */
const vraagBezichtigingAan = async (req, res, next) => {
  try {
    const { woningId, bezichtigingDatum, notities } = req.body;
    const gebruikerId = req.gebruiker.id;
    
    // Haal woning op om te controleren of deze bestaat en beschikbaar is
    const woning = await woningService.getWoningById(woningId);
    
    if (woning.status !== 'beschikbaar') {
      return res.status(400).json({
        succes: false,
        bericht: 'Deze woning is niet beschikbaar voor bezichtiging'
      });
    }
    
    // Controleer of gebruiker niet de eigenaar is
    if (woning.verkoperId === gebruikerId) {
      return res.status(400).json({
        succes: false,
        bericht: 'U kunt geen bezichtiging aanvragen voor uw eigen woning'
      });
    }
    
    const bezichtiging = await bezichtigingService.vraagBezichtigingAan(
      gebruikerId,
      woningId,
      new Date(bezichtigingDatum),
      notities
    );
    
    res.status(201).json({
      succes: true,
      bericht: 'Bezichtiging succesvol aangevraagd',
      data: bezichtiging
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt een specifieke bezichtiging op
 * @route GET /api/bezichtigingen/:id
 */
const getBezichtigingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const bezichtiging = await bezichtigingService.getBezichtigingById(id);
    
    // Controleer of de gebruiker toegang heeft tot deze bezichtiging
    const isEigenaar = bezichtiging.woning.verkoperId === req.gebruiker.id;
    const isAanvrager = bezichtiging.gebruikerId === req.gebruiker.id;
    const isAdmin = req.gebruiker.rol === appConfig.gebruikerNiveaus.ADMIN;
    
    if (!isEigenaar && !isAanvrager && !isAdmin) {
      return res.status(403).json({
        succes: false,
        bericht: 'U heeft geen toegang tot deze bezichtiging'
      });
    }
    
    res.json({
      succes: true,
      data: bezichtiging
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Werkt de status van een bezichtiging bij
 * @route PUT /api/bezichtigingen/:id
 */
const updateBezichtigingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, verkoperNotities } = req.body;
    
    // Haal bezichtiging op
    const bezichtiging = await bezichtigingService.getBezichtigingById(id);
    
    // Controleer of de gebruiker de verkoper is of een admin
    const isEigenaar = bezichtiging.woning.verkoperId === req.gebruiker.id;
    const isAdmin = req.gebruiker.rol === appConfig.gebruikerNiveaus.ADMIN;
    
    if (!isEigenaar && !isAdmin) {
      return res.status(403).json({
        succes: false,
        bericht: 'Alleen de verkoper of beheerder kan de status van een bezichtiging wijzigen'
      });
    }
    
    // Controleer of de nieuwe status geldig is
    if (!['aangevraagd', 'goedgekeurd', 'afgewezen', 'voltooid'].includes(status)) {
      return res.status(400).json({
        succes: false,
        bericht: 'Ongeldige status'
      });
    }
    
    const bijgewerkteBezichtiging = await bezichtigingService.updateBezichtigingStatus(
      id,
      status,
      verkoperNotities
    );
    
    res.json({
      succes: true,
      bericht: `Bezichtiging status bijgewerkt naar ${status}`,
      data: bijgewerkteBezichtiging
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Annuleert een bezichtiging
 * @route DELETE /api/bezichtigingen/:id
 */
const annuleerBezichtiging = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Haal bezichtiging op
    const bezichtiging = await bezichtigingService.getBezichtigingById(id);
    
    // Controleer of de gebruiker toegang heeft tot deze bezichtiging
    const isEigenaar = bezichtiging.woning.verkoperId === req.gebruiker.id;
    const isAanvrager = bezichtiging.gebruikerId === req.gebruiker.id;
    const isAdmin = req.gebruiker.rol === appConfig.gebruikerNiveaus.ADMIN;
    
    if (!isEigenaar && !isAanvrager && !isAdmin) {
      return res.status(403).json({
        succes: false,
        bericht: 'U heeft geen toegang om deze bezichtiging te annuleren'
      });
    }
    
    // Alleen recentelijk aangevraagde of goedgekeurde bezichtigingen kunnen worden geannuleerd
    if (!['aangevraagd', 'goedgekeurd'].includes(bezichtiging.status)) {
      return res.status(400).json({
        succes: false,
        bericht: `Bezichtigingen met status ${bezichtiging.status} kunnen niet worden geannuleerd`
      });
    }
    
    await bezichtigingService.annuleerBezichtiging(id);
    
    res.json({
      succes: true,
      bericht: 'Bezichtiging succesvol geannuleerd'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bevestigt een bezichtiging met een token
 * @route POST /api/bezichtigingen/:id/bevestig
 */
const bevestigBezichtiging = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        succes: false,
        bericht: 'Token is vereist'
      });
    }
    
    const bezichtiging = await bezichtigingService.bevestigBezichtiging(id, token);
    
    res.json({
      succes: true,
      bericht: 'Bezichtiging succesvol bevestigd',
      data: bezichtiging
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBezichtigingen,
  vraagBezichtigingAan,
  getBezichtigingById,
  updateBezichtigingStatus,
  annuleerBezichtiging,
  bevestigBezichtiging
};