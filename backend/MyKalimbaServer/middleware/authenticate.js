var security = require('../core/security');

function authenticate(req, res, next) {
  try {
    var header = req.headers.authorization || req.headers.Authorization;
    if (!header) return res.status(401).json({ message: 'Missing Authorization header' });

    var parts = String(header).split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid Authorization header' });
    }

    var token = parts[1];
    var decoded = security.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function optionalAuthenticate(req, res, next) {
  var header = req.headers.authorization || req.headers.Authorization;
  if (!header) return next();

  var parts = String(header).split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return next();

  try {
    req.user = security.verifyAccessToken(parts[1]);
  } catch (err) {
    // ignore
  }

  return next();
}

module.exports = {
  authenticate: authenticate,
  optionalAuthenticate: optionalAuthenticate
};
