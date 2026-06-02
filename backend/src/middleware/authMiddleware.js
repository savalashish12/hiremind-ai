const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: 'No token provided',
      });
    }

    const actualToken = token.split(' ')[1];

    const decoded = jwt.verify(
      actualToken,
      process.env.JWT_SECRET
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        message: 'User does not exist',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        message: 'Your account has been suspended. Please contact the administrator.',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: 'Invalid token',
    });
  }
};

module.exports = protect;