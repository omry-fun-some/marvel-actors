export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication token required' });
    }

    if (token !== process.env.AUTH_TOKEN) {
        return res.status(403).json({ error: 'Invalid authentication token' });
    }

    next();
}
