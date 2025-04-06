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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Implementeer token refresh voor 401 responses
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        if (typeof window === 'undefined') {
          throw new Error('Cannot refresh token on server side');
        }
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('Geen verversingstoken beschikbaar');
        }
        
        console.log("Attempting to refresh token");
        const response = await axios.post(`${API_URL}/auth/vernieuw-token`, { refreshToken });
        const { token } = response.data;
        
        console.log("Token refreshed successfully");
        
        try {
          // Update localStorage with new token
          localStorage.setItem('token', token);
          console.log("New token stored in localStorage");
        } catch (storageError) {
          console.error("Error storing refreshed token:", storageError);
          throw storageError;
        }
        
        // Update the authorization header
        originalRequest.headers.Authorization = `Bearer ${token}`;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        processQueue(null, token);
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Error during token refresh:", refreshError);
        processQueue(refreshError, null);
        
        // Clear tokens from storage
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            console.log("Tokens removed from localStorage after failed refresh");
          } catch (clearError) {
            console.error("Error clearing tokens:", clearError);
          }
        }
        
        // Redirect to login page with expired parameter
        if (typeof window !== 'undefined') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
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
  try {
    console.log("Making login request with:", credentials.email);
    console.log("API URL:", API_URL);
    
    const response = await api.post('/auth/inloggen', credentials);
    console.log("Login API response status:", response.status);
    console.log("Login API response data:", response.data);
    
    // Log de volledige structuur voor debugging
    console.log("Full response data structure:", JSON.stringify(response.data, null, 2));
    
    // Check op Nederlandse tokennamen (toegangsToken & verversingsToken)
    if (response.data.data && response.data.data.toegangsToken) {
      try {
        console.log("Token gevonden als toegangsToken");
        localStorage.setItem('token', response.data.data.toegangsToken);
        if (response.data.data.verversingsToken) {
          localStorage.setItem('refreshToken', response.data.data.verversingsToken);
        }
      } catch (storageError) {
        console.error("Error storing token in localStorage:", storageError);
        throw new Error(`Token storage failed: ${storageError.message}`);
      }
    }
    // Check op Engelse tokennamen (token & refreshToken)
    else if (response.data.data && response.data.data.token) {
      try {
        console.log("Token gevonden als token");
        localStorage.setItem('token', response.data.data.token);
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
      } catch (storageError) {
        console.error("Error storing token in localStorage:", storageError);
        throw new Error(`Token storage failed: ${storageError.message}`);
      }
    }
    // Check op tokens direct in de response (zonder data object)
    else if (response.data.token || response.data.toegangsToken) {
      try {
        console.log("Token gevonden in root response");
        localStorage.setItem('token', response.data.token || response.data.toegangsToken);
        if (response.data.refreshToken || response.data.verversingsToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken || response.data.verversingsToken);
        }
      } catch (storageError) {
        console.error("Error storing token in localStorage:", storageError);
        throw new Error(`Token storage failed: ${storageError.message}`);
      }
    }
    else {
      console.error("Geen token gevonden in verwachte locaties. Response structuur:", 
                 JSON.stringify(response.data, null, 2));
      throw new Error("Geen token ontvangen van de server. Controleer de API respons structuur.");
    }
    
    // Verifieer opslag
    const storedToken = localStorage.getItem('token');
    console.log("Token stored successfully:", !!storedToken);
    if (storedToken) {
      console.log("First 10 chars of stored token:", storedToken.substring(0, 10) + "...");
    }
    
    return response.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
},

  /**
   * Vernieuw het toegangstoken
   */
  vernieuwToken: async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Cannot refresh token on server side');
      }
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Geen verversingstoken beschikbaar');
      }
      
      console.log("Attempting to refresh token");
      const response = await api.post('/auth/vernieuw-token', { refreshToken });
      console.log("Token refresh response:", response.data);
      
      if (response.data.data && response.data.data.token) {
        try {
          localStorage.setItem('token', response.data.data.token);
          console.log("New token stored after refresh");
        } catch (storageError) {
          console.error("Error storing refreshed token:", storageError);
          throw storageError;
        }
      } else {
        console.error("No token in refresh response");
      }
      
      return response.data;
    } catch (error) {
      console.error("Token refresh error:", error);
      throw error;
    }
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
    try {
      console.log("Fetching user account");
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      console.log("Token exists for account fetch:", !!token);
      
      const response = await api.get('/auth/mijn-account');
      console.log("User account fetch successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user account:", error);
      throw error;
    }
  },

  /**
   * Log de gebruiker uit (lokaal)
   */
  uitloggen: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        console.log("Tokens removed during logout");
      } catch (error) {
        console.error("Error removing tokens during logout:", error);
      }
    }
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
   * Haal dashboard statistieken op met robuuste foutafhandeling
   */
  getDashboardStats: async () => {
    try {
      console.log("Fetching dashboard stats from API...");
      // Probeer de originele API call
      const response = await api.get('/beheerder/dashboard');
      console.log("Dashboard stats received successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats from API:", error);
      
      // Probeer de statistieken handmatig te berekenen
      console.log("Calculating stats manually...");
      
      try {
        // Haal woningen op
        const woningenResponse = await api.get('/beheerder/woningen');
        const woningen = woningenResponse.data && woningenResponse.data.data ? woningenResponse.data.data : [];
        
        // Haal gebruikers op
        const gebruikersResponse = await api.get('/beheerder/gebruikers');
        const gebruikers = gebruikersResponse.data && gebruikersResponse.data.data ? gebruikersResponse.data.data : [];
        
        // Haal bezichtigingen op (als API endpoint bestaat)
        let actieveBezichtigingen = 0;
        try {
          const bezichtigingenResponse = await api.get('/beheerder/bezichtigingen');
          const bezichtigingen = bezichtigingenResponse.data && bezichtigingenResponse.data.data ? bezichtigingenResponse.data.data : [];
          actieveBezichtigingen = bezichtigingen.filter(b => b.status === 'aangevraagd' || b.status === 'bevestigd').length;
        } catch (bezError) {
          console.log("Could not fetch viewings data:", bezError);
        }
        
        // Bereken de stats handmatig
        const stats = {
          succes: true,
          bericht: 'Dashboard statistieken handmatig berekend (Server API geeft een fout)',
          data: {
            totalUsers: gebruikers.length,
            totalProperties: woningen.length,
            featuredProperties: Array.isArray(woningen) ? woningen.filter(w => w.isUitgelicht).length : 0,
            activeViewings: actieveBezichtigingen
          }
        };
        
        console.log("Manually calculated stats:", stats);
        return stats;
      } catch (manualError) {
        console.error("Error calculating stats manually:", manualError);
        
        // Als alles faalt, retourneer een fallback object
        return {
          succes: false,
          bericht: 'Kon geen dashboard statistieken ophalen of berekenen',
          data: {
            totalUsers: 0,
            totalProperties: 0,
            featuredProperties: 0,
            activeViewings: 0
          },
          error: error.message
        };
      }
    }
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

/**
 * Hulpfunctie om data veilig uit API responses te halen
 * Gebruikt voor consistente verwerking van response data
 */
export const extractDataFromResponse = (response) => {
  // Check of de response een succes: true en data veld heeft
  if (response && response.succes === true && response.data) {
    return response.data;
  }
  
  // Sommige endpoints kunnen direct een array of object teruggeven zonder wrapper
  if (response && (Array.isArray(response) || typeof response === 'object')) {
    return response;
  }
  
  // Fallback: leeg resultaat
  return Array.isArray(response) ? [] : {};
};

// Test function for localStorage
export const testLocalStorage = () => {
  if (typeof window === 'undefined') {
    console.log("localStorage not available (server-side)");
    return false;
  }
  
  try {
    const testKey = 'bunda-test-key';
    const testValue = 'works-' + new Date().getTime();
    
    // Try to write to localStorage
    localStorage.setItem(testKey, testValue);
    
    // Try to read from localStorage
    const readValue = localStorage.getItem(testKey);
    
    // Clean up
    localStorage.removeItem(testKey);
    
    // Check if the read value matches what we wrote
    const success = readValue === testValue;
    console.log("localStorage test:", success ? "PASSED" : "FAILED");
    return success;
  } catch (error) {
    console.error("localStorage test error:", error);
    return false;
  }
};

// Run the test when this module is loaded (client-side only)
if (typeof window !== 'undefined') {
  console.log("Testing localStorage capability:");
  testLocalStorage();
}

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
  suggestie: suggestieAPI,
  testLocalStorage,
  extractDataFromResponse
};