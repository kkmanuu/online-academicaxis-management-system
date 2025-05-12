const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            console.error(`User not found for ID: ${decoded.userId}`);
            return res.status(401).json({ message: 'User not found. Please log in again.' });
        }

        if (user.isBlocked) {
            console.log(`Blocked user ${user._id} attempted to access protected route`);
            return res.status(403).json({ 
                message: 'Your account has been blocked. Please contact the administrator for assistance.' 
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Authentication failed' });
    }
};

// Middleware to check user role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}, User role: ${req.user.role}` 
            });
        }

        next();
    };
};

module.exports = { auth, checkRole }; 