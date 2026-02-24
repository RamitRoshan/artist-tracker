// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const protect = async (req, res, next) => {
//     let token;
//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);
//             req.user = await User.findById(decoded.id).select('-password');
//             return next();
//         } catch (error) {
//             console.error(error);
//             return res.status(401).json({ message: 'Not authorized, token failed' });
//         }
//     }

//     if (!token) {
//         return res.status(401).json({ message: 'Not authorized, no token' });
//     }
// };

// const artistOnly = (req, res, next) => {
//     if (req.user && req.user.role === 'artist') {
//         next();
//     } else {
//         res.status(403).json({ message: 'Not authorized as an artist' });
//     }
// };

// module.exports = { protect, artistOnly };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            return next();
        }

        return res.status(401).json({ message: 'Not authorized, no token' });

    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const artistOnly = (req, res, next) => {
    if (req.user && req.user.role === 'artist') {
        return next();
    }
    return res.status(403).json({ message: 'Not authorized as an artist' });
};

module.exports = {
    protect,
    artistOnly
};