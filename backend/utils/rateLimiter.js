const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const logger = require('./logger');

// Rate limiter configuration
const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    handler: (req, res) => {
        logger.warn('Rate Limit Exceeded', {
            ip: req.ip,
            url: req.url,
            timestamp: new Date().toISOString()
        });
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.'
        });
    }
});

// Speed limiter configuration
const speedLimiter = slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 50, // Allow 50 requests per minute at full speed
    delayMs: (hits) => hits * 100, // Add 100ms of delay per request above 50
    onLimitReached: (req, res, options) => {
        logger.warn('Speed Limit Reached', {
            ip: req.ip,
            url: req.url,
            delay: options.delayMs,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = {
    rateLimiter,
    speedLimiter
};
