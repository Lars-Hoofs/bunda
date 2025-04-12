const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app.config');

// Algemene rate limiter voor alle routes
const algemeneLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
  message: {
    succes: false,
    bericht: 'Te veel verzoeken van dit IP-adres, probeer het later opnieuw.',
    details: 'Rate limit overschreden'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    succes: false,
    bericht: 'Te veel inlogpogingen, probeer het later opnieuw.',
    details: 'Auth rate limit overschreden'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API route limiter
const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: {
    succes: false,
    bericht: 'Te veel API verzoeken, probeer het later opnieuw.',
    details: 'API rate limit overschreden'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  algemeneLimiter,
  authLimiter,
  apiLimiter
}; 