 
/**
 * Bunda API - Beheerder Controller
 * 
 * Deze controller bevat de endpoint handlers voor beheerder (admin) functionaliteit.
 */

const beheerderService = require('../services/beheerder.service');
const gebruikerService = require('../services/gebruiker.service');
const woningService = require('../services/woning.service');

/**
 * Haalt dashboard statistieken op
 * @route GET /api/beheerder/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await beheerderService.getDashboardStats();
    
    res.json({
      succes: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt alle gebruikers op met geavanceerde filtering
 * @route GET /api/beheerder/gebruikers
 */
const getGebruikers = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      rol, zoekterm, status, datumVan, datumTot,
      pagina, aantalPerPagina, sorteerOp, sorteerRichting 
    } = req.query;
    
    // Bouw filters object
    const filters = {
      rol: rol ? parseInt(rol) : undefined,
      zoekterm,
      status,
      datumVan,
      datumTot
    };
    
    // Bouw paginatie en sortering object
    const opties = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10,
      sorteerOp: sorteerOp || 'aangemaaktOp',
      sorteerRichting: sorteerRichting || 'DESC'
    };
    
    const result = await beheerderService.getGebruikers(filters, opties);
    
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
 * Werkt de rol van een gebruiker bij
 * @route PUT /api/beheerder/gebruikers/:id/rol
 */
const updateGebruikerRol = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    
    if (!rol || ![1, 2, 3].includes(parseInt(rol))) {
      return res.status(400).json({
        succes: false,
        bericht: 'Ongeldige rol. Rol moet 1, 2 of 3 zijn.'
      });
    }
    
    // Voorkom dat een admin zijn eigen rol verlaagt
    if (req.gebruiker.id == id && req.gebruiker.rol === 3 && parseInt(rol) < 3) {
      return res.status(400).json({
        succes: false,
        bericht: 'U kunt uw eigen beheerderrol niet verlagen.'
      });
    }
    
    const bijgewerktGebruiker = await beheerderService.updateGebruikerRol(id, parseInt(rol));
    
    res.json({
      succes: true,
      bericht: 'Gebruikersrol succesvol bijgewerkt',
      data: bijgewerktGebruiker
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt alle woningen op met geavanceerde filtering
 * @route GET /api/beheerder/woningen
 */
const getWoningen = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      status, verkoperId, prijsVan, prijsTot, goedgekeurd,
      datumVan, datumTot, zoekterm,
      pagina, aantalPerPagina, sorteerOp, sorteerRichting 
    } = req.query;
    
    // Bouw filters object
    const filters = {
      status,
      verkoperId,
      prijsVan: prijsVan ? parseFloat(prijsVan) : undefined,
      prijsTot: prijsTot ? parseFloat(prijsTot) : undefined,
      goedgekeurd: goedgekeurd === 'true' ? true : (goedgekeurd === 'false' ? false : undefined),
      datumVan,
      datumTot,
      zoekterm
    };
    
    // Bouw paginatie en sortering object
    const opties = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10,
      sorteerOp: sorteerOp || 'aangemaaktOp',
      sorteerRichting: sorteerRichting || 'DESC'
    };
    
    const result = await beheerderService.getWoningen(filters, opties);
    
    res.json({
      succes: true,
      data: result.woningen,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Markeert of verwijdert een woning als uitgelicht
 * @route PUT /api/beheerder/woningen/:id/uitgelicht
 */
const toggleWoningUitgelicht = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isUitgelicht } = req.body;
    
    if (isUitgelicht === undefined) {
      return res.status(400).json({
        succes: false,
        bericht: 'Parameter isUitgelicht is vereist'
      });
    }
    
    const woning = await beheerderService.toggleWoningUitgelicht(id, isUitgelicht === true);
    
    res.json({
      succes: true,
      bericht: isUitgelicht ? 'Woning is nu uitgelicht' : 'Woning is niet meer uitgelicht',
      data: woning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Werkt de status van een woning bij
 * @route PUT /api/beheerder/woningen/:id/status
 */
const updateWoningStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status || !['beschikbaar', 'verkocht', 'in behandeling'].includes(status)) {
      return res.status(400).json({
        succes: false,
        bericht: 'Ongeldige status. Status moet beschikbaar, verkocht of in behandeling zijn.'
      });
    }
    
    const woning = await beheerderService.updateWoningStatus(id, status);
    
    res.json({
      succes: true,
      bericht: `Woning status bijgewerkt naar ${status}`,
      data: woning
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Haalt alle bezichtigingen op met geavanceerde filtering
 * @route GET /api/beheerder/bezichtigingen
 */
const getBezichtigingen = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      status, woningId, gebruikerId, datumVan, datumTot,
      pagina, aantalPerPagina, sorteerOp, sorteerRichting 
    } = req.query;
    
    // Bouw filters object
    const filters = {
      status,
      woningId,
      gebruikerId,
      datumVan,
      datumTot
    };
    
    // Bouw paginatie en sortering object
    const opties = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 10,
      sorteerOp: sorteerOp || 'aangemaaktOp',
      sorteerRichting: sorteerRichting || 'DESC'
    };
    
    const result = await beheerderService.getBezichtigingen(filters, opties);
    
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
 * Haalt activiteitenlogboek op
 * @route GET /api/beheerder/activiteiten
 */
const getActiviteitenLog = async (req, res, next) => {
  try {
    // Haal query parameters op
    const { 
      type, gebruikerId, datumVan, datumTot,
      pagina, aantalPerPagina
    } = req.query;
    
    // Bouw filters object
    const filters = {
      type,
      gebruikerId,
      datumVan,
      datumTot
    };
    
    // Bouw paginatie object
    const paginatie = {
      pagina: pagina ? parseInt(pagina) : 1,
      aantalPerPagina: aantalPerPagina ? parseInt(aantalPerPagina) : 20
    };
    
    const result = await beheerderService.getActiviteitenLog(filters, paginatie);
    
    res.json({
      succes: true,
      data: result.activiteiten,
      metadata: result.metadata
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getGebruikers,
  updateGebruikerRol,
  getWoningen,
  toggleWoningUitgelicht,
  updateWoningStatus,
  getBezichtigingen,
  getActiviteitenLog
};