const logger = require('./logger');

const performanceMonitor = (req, res, next) => {
    const start = process.hrtime();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function
    res.end = function(chunk, encoding) {
        // Calculate response time
        const diff = process.hrtime(start);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        
        // Log performance metrics
        logger.info('Performance Metrics', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('user-agent'),
            timestamp: new Date().toISOString()
        });

        // Call original end function
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = performanceMonitor;
