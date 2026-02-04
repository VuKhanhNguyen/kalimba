var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('./config');

function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, 10);
}

function comparePassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

function signAccessToken(payload) {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.auth.jwtSecret);
}

module.exports = {
  hashPassword: hashPassword,
  comparePassword: comparePassword,
  signAccessToken: signAccessToken,
  verifyAccessToken: verifyAccessToken
};
