const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');
const AuthError = require('../errors/AuthError');

dotenv.config();
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Authorization Required');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    // trying to verify the token
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'super-secret',
    );
  } catch (err) {
    // we return an error if something goes wrong
    throw new AuthError('Authorization Required');
  }
  req.user = payload;
  next();
};
