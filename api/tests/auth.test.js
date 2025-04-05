/**
 * Bunda API - Authentication Unit Tests
 * 
 * This file contains tests for the authentication controller and service functionality.
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const { Gebruiker } = require('../src/models');
const appConfig = require('../src/config/app.config');

// Mock the Gebruiker model
jest.mock('../src/models', () => ({
  Gebruiker: {
    vindMetEmail: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

describe('Auth Controller', () => {
  let mockGebruiker;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock user for testing
    mockGebruiker = {
      id: 1,
      email: 'test@example.com',
      naam: 'Test User',
      rol: appConfig.gebruikerNiveaus.GEBRUIKER,
      wachtwoord: bcrypt.hashSync('Password123', 10),
      controleerWachtwoord: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(true),
      toJSON: function() {
        const { wachtwoord, ...userWithoutPassword } = this;
        return userWithoutPassword;
      }
    };
  });

  describe('POST /api/auth/registreren', () => {
    it('should register a new user successfully', async () => {
      // Mock the user doesn't exist yet
      Gebruiker.vindMetEmail.mockResolvedValue(null);
      
      // Mock user creation
      Gebruiker.create.mockResolvedValue({
        ...mockGebruiker,
        toJSON: function() {
          const { wachtwoord, ...userWithoutPassword } = this;
          return userWithoutPassword;
        }
      });
      
      const response = await request(app)
        .post('/api/auth/registreren')
        .send({
          email: 'test@example.com',
          wachtwoord: 'Password123',
          naam: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
      expect(response.body.data).not.toHaveProperty('wachtwoord');
      expect(Gebruiker.create).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 if email already exists', async () => {
      // Mock the user already exists
      Gebruiker.vindMetEmail.mockResolvedValue(mockGebruiker);
      
      const response = await request(app)
        .post('/api/auth/registreren')
        .send({
          email: 'test@example.com',
          wachtwoord: 'Password123',
          naam: 'Test User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.succes).toBe(false);
      expect(Gebruiker.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/inloggen', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock finding the user
      Gebruiker.vindMetEmail.mockResolvedValue(mockGebruiker);
      
      const response = await request(app)
        .post('/api/auth/inloggen')
        .send({
          email: 'test@example.com',
          wachtwoord: 'Password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('toegangsToken');
      expect(response.body.data).toHaveProperty('verversingsToken');
      expect(response.body.data.gebruiker).toHaveProperty('email', 'test@example.com');
      expect(mockGebruiker.save).toHaveBeenCalledTimes(1); // Last login should be updated
    });
    
    it('should return 401 if user does not exist', async () => {
      // Mock user doesn't exist
      Gebruiker.vindMetEmail.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/inloggen')
        .send({
          email: 'nonexistent@example.com',
          wachtwoord: 'Password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.succes).toBe(false);
    });
    
    it('should return 401 if password is incorrect', async () => {
      // Mock finding the user but password check fails
      Gebruiker.vindMetEmail.mockResolvedValue({
        ...mockGebruiker,
        controleerWachtwoord: jest.fn().mockResolvedValue(false)
      });
      
      const response = await request(app)
        .post('/api/auth/inloggen')
        .send({
          email: 'test@example.com',
          wachtwoord: 'WrongPassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.succes).toBe(false);
    });
  });

  describe('POST /api/auth/vernieuw-token', () => {
    it('should refresh token successfully with valid refresh token', async () => {
      // Create a valid refresh token
      const validRefreshToken = jwt.sign(
        { id: mockGebruiker.id },
        appConfig.auth.jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Mock finding the user by ID
      Gebruiker.findByPk.mockResolvedValue(mockGebruiker);
      
      const response = await request(app)
        .post('/api/auth/vernieuw-token')
        .send({
          verversingsToken: validRefreshToken
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('toegangsToken');
    });
    
    it('should return 401 if refresh token is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/vernieuw-token')
        .send({
          verversingsToken: 'invalid-token'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.succes).toBe(false);
    });
    
    it('should return 401 if user no longer exists', async () => {
      // Create a valid refresh token
      const validRefreshToken = jwt.sign(
        { id: mockGebruiker.id },
        appConfig.auth.jwtSecret,
        { expiresIn: '7d' }
      );
      
      // Mock user no longer exists
      Gebruiker.findByPk.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/vernieuw-token')
        .send({
          verversingsToken: validRefreshToken
        });
      
      expect(response.status).toBe(401);
      expect(response.body.succes).toBe(false);
    });
  });

  describe('POST /api/auth/wachtwoord-vergeten', () => {
    it('should initiate password reset process for existing user', async () => {
      // Mock finding the user
      Gebruiker.vindMetEmail.mockResolvedValue(mockGebruiker);
      
      const response = await request(app)
        .post('/api/auth/wachtwoord-vergeten')
        .send({
          email: 'test@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(mockGebruiker.save).toHaveBeenCalledTimes(1);
    });
    
    it('should return success message even if user does not exist (for security)', async () => {
      // Mock user doesn't exist
      Gebruiker.vindMetEmail.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/wachtwoord-vergeten')
        .send({
          email: 'nonexistent@example.com'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
    });
  });

  describe('POST /api/auth/wachtwoord-resetten', () => {
    it('should reset password with valid token', async () => {
      // Mock finding user with valid reset token
      const mockUserWithToken = {
        ...mockGebruiker,
        resetToken: 'valid-token',
        resetTokenVerlooptOp: new Date(Date.now() + 3600000) // 1 hour in the future
      };
      
      Gebruiker.findOne.mockResolvedValue(mockUserWithToken);
      
      const response = await request(app)
        .post('/api/auth/wachtwoord-resetten')
        .send({
          token: 'valid-token',
          nieuwWachtwoord: 'NewPassword123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(mockUserWithToken.save).toHaveBeenCalledTimes(1);
    });
    
    it('should return 400 if reset token is invalid or expired', async () => {
      // Mock no user found with that token
      Gebruiker.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/auth/wachtwoord-resetten')
        .send({
          token: 'invalid-token',
          nieuwWachtwoord: 'NewPassword123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.succes).toBe(false);
    });
  });

  describe('GET /api/auth/mijn-account', () => {
    it('should return user data for authenticated user', async () => {
      // Create test JWT token
      const token = jwt.sign(
        { id: mockGebruiker.id, email: mockGebruiker.email },
        appConfig.auth.jwtSecret,
        { expiresIn: '1h' }
      );
      
      // Mock finding user by ID in auth middleware
      Gebruiker.findByPk.mockResolvedValue(mockGebruiker);
      
      const response = await request(app)
        .get('/api/auth/mijn-account')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.succes).toBe(true);
      expect(response.body.data).toHaveProperty('email', mockGebruiker.email);
      expect(response.body.data).not.toHaveProperty('wachtwoord');
    });
    
    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/mijn-account');
      
      expect(response.status).toBe(401);
      expect(response.body.succes).toBe(false);
    });
  });
}); 
