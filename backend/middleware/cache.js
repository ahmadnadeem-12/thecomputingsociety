const cache = {};

/**
 * Simple in-memory cache middleware
 * @param {number} duration - Time to live in seconds
 */
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        
        // Skip caching for authenticated users if needed (e.g., admin), 
        // but for public data like events/home, it's fine.
        // We will just cache based on URL.
        const key = '__express__' + req.originalUrl || req.url;
        const cachedItem = cache[key];
        
        if (cachedItem && (Date.now() - cachedItem.timestamp < duration * 1000)) {
            res.setHeader('X-Cache', 'HIT');
            res.setHeader('Content-Type', 'application/json');
            return res.send(cachedItem.data);
        } else {
            res.setHeader('X-Cache', 'MISS');
            res.sendResponse = res.send;
            res.send = (body) => {
                // Only cache successful JSON responses (not errors)
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache[key] = {
                        data: body,
                        timestamp: Date.now()
                    };
                }
                res.sendResponse(body);
            }
            next();
        }
    };
};

/**
 * Clear cache for specific prefixes, useful when data changes
 */
const clearCache = (urlPrefix = '') => {
    Object.keys(cache).forEach(key => {
        if (key.includes(urlPrefix)) {
            delete cache[key];
        }
    });
};

module.exports = { cacheMiddleware, clearCache };
