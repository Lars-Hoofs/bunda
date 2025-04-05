/**
 * Bunda API - Woning Unit Tests
 * 
 * This file contains tests for the woning controller and service functionality.
 */

const request = require('supertest');
const app = require('../src/app');
const { Woning, Gebruiker, WoningAfbeelding, Kenmerk } = require('../src/models');
const appConfig = require('../src/config/app.config');

// Mock the models
jest.mock('../src/models', () => ({
  Woning: {
    findAndCountAll: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    prototype: {
      getVolledigAdres: jest.fn()
    }
  },
  Gebruiker: {
    findByPk: jest.fn()
  },
  WoningAfbeelding: {},
  Kenmerk: {},
  WoningKenmerk: {},
  Favoriet: {}
}));

// Mock JWT authentication middleware
jest.mock('../src/middleware/auth.middleware', () => ({
  authenticateJWT: (req, res, next) => {
    req.gebruiker = { id: 1, rol: 'gebruiker' };
    next();
  },
  isVerkoopmakelaar: (req, res, next) => {
    next();
  }
}));

describe('Woning Controller', () => {
  let mockWoning;
  let mockGebruiker;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock user for testing
    mockGebruiker = {
      id: 1,
      email: 'verkoper@example.com',
      naam: 'Test Verkoper',
      rol: 'verkoopmakelaar',
      toJSON: function() {
        return {
          id: this.id,
          email: this.email,
          naam: this.naam,
          rol: this.rol
        };
      }
    };
    
    // Create a mock woning for testing
    mockWoning = {
      id: 1,
      titel: 'Prachtige vrijstaande woning',
      beschrijving: 'Een mooie vrijstaande woning in het centrum van de stad.',
      prijs: 350000.00,
      oppervlakte: 120.5,
      slaapkamers: 3,
      badkamers: 2,
      bouwjaar: 2010,
      energielabel: 'A',
      straat: 'Hoofdstraat',
      huisnummer: '123',
      stad: 'Amsterdam',
      postcode: '1000AB',
      breedtegraad: 52.3702,
      lengtegraad: 4.8952,
      verkoperId: 1,
      status: 'beschikbaar',
      isUitgelicht: false,
      aangemaaktOp: new Date(),
      bijgewerktOp: new Date(),
      verkoper: mockGebruiker,
      afbeeldingen: [],
      kenmerken: [],
      getVolledigAdres: jest.fn().mockReturnValue('Hoofdstraat 123, 1000AB Amsterdam'),
      toJSON: function() {
        return { ...this };
      }
    };
  });

  describe('GET /api/woningen', () => {
    it('should fetch woningen with default filters', async () => {
      // Mock the response from findAndCountAll
      const mockResponse = {
        count: 1,
        rows: [mockWoning]
      };
      
      Woning.findAndCountAll.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .get('/api/woningen');
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.metadata).toHaveProperty('totaal', 1);
      expect(Woning.findAndCountAll).toHaveBeenCalledTimes(1);
    });
    
    it('should apply filters correctly', async () => {
      // Mock the response from findAndCountAll
      const mockResponse = {
        count: 1,
        rows: [mockWoning]
      };
      
      Woning.findAndCountAll.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .get('/api/woningen')
        .query({
          minPrijs: 300000,
          maxPrijs: 400000,
          stad: 'Amsterdam',
          minSlaapkamers: 2
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      
      // Verify that findAndCountAll was called with the right filters
      const whereClause = Woning.findAndCountAll.mock.calls[0][0].where;
      expect(whereClause).toBeDefined();
      expect(Woning.findAndCountAll).toHaveBeenCalledTimes(1);
    });
    
    it('should handle pagination correctly', async () => {
      // Mock the response with multiple pages
      const mockResponse = {
        count: 15,
        rows: [mockWoning]
      };
      
      Woning.findAndCountAll.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .get('/api/woningen')
        .query({
          pagina: 2,
          aantalPerPagina: 10
        });
      
      expect(response.status).toBe(200);
      expect(response.body.metadata).toHaveProperty('pagina', 2);
      expect(response.body.metadata).toHaveProperty('aantalPerPagina', 10);
      expect(response.body.metadata).toHaveProperty('totaal', 15);
      expect(response.body.metadata).toHaveProperty('totaalPaginas', 2);
      
      // Verify that offset and limit were set correctly
      const options = Woning.findAndCountAll.mock.calls[0][0];
      expect(options).toHaveProperty('offset', 10);
      expect(options).toHaveProperty('limit', 10);
    });
  });

  describe('GET /api/woningen/:id', () => {
    it('should fetch a single woning by ID', async () => {
      Woning.findByPk.mockResolvedValue(mockWoning);
      
      const response = await request(app)
        .get('/api/woningen/1');
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
      expect(response.body.data).toHaveProperty('titel', 'Prachtige vrijstaande woning');
      expect(Woning.findByPk).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ as: 'verkoper' }),
            expect.objectContaining({ as: 'afbeeldingen' }),
            expect.objectContaining({ as: 'kenmerken' })
          ])
        })
      );
    });
    
    it('should return 404 if woning doesn\'t exist', async () => {
      Woning.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/woningen/999');
      
      expect(response.status).toBe(404);
      expect(response.body.succes).toBe(false);
    });
  });
  
  describe('POST /api/woningen', () => {
    it('should create a new woning successfully', async () => {
      // Mock the user exists
      Gebruiker.findByPk.mockResolvedValue(mockGebruiker);
      
      // Mock woning creation
      Woning.create.mockResolvedValue(mockWoning);
      
      const woningData = {
        titel: 'Nieuwe woning',
        beschrijving: 'Een nieuwe woning in de database',
        prijs: 250000.00,
        oppervlakte: 85.5,
        slaapkamers: 2,
        badkamers: 1,
        bouwjaar: 2015,
        energielabel: 'B',
        straat: 'Teststraat',
        huisnummer: '42',
        stad: 'Rotterdam',
        postcode: '3000XY'
      };
      
      const response = await request(app)
        .post('/api/woningen')
        .send(woningData);
      
      expect(response.status).toBe(201);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('titel', 'Prachtige vrijstaande woning');
      expect(Woning.create).toHaveBeenCalledTimes(1);
      expect(Woning.create).toHaveBeenCalledWith(
        expect.objectContaining({
          verkoperId: 1 // From the mocked auth middleware
        }),
        expect.anything()
      );
    });
    
    it('should return 400 for invalid woning data', async () => {
      // Mock create failing with validation error
      Woning.create.mockRejectedValue(new Error('Validation error'));
      
      const invalidWoningData = {
        // Missing required fields
        titel: 'Incomplete woning'
      };
      
      const response = await request(app)
        .post('/api/woningen')
        .send(invalidWoningData);
      
      expect(response.status).toBe(400);
      expect(response.body.succes).toBe(false);
    });
  });
  
  describe('PUT /api/woningen/:id', () => {
    it('should update a woning successfully', async () => {
      // Mock finding the woning
      Woning.findByPk.mockResolvedValue({
        ...mockWoning,
        update: jest.fn().mockResolvedValue({
          ...mockWoning,
          titel: 'Updated titel',
          prijs: 375000.00
        })
      });
      
      const updates = {
        titel: 'Updated titel',
        prijs: 375000.00
      };
      
      const response = await request(app)
        .put('/api/woningen/1')
        .send(updates);
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('titel', 'Updated titel');
      expect(response.body.data).toHaveProperty('prijs', 375000.00);
    });
    
    it('should return 404 if woning doesn\'t exist', async () => {
      Woning.findByPk.mockResolvedValue(null);
      
      const updates = {
        titel: 'Updated titel'
      };
      
      const response = await request(app)
        .put('/api/woningen/999')
        .send(updates);
      
      expect(response.status).toBe(404);
      expect(response.body.succes).toBe(false);
    });
  });
  
  describe('DELETE /api/woningen/:id', () => {
    it('should delete a woning successfully', async () => {
      // Mock finding the woning
      Woning.findByPk.mockResolvedValue({
        ...mockWoning,
        destroy: jest.fn().mockResolvedValue(true)
      });
      
      const response = await request(app)
        .delete('/api/woningen/1');
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body).toHaveProperty('bericht');
    });
    
    it('should return 404 if woning doesn\'t exist', async () => {
      Woning.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/api/woningen/999');
      
      expect(response.status).toBe(404);
      expect(response.body.succes).toBe(false);
    });
  });
  
  describe('GET /api/woningen/uitgelicht', () => {
    it('should fetch featured woningen', async () => {
      const mockFeaturedWoningen = [
        { ...mockWoning, isUitgelicht: true },
        { ...mockWoning, id: 2, titel: 'Andere uitgelichte woning', isUitgelicht: true }
      ];
      
      Woning.findAll.mockResolvedValue(mockFeaturedWoningen);
      
      const response = await request(app)
        .get('/api/woningen/uitgelicht');
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(Woning.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isUitgelicht: true,
            status: 'beschikbaar'
          }),
          limit: 6 // Default value
        })
      );
    });
    
    it('should respect the aantal parameter', async () => {
      Woning.findAll.mockResolvedValue([mockWoning]);
      
      const response = await request(app)
        .get('/api/woningen/uitgelicht')
        .query({ aantal: 3 });
      
      expect(response.status).toBe(200);
      expect(Woning.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 3
        })
      );
    });
  });
  
  describe('GET /api/woningen/zoeken', () => {
    it('should search woningen in a radius', async () => {
      // Mock the response from findAndCountAll
      const mockResponse = {
        count: 1,
        rows: [{
          ...mockWoning,
          dataValues: {
            ...mockWoning,
            afstand: 2.5 // Distance in km
          },
          toJSON: function() {
            return { ...this.dataValues };
          }
        }]
      };
      
      Woning.findAndCountAll.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .get('/api/woningen/zoeken')
        .query({
          breedtegraad: 52.3702,
          lengtegraad: 4.8952,
          straal: 5
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('afstand');
      
      // Verify that correct Haversine formula was used in the query
      const options = Woning.findAndCountAll.mock.calls[0][0];
      expect(options.attributes.include).toBeDefined();
      expect(options.order).toEqual([
        [expect.anything(), 'ASC'] // Ordering by distance
      ]);
    });
    
    it('should return 400 if coordinates are missing', async () => {
      const response = await request(app)
        .get('/api/woningen/zoeken')
        .query({
          straal: 5
        });
      
      expect(response.status).toBe(400);
      expect(response.body.succes).toBe(false);
    });
  });
}); 
