/**
 * Bunda API Client voor Next.js
 * 
 * Dit bestand bevat alle API functies voor communicatie met de Bunda backend.
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Configureer axios met standaardopties
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Voeg token toe aan requests indien beschikbaar
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ===================================
 * AUTHENTICATIE FUNCTIES
 * ===================================
 */

export const authAPI = {
  /**
   * Registreer een nieuwe gebruiker
   * @param {Object} userData - Gebruiker registratiegegevens
   */
  registreren: async (userData) => {
    const response = await api.post('/auth/registreren', userData);
    return response.data;
  },

  /**
   * Log een gebruiker in
   * @param {Object} credentials - Email en wachtwoord
   */
  inloggen: async (credentials) => {
    const response = await api.post('/auth/inloggen', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
  },

  /**
   * Vernieuw het toegangstoken
   */
  vernieuwToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('Geen verversingstoken beschikbaar');
    }
    const response = await api.post('/auth/vernieuw-token', { refreshToken });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  /**
   * Start wachtwoord reset procedure
   * @param {Object} data - Email voor reset
   */
  wachtwoordVergeten: async (data) => {
    const response = await api.post('/auth/wachtwoord-vergeten', data);
    return response.data;
  },

  /**
   * Reset wachtwoord met token
   * @param {Object} data - Reset token en nieuw wachtwoord
   */
  wachtwoordResetten: async (data) => {
    const response = await api.post('/auth/wachtwoord-resetten', data);
    return response.data;
  },

  /**
   * Haal het profiel van de ingelogde gebruiker op
   */
  getMijnAccount: async () => {
    const response = await api.get('/auth/mijn-account');
    return response.data;
  },

  /**
   * Log de gebruiker uit (lokaal)
   */
  uitloggen: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * ===================================
 * GEBRUIKER FUNCTIES
 * ===================================
 */

export const gebruikerAPI = {
  /**
   * Haal lijst van gebruikers op (admin)
   */
  getGebruikers: async () => {
    const response = await api.get('/gebruikers');
    return response.data;
  },

  /**
   * Haal gebruiker op met ID
   * @param {string} id - Gebruiker ID
   */
  getGebruikerById: async (id) => {
    const response = await api.get(`/gebruikers/${id}`);
    return response.data;
  },

  /**
   * Update gebruiker
   * @param {string} id - Gebruiker ID
   * @param {Object} data - Nieuwe gebruikergegevens
   */
  updateGebruiker: async (id, data) => {
    const response = await api.put(`/gebruikers/${id}`, data);
    return response.data;
  },

  /**
   * Verwijder gebruiker
   * @param {string} id - Gebruiker ID
   */
  verwijderGebruiker: async (id) => {
    const response = await api.delete(`/gebruikers/${id}`);
    return response.data;
  },

  /**
   * Haal woningen op van een verkoper
   * @param {string} id - Verkoper ID
   */
  getGebruikerWoningen: async (id) => {
    const response = await api.get(`/gebruikers/${id}/woningen`);
    return response.data;
  }
};

/**
 * ===================================
 * WONING FUNCTIES
 * ===================================
 */

export const woningAPI = {
  /**
   * Haal alle woningen op (met filters)
   * @param {Object} params - Zoek/filter parameters
   */
  getWoningen: async (params = {}) => {
    const response = await api.get('/woningen', { params });
    return response.data;
  },

  /**
   * Zoek woningen binnen een straal
   * @param {Object} params - Locatie en straal parameters
   */
  zoekWoningen: async (params) => {
    const response = await api.get('/woningen/zoeken', { params });
    return response.data;
  },

  /**
   * Haal uitgelichte woningen op
   */
  getUitgelichteWoningen: async () => {
    const response = await api.get('/woningen/uitgelicht');
    return response.data;
  },

  /**
   * Maak een nieuwe woning aan
   * @param {Object} data - Woninggegevens
   */
  maakWoning: async (data) => {
    const response = await api.post('/woningen', data);
    return response.data;
  },

  /**
   * Haal een woning op met ID
   * @param {string} id - Woning ID
   */
  getWoningById: async (id) => {
    const response = await api.get(`/woningen/${id}`);
    return response.data;
  },

  /**
   * Update een woning
   * @param {string} id - Woning ID
   * @param {Object} data - Nieuwe woninggegevens
   */
  updateWoning: async (id, data) => {
    const response = await api.put(`/woningen/${id}`, data);
    return response.data;
  },

  /**
   * Verwijder een woning
   * @param {string} id - Woning ID
   */
  verwijderWoning: async (id) => {
    const response = await api.delete(`/woningen/${id}`);
    return response.data;
  }
};

/**
 * ===================================
 * AFBEELDING FUNCTIES
 * ===================================
 */

export const afbeeldingAPI = {
  /**
   * Upload afbeeldingen voor een woning
   * @param {string} woningId - Woning ID
   * @param {FormData} formData - Form data met afbeeldingen
   */
  uploadAfbeeldingen: async (woningId, formData) => {
    // Voor file uploads moeten we multipart/form-data headers gebruiken
    const response = await api.post(`/afbeeldingen/woning/${woningId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Verwijder een afbeelding
   * @param {string} id - Afbeelding ID
   */
  verwijderAfbeelding: async (id) => {
    const response = await api.delete(`/afbeeldingen/${id}`);
    return response.data;
  },

  /**
   * Stel een afbeelding in als primair
   * @param {string} id - Afbeelding ID
   */
  setPrimaireAfbeelding: async (id) => {
    const response = await api.put(`/afbeeldingen/${id}/primair`);
    return response.data;
  },

  /**
   * Update de volgorde van afbeeldingen
   * @param {Array} volgorde - Array met afbeelding IDs in juiste volgorde
   */
  updateAfbeeldingVolgorde: async (volgorde) => {
    const response = await api.put('/afbeeldingen/volgorde', { volgorde });
    return response.data;
  }
};

/**
 * ===================================
 * KENMERK FUNCTIES
 * ===================================
 */

export const kenmerkAPI = {
  /**
   * Haal alle kenmerken op
   */
  getKenmerken: async () => {
    const response = await api.get('/kenmerken');
    return response.data;
  },

  /**
   * Maak een nieuw kenmerk aan (admin)
   * @param {Object} data - Kenmerkgegevens
   */
  maakKenmerk: async (data) => {
    const response = await api.post('/kenmerken', data);
    return response.data;
  },

  /**
   * Update een kenmerk (admin)
   * @param {string} id - Kenmerk ID
   * @param {Object} data - Nieuwe kenmerkgegevens
   */
  updateKenmerk: async (id, data) => {
    const response = await api.put(`/kenmerken/${id}`, data);
    return response.data;
  },

  /**
   * Verwijder een kenmerk (admin)
   * @param {string} id - Kenmerk ID
   */
  verwijderKenmerk: async (id) => {
    const response = await api.delete(`/kenmerken/${id}`);
    return response.data;
  },

  /**
   * Haal alle kenmerk categorieën op
   */
  getKenmerkCategorieen: async () => {
    const response = await api.get('/kenmerken/categorieen');
    return response.data;
  },

  /**
   * Haal kenmerken van een woning op
   * @param {string} woningId - Woning ID
   */
  getWoningKenmerken: async (woningId) => {
    const response = await api.get(`/kenmerken/woning/${woningId}`);
    return response.data;
  },

  /**
   * Voeg kenmerken toe aan een woning
   * @param {string} woningId - Woning ID
   * @param {Object} data - Kenmerken om toe te voegen
   */
  voegWoningKenmerkenToe: async (woningId, data) => {
    const response = await api.post(`/kenmerken/woning/${woningId}`, data);
    return response.data;
  },

  /**
   * Verwijder een kenmerk van een woning
   * @param {string} woningId - Woning ID
   * @param {string} kenmerkId - Kenmerk ID
   */
  verwijderWoningKenmerk: async (woningId, kenmerkId) => {
    const response = await api.delete(`/kenmerken/woning/${woningId}/${kenmerkId}`);
    return response.data;
  }
};

/**
 * ===================================
 * FAVORIET FUNCTIES
 * ===================================
 */

export const favorietAPI = {
  /**
   * Haal favorieten van huidige gebruiker
   */
  getFavorieten: async () => {
    const response = await api.get('/favorieten');
    return response.data;
  },

  /**
   * Voeg een woning toe aan favorieten
   * @param {Object} data - Woning ID
   */
  voegFavorietToe: async (data) => {
    const response = await api.post('/favorieten', data);
    return response.data;
  },

  /**
   * Verwijder een favoriet
   * @param {string} id - Favoriet ID
   */
  verwijderFavoriet: async (id) => {
    const response = await api.delete(`/favorieten/${id}`);
    return response.data;
  },

  /**
   * Verwijder een woning uit favorieten
   * @param {string} woningId - Woning ID
   */
  verwijderWoningUitFavorieten: async (woningId) => {
    const response = await api.delete(`/favorieten/woning/${woningId}`);
    return response.data;
  }
};

/**
 * ===================================
 * BEZICHTIGING FUNCTIES
 * ===================================
 */

export const bezichtigingAPI = {
  /**
   * Haal bezichtigingen op (gefilterd op rol)
   */
  getBezichtigingen: async () => {
    const response = await api.get('/bezichtigingen');
    return response.data;
  },

  /**
   * Vraag een bezichtiging aan
   * @param {Object} data - Bezichtiginggegevens
   */
  vraagBezichtigingAan: async (data) => {
    const response = await api.post('/bezichtigingen', data);
    return response.data;
  },

  /**
   * Haal bezichtiging op met ID
   * @param {string} id - Bezichtiging ID
   */
  getBezichtigingById: async (id) => {
    const response = await api.get(`/bezichtigingen/${id}`);
    return response.data;
  },

  /**
   * Update bezichtigingsstatus
   * @param {string} id - Bezichtiging ID
   * @param {Object} data - Status update
   */
  updateBezichtigingStatus: async (id, data) => {
    const response = await api.put(`/bezichtigingen/${id}`, data);
    return response.data;
  },

  /**
   * Annuleer bezichtiging
   * @param {string} id - Bezichtiging ID
   */
  annuleerBezichtiging: async (id) => {
    const response = await api.delete(`/bezichtigingen/${id}`);
    return response.data;
  },

  /**
   * Bevestig een bezichtiging met token
   * @param {string} id - Bezichtiging ID
   * @param {Object} data - Bevestigingstoken
   */
  bevestigBezichtiging: async (id, data) => {
    const response = await api.post(`/bezichtigingen/${id}/bevestig`, data);
    return response.data;
  }
};

/**
 * ===================================
 * BEHEERDER FUNCTIES
 * ===================================
 */

export const beheerderAPI = {
  /**
   * Haal dashboard statistieken op
   */
  getDashboardStats: async () => {
    const response = await api.get('/beheerder/dashboard');
    return response.data;
  },

  /**
   * Beheer gebruikers (admin)
   */
  getGebruikers: async () => {
    const response = await api.get('/beheerder/gebruikers');
    return response.data;
  },

  /**
   * Update gebruiker rol (admin)
   * @param {string} id - Gebruiker ID
   * @param {Object} data - Nieuwe rol
   */
  updateGebruikerRol: async (id, data) => {
    const response = await api.put(`/beheerder/gebruikers/${id}/rol`, data);
    return response.data;
  },

  /**
   * Beheer woningen (admin)
   */
  getWoningen: async () => {
    const response = await api.get('/beheerder/woningen');
    return response.data;
  },

  /**
   * Markeer/verwijder woning als uitgelicht (admin)
   * @param {string} id - Woning ID
   * @param {Object} data - Uitgelicht status
   */
  toggleWoningUitgelicht: async (id, data) => {
    const response = await api.put(`/beheerder/woningen/${id}/uitgelicht`, data);
    return response.data;
  },

  /**
   * Update woning status (admin)
   * @param {string} id - Woning ID
   * @param {Object} data - Nieuwe status
   */
  updateWoningStatus: async (id, data) => {
    const response = await api.put(`/beheerder/woningen/${id}/status`, data);
    return response.data;
  },

  /**
   * Beheer alle bezichtigingen (admin)
   */
  getBezichtigingen: async () => {
    const response = await api.get('/beheerder/bezichtigingen');
    return response.data;
  },

  /**
   * Bekijk activiteitenlogboek (admin)
   */
  getActiviteitenLog: async () => {
    const response = await api.get('/beheerder/activiteiten');
    return response.data;
  }
};

/**
 * ===================================
 * SUGGESTIE FUNCTIES
 * ===================================
 */

export const suggestieAPI = {
  /**
   * Haal adressuggesties op voor autocomplete
   * @param {Object} params - Zoekopdracht
   */
  getAdresSuggesties: async (params) => {
    const response = await api.get('/suggesties/adres', { params });
    return response.data;
  },

  /**
   * Voer geocoding uit voor een specifiek adres
   * @param {Object} params - Adresgegevens
   */
  geocodeAdres: async (params) => {
    const response = await api.get('/suggesties/geocode', { params });
    return response.data;
  },

  /**
   * Voer reverse geocoding uit voor coördinaten
   * @param {Object} params - Coördinaten (lat, lng)
   */
  reverseGeocode: async (params) => {
    const response = await api.get('/suggesties/reverseGeocode', { params });
    return response.data;
  },

  /**
   * Haal reistijden op naar voorzieningen
   * @param {Object} data - Locatie en voorzieningen
   */
  getReistijden: async (data) => {
    const response = await api.post('/suggesties/reistijden', data);
    return response.data;
  },

  /**
   * Haal geocoding cache statistieken op (admin)
   */
  getCacheStats: async () => {
    const response = await api.get('/suggesties/cache-stats');
    return response.data;
  }
};

// Exporteer alle API services
export default {
  auth: authAPI,
  gebruiker: gebruikerAPI,
  woning: woningAPI,
  afbeelding: afbeeldingAPI,
  kenmerk: kenmerkAPI,
  favoriet: favorietAPI,
  bezichtiging: bezichtigingAPI,
  beheerder: beheerderAPI,
  suggestie: suggestieAPI
};